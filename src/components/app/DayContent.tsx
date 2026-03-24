'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckSquare, Square, ArrowRight, ClipboardText, Lightning, CheckCircle } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'

interface CourseItem {
  id: string
  title: string
  slug: string
  modules: { slug: string; name: string } | null
}

function matchObjectiveToCourse(objective: string, courses: CourseItem[]): CourseItem | null {
  // Strip common French prefixes like "Maîtriser : ", "Revoir : ", etc.
  const stripped = objective.replace(/^(Ma[îi]triser|Revoir|Apprendre|[ÉE]tudier|Comprendre)\s*:\s*/i, '').trim()
  return courses.find(c => c.title.trim().toLowerCase() === stripped.toLowerCase()) ?? null
}

interface Props {
  programId: string
  dayNumber: number
  programType: string
  courses: CourseItem[]
  objectives: string[]
  qcmCount: number
  isAlreadyCompleted: boolean
  existingNotes: string
}

export default function DayContent({
  programId,
  dayNumber,
  programType,
  courses,
  objectives,
  qcmCount,
  isAlreadyCompleted,
  existingNotes,
}: Props) {
  const router = useRouter()
  const { addToast } = useAppStore()

  // Build checklist items
  const items = [
    ...courses.map((c) => ({
      id: `course-${c.id}`,
      label: c.title,
      sublabel: `Cours · ${c.modules?.name ?? ''}`,
      href: `/app/preparation/${c.modules?.slug ?? ''}/${c.slug}`,
      icon: <ArrowRight size={14} style={{ color: 'var(--accent)' }} />,
      linkLabel: 'Ouvrir le cours →',
    })),
    ...(qcmCount > 0 ? [{
      id: 'qcm',
      label: `QCM du jour`,
      sublabel: `${qcmCount} questions`,
      href: '/app/examen-blanc' as string | null,
      icon: <ClipboardText size={14} style={{ color: 'var(--warning)' }} />,
      linkLabel: 'Faire le QCM →' as string | null,
    }] : []),
    {
      id: 'flashcards',
      label: 'Flashcards',
      sublabel: 'Répétition espacée',
      href: null as string | null,
      icon: <Lightning size={14} style={{ color: 'var(--accent)' }} />,
      linkLabel: null as string | null,
    },
  ]

  const [checked, setChecked] = useState<Record<string, boolean>>(
    isAlreadyCompleted
      ? Object.fromEntries(items.map((i) => [i.id, true]))
      : {}
  )
  const [notes, setNotes] = useState(existingNotes)
  const [saving, setSaving] = useState(false)

  const allChecked = items.every((item) => checked[item.id])
  const checkedCount = items.filter((item) => checked[item.id]).length

  function toggle(id: string) {
    if (isAlreadyCompleted) return
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleValidate() {
    if (!allChecked || saving || isAlreadyCompleted) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      addToast({ type: 'error', title: 'Session expirée', message: 'Reconnectez-vous.' })
      setSaving(false)
      return
    }

    const { error } = await supabase.from('day_completions').upsert({
      user_id: user.id,
      program_id: programId,
      day_number: dayNumber,
      completed: true,
      notes: notes || null,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,program_id,day_number' })

    if (error) {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de sauvegarder.' })
      setSaving(false)
      return
    }

    addToast({ type: 'success', title: `Jour ${dayNumber} validé !`, message: 'Continuez sur votre lancée.' })
    router.push(`/app/programmes/${programType}`)
  }

  return (
    <div>
      {/* Objectives (display only) */}
      {objectives.length > 0 && (
        <div style={{
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--app-text-ghost)', marginBottom: '12px' }}>
            Objectifs
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
            {objectives.map((obj, i) => {
              const matched = matchObjectiveToCourse(obj, courses)
              const label = <span style={{ fontSize: '14px', color: matched ? 'var(--accent)' : 'var(--app-text-body)', lineHeight: 1.5, textDecoration: matched ? 'underline' : 'none', textUnderlineOffset: '3px' }}>{obj}</span>
              return (
                <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>→</span>
                  {matched ? (
                    <Link href={`/app/preparation/${matched.modules?.slug ?? ''}/${matched.slug}`} style={{ textDecoration: 'none' }}>
                      {label}
                    </Link>
                  ) : label}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Checklist */}
      <div style={{
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--app-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--app-text-ghost)' }}>
            Tâches du jour
          </p>
          <span style={{ fontSize: '12px', color: 'var(--app-text-muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>
            {checkedCount}/{items.length}
          </span>
        </div>

        {items.map((item, idx) => {
          const isChecked = checked[item.id] ?? false
          const isLast = idx === items.length - 1

          return (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '18px 24px',
                borderBottom: isLast ? 'none' : '1px solid var(--app-border)',
                background: isChecked ? 'var(--success-soft)' : 'transparent',
                transition: 'background 200ms',
                cursor: isAlreadyCompleted ? 'default' : 'pointer',
              }}
              onClick={() => toggle(item.id)}
            >
              {/* Checkbox */}
              <div style={{ flexShrink: 0 }}>
                {isChecked
                  ? <CheckSquare size={22} weight="fill" style={{ color: 'var(--success)' }} />
                  : <Square size={22} style={{ color: 'var(--app-border)' }} />
                }
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '14px', fontWeight: 500,
                  color: isChecked ? 'var(--app-text-muted)' : 'var(--app-text)',
                  textDecoration: isChecked ? 'line-through' : 'none',
                  transition: 'all 200ms',
                }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--app-text-ghost)', marginTop: '2px' }}>
                  {item.sublabel}
                </p>
              </div>

              {/* Action link */}
              {item.href && item.linkLabel && (
                <Link
                  href={item.href}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '13px', fontWeight: 500, color: 'var(--accent)',
                    textDecoration: 'none', flexShrink: 0,
                    transition: 'opacity 150ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  {item.linkLabel}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Notes */}
      {!isAlreadyCompleted && (
        <div style={{ marginBottom: '16px' }}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes du jour (facultatif)..."
            rows={3}
            style={{
              width: '100%', resize: 'vertical',
              background: 'var(--app-surface)',
              border: '1px solid var(--app-border)',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '14px', color: 'var(--app-text)',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 150ms',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)' }}
          />
        </div>
      )}

      {/* Sticky validate button */}
      <div style={{
        position: 'sticky', bottom: '20px',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <p style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>
          {isAlreadyCompleted ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 500 }}>
              <CheckCircle size={16} weight="fill" /> Jour complété
            </span>
          ) : allChecked
            ? 'Toutes les tâches complétées !'
            : `${checkedCount}/${items.length} tâches complétées`
          }
        </p>

        <button
          onClick={handleValidate}
          disabled={!allChecked || saving || isAlreadyCompleted}
          style={{
            background: isAlreadyCompleted ? 'var(--success-soft)' : allChecked ? 'var(--success)' : 'var(--app-border)',
            color: isAlreadyCompleted ? 'var(--success)' : allChecked ? '#fff' : 'var(--app-text-ghost)',
            border: 'none', borderRadius: '10px',
            padding: '12px 24px', fontSize: '14px', fontWeight: 600,
            cursor: allChecked && !isAlreadyCompleted ? 'pointer' : 'not-allowed',
            transition: 'all 200ms',
            whiteSpace: 'nowrap',
          }}
        >
          {saving ? 'Enregistrement...' : isAlreadyCompleted ? 'Jour validé ✓' : `Valider le Jour ${dayNumber} →`}
        </button>
      </div>
    </div>
  )
}
