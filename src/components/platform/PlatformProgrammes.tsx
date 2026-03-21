'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const PHASES_180 = [
  { label: 'Acquisition', detail: '16 sem · 418 cours', pct: 0 },
  { label: 'Urgences', detail: '6 sem · 145 QCM', pct: 50 },
  { label: 'Consolidation', detail: '4 sem · Examens', pct: 100 },
]

const PHASES_90 = [
  { label: 'Acquisition', detail: '7 sem · 200 cours', pct: 0 },
  { label: 'Intensif', detail: '3 sem · QCM', pct: 50 },
  { label: 'Exam prep', detail: '2 sem · Blancs', pct: 100 },
]

function Timeline({ phases, color }: { phases: typeof PHASES_180; color: string }) {
  return (
    <div style={{ padding: '24px 0', position: 'relative' }}>
      {/* Track */}
      <div style={{ position: 'absolute', top: '44px', left: '24px', right: '24px', height: '2px', background: '#E5E5E5', zIndex: 0 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        {phases.map((phase, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: color, flexShrink: 0,
              boxShadow: `0 0 12px ${color}60`,
            }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', fontWeight: 600, color: '#0A0A0A', marginBottom: '2px' }}>{phase.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#A3A3A3' }}>{phase.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgrammeCard({ title, badge, badgeColor, price, phases, ctaHref, ctaLabel, ctaStyle, delay }: {
  title: string; badge: string; badgeColor: string; price: string;
  phases: typeof PHASES_180; ctaHref: string; ctaLabel: string;
  ctaStyle: React.CSSProperties; delay: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'white',
        border: `1px solid ${badge === 'RECOMMANDÉ' ? 'rgba(59,130,246,0.25)' : '#E5E5E5'}`,
        borderRadius: '20px', padding: '40px',
        boxShadow: badge === 'RECOMMANDÉ' ? '0 0 40px rgba(59,130,246,0.06)' : 'none',
        display: 'flex', flexDirection: 'column', gap: '0',
      }}
    >
      {/* Badge + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <h3 style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '22px', fontWeight: 700, color: '#0A0A0A' }}>{title}</h3>
        <span style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
          color: 'white', background: badgeColor,
          borderRadius: '999px', padding: '3px 10px',
        }}>{badge}</span>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '32px', fontWeight: 700, color: '#0A0A0A' }}>{price}</span>
      </div>

      {/* Timeline */}
      <Timeline phases={phases} color={badgeColor} />

      {/* CTA */}
      <Link href={ctaHref} style={{
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontSize: '14px', fontWeight: 600,
        textDecoration: 'none', textAlign: 'center',
        padding: '14px', borderRadius: '12px',
        marginTop: '8px', display: 'block',
        transition: 'all 300ms',
        ...ctaStyle,
      }}>
        {ctaLabel}
      </Link>
    </motion.div>
  )
}

export default function PlatformProgrammes() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="programmes" ref={ref} style={{ background: '#F8F8F8', padding: '120px 0' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '4px', color: '#3B82F6', marginBottom: '20px' }}
          >Programmes</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            <h2 style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', color: '#0A0A0A', lineHeight: 1.1, marginBottom: '4px' }}>
              Un parcours clair.
            </h2>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 52px)', color: '#A3A3A3', lineHeight: 1.1 }}>
              Du jour 1 au jour du concours.
            </h2>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="grid-cols-1 lg:grid-cols-2">
          <ProgrammeCard
            title="Programme 6 mois"
            badge="RECOMMANDÉ"
            badgeColor="#3B82F6"
            price="79 DH / mois"
            phases={PHASES_180}
            ctaHref="/auth/signup?plan=pro"
            ctaLabel="Commencer ce programme →"
            ctaStyle={{ background: '#3B82F6', color: 'white', boxShadow: '0 0 20px rgba(59,130,246,0.25)' }}
            delay={0}
          />
          <ProgrammeCard
            title="Programme 3 mois"
            badge="INTENSIF"
            badgeColor="#F59E0B"
            price="99 DH / mois"
            phases={PHASES_90}
            ctaHref="/auth/signup?plan=pro"
            ctaLabel="Choisir ce programme"
            ctaStyle={{ border: '1px solid #E5E5E5', color: '#525252' }}
            delay={0.1}
          />
        </div>
      </div>
    </section>
  )
}
