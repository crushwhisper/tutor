import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Module } from '@/types/database'

const MODULE_META = [
  { slug: 'anatomie-biologie', icon: '🧬', color: '#4A90D9', description: 'Bases fondamentales en anatomie et biologie médicale' },
  { slug: 'medecine', icon: '🏥', color: '#E8A83E', description: 'Pathologies médicales et diagnostics cliniques' },
  { slug: 'chirurgie', icon: '🔬', color: '#E85555', description: 'Techniques chirurgicales et pathologies opératoires' },
  { slug: 'urgences-medicales', icon: '🚨', color: '#9B59B6', description: 'Prise en charge des urgences médicales' },
  { slug: 'urgences-chirurgicales', icon: '⚡', color: '#E67E22', description: 'Prise en charge des urgences chirurgicales' },
]

type ModuleWithCount = Module & { courses: { count: number }[] }

export default async function PreparationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: modules } = await supabase
    .from('modules')
    .select('*, courses(count)')
    .eq('is_active', true)
    .order('order_index')

  const { data: userProfile } = await supabase
    .from('users')
    .select('subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = userProfile?.subscription_plan === 'pro' && userProfile?.subscription_status === 'active'

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Préparation Libre</h1>
        <p className="text-muted text-sm">Choisissez un module pour accéder aux cours.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {((modules ?? []) as ModuleWithCount[]).map((mod) => {
          const meta = MODULE_META.find((m) => m.slug === mod.slug)
          const courseCount = mod.courses?.[0]?.count ?? 0

          return (
            <Link
              key={mod.id}
              href={`/app/preparation/${mod.slug}`}
              className="glass-card p-6 hover:border-gold/30 transition-all group block"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${meta?.color ?? '#e8a83e'}20` }}
                >
                  {meta?.icon ?? '📚'}
                </div>
                <span className="text-xs text-muted">{courseCount} cours</span>
              </div>
              <h3 className="text-white font-semibold mb-2 group-hover:text-gold transition-colors">
                {mod.name}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {meta?.description ?? mod.description}
              </p>
              <div className="mt-4 flex items-center text-gold text-sm font-medium">
                Explorer →
              </div>
            </Link>
          )
        })}
      </div>

      {!isPro && (
        <div className="glass-card p-6 border-gold/30 bg-gold/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">Accès limité</h3>
              <p className="text-muted text-sm">Certains cours sont réservés aux membres Pro. Passez à Pro pour tout débloquer.</p>
            </div>
            <Link href="/app/settings?tab=subscription" className="btn-primary shrink-0 text-sm">
              Passer à Pro
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
