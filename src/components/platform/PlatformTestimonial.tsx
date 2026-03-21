'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function PlatformTestimonial() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{ background: '#F8F8F8', padding: '100px 0' }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'white', border: '1px solid #E5E5E5',
            borderRadius: '24px', padding: '56px 64px',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Large quote mark */}
          <div style={{
            position: 'absolute', top: '-20px', left: '48px',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '160px', fontWeight: 700,
            color: '#F1F1F1', lineHeight: 1,
            userSelect: 'none', pointerEvents: 'none',
          }}>"</div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <blockquote style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(18px, 2vw, 22px)',
              color: '#404040', lineHeight: 1.7,
              maxWidth: '740px', marginBottom: '40px',
            }}>
              TUTOR a transformé ma façon de réviser. En 3 mois, j&apos;ai couvert l&apos;intégralité
              du programme avec une méthode que je n&apos;aurais jamais pu construire seul.
              Les QCM avec corrections détaillées et les flashcards espacées ont fait
              toute la différence.
            </blockquote>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 700, fontSize: '16px', color: 'white' }}>A</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '15px', fontWeight: 600, color: '#0A0A0A' }}>Dr. A.B.</div>
                <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '14px', color: '#A3A3A3' }}>Résident en cardiologie</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: '#F59E0B', fontSize: '16px' }}>★</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
