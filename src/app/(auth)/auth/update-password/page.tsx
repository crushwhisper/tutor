'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className="glass-card p-8">
      <h1 className="text-2xl font-semibold text-white mb-2">Nouveau mot de passe</h1>
      <p className="text-muted text-sm mb-8">Choisissez un mot de passe sécurisé.</p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm text-muted mb-2">Nouveau mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
            minLength={8}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-2">Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
            minLength={8}
            required
            className="input-field"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  )
}
