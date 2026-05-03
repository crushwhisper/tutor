'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from '@phosphor-icons/react'

export default function VideoDemo() {
  const [playHovered, setPlayHovered] = useState(false)

  return (
    <section
      style={{
        background: '#09090B',
        padding: '100px 0',
        textAlign: 'center',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'rgba(37,99,235,0.7)',
            marginBottom: '20px',
          }}
        >
          DÉMONSTRATION
        </p>

        {/* H2 */}
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 4vw, 56px)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '56px',
          }}
        >
          Découvrez TUTOR en action.
        </h2>

        {/* Video player container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring' as const, stiffness: 80, damping: 20 }}
          style={{
            maxWidth: '840px',
            margin: '0 auto',
            aspectRatio: '16/9',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#18181B',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Play button */}
          <button
            onMouseEnter={() => setPlayHovered(true)}
            onMouseLeave={() => setPlayHovered(false)}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: playHovered ? '2px solid transparent' : '2px solid rgba(255,255,255,0.3)',
              background: playHovered ? '#2563EB' : 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 300ms ease',
              boxShadow: playHovered ? '0 0 20px rgba(37,99,235,0.5), 0 0 60px rgba(37,99,235,0.15)' : 'none',
              marginBottom: '16px',
            }}
          >
            <Play size={32} weight="fill" style={{ color: 'white', marginLeft: '4px' }} />
          </button>

          {/* Below play button */}
          <p
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            2 minutes · Regarder la démo
          </p>
        </motion.div>
      </div>
    </section>
  )
}
