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
    <div style={{
      background: 'var(--app-surface)',
      border: '1px solid var(--app-border)',
      borderRadius: '14px',
      padding: '24px',
    }}>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>
        {isCompleted ? 'Jour validé' : 'Valider le jour'}
      </h2>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: 'var(--app-text-muted)', marginBottom: '8px' }}>
          Notes (facultatif)
        </label>
        <textarea
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Vos notes de révision..."
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box', resize: 'vertical',
            background: 'var(--app-bg)', border: '1px solid var(--app-border)',
            borderRadius: '10px', padding: '12px 14px',
            fontSize: '13px', color: 'var(--app-text)', outline: 'none',
            fontFamily: 'inherit', transition: 'border-color 150ms',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)' }}
        />
      </div>

      <button
        onClick={markComplete}
        disabled={saving || !!isCompleted}
        style={{
          width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
          background: isCompleted ? 'var(--success-soft)' : 'var(--success)',
          color: isCompleted ? 'var(--success)' : 'white',
          fontSize: '13px', fontWeight: 600,
          cursor: saving || isCompleted ? 'not-allowed' : 'pointer',
          transition: 'all 150ms', opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? 'Enregistrement...' : isCompleted ? 'Jour complété ✓' : 'Marquer comme complété'}
      </button>
    </div>
  )
}
