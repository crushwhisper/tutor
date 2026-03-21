import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Program } from '@/types'

export default async function ProgrammesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userProfile } = await supabase
    .from('users')
    .select('subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro =
    userProfile?.subscription_plan === 'pro' &&
    userProfile?.subscription_status === 'active'

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .order('total_days')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white mb-1">Programmes</h1>
        <p className="text-muted text-sm">Chaque jour planifié pour vous.</p>
      </div>

      {!isPro && (
        <div className="glass-card p-6 border-gold/30 bg-gold/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">Fonctionnalité Pro</h3>
              <p className="text-muted text-sm">
                Les programmes structurés sont réservés aux membres Pro.
              </p>
            </div>
            <Link
              href="/app/settings?tab=subscription"
              className="btn-primary text-sm shrink-0"
            >
              Passer à Pro
            </Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {((programs ?? []) as Program[]).map((program) => (
          <div
            key={program.id}
            className={`glass-card p-8 ${
              !isPro ? 'opacity-60' : 'hover:border-gold/30 transition-all'
            }`}
          >
            <div className="text-4xl font-bold text-gold mb-2">
              {program.total_days}j
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {program.title}
            </h3>
            <p className="text-muted text-sm mb-6">{program.description}</p>
            {isPro ? (
              <Link
                href={`/app/programmes/${program.type}`}
                className="btn-primary block text-center"
              >
                Commencer le programme
              </Link>
            ) : (
              <button
                disabled
                className="btn-secondary w-full opacity-50 cursor-not-allowed"
              >
                Accès Pro requis
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
