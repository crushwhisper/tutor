import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MesCours from '@/components/app/MesCours'

export const metadata = { title: 'Mes Cours — TUTOR' }

export default async function MesCoursPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: uploads } = await supabase
    .from('user_generated_content')
    .select('id, content_type, content, created_at')
    .eq('user_id', user.id)
    .eq('content_type', 'summary')
    .order('created_at', { ascending: false })

  return <MesCours initialUploads={uploads ?? []} />
}
