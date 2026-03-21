'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'
import type { DayCompletion } from '@/types'

interface Props {
  programId: string
  dayNumber: number
  programType: string
  existingCompletion: DayCompletion | null
}

export default function DayCompletionForm({
  programId,
  dayNumber,
  existingCompletion,
}: Props) {
  const router = useRouter()
  const { addToast } = useAppStore()
  const [notes, setNotes] = useState(existingCompletion?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const isCompleted = existingCompletion?.completed

  async function markComplete() {
    setSaving(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      addToast({ type: 'error', title: 'Erreur', message: 'Session expirée. Reconnectez-vous.' })
      setSaving(false)
      return
    }

    const { error } = await supabase.from('day_completions').upsert(
      {
        user_id: user.id,
        program_id: programId,
        day_number: dayNumber,
        completed: true,
        notes: notes || null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,program_id,day_number' }
    )

    if (error) {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de sauvegarder.' })
    } else {
      addToast({
        type: 'success',
        title: 'Jour validé !',
        message: `Jour ${dayNumber} complété.`,
      })
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="glass-card p-6 border-gold/20">
      <h2 className="text-white font-semibold mb-4">
        {isCompleted ? 'Jour validé' : 'Valider le jour'}
      </h2>

      <div className="mb-4">
        <label className="block text-sm text-muted mb-2">Notes (facultatif)</label>
        <textarea
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Vos notes de révision..."
          rows={3}
          className="w-full bg-navy-800 border border-gold/20 rounded-xl px-4 py-3 text-sm text-white placeholder-muted focus:outline-none focus:border-gold/40 resize-none"
        />
      </div>

      <button
        onClick={markComplete}
        disabled={saving || !!isCompleted}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
          isCompleted
            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
            : 'btn-primary'
        }`}
      >
        {saving
          ? 'Enregistrement...'
          : isCompleted
          ? 'Jour complété'
          : 'Marquer comme complété'}
      </button>
    </div>
  )
}
