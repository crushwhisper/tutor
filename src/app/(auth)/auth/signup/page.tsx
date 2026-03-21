'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Outfit, system-ui, sans-serif',
  fontSize: '13px',
  fontWeight: 500,
  color: '#3F3F46',
  marginBottom: '8px',
}

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  async function handleGoogleSignup() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        {/* Email icon */}
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
          Vérifiez votre email
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
          Un lien de confirmation a été envoyé à{' '}
          <span style={{ fontWeight: 600, color: '#09090B' }}>{email}</span>.
          <br />
          Cliquez sur le lien pour activer votre compte.
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
      {/* Header */}
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
          Créer un compte
        </h1>
        <p
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '14px',
            color: '#71717A',
          }}
        >
          Déjà inscrit ?{' '}
          <Link
            href="/auth/login"
            style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 500 }}
          >
            Se connecter
          </Link>
        </p>
      </div>

      {/* Error */}
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

      {/* Google OAuth */}
      <button
        onClick={handleGoogleSignup}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid #E4E4E7',
          background: 'white',
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          color: '#09090B',
          cursor: 'pointer',
          transition: 'background 200ms',
          marginBottom: '24px',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#F4F4F5')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'white')}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuer avec Google
      </button>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ flex: 1, height: '1px', background: '#E4E4E7' }} />
        <span
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#A1A1AA',
          }}
        >
          ou
        </span>
        <div style={{ flex: 1, height: '1px', background: '#E4E4E7' }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSignup}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              placeholder="Prénom Nom"
              required
              style={{
                ...inputStyle,
                borderColor: focused === 'name' ? '#6366F1' : '#E4E4E7',
                boxShadow: focused === 'name' ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
              }}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              placeholder="votre@email.com"
              required
              style={{
                ...inputStyle,
                borderColor: focused === 'email' ? '#6366F1' : '#E4E4E7',
                boxShadow: focused === 'email' ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
              }}
            />
          </div>
          <div>
            <label style={labelStyle}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('pw')}
              onBlur={() => setFocused(null)}
              placeholder="8 caractères minimum"
              minLength={8}
              required
              style={{
                ...inputStyle,
                borderColor: focused === 'pw' ? '#6366F1' : '#E4E4E7',
                boxShadow: focused === 'pw' ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-glow"
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
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <p
        style={{
          marginTop: '24px',
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '12px',
          color: '#A1A1AA',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        En créant un compte, vous acceptez nos{' '}
        <Link href="/legal/cgu" style={{ color: '#6366F1', textDecoration: 'none' }}>CGU</Link>{' '}
        et notre{' '}
        <Link href="/legal/confidentialite" style={{ color: '#6366F1', textDecoration: 'none' }}>politique de confidentialité</Link>.
      </p>
    </div>
  )
}
