'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: '#FFFFFF', border: '1px solid #E4E4E7',
  borderRadius: '12px', padding: '12px 16px',
  fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '14px',
  color: '#09090B', outline: 'none', transition: 'border-color 200ms',
}

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pw1Focused, setPw1Focused] = useState(false)
  const [pw2Focused, setPw2Focused] = useState(false)

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/app')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '28px', fontWeight: 700, color: '#09090B', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Nouveau mot de passe
        </h1>
        <p style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '14px', color: '#71717A' }}>
          Choisissez un mot de passe sécurisé.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: '24px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', color: '#DC2626' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', fontWeight: 500, color: '#3F3F46', marginBottom: '8px' }}>
            Nouveau mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPw1Focused(true)}
            onBlur={() => setPw1Focused(false)}
            placeholder="8 caractères minimum"
            minLength={8}
            required
            style={{ ...inputStyle, borderColor: pw1Focused ? '#2563EB' : '#E4E4E7', boxShadow: pw1Focused ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', fontWeight: 500, color: '#3F3F46', marginBottom: '8px' }}>
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onFocus={() => setPw2Focused(true)}
            onBlur={() => setPw2Focused(false)}
            placeholder="Répétez le mot de passe"
            minLength={8}
            required
            style={{ ...inputStyle, borderColor: pw2Focused ? '#2563EB' : '#E4E4E7', boxShadow: pw2Focused ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-cta"
          style={{ width: '100%', padding: '14px', borderRadius: '12px', fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 200ms' }}
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  )
}
