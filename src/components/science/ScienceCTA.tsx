'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'

export default function ScienceCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [hovered, setHovered] = useState(false)

  return (
    <section ref={ref} style={{
      background: 'transparent',
      padding: '160px 0',
      textAlign: 'center',
    }}>
      <div className="max-w-3xl mx-auto px-6">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            border: '1px solid #e8d3c0',
            borderRadius: '999px',
            padding: '6px 20px',
            marginBottom: '48px',
            background: 'rgba(255,255,255,0.6)',
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0099ff' }} />
          <span style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '13px', fontWeight: 500,
            color: '#94877c',
          }}>Inscription gratuite</span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Halant', Georgia, serif",
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 600, color: '#2b180a',
            lineHeight: 1.1, letterSpacing: '-1px',
            marginBottom: '20px',
          }}
        >
          Prêt à appliquer la science ?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '17px', fontWeight: 300,
            color: '#94877c',
            marginBottom: '56px', lineHeight: 1.7,
          }}
        >
          TUTOR transforme ces principes en outils concrets.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Link
            href="/platform"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '16px', fontWeight: 600,
              color: 'white', textDecoration: 'none',
              background: hovered ? '#007acc' : '#0099ff',
              padding: '18px 44px',
              borderRadius: '999px',
              display: 'inline-block',
              boxShadow: hovered
                ? '0 0 0 4px rgba(0,153,255,0.15), 0 8px 24px rgba(0,153,255,0.3)'
                : '0 4px 16px rgba(0,153,255,0.2)',
              transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            Commencer votre préparation →
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '13px', color: '#dab697',
            marginTop: '24px',
          }}
        >
          Inscription gratuite · Aucune carte bancaire requise
        </motion.p>
      </div>
    </section>
  )
}
