'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { UserPlus, ListChecks, Trophy } from '@phosphor-icons/react'

const STEPS = [
  {
    num: '01', Icon: UserPlus,
    title: 'Inscrivez-vous',
    desc: 'Créez votre compte en 30 secondes. Choisissez votre programme selon votre date de concours.',
  },
  {
    num: '02', Icon: ListChecks,
    title: 'Suivez le programme',
    desc: 'Chaque jour, des objectifs clairs : cours, QCM, flashcards et audio, sans improvisation.',
  },
  {
    num: '03', Icon: Trophy,
    title: 'Réussissez',
    desc: 'Mesurez vos progrès, identifiez vos faiblesses, arrivez au concours pleinement préparé.',
  },
]

export default function PlatformHowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{ background: '#FFFFFF', padding: '120px 0' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '4px', color: '#0099ff', marginBottom: '20px' }}
          >Comment ça marche</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
            style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 3.5vw, 44px)', color: '#2b180a' }}
          >
            Simple, structuré, efficace.
          </motion.h2>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', position: 'relative' }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>

                {/* Circle + icon */}
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    border: inView ? '2px solid #0099ff' : '2px solid #e8d3c0',
                    background: '#fcf6ef',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: inView ? '0 0 20px rgba(0,153,255,0.15)' : 'none',
                    transition: 'border-color 600ms, box-shadow 600ms',
                    transitionDelay: `${i * 150}ms`,
                    flexShrink: 0,
                  }}
                >
                  <step.Icon size={24} style={{ color: '#0099ff' }} />
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.35 + i * 0.15 }}
                  style={{ textAlign: 'center', maxWidth: '220px' }}
                >
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#94877c', marginBottom: '8px' }}>{step.num}</div>
                  <h3 style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '18px', fontWeight: 700, color: '#2b180a', marginBottom: '8px' }}>{step.title}</h3>
                  <p style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '14px', color: '#94877c', lineHeight: 1.7 }}>{step.desc}</p>
                </motion.div>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div style={{ flexShrink: 0, paddingTop: '32px', width: '80px' }}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: inView ? 1 : 0 }}
                    transition={{ duration: 0.7, delay: 0.5 + i * 0.3, ease: 'easeInOut' }}
                    style={{ height: '2px', background: 'linear-gradient(to right, #0099ff, #8B5CF6)', transformOrigin: 'left center' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
