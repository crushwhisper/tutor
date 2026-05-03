'use client'

import { useState } from 'react'
import type { User } from '@/types'

interface Props {
  user: User
}

export default function SubscriptionCard({ user }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  const isPro = user.role === 'admin' || (user.subscription_plan === 'pro' && user.subscription_status === 'active')

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
      <div style={{
        background: 'var(--app-surface)',
        border: '1px solid var(--success)',
        borderRadius: '14px',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '4px' }}>Abonnement Pro</h3>
            <p style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>
              Actif jusqu&apos;au{' '}
              {user.subscription_ends_at
                ? new Date(user.subscription_ends_at).toLocaleDateString('fr-FR')
                : '—'}
            </p>
          </div>
          <span style={{
            fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px',
            background: 'var(--success-soft)', color: 'var(--success)', border: '1px solid var(--success)',
          }}>
            Pro actif
          </span>
        </div>
        <button
          onClick={handlePortal}
          disabled={loading === 'portal'}
          style={{
            padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
            background: 'transparent', border: '1px solid var(--app-border)',
            color: 'var(--app-text-muted)', cursor: 'pointer', transition: 'all 150ms',
            opacity: loading === 'portal' ? 0.6 : 1,
          }}
        >
          {loading === 'portal' ? 'Chargement...' : 'Gérer mon abonnement'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: '14px',
        padding: '24px',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '4px' }}>Plan Starter</h3>
        <p style={{ fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '24px' }}>
          Passez à Pro pour débloquer toutes les fonctionnalités.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{
            background: 'var(--app-bg)',
            border: '1px solid var(--app-border)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '4px' }}>
              99 <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--app-text-muted)' }}>DH</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '16px' }}>/ mois</div>
            <button
              onClick={() => handleCheckout('monthly')}
              disabled={!!loading}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                background: '#2563EB', color: 'white', fontSize: '13px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                transition: 'opacity 150ms',
              }}
            >
              {loading === 'monthly' ? 'Chargement...' : 'Choisir mensuel'}
            </button>
          </div>

          <div style={{
            background: 'var(--app-bg)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '10px', right: '10px',
              fontSize: '10px', fontWeight: 600, padding: '2px 8px',
              borderRadius: '999px', background: 'var(--accent)', color: 'white',
            }}>
              -20%
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>
              79 <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--app-text-muted)' }}>DH</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '16px' }}>/ mois × 6</div>
            <button
              onClick={() => handleCheckout('6months')}
              disabled={!!loading}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                background: '#2563EB', color: 'white', fontSize: '13px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                transition: 'opacity 150ms',
              }}
            >
              {loading === '6months' ? 'Chargement...' : 'Choisir 6 mois'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
