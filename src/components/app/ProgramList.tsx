'use client'

import Link from 'next/link'
import { Lightning, CalendarDots } from '@phosphor-icons/react'
import type { Program } from '@/types'

interface Props {
  programs: Program[]
}

export default function ProgramList({ programs }: Props) {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '6px' }}>
          Programmes
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--app-text-muted)' }}>
          Chaque jour planifié pour vous.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {programs.map((program) => {
          const is90 = program.total_days <= 90
          const Icon = is90 ? Lightning : CalendarDots
          const accentColor = is90 ? 'var(--warning)' : 'var(--success)'
          const accentSoft = is90 ? 'var(--warning-soft)' : 'var(--success-soft)'
          const badge = is90 ? 'INTENSIF' : 'RECOMMANDÉ'

          return (
            <div
              key={program.id}
              style={{
                background: 'var(--app-surface)',
                border: '1px solid var(--app-border)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'box-shadow 300ms ease, transform 300ms ease, border-color 300ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                e.currentTarget.style.borderColor = 'var(--app-border-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'var(--app-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: accentSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={24} style={{ color: accentColor }} />
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '1px',
                  padding: '4px 10px', borderRadius: '999px',
                  background: accentSoft, color: accentColor,
                }}>
                  {badge}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: accentColor, fontFamily: 'var(--font-geist-mono), monospace', lineHeight: 1 }}>
                  {program.total_days}j
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--app-text)', marginTop: '8px' }}>
                  {program.title}
                </div>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', lineHeight: 1.6, flex: 1 }}>
                {program.description}
              </p>

              <Link
                href={`/app/programmes/${program.type}`}
                style={{
                  display: 'block', textAlign: 'center',
                  padding: '12px 20px', borderRadius: '12px',
                  background: 'var(--accent)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '14px', fontWeight: 600,
                  transition: 'opacity 200ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                Commencer le programme →
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
