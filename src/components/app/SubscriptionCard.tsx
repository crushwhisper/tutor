'use client'

import { useState } from 'react'
import type { User } from '@/types'

interface Props {
  user: User
}

export default function SubscriptionCard({ user }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const isPro = user.subscription_plan === 'pro' && user.subscription_status === 'active'

  async function handleCheckout(plan: 'monthly' | '6months') {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Erreur lors du paiement. Réessayez.')
    }
    setLoading(null)
  }

  async function handlePortal() {
    setLoading('portal')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Erreur. Réessayez.')
    }
    setLoading(null)
  }

  if (isPro) {
    return (
      <div className="glass-card p-6 border-gold/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold">Abonnement Pro</h3>
            <p className="text-muted text-sm mt-1">
              Actif jusqu&apos;au{' '}
              {user.subscription_ends_at
                ? new Date(user.subscription_ends_at).toLocaleDateString('fr-FR')
                : '—'}
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-gold/20 text-gold border border-gold/30">Pro actif</span>
        </div>
        <button
          onClick={handlePortal}
          disabled={loading === 'portal'}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          {loading === 'portal' ? 'Chargement...' : 'Gérer mon abonnement'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-1">Plan Starter</h3>
        <p className="text-muted text-sm mb-6">Passez à Pro pour débloquer toutes les fonctionnalités.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass-card p-5 border-white/10">
            <div className="text-2xl font-bold text-white mb-1">99 <span className="text-sm font-normal text-muted">DH</span></div>
            <div className="text-muted text-sm mb-4">/ mois</div>
            <button
              onClick={() => handleCheckout('monthly')}
              disabled={!!loading}
              className="btn-primary w-full text-sm disabled:opacity-50"
            >
              {loading === 'monthly' ? 'Chargement...' : 'Choisir mensuel'}
            </button>
          </div>

          <div className="glass-card p-5 border-gold/30 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-gold text-navy font-semibold">-20%</div>
            <div className="text-2xl font-bold text-gold mb-1">79 <span className="text-sm font-normal text-muted">DH</span></div>
            <div className="text-muted text-sm mb-4">/ mois × 6</div>
            <button
              onClick={() => handleCheckout('6months')}
              disabled={!!loading}
              className="btn-primary w-full text-sm disabled:opacity-50"
            >
              {loading === '6months' ? 'Chargement...' : 'Choisir 6 mois'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
