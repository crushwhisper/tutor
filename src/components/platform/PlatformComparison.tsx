'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { X, Check } from '@phosphor-icons/react'

const THEM = [
  'Relecture passive des cours',
  'Annales non corrigées',
  'Aucune structure de révision',
  'Aucun suivi de progression',
  'Isolement total',
]

const US = [
  'Rappel actif et testing effect',
  'QCM corrigés avec explications',
  'Programme structuré jour par jour',
  'Dashboard et analyse des faiblesses',
  'Journal + feedback personnalisé',
]

export default function PlatformComparison() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{ background: '#f6f0e9', padding: '120px 0' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', color: '#2b180a', lineHeight: 1.1, marginBottom: '4px' }}
          >
            Pas une méthode de plus.
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.08 }}
            style={{ fontFamily: "'Halant', Georgia, serif", fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 52px)', color: '#94877c', lineHeight: 1.1 }}
          >
            La bonne méthode.
          </motion.h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="grid-cols-1 lg:grid-cols-2">

          {/* THEM */}
          <motion.div
            initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ background: '#fcf6ef', border: '1px solid #e8d3c0', borderRadius: '20px', overflow: 'hidden' }}
          >
            <div style={{ background: '#F1F1F1', padding: '20px 32px', borderBottom: '1px solid #e8d3c0' }}>
              <span style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '16px', fontWeight: 600, color: '#94877c' }}>Révision classique</span>
            </div>
            <ul style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {THEM.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '15px', color: '#94877c' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(244,63,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <X size={12} weight="bold" style={{ color: '#F43F5E' }} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* US */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.18 }}
            style={{
              background: '#fcf6ef',
              border: '1px solid rgba(0,153,255,0.25)',
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(0,153,255,0.08), 0 8px 40px rgba(0,153,255,0.06)',
            }}
          >
            <div style={{ background: '#0099ff', padding: '20px 32px', borderBottom: '1px solid rgba(0,153,255,0.3)' }}>
              <span style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '16px', fontWeight: 600, color: 'white' }}>TUTOR</span>
            </div>
            <ul style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {US.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '15px', color: '#2b180a' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} weight="bold" style={{ color: '#10B981' }} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
