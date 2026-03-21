import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendDailyReminderEmail, sendWeeklyDigestEmail } from '@/lib/resend'
import { sendWhatsAppReminder } from '@/lib/twilio'

const DEFAULT_PROGRAM_TYPE = '90j'
const MAX_PROGRAM_DAYS = 365 // safety cap — skip users past programme length

// ---------------------------------------------------------------------------
// Auth helper — timing-safe comparison to prevent timing oracle attacks
// ---------------------------------------------------------------------------

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const secret = process.env.NOTIFICATIONS_SECRET ?? ''
  if (!token || !secret) {
    if (!secret) console.error('[notifications] NOTIFICATIONS_SECRET env var is not set')
    return false
  }
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(secret))
  } catch {
    // Buffers of different lengths throw — token is invalid
    return false
  }
}

// ---------------------------------------------------------------------------
// Batch helper — process items in groups, returns count of successful (truthy)
// results so callers never mutate an external counter across async closures
// ---------------------------------------------------------------------------

async function processBatches<T>(
  items: T[],
  batchSize: number,
  handler: (item: T) => Promise<boolean>,
): Promise<number> {
  let total = 0
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const results = await Promise.allSettled(batch.map(handler))
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) total++
    }
  }
  return total
}

// ---------------------------------------------------------------------------
// daily_reminder handler
// ---------------------------------------------------------------------------

type UserRow = {
  id: string
  email: string
  full_name: string | null
  whatsapp_notifications: boolean
  whatsapp_number: string | null
  preferred_study_time: number
}

// Returns the current hour as minutes from midnight (UTC), rounded to the nearest hour.
function currentHourMinutes(): number {
  const now = new Date()
  return now.getUTCHours() * 60
}

async function handleDailyReminder(): Promise<number> {
  const hourMinutes = currentHourMinutes()
  // Fetch users whose preferred study time falls within the current hour window (±0 min, exact hour match).
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, whatsapp_notifications, whatsapp_number, preferred_study_time')
    .eq('email_notifications', true)
    .eq('preferred_study_time', hourMinutes)

  if (error || !users) {
    if (error) console.error('[notifications/daily_reminder] Failed to fetch users:', error)
    return 0
  }

  return processBatches(users as UserRow[], 10, async (user) => {
    try {
      // Find the latest completed day for this user
      const { data: completions } = await supabaseAdmin
        .from('day_completions')
        .select('day_number, programs(type)')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('day_number', { ascending: false })
        .limit(1)

      let dayNumber: number
      let programType: string

      if (!completions || completions.length === 0) {
        // No completed days yet — check if user has any programme record at all.
        // If they do, they started but haven't completed day 1; remind from day 1.
        // (This is intentionally different from the "completed" query above.)
        const { data: anyRow } = await supabaseAdmin
          .from('day_completions')
          .select('programs(type)')
          .eq('user_id', user.id)
          .limit(1)

        if (!anyRow || anyRow.length === 0) return false // no active programme — skip
        dayNumber = 1
        programType = (anyRow[0].programs as unknown as { type: string } | null)?.type ?? DEFAULT_PROGRAM_TYPE
      } else {
        dayNumber = completions[0].day_number + 1
        programType =
          (completions[0].programs as unknown as { type: string } | null)?.type ?? DEFAULT_PROGRAM_TYPE
      }

      // Skip users who have exceeded the programme length
      if (dayNumber > MAX_PROGRAM_DAYS) return false

      const name = user.full_name ?? user.email.split('@')[0]

      await sendDailyReminderEmail({ to: user.email, name, dayNumber, programType })

      // WhatsApp is best-effort — failure must not affect email sent count
      if (user.whatsapp_notifications && user.whatsapp_number) {
        try {
          await sendWhatsAppReminder({ to: user.whatsapp_number, name, dayNumber })
        } catch (waErr) {
          console.error(`[notifications/daily_reminder] WhatsApp failed for ${user.id}:`, waErr)
        }
      }

      return true
    } catch (err) {
      console.error(`[notifications/daily_reminder] Failed for user ${user.id}:`, err)
      return false
    }
  })
}

// ---------------------------------------------------------------------------
// weekly_digest handler
// ---------------------------------------------------------------------------

type DigestUserRow = { id: string; email: string; full_name: string | null }

async function handleWeeklyDigest(): Promise<number> {
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name')
    .eq('email_notifications', true)

  if (error || !users) {
    if (error) console.error('[notifications/weekly_digest] Failed to fetch users:', error)
    return 0
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  return processBatches(users as DigestUserRow[], 10, async (user) => {
    try {
      const [
        { count: completedThisWeek },
        { data: recentActivity },
        { count: totalCompleted },
      ] = await Promise.all([
        supabaseAdmin
          .from('user_progress')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true)
          .gte('last_accessed_at', sevenDaysAgo),
        supabaseAdmin
          .from('user_progress')
          .select('last_accessed_at')
          .eq('user_id', user.id)
          .eq('completed', true)
          .gte('last_accessed_at', thirtyDaysAgo)
          .order('last_accessed_at', { ascending: false }),
        supabaseAdmin
          .from('user_progress')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true),
      ])

      const streak = computeStreak(recentActivity ?? [])
      const total = totalCompleted ?? 0
      const nextMilestone = Math.ceil((total + 1) / 10) * 10
      const name = user.full_name ?? user.email.split('@')[0]

      await sendWeeklyDigestEmail({
        to: user.email,
        name,
        completedThisWeek: completedThisWeek ?? 0,
        streak,
        nextMilestone,
      })

      return true
    } catch (err) {
      console.error(`[notifications/weekly_digest] Failed for user ${user.id}:`, err)
      return false
    }
  })
}

// ---------------------------------------------------------------------------
// Streak helper — count consecutive days going back from today (UTC).
// Uses pure UTC arithmetic so results are identical regardless of server TZ.
// If today has no entry the loop continues to yesterday (offset 0 never breaks),
// so a user who was active yesterday but not yet today keeps their streak alive.
// ---------------------------------------------------------------------------

const MS_PER_DAY = 86_400_000

function computeStreak(rows: { last_accessed_at: string }[]): number {
  if (rows.length === 0) return 0
  const dates = new Set(rows.map((r) => r.last_accessed_at.slice(0, 10)))
  let streak = 0
  const nowMs = Date.now()
  for (let offset = 0; offset < 31; offset++) {
    // Subtract whole days in milliseconds — always UTC, no local-TZ influence
    const key = new Date(nowMs - offset * MS_PER_DAY).toISOString().slice(0, 10)
    if (dates.has(key)) {
      streak++
    } else if (offset > 0) {
      break
    }
  }
  return streak
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: { type?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { type } = body

  if (type === 'daily_reminder') {
    const sent = await handleDailyReminder()
    return NextResponse.json({ sent })
  }

  if (type === 'weekly_digest') {
    const sent = await handleWeeklyDigest()
    return NextResponse.json({ sent })
  }

  return NextResponse.json(
    { error: 'Type non reconnu. Valeurs acceptées : daily_reminder, weekly_digest' },
    { status: 400 },
  )
}
