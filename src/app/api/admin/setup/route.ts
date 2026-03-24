import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// One-time setup: sets the current authenticated user's role to 'admin'
// Only works if no admin exists yet OR if called by an existing admin
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if any admin already exists
  const { data: existingAdmins } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)

  // Allow if no admin exists yet, or if the caller is already admin
  const callerIsAdmin = existingAdmins?.some((a) => a.id === user.id) ?? false
  const noAdminYet = !existingAdmins || existingAdmins.length === 0

  if (!noAdminYet && !callerIsAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Upsert user record with admin role
  const { error } = await supabaseAdmin
    .from('users')
    .upsert({
      id: user.id,
      email: user.email ?? '',
      role: 'admin',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, message: `User ${user.email} is now admin` })
}
