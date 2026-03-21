import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/app/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch recent progress (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentProgress } = await supabase
    .from('user_progress')
    .select('*, courses(title, module_id, modules(name, color))')
    .eq('user_id', user.id)
    .gte('last_accessed_at', sevenDaysAgo.toISOString())
    .order('last_accessed_at', { ascending: false })
    .limit(5)

  // Fetch total completed courses count
  const { count: completedCount } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completed', true)

  // Fetch last journal entry
  const { data: lastJournal } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <DashboardClient
      profile={profile}
      recentProgress={recentProgress ?? []}
      completedCount={completedCount ?? 0}
      lastJournal={lastJournal ?? null}
    />
  )
}
