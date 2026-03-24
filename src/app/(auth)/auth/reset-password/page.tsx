'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#FFFFFF',
  border: '1px solid #E4E4E7',
  borderRadius: '12px',
  padding: '12px 16px',
  fontFamily: 'Outfit, system-ui, sans-serif',
  fontSize: '14px',
  color: '#09090B',
  outline: 'none',
  transition: 'border-color 200ms, box-shadow 200ms',
  boxSizing: 'border-box',
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 7l10 7 10-7" />
          </svg>
        </div>
        <h2
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: '#09090B',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
          }}
        >
          Email envoyé
        </h2>
        <p
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '14px',
            color: '#71717A',
            lineHeight: 1.7,
            marginBottom: '32px',
          }}
        >
          Vérifiez votre boîte mail pour réinitialiser votre mot de passe.
        </p>
        <Link
          href="/auth/login"
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '14px',
            color: '#6366F1',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          ← Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            color: '#09090B',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}
        >
          Mot de passe oublié
        </h1>
        <p
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '14px',
            color: '#71717A',
          }}
        >
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '24px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '13px',
            color: '#DC2626',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleReset}>
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: '#3F3F46',
              marginBottom: '8px',
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="votre@email.com"
            required
            style={{
              ...inputStyle,
              borderColor: focused ? '#6366F1' : '#E4E4E7',
              boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-cta"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 200ms',
          }}
        >
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link
          href="/auth/login"
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '14px',
            color: '#71717A',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#6366F1')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#71717A')}
        >
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
