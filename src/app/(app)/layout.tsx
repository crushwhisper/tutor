import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Sidebar from '@/components/app/Sidebar'
import Topbar from '@/components/app/Topbar'
import ToastContainer from '@/components/app/ToastContainer'
import OwlJournal from '@/components/app/OwlJournal'
import UserInitializer from '@/components/app/UserInitializer'
import type { User } from '@/types'

export const metadata: Metadata = {
  title: 'TUTOR — Mon Espace',
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  let { data: profile } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Auto-promote: if no admin exists yet, make this user admin
  if (profile && profile.role !== 'admin') {
    const { count } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')

    if ((count ?? 0) === 0) {
      await supabaseAdmin
        .from('users')
        .update({ role: 'admin' })
        .eq('id', user.id)

      profile = { ...profile, role: 'admin' }
    }
  }

  // If no profile at all, create one with admin role (first user)
  if (!profile) {
    const { data: anyAdmin } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    const role = !anyAdmin ? 'admin' : 'student'
    const { data: newProfile } = await supabaseAdmin
      .from('users')
      .upsert({
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? null,
        role,
        subscription_plan: 'pro',
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select('*')
      .single()

    profile = newProfile
  }

  return (
    <div className="cockpit-wrapper" style={{ minHeight: '100dvh' }}>
      {/* Hydrate Zustand store with user profile */}
      {profile && <UserInitializer user={profile as User} />}

      {/* Fixed top bar */}
      <Topbar />

      {/* Fixed sidebar */}
      <Sidebar />

      {/* Scrollable main content */}
      <main style={{
        marginLeft: '240px',
        marginTop: '64px',
        minHeight: 'calc(100dvh - 64px)',
        padding: '40px',
        background: 'var(--app-bg)',
        overflowY: 'auto',
      }}>
        {children}
      </main>

      {/* Owl / Journal panel */}
      <OwlJournal />

      <ToastContainer />
    </div>
  )
}
