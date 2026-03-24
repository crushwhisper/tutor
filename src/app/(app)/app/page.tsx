import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/app/DashboardClient'
import { checkIsPro } from '@/lib/isPro'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role, subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const { count: completedCount } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completed', true)

  const isPro = checkIsPro(profile)

  return (
    <DashboardClient
      profile={profile}
      completedCount={completedCount ?? 0}
      isPro={isPro}
    />
  )
}
