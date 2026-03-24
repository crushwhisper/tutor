'use client'

import Link from 'next/link'
import { CheckCircle, Lock, Clock } from '@phosphor-icons/react'
import type { Course } from '@/types/database'

const DIFFICULTY_LABEL: Record<string, string> = {
  facile: 'Facile', moyen: 'Moyen', difficile: 'Difficile',
}
const DIFFICULTY_COLOR: Record<string, string> = {
  facile: 'var(--success)',
  moyen: 'var(--warning)',
  difficile: '#E85555',
}

interface Props {
  course: Course
  index: number
  total: number
  isLocked: boolean
  isCompleted: boolean
  score: number | null
  moduleSlug: string
  accentColor: string
}

export default function CourseRow({ course, index, total, isLocked, isCompleted, score, moduleSlug, accentColor }: Props) {
  const diffColor = DIFFICULTY_COLOR[course.difficulty] ?? 'var(--app-text-ghost)'
  const isLast = index === total - 1
  const href = isLocked ? '/pricing' : `/app/preparation/${moduleSlug}/${course.slug}`

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 20px',
        textDecoration: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--app-border)',
        opacity: isLocked ? 0.6 : 1,
        transition: 'background 150ms',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isLocked) e.currentTarget.style.background = 'var(--app-surface-hover, rgba(0,0,0,0.02))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {/* Number / state */}
      <div style={{
        width: '28px', flexShrink: 0,
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: '13px', fontWeight: 500,
        color: isCompleted ? 'var(--success)' : 'var(--app-text-ghost)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isCompleted
          ? <CheckCircle size={18} weight="fill" style={{ color: 'var(--success)' }} />
          : isLocked
          ? <Lock size={16} style={{ color: 'var(--app-text-ghost)' }} />
          : String(index + 1).padStart(2, '0')}
      </div>

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '14px', fontWeight: 500,
          color: 'var(--app-text)',
          marginBottom: '4px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {course.title}
          {course.is_premium && !isLocked && (
            <span style={{
              marginLeft: '8px',
              fontSize: '10px', fontWeight: 600,
              background: 'var(--warning-soft, rgba(245,158,11,0.1))',
              color: 'var(--warning)',
              padding: '2px 8px', borderRadius: '999px',
              letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>Pro</span>
          )}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, color: diffColor }}>
            {DIFFICULTY_LABEL[course.difficulty]}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--app-text-ghost)' }}>
            <Clock size={11} />
            {course.duration_minutes} min
          </span>
          {score != null && (
            <span style={{ fontSize: '11px', color: 'var(--app-text-ghost)' }}>
              Score : {score}%
            </span>
          )}
        </div>
      </div>

      {/* CTA label */}
      <span style={{
        fontSize: '12px', fontWeight: 600,
        color: isLocked ? 'var(--app-text-ghost)' : accentColor,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        {isLocked ? 'Débloquer' : isCompleted ? 'Revoir →' : 'Étudier →'}
      </span>
    </Link>
  )
}
