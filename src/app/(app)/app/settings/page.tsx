import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import SettingsClient from '@/components/app/SettingsClient'

interface Props {
  searchParams: Promise<{ tab?: string; success?: string }>
}

export default async function SettingsPage({ searchParams }: Props) {
  const { tab, success } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, avatar_url, subscription_plan, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_ends_at, whatsapp_number, email_notifications, whatsapp_notifications, preferred_study_time, role, created_at, updated_at')
    .eq('id', user.id)
    .single()

  return <SettingsClient profile={profile} activeTab={tab ?? 'profil'} showSuccess={success === 'true'} />
}
