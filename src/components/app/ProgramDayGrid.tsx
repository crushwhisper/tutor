'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import type { Program } from '@/types'

interface CompletionEntry {
  day_number: number
  completed: boolean
  score?: number | null
}

interface Props {
  program: Program
  completionMap: Record<number, CompletionEntry>
  completedDays: number
  programType: string
}

export default function ProgramDayGrid({ program, completionMap, completedDays, programType }: Props) {
  const progressPct = Math.round((completedDays / program.total_days) * 100)
  const currentDay = completedDays + 1
  const totalDays = program.total_days
  const weeks = Math.ceil(totalDays / 7)

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <Link
          href="/app/programmes"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: 'var(--app-text-muted)',
            textDecoration: 'none', transition: 'color 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--app-text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--app-text-muted)' }}
        >
          <ArrowLeft size={14} />
          Programmes
        </Link>
        <span style={{ color: 'var(--app-border)', fontSize: '13px' }}>/</span>
        <span style={{ fontSize: '13px', color: 'var(--app-text)', fontWeight: 500 }}>
          {program.title}
        </span>
      </div>

      {/* Header + progress */}
      <div style={{
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '4px' }}>
              {program.title}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--app-text-muted)' }}>
              {program.total_days} jours de préparation
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-geist-mono), monospace' }}>
              {progressPct}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>
              {completedDays}/{program.total_days} jours
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', background: 'var(--app-border)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'var(--accent)',
            borderRadius: '999px',
            transition: 'width 600ms ease',
          }} />
        </div>
      </div>

      {/* Day grid — 7 columns (weeks) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Week day labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
            <div key={d} style={{
              textAlign: 'center', fontSize: '11px', fontWeight: 500,
              color: 'var(--app-text-ghost)', padding: '4px 0',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {d}
            </div>
          ))}
        </div>

        {Array.from({ length: weeks }, (_, weekIndex) => (
          <div key={weekIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const day = weekIndex * 7 + dayIndex + 1
              if (day > totalDays) return <div key={dayIndex} />

              const comp = completionMap[day]
              const isCompleted = comp?.completed ?? false
              const isCurrent = day === currentDay
              const score = comp?.score

              let bg = 'var(--app-surface)'
              let border = '1px solid var(--app-border)'
              let textColor = 'var(--app-text-muted)'

              if (isCompleted) {
                bg = 'var(--success-soft)'
                border = '1px solid rgba(16,185,129,0.25)'
                textColor = 'var(--success)'
              } else if (isCurrent) {
                bg = 'var(--accent-soft)'
                border = '2px solid var(--accent)'
                textColor = 'var(--accent)'
              }

              return (
                <Link
                  key={day}
                  href={`/app/programmes/${programType}/${day}`}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '10px 4px',
                    background: bg, border, borderRadius: '10px',
                    textDecoration: 'none', cursor: 'pointer',
                    transition: 'transform 150ms, box-shadow 150ms',
                    minHeight: '60px',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {isCompleted && (
                    <CheckCircle
                      size={12}
                      weight="fill"
                      style={{ color: 'var(--success)', position: 'absolute', top: '6px', right: '6px' }}
                    />
                  )}
                  <span style={{
                    fontSize: '14px', fontWeight: isCurrent ? 800 : 600,
                    color: textColor,
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}>
                    {day}
                  </span>
                  {score !== null && score !== undefined && (
                    <span style={{
                      fontSize: '10px', color: 'var(--success)',
                      fontFamily: 'var(--font-geist-mono), monospace',
                      fontWeight: 500, marginTop: '2px',
                    }}>
                      {score}%
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: '20px', marginTop: '24px',
        padding: '16px 20px',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: '12px',
      }}>
        {[
          { color: 'var(--success)', bg: 'var(--success-soft)', label: 'Complété' },
          { color: 'var(--accent)', bg: 'var(--accent-soft)', label: 'Jour en cours' },
          { color: 'var(--app-text-muted)', bg: 'var(--app-surface)', label: 'À venir' },
        ].map(({ color, bg, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px', height: '16px', borderRadius: '4px',
              background: bg, border: `1.5px solid ${color}`,
            }} />
            <span style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
