import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ExamenBlancClient from '@/components/app/ExamenBlancClient'

export default async function ExamenBlancPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userProfile } = await supabase
    .from('users')
    .select('subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = userProfile?.subscription_plan === 'pro' && userProfile?.subscription_status === 'active'

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-5xl mb-6">🏆</div>
        <h1 className="text-2xl font-semibold text-white mb-3">Examen Blanc</h1>
        <p className="text-muted mb-8">
          Simulez les conditions du concours avec un timer et obtenez un radar de vos performances.
          Disponible avec le plan Pro.
        </p>
        <Link href="/app/settings?tab=subscription" className="btn-primary">
          Passer à Pro
        </Link>
      </div>
    )
  }

  // Fetch past results
  const { data: pastResults } = await supabase
    .from('mock_exam_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return <ExamenBlancClient pastResults={pastResults ?? []} />
}
