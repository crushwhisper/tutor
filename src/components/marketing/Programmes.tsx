'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Circle } from '@phosphor-icons/react'

// Calendar visual for 6-month programme
function CalendarVisual() {
  const days = Array.from({ length: 35 }, (_, i) => i + 1)
  const currentDay = 22
  const totalDays = 35

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: 'white',
        border: '1px solid #E4E4E7',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '12px',
          fontWeight: 600,
          color: '#71717A',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '16px',
        }}
      >
        Programme 6 mois
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
        }}
      >
        {days.map((day) => {
          const isPast = day < currentDay
          const isCurrent = day === currentDay
          const isFuture = day > currentDay

          return (
            <div
              key={day}
              style={{
                borderRadius: '8px',
                padding: '6px 4px',
                textAlign: 'center',
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: isCurrent ? 700 : 400,
                ...(isPast
                  ? {
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      color: '#10B981',
                    }
                  : isCurrent
                  ? {
                      background: '#6366F1',
                      color: 'white',
                      boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                    }
                  : {
                      background: '#F4F4F5',
                      color: '#A1A1AA',
                    }),
              }}
            >
              {day}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Checklist visual for 3-month programme
function ChecklistVisual() {
  const items = [
    { text: 'Cardiologie — Insuffisance cardiaque', done: true },
    { text: 'QCM · 20 questions', done: true },
    { text: 'Flashcards · 15 cartes', done: false },
    { text: 'Révision Audio · 12 min', done: false },
  ]

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      style={{
        background: 'white',
        border: '1px solid #E4E4E7',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: '#09090B',
          marginBottom: '16px',
        }}
      >
        Aujourd&apos;hui · Jour 23
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {items.map((item) => (
          <div
            key={item.text}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {item.done ? (
              <CheckCircle size={18} weight="fill" style={{ color: '#10B981', flexShrink: 0 }} />
            ) : (
              <Circle size={18} style={{ color: '#D4D4D8', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                color: item.done ? '#71717A' : '#09090B',
                textDecoration: item.done ? 'line-through' : 'none',
              }}
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <span
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '12px',
              color: '#71717A',
            }}
          >
            47% du programme
          </span>
        </div>
        <div
          style={{
            height: '4px',
            background: '#F4F4F5',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '47%',
              background: '#F59E0B',
              borderRadius: '2px',
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function Programmes() {
  return (
    <section id="programmes" style={{ padding: '120px 0', background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div style={{ marginBottom: '80px' }}>
          <p
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#71717A',
              marginBottom: '16px',
            }}
          >
            PROGRAMMES
          </p>
          <h2
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: '#09090B',
              lineHeight: 1.15,
            }}
          >
            Un parcours structuré,{' '}
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
              }}
            >
              jour après jour.
            </span>
          </h2>
        </div>

        {/* Block 1 — 6 mois: text left, visual right */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring' as const, stiffness: 80, damping: 20 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
            marginBottom: '80px',
          }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          {/* Left text */}
          <div>
            <h3
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '24px',
                fontWeight: 600,
                color: '#09090B',
                marginBottom: '16px',
              }}
            >
              Programme 6 mois
            </h3>
            <p
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '15px',
                color: '#3F3F46',
                lineHeight: 1.7,
                marginBottom: '24px',
                maxWidth: '420px',
              }}
            >
              Une approche progressive qui couvre l&apos;ensemble du programme. Idéal pour une préparation
              en profondeur, sans pression excessive.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['6 phases', 'Révision intégrée', 'Examens blancs'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#6366F1',
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '999px',
                    padding: '4px 12px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <CalendarVisual />
        </motion.div>

        {/* Block 2 — 3 mois: visual left, text right */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring' as const, stiffness: 80, damping: 20, delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          {/* Left visual */}
          <ChecklistVisual />

          {/* Right text */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <span
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#F59E0B',
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                INTENSIF
              </span>
            </div>
            <h3
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '24px',
                fontWeight: 600,
                color: '#09090B',
                marginBottom: '16px',
              }}
            >
              Programme 3 mois
            </h3>
            <p
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '15px',
                color: '#3F3F46',
                lineHeight: 1.7,
                marginBottom: '24px',
                maxWidth: '420px',
              }}
            >
              Pour ceux qui ont peu de temps mais une grande détermination. Un planning dense,
              optimisé pour maximiser la rétention en un minimum de jours.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['3 mois intensifs', 'Priorités ciblées', 'Révision quotidienne'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#6366F1',
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '999px',
                    padding: '4px 12px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
