'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1A1A1A',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '13px 16px',
  fontFamily: 'Outfit, system-ui, sans-serif',
  fontSize: '14px',
  color: 'white',
  outline: 'none',
  transition: 'border-color 200ms',
  boxSizing: 'border-box',
}

const CONCOURS = ['Internat', 'Résidanat', 'Autre', 'Je ne sais pas encore']

export default function PlatformCTAForm() {
  const router = useRouter()
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', password: '', concours: '' })
  const [focused, setFocused] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: `${form.prenom} ${form.nom}`, concours: form.concours },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/auth/signup?success=1')
    }
  }

  const focusStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focused === field ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)',
    boxShadow: focused === field ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
  })

  return (
    <section style={{ background: '#0A0A0A', padding: '120px 0' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '999px', padding: '6px 18px', marginBottom: '40px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
            <span style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Inscription gratuite</span>
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 700, color: 'white',
            letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '16px',
          }}>
            Commencez votre préparation.
          </h2>
          <p style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '17px', fontWeight: 300,
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '56px',
          }}>
            Créez votre compte en 30 secondes.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '480px' }}>
            {error && (
              <div style={{
                marginBottom: '20px', padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
                fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', color: '#F43F5E',
              }}>{error}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input placeholder="Prénom" required value={form.prenom} onChange={set('prenom')}
                onFocus={() => setFocused('prenom')} onBlur={() => setFocused(null)}
                style={focusStyle('prenom')} />
              <input placeholder="Nom" required value={form.nom} onChange={set('nom')}
                onFocus={() => setFocused('nom')} onBlur={() => setFocused(null)}
                style={focusStyle('nom')} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
              <input type="email" placeholder="Email" required value={form.email} onChange={set('email')}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                style={focusStyle('email')} />
              <input type="password" placeholder="Mot de passe (8 car. min)" minLength={8} required value={form.password} onChange={set('password')}
                onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)}
                style={focusStyle('pw')} />
            </div>

            <select value={form.concours} onChange={set('concours')} style={{
              ...inputStyle,
              marginBottom: '20px',
              color: form.concours ? 'white' : 'rgba(255,255,255,0.3)',
              appearance: 'none',
            }}>
              <option value="" disabled>Quel concours préparez-vous ?</option>
              {CONCOURS.map((c) => <option key={c} value={c} style={{ color: '#0A0A0A', background: 'white' }}>{c}</option>)}
            </select>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '16px',
              background: '#3B82F6', color: 'white',
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '16px', fontWeight: 600,
              border: 'none', borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 0 0 1px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.25)',
              transition: 'box-shadow 300ms, transform 200ms',
              marginBottom: '16px',
            }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(59,130,246,0.6), 0 0 60px rgba(59,130,246,0.4)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.25)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
            >
              {loading ? 'Création...' : 'Créer mon compte →'}
            </button>

            <p style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginBottom: '12px' }}>
              En créant un compte, vous acceptez nos{' '}
              <Link href="/legal/cgu" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>CGU</Link>
              {' '}et notre{' '}
              <Link href="/legal/confidentialite" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>politique de confidentialité</Link>.
            </p>

            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              Aucune carte bancaire requise.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
