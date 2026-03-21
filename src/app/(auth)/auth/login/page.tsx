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
  transition: 'border-color 200ms',
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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailFocused, setEmailFocused] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      router.push('/app')
      router.refresh()
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
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
          Connexion
        </h1>
        <p
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '14px',
            color: '#71717A',
          }}
        >
          Pas encore de compte ?{' '}
          <Link
            href="/auth/signup"
            style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 500 }}
          >
            Créer un compte
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
        onClick={handleGoogleLogin}
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
      <form onSubmit={handleEmailLogin}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="votre@email.com"
              required
              style={{
                ...inputStyle,
                borderColor: emailFocused ? '#6366F1' : '#E4E4E7',
                boxShadow: emailFocused ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Mot de passe</label>
              <Link
                href="/auth/reset-password"
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '12px',
                  color: '#6366F1',
                  textDecoration: 'none',
                }}
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              placeholder="••••••••"
              required
              style={{
                ...inputStyle,
                borderColor: pwFocused ? '#6366F1' : '#E4E4E7',
                boxShadow: pwFocused ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
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
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
