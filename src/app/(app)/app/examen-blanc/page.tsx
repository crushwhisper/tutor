import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock } from '@phosphor-icons/react/dist/ssr'
import ExamenBlancClient from '@/components/app/ExamenBlancClient'
import { checkIsPro } from '@/lib/isPro'
import type { MockExamResult } from '@/types'

export default async function ExamenBlancPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userProfile } = await supabase
    .from('users')
    .select('role, subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = checkIsPro(userProfile)

  if (!isPro) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'var(--accent-soft)', margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={24} style={{ color: 'var(--accent)' }} />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '10px' }}>
          Examens Blancs
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--app-text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
          Simulez les conditions du concours avec un timer, des QCM par matière et des questions rédactionnelles corrigées par IA.
          Disponible avec le plan Pro.
        </p>
        <Link
          href="/app/settings?tab=subscription"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontSize: '14px', fontWeight: 600,
          }}
        >
          Passer à Pro →
        </Link>
      </div>
    )
  }

  const { data: pastResults } = await supabase
    .from('mock_exam_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return <ExamenBlancClient pastResults={(pastResults ?? []) as MockExamResult[]} />
}
