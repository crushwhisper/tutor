'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

function useCountUp(target: number, started: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!started) return
    const duration = 1500
    const startTime = performance.now()

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3)
    }

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.round(easeOut(progress) * target))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target, started])

  return count
}

const STATS = [
  { target: 563, suffix: '+', label: 'Cours structurés' },
  { target: 47, suffix: '%', label: "Taux d'admission" },
  { target: 1000, suffix: '+', label: 'QCM disponibles' },
  { target: 5, suffix: '', label: 'Modules cliniques' },
]

function StatItem({ target, suffix, label, started }: { target: number; suffix: string; label: string; started: boolean }) {
  const count = useCountUp(target, started)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '0 32px',
      }}
    >
      <div
        style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '24px',
          fontWeight: 600,
          color: '#09090B',
        }}
      >
        {count}
        {suffix}
      </div>
      <div
        style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '13px',
          fontWeight: 400,
          color: '#71717A',
        }}
      >
        {label}
      </div>
    </div>
  )
}

export default function SocialProof() {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: '#FAFAFA',
        borderTop: '1px solid #E4E4E7',
        borderBottom: '1px solid #E4E4E7',
        padding: '40px 0',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Desktop: flex row with dividers */}
        <div className="hidden md:flex items-center justify-center">
          {STATS.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
              <StatItem {...s} started={started} />
              {i < STATS.length - 1 && (
                <div
                  style={{
                    width: '1px',
                    height: '32px',
                    background: '#E4E4E7',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: 2x2 grid */}
        <div className="md:hidden grid grid-cols-2 gap-8">
          {STATS.map((s) => (
            <StatItem key={s.label} {...s} started={started} />
          ))}
        </div>
      </div>
    </motion.section>
  )
}
