'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckSquare, Square, ClipboardText, Lightning, CheckCircle, BookOpenText, CaretRight } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'

interface CourseItem {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string | null
  duration_minutes: number | null
  modules: { slug: string; name: string } | null
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

// ─── TOC extraction ───────────────────────────────────────────────────────────

function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],
    [100,'C'],[90,'XC'],[50,'L'],[40,'XL'],
    [10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I'],
  ]
  let result = ''
  for (const [val, sym] of map) {
    while (n >= val) { result += sym; n -= val }
  }
  return result
}

function extractTOC(content: string): { level: 'chapter' | 'section'; label: string }[] {
  const lines = content.split('\n')
  let chapterCount = 0
  let sectionCount = 0
  const toc: { level: 'chapter' | 'section'; label: string }[] = []

  for (const line of lines) {
    if (/^## /.test(line)) {
      chapterCount++
      sectionCount = 0
      const heading = line.replace(/^## /, '').trim()
      toc.push({ level: 'chapter', label: `${toRoman(chapterCount)}. ${heading}` })
    } else if (/^### /.test(line)) {
      sectionCount++
      const heading = line.replace(/^### /, '').trim()
      toc.push({ level: 'section', label: `${sectionCount}. ${heading}` })
    }
  }
  return toc
}

// ─── Academic course card ─────────────────────────────────────────────────────

function CourseCard({ course }: { course: CourseItem }) {
  const [expanded, setExpanded] = useState(true)
  const toc = extractTOC(course.content ?? '')
  const href = course.modules
    ? `/app/preparation/${course.modules.slug}/${course.slug}`
    : null

  return (
    <div style={{
      background: 'var(--app-surface)',
      border: '1px solid var(--app-border)',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'border-color 200ms',
    }}
    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)'}
    >
      {/* Card header */}
      <div style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        borderBottom: expanded && toc.length > 0 ? '1px solid var(--app-border)' : 'none',
        cursor: toc.length > 0 ? 'pointer' : 'default',
      }}
      onClick={() => toc.length > 0 && setExpanded(v => !v)}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <BookOpenText size={18} style={{ color: 'var(--accent)' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '15px', fontWeight: 700,
            color: 'var(--app-text)',
            lineHeight: 1.35, marginBottom: '4px',
          }}>
            {course.title}
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {course.modules && (
              <span style={{ fontSize: '11px', color: 'var(--app-text-ghost)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {course.modules.name}
              </span>
            )}
            {course.duration_minutes && (
              <span style={{ fontSize: '11px', color: 'var(--app-text-ghost)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                {course.duration_minutes} min
              </span>
            )}
            {toc.length > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--app-text-ghost)' }}>
                {toc.filter(t => t.level === 'chapter').length} chapitres
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {href && (
            <Link
              href={href}
              onClick={e => e.stopPropagation()}
              style={{
                fontSize: '12px', fontWeight: 600,
                color: 'var(--accent)', textDecoration: 'none',
                border: '1px solid var(--accent-soft)',
                borderRadius: '8px', padding: '6px 12px',
                background: 'var(--accent-soft)',
                transition: 'all 150ms',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'var(--accent)'
                el.style.color = '#fff'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'var(--accent-soft)'
                el.style.color = 'var(--accent)'
              }}
            >
              Ouvrir →
            </Link>
          )}
          {toc.length > 0 && (
            <CaretRight
              size={14}
              style={{
                color: 'var(--app-text-ghost)',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 200ms',
              }}
            />
          )}
        </div>
      </div>

      {/* TOC tree */}
      {expanded && toc.length > 0 && (
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {toc.map((item, i) => (
            <div
              key={i}
              style={{
                paddingLeft: item.level === 'section' ? '20px' : '0px',
                display: 'flex', alignItems: 'baseline', gap: '8px',
              }}
            >
              {item.level === 'section' && (
                <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#9ca3af', flexShrink: 0, marginTop: '6px' }} />
              )}
              <span style={{
                fontSize: item.level === 'chapter' ? '13px' : '12px',
                fontWeight: item.level === 'chapter' ? 600 : 400,
                color: item.level === 'chapter' ? '#1e3a8a' : '#374151',
                lineHeight: 1.5,
                fontFamily: item.level === 'chapter' ? 'inherit' : 'inherit',
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No content fallback */}
      {toc.length === 0 && course.summary && (
        <div style={{ padding: '0 24px 18px', borderTop: '1px solid var(--app-border)' }}>
          <p style={{ fontSize: '13px', color: 'var(--app-text-muted)', lineHeight: 1.6, paddingTop: '14px' }}>
            {course.summary}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DayContent({
  programId,
  dayNumber,
  programType,
  courses,
  qcmCount,
  isAlreadyCompleted,
  existingNotes,
}: Props) {
  const router = useRouter()
  const { addToast } = useAppStore()

  // Zone B — only QCM + Flashcards (courses are shown in Zone A)
  const tasks = [
    ...(qcmCount > 0 ? [{
      id: 'qcm',
      label: 'QCM du jour',
      sublabel: `${qcmCount} questions`,
      href: '/app/examen-blanc' as string | null,
      icon: <ClipboardText size={14} style={{ color: 'var(--warning)' }} />,
      linkLabel: 'Faire le QCM →',
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
      ? Object.fromEntries(tasks.map(t => [t.id, true]))
      : {}
  )
  const [notes, setNotes] = useState(existingNotes)
  const [saving, setSaving] = useState(false)

  const allChecked = tasks.every(t => checked[t.id])
  const checkedCount = tasks.filter(t => checked[t.id]).length

  function toggle(id: string) {
    if (isAlreadyCompleted) return
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Zone A : Cours du jour ── */}
      {courses.length > 0 && (
        <div>
          <p style={{
            fontSize: '11px', fontWeight: 600, letterSpacing: '1px',
            textTransform: 'uppercase', color: 'var(--app-text-ghost)',
            marginBottom: '12px',
          }}>
            Cours du jour
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* ── Zone B : Tâches & Révisions ── */}
      <div>
        <p style={{
          fontSize: '11px', fontWeight: 600, letterSpacing: '1px',
          textTransform: 'uppercase', color: 'var(--app-text-ghost)',
          marginBottom: '12px',
        }}>
          Tâches &amp; Révisions
        </p>

        <div style={{
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          borderRadius: '14px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--app-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>
              {isAlreadyCompleted ? 'Tâches complétées' : 'Cocher après completion'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--app-text-ghost)', fontFamily: 'var(--font-geist-mono), monospace' }}>
              {checkedCount}/{tasks.length}
            </span>
          </div>

          {tasks.map((task, idx) => {
            const isChecked = checked[task.id] ?? false
            const isLast = idx === tasks.length - 1
            return (
              <div
                key={task.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '18px 20px',
                  borderBottom: isLast ? 'none' : '1px solid var(--app-border)',
                  background: isChecked ? 'var(--success-soft)' : 'transparent',
                  transition: 'background 200ms',
                  cursor: isAlreadyCompleted ? 'default' : 'pointer',
                }}
                onClick={() => toggle(task.id)}
              >
                <div style={{ flexShrink: 0 }}>
                  {isChecked
                    ? <CheckSquare size={22} weight="fill" style={{ color: 'var(--success)' }} />
                    : <Square size={22} style={{ color: 'var(--app-border)' }} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px', fontWeight: 500,
                    color: isChecked ? 'var(--app-text-muted)' : 'var(--app-text)',
                    textDecoration: isChecked ? 'line-through' : 'none',
                    transition: 'all 200ms',
                  }}>{task.label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--app-text-ghost)', marginTop: '2px' }}>
                    {task.sublabel}
                  </p>
                </div>
                {task.href && task.linkLabel && (
                  <Link
                    href={task.href}
                    onClick={e => e.stopPropagation()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '13px', fontWeight: 500, color: 'var(--accent)',
                      textDecoration: 'none', flexShrink: 0,
                      transition: 'opacity 150ms',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                  >
                    {task.linkLabel}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      {!isAlreadyCompleted && (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
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
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--app-border)' }}
        />
      )}

      {/* Sticky validate */}
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
            : `${checkedCount}/${tasks.length} tâches complétées`
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
