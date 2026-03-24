import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkIsPro } from '@/lib/isPro'
import ModuleGrid from '@/components/app/ModuleGrid'

export default async function PreparationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: modules }, { data: userProfile }] = await Promise.all([
    supabaseAdmin.from('modules').select('*').eq('is_active', true).order('order_index'),
    supabaseAdmin.from('users').select('role,subscription_plan,subscription_status').eq('id', user.id).single(),
  ])

  // Count published courses per module
  const courseCountMap: Record<string, number> = {}
  if (modules) {
    await Promise.all(modules.map(async (mod) => {
      const { count } = await supabaseAdmin
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', mod.id)
        .eq('is_published', true)
      courseCountMap[mod.id] = count ?? 0
    }))
  }

  const modulesWithCount = (modules ?? []).map((mod) => ({
    ...mod,
    courseCount: courseCountMap[mod.id] ?? 0,
  }))

  return <ModuleGrid modules={modulesWithCount} isPro={checkIsPro(userProfile)} />
}
