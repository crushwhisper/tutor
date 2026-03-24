'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import DayContent from '@/components/app/DayContent'
import type { Program, ProgramDay, DayCompletion } from '@/types'

interface CourseWithModule {
  id: string
  title: string
  slug: string
  modules: { slug: string; name: string } | null
}

interface Props {
  program: Program
  programDay: ProgramDay | null
  completion: DayCompletion | null
  courses: CourseWithModule[]
  dayNum: number
  programType: string
}

export default function ProgramDayPageClient({ program, programDay, completion, courses, dayNum, programType }: Props) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <Link
          href="/app/programmes"
          style={{ fontSize: '13px', color: 'var(--app-text-muted)', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--app-text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--app-text-muted)' }}
        >
          Programmes
        </Link>
        <span style={{ color: 'var(--app-border)' }}>/</span>
        <Link
          href={`/app/programmes/${programType}`}
          style={{ fontSize: '13px', color: 'var(--app-text-muted)', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--app-text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--app-text-muted)' }}
        >
          {program.title}
        </Link>
        <span style={{ color: 'var(--app-border)' }}>/</span>
        <span style={{ fontSize: '13px', color: 'var(--app-text)', fontWeight: 500 }}>
          Jour {dayNum}
        </span>
      </div>

      {/* Day header */}
      <div style={{
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 600, letterSpacing: '1px',
            textTransform: 'uppercase', color: 'var(--accent)',
            background: 'var(--accent-soft)', padding: '3px 10px', borderRadius: '999px',
          }}>
            Jour {dayNum}
          </span>
          {completion?.completed && (
            <span style={{
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px',
              color: 'var(--success)', background: 'var(--success-soft)',
              padding: '3px 10px', borderRadius: '999px',
            }}>
              Complété
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '8px' }}>
          {programDay?.title ?? `Jour ${dayNum}`}
        </h1>

        {programDay?.description && (
          <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
            {programDay.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>
            <strong style={{ color: 'var(--app-text)', fontFamily: 'var(--font-geist-mono), monospace' }}>
              {programDay?.estimated_hours ?? 3}h
            </strong>{' '}estimées
          </span>
          {(programDay?.qcm_count ?? 0) > 0 && (
            <span style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>
              <strong style={{ color: 'var(--app-text)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                {programDay?.qcm_count}
              </strong>{' '}QCM
            </span>
          )}
          <span style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>
            <strong style={{ color: 'var(--app-text)', fontFamily: 'var(--font-geist-mono), monospace' }}>
              {courses.length}
            </strong>{' '}cours
          </span>
        </div>
      </div>

      {/* Interactive checklist + validation */}
      <DayContent
        programId={program.id}
        dayNumber={dayNum}
        programType={programType}
        courses={courses}
        objectives={programDay?.objectives ?? []}
        qcmCount={programDay?.qcm_count ?? 0}
        isAlreadyCompleted={completion?.completed ?? false}
        existingNotes={completion?.notes ?? ''}
      />

      {/* Prev / Next navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '20px' }}>
        {dayNum > 1 ? (
          <Link
            href={`/app/programmes/${programType}/${dayNum - 1}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: 'var(--app-text-muted)',
              background: 'var(--app-surface)', border: '1px solid var(--app-border)',
              borderRadius: '10px', padding: '10px 16px', textDecoration: 'none',
              transition: 'border-color 150ms, color 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--app-border-hover)'; e.currentTarget.style.color = 'var(--app-text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)'; e.currentTarget.style.color = 'var(--app-text-muted)' }}
          >
            <ArrowLeft size={14} /> Jour {dayNum - 1}
          </Link>
        ) : <div />}

        {dayNum < program.total_days && (
          <Link
            href={`/app/programmes/${programType}/${dayNum + 1}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: 'var(--app-text-muted)',
              background: 'var(--app-surface)', border: '1px solid var(--app-border)',
              borderRadius: '10px', padding: '10px 16px', textDecoration: 'none',
              transition: 'border-color 150ms, color 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--app-border-hover)'; e.currentTarget.style.color = 'var(--app-text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)'; e.currentTarget.style.color = 'var(--app-text-muted)' }}
          >
            Jour {dayNum + 1} <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}
