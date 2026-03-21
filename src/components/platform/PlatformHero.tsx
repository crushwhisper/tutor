'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users } from '@phosphor-icons/react'

const MODULES = [
  { name: 'Anatomie', pct: 78, color: '#0099ff' },
  { name: 'Biologie cellulaire', pct: 65, color: '#8B5CF6' },
  { name: 'Médecine interne', pct: 42, color: '#10B981' },
]

function AppMockup() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: 'linear-gradient(145deg, #0F172A, #0C1222)',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)',
        transform: 'perspective(1200px) rotateY(-5deg) rotateX(2deg)',
        maxWidth: '420px',
      }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Tableau de bord</div>
          <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '17px', fontWeight: 700, color: 'white' }}>Bonne continuation</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,153,255,0.15)', border: '1px solid rgba(0,153,255,0.3)', borderRadius: '8px', padding: '6px 12px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0099ff' }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600, color: '#0099ff' }}>Jour 34</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[['563', 'Cours'], ['47%', 'Score'], ['12j', 'Streak']].map(([val, label]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Halant', Georgia, serif", fontSize: '20px', fontWeight: 700, color: 'white', lineHeight: 1 }}>{val}</div>
            <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Module progress */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
        <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Progression</div>
        {MODULES.map((m) => (
          <div key={m.name} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{m.name}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: m.color }}>{m.pct}%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${m.pct}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', background: m.color, borderRadius: '2px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

export default function PlatformHero() {
  return (
    <section style={{
      minHeight: '90vh', paddingTop: '160px', paddingBottom: '80px',
      background: '#FFFFFF',
      backgroundImage: [
        'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(0,153,255,0.04) 0%, transparent 70%)',
        'radial-gradient(ellipse 50% 40% at 20% 80%, rgba(139,92,246,0.03) 0%, transparent 70%)',
      ].join(', '),
      position: 'relative',
    }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: '64px', alignItems: 'center' }}
          className="grid-cols-1 lg:grid-cols-[55%_45%]">

          {/* Left */}
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            {/* Badge */}
            <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '1px solid #e8d3c0', background: '#f6f0e9',
                borderRadius: '999px', padding: '6px 16px',
              }}>
                <Users size={14} style={{ color: '#94877c' }} />
                <span style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', fontWeight: 500, color: '#94877c' }}>
                  Utilisé par +1000 étudiants
                </span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
              <h1 style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: 'clamp(44px, 6vw, 76px)',
                fontWeight: 800, lineHeight: 1.0,
                letterSpacing: '-3px', color: '#2b180a',
                marginBottom: '4px',
              }}>
                La préparation
              </h1>
              <h1 style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: 'clamp(44px, 6vw, 76px)',
                fontWeight: 800, lineHeight: 1.0,
                letterSpacing: '-3px', color: '#2b180a',
                marginBottom: '4px',
              }}>
                qui structure
              </h1>
              <h1 style={{
                fontFamily: "'Halant', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 'clamp(44px, 6vw, 76px)',
                fontWeight: 700, lineHeight: 1.0,
                letterSpacing: '-2px', color: '#0099ff',
              }}>
                votre réussite.
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p variants={itemVariants} style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '17px', fontWeight: 400,
              color: '#94877c', maxWidth: '440px',
              lineHeight: 1.7, marginBottom: '40px',
            }}>
              563 cours structurés. Programmes jour par jour.
              Outils de révision intégrés.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <Link href="/auth/signup" style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '15px', fontWeight: 600,
                color: 'white', textDecoration: 'none',
                background: '#0099ff', borderRadius: '12px',
                padding: '14px 28px',
                boxShadow: '0 0 0 1px rgba(0,153,255,0.3), 0 0 30px rgba(0,153,255,0.2)',
                transition: 'box-shadow 300ms, transform 200ms',
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(0,153,255,0.5), 0 0 50px rgba(0,153,255,0.35)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(0,153,255,0.3), 0 0 30px rgba(0,153,255,0.2)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
              >
                Commencer gratuitement
              </Link>
              <a href="#outils" style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '15px', fontWeight: 500,
                color: '#2b180a', textDecoration: 'none',
                border: '1px solid #D4D4D4', borderRadius: '12px',
                padding: '14px 28px',
                transition: 'border-color 200ms, background 200ms',
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#94877c'
                  ;(e.currentTarget as HTMLElement).style.background = '#f6f0e9'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#D4D4D4'
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                Voir les outils
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={itemVariants}>
              <p style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '13px', fontWeight: 500, color: '#94877c' }}>
                ★★★★★ Recommandé par des médecins résidents
              </p>
            </motion.div>
          </motion.div>

          {/* Right — mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', justifyContent: 'center' }}
            className="hidden lg:flex"
          >
            <AppMockup />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
