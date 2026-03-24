'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'
import SubscriptionCard from './SubscriptionCard'
import type { User } from '@/types'

interface Props {
  profile: User | null
  activeTab: string
  showSuccess: boolean
}

const TABS = [
  { id: 'profil', label: 'Profil' },
  { id: 'subscription', label: 'Abonnement' },
  { id: 'notifications', label: 'Notifications' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 14px',
  background: 'var(--app-bg)',
  border: '1px solid var(--app-border)',
  borderRadius: '10px',
  fontFamily: 'inherit', fontSize: '14px',
  color: 'var(--app-text)',
  outline: 'none',
  transition: 'border-color 150ms',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px', fontWeight: 500,
  color: 'var(--app-text-muted)',
  marginBottom: '6px',
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        position: 'relative', width: '44px', height: '24px',
        borderRadius: '999px', border: 'none', cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--app-border)',
        transition: 'background 200ms', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: checked ? '23px' : '3px',
        width: '18px', height: '18px',
        borderRadius: '50%', background: 'white',
        transition: 'left 200ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

export default function SettingsClient({ profile, activeTab, showSuccess }: Props) {
  const [tab, setTab] = useState(activeTab)
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp_number ?? '')
  const [emailNotifs, setEmailNotifs] = useState(profile?.email_notifications ?? true)
  const [whatsappNotifs, setWhatsappNotifs] = useState(profile?.whatsapp_notifications ?? false)
  const [preferredStudyTime, setPreferredStudyTime] = useState(profile?.preferred_study_time ?? 480)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const { addToast } = useAppStore()

  async function saveProfile() {
    if (!profile?.id) { addToast({ type: 'error', title: 'Erreur', message: 'Profil introuvable.' }); return }
    setSavingProfile(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('users').update({ full_name: fullName, whatsapp_number: whatsapp || null }).eq('id', profile.id)
    if (error) {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de sauvegarder.' })
    } else {
      addToast({ type: 'success', title: 'Profil mis à jour' })
    }
    setSavingProfile(false)
  }

  async function saveNotifications() {
    if (!profile?.id) { addToast({ type: 'error', title: 'Erreur', message: 'Profil introuvable.' }); return }
    setSavingNotifications(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ email_notifications: emailNotifs, whatsapp_notifications: whatsappNotifs, preferred_study_time: preferredStudyTime })
      .eq('id', profile.id)
    if (error) {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de sauvegarder.' })
    } else {
      addToast({ type: 'success', title: 'Préférences enregistrées' })
    }
    setSavingNotifications(false)
  }

  async function signOut() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/auth/login'
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de se déconnecter.' })
    }
  }

  const surface: React.CSSProperties = {
    background: 'var(--app-surface)',
    border: '1px solid var(--app-border)',
    borderRadius: '16px',
    padding: '28px 32px',
    marginBottom: '16px',
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '4px' }}>
          Paramètres
        </h1>
      </div>

      {showSuccess && (
        <div style={{
          background: 'var(--success-soft)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '12px', padding: '14px 20px',
          marginBottom: '16px',
          fontSize: '14px', fontWeight: 500, color: 'var(--success)',
        }}>
          Votre abonnement Pro est maintenant actif !
        </div>
      )}

      {/* Tab navigation */}
      <div style={{
        display: 'flex', gap: '4px',
        background: 'var(--app-bg)',
        border: '1px solid var(--app-border)',
        borderRadius: '12px', padding: '4px',
        marginBottom: '20px',
      }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '9px',
              borderRadius: '9px', border: 'none',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer',
              background: tab === t.id ? 'var(--app-surface)' : 'transparent',
              color: tab === t.id ? 'var(--accent)' : 'var(--app-text-muted)',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 150ms',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profil tab */}
      {tab === 'profil' && (
        <div style={surface}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '20px' }}>
            Informations personnelles
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Prénom Nom"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={profile?.email ?? ''}
                disabled
                style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
              />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp (facultatif)</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+212 6XX XXX XXX"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--app-border)' }}>
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              style={{
                padding: '10px 24px',
                background: savingProfile ? 'var(--app-border)' : 'var(--accent)',
                color: savingProfile ? 'var(--app-text-ghost)' : 'white',
                border: 'none', borderRadius: '10px',
                fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
                cursor: savingProfile ? 'not-allowed' : 'pointer',
                transition: 'all 150ms',
              }}
            >
              {savingProfile ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
            <button
              onClick={signOut}
              style={{
                padding: '10px 24px',
                background: 'none',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                fontFamily: 'inherit', fontSize: '14px', fontWeight: 500,
                color: '#EF4444', cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* Subscription tab */}
      {tab === 'subscription' && profile && (
        <SubscriptionCard user={profile} />
      )}

      {/* Notifications tab */}
      {tab === 'notifications' && (
        <div style={surface}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '20px' }}>
            Notifications
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--app-border)', marginBottom: '20px' }}>
              <label style={labelStyle}>Heure de rappel quotidien</label>
              <p style={{ fontSize: '12px', color: 'var(--app-text-ghost)', marginBottom: '10px' }}>
                À quelle heure souhaitez-vous recevoir vos rappels ?
              </p>
              <select
                value={preferredStudyTime}
                onChange={(e) => setPreferredStudyTime(Number(e.target.value))}
                style={{ ...inputStyle, width: 'auto', minWidth: '140px' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)' }}
              >
                {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => (
                  <option key={h} value={h * 60}>{String(h).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--app-border)', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--app-text)', marginBottom: '3px' }}>
                  Notifications email
                </p>
                <p style={{ fontSize: '12px', color: 'var(--app-text-ghost)' }}>
                  Rappels de révision et mises à jour
                </p>
              </div>
              <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--app-text)', marginBottom: '3px' }}>
                  Notifications WhatsApp
                </p>
                <p style={{ fontSize: '12px', color: 'var(--app-text-ghost)' }}>
                  Messages de motivation et rappels
                </p>
              </div>
              <Toggle checked={whatsappNotifs} onChange={() => setWhatsappNotifs(!whatsappNotifs)} />
            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--app-border)' }}>
            <button
              onClick={saveNotifications}
              disabled={savingNotifications}
              style={{
                padding: '10px 24px',
                background: savingNotifications ? 'var(--app-border)' : 'var(--accent)',
                color: savingNotifications ? 'var(--app-text-ghost)' : 'white',
                border: 'none', borderRadius: '10px',
                fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
                cursor: savingNotifications ? 'not-allowed' : 'pointer',
                transition: 'all 150ms',
              }}
            >
              {savingNotifications ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
