import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Program } from '@/types'
import ProgramList from '@/components/app/ProgramList'

export default async function ProgrammesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .order('total_days')

  return <ProgramList programs={(programs ?? []) as Program[]} />
}
