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
      background: 'linear-gradient(to bottom, #0A0A0A, #0D0D10)',
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
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '999px',
            padding: '6px 18px',
            marginBottom: '48px',
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
          <span style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '13px', fontWeight: 500,
            color: 'rgba(255,255,255,0.4)',
          }}>
            Inscription gratuite
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 700, color: 'white',
            lineHeight: 1.1, letterSpacing: '-2px',
            marginBottom: '20px',
          }}
        >
          Prêt à appliquer la science ?
        </motion.h2>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '17px', fontWeight: 300,
            color: 'rgba(255,255,255,0.4)',
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
              background: '#3B82F6',
              padding: '18px 44px',
              borderRadius: '14px',
              display: 'inline-block',
              boxShadow: hovered
                ? '0 0 0 1px rgba(59,130,246,0.4), 0 0 50px rgba(59,130,246,0.4), 0 0 100px rgba(59,130,246,0.15)'
                : '0 0 0 1px rgba(59,130,246,0.2), 0 0 30px rgba(59,130,246,0.2), 0 0 60px rgba(59,130,246,0.08)',
              transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
              transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            Commencer votre préparation →
          </Link>
        </motion.div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.2)',
            marginTop: '24px',
          }}
        >
          Inscription gratuite · Aucune carte bancaire requise
        </motion.p>
      </div>
    </section>
  )
}
