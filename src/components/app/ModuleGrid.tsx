'use client'

import Link from 'next/link'
import {
  Dna, Heartbeat, Scissors, Siren, Lightning,
} from '@phosphor-icons/react'
import type { Module } from '@/types/database'

const MODULE_META: Record<string, {
  Icon: React.ElementType
  color: string
  bg: string
  description: string
}> = {
  'anatomie-biologie': {
    Icon: Dna,
    color: '#4A90D9',
    bg: 'rgba(74,144,217,0.08)',
    description: 'Bases fondamentales en anatomie et biologie médicale',
  },
  'medecine': {
    Icon: Heartbeat,
    color: '#E8A83E',
    bg: 'rgba(232,168,62,0.08)',
    description: 'Pathologies médicales, diagnostics et prise en charge clinique',
  },
  'chirurgie': {
    Icon: Scissors,
    color: '#E85555',
    bg: 'rgba(232,85,85,0.08)',
    description: 'Pathologies chirurgicales, indications opératoires et techniques',
  },
  'urgences-medicales': {
    Icon: Siren,
    color: '#9B59B6',
    bg: 'rgba(155,89,182,0.08)',
    description: 'Prise en charge des urgences médicales',
  },
  'urgences-chirurgicales': {
    Icon: Lightning,
    color: '#E67E22',
    bg: 'rgba(230,126,34,0.08)',
    description: 'Prise en charge des urgences chirurgicales',
  },
}

type ModuleWithCount = Module & { courseCount: number }

interface Props {
  modules: ModuleWithCount[]
  isPro: boolean
}

export default function ModuleGrid({ modules, isPro }: Props) {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '6px', letterSpacing: '-0.3px' }}>
          Préparation Libre
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--app-text-muted)' }}>
          Choisissez un module pour accéder aux cours.
        </p>
      </div>

      {modules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--app-text-muted)', fontSize: '14px' }}>
          Aucun module disponible pour le moment.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {modules.map((mod) => {
            const meta = MODULE_META[mod.slug]
            const Icon = meta?.Icon
            const courseCount = mod.courseCount ?? 0

            return (
              <Link
                key={mod.id}
                href={`/app/preparation/${mod.slug}`}
                style={{
                  display: 'block',
                  background: 'var(--app-surface)',
                  border: '1px solid var(--app-border)',
                  borderRadius: '16px',
                  padding: '24px',
                  textDecoration: 'none',
                  transition: 'border-color 200ms, box-shadow 200ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = meta?.color ?? 'var(--accent)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--app-border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: meta?.bg ?? 'var(--accent-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {Icon && <Icon size={24} weight="duotone" style={{ color: meta?.color }} />}
                  </div>
                  <span style={{
                    fontSize: '12px', color: 'var(--app-text-ghost)',
                    background: 'var(--app-bg)', border: '1px solid var(--app-border)',
                    borderRadius: '999px', padding: '3px 10px',
                  }}>
                    {courseCount} cours
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '8px' }}>
                  {mod.name}
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--app-text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {meta?.description ?? mod.description}
                </p>

                <div style={{ fontSize: '13px', fontWeight: 600, color: meta?.color ?? 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Explorer →
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {!isPro && (
        <div style={{
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-glow)',
          borderRadius: '14px',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '4px' }}>
              Accès limité
            </p>
            <p style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>
              Certains cours sont réservés aux membres Pro. Passez à Pro pour tout débloquer.
            </p>
          </div>
          <Link
            href="/pricing"
            style={{
              flexShrink: 0,
              background: 'var(--accent)', color: 'white',
              padding: '10px 18px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Passer à Pro
          </Link>
        </div>
      )}
    </div>
  )
}
