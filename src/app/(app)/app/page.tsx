import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/app/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const { count: completedCount } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completed', true)

  const isPro =
    profile?.subscription_plan === 'pro' &&
    profile?.subscription_status === 'active'

  return (
    <DashboardClient
      profile={profile}
      completedCount={completedCount ?? 0}
      isPro={isPro}
    />
  )
}
