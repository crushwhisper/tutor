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
    if (!profile?.id) {
      addToast({ type: 'error', title: 'Erreur', message: 'Profil introuvable.' })
      return
    }
    setSavingProfile(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName, whatsapp_number: whatsapp || null })
      .eq('id', profile.id)

    if (error) {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de sauvegarder.' })
    } else {
      addToast({ type: 'success', title: 'Profil mis à jour' })
    }
    setSavingProfile(false)
  }

  async function saveNotifications() {
    if (!profile?.id) {
      addToast({ type: 'error', title: 'Erreur', message: 'Profil introuvable.' })
      return
    }
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {showSuccess && (
        <div className="glass-card p-4 border-gold/40 bg-gold/10">
          <p className="text-gold font-medium">🎉 Votre abonnement Pro est maintenant actif !</p>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 bg-navy-800 p-1 rounded-2xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.id ? 'bg-gold text-navy-900' : 'text-muted hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profil tab */}
      {tab === 'profil' && (
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-white font-semibold">Informations personnelles</h2>
          <div>
            <label className="block text-sm text-muted mb-2">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="Prénom Nom"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Email</label>
            <input
              type="email"
              value={profile?.email ?? ''}
              disabled
              className="input-field opacity-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">WhatsApp (facultatif)</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="input-field"
              placeholder="+212 6XX XXX XXX"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="btn-primary disabled:opacity-50"
            >
              {savingProfile ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
            <button onClick={signOut} className="btn-ghost text-red-400 hover:text-red-300">
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
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-white font-semibold">Notifications</h2>
          <div className="space-y-4">
            <div>
              <p className="text-white text-sm font-medium mb-1">Heure de rappel quotidien</p>
              <p className="text-muted text-xs mb-2">À quelle heure souhaitez-vous recevoir vos rappels ?</p>
              <select
                value={preferredStudyTime}
                onChange={(e) => setPreferredStudyTime(Number(e.target.value))}
                className="input-field"
              >
                {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => (
                  <option key={h} value={h * 60}>
                    {String(h).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Notifications email</p>
                <p className="text-muted text-xs mt-0.5">Rappels de révision et mises à jour</p>
              </div>
              <button
                onClick={() => setEmailNotifs(!emailNotifs)}
                className={`relative w-10 h-6 rounded-full transition-colors ${emailNotifs ? 'bg-gold' : 'bg-navy-800'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Notifications WhatsApp</p>
                <p className="text-muted text-xs mt-0.5">Messages de motivation et rappels</p>
              </div>
              <button
                onClick={() => setWhatsappNotifs(!whatsappNotifs)}
                className={`relative w-10 h-6 rounded-full transition-colors ${whatsappNotifs ? 'bg-gold' : 'bg-navy-800'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${whatsappNotifs ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <button
            onClick={saveNotifications}
            disabled={savingNotifications}
            className="btn-primary disabled:opacity-50"
          >
            {savingNotifications ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
        </div>
      )}
    </div>
  )
}
