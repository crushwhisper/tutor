import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/resend'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app'

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Fire welcome email for genuinely new signups (non-blocking)
      try {
        const userId = sessionData.user?.id
        if (userId) {
          const { data: profile } = await supabaseAdmin
            .from('users')
            .select('email, full_name, created_at')
            .eq('id', userId)
            .single()

          if (profile) {
            const createdAt = new Date(profile.created_at).getTime()
            const isNewSignup = Date.now() - createdAt < 60_000 // within last 60 s

            if (isNewSignup) {
              await sendWelcomeEmail({
                to: profile.email,
                name: profile.full_name ?? profile.email.split('@')[0],
              })
            }
          }
        }
      } catch {
        // Email failure must not block the redirect
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
