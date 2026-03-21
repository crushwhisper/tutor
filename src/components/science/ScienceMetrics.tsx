'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function useCountUp(target: number, duration: number, active: boolean, isFloat = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(parseFloat((ease * target).toFixed(isFloat ? 0 : 0)))
      if (progress < 1) requestAnimationFrame(step)
      else setValue(target)
    }
    requestAnimationFrame(step)
  }, [active, target, duration, isFloat])

  return value
}

const METRICS = [
  {
    value: 4,
    suffix: '×',
    label: 'meilleure rétention',
    sublabel: 'avec la répétition espacée',
  },
  {
    value: 67,
    suffix: '%',
    label: 'de réussite en plus',
    sublabel: 'avec le testing effect',
  },
  {
    value: 2,
    suffix: '×',
    label: 'plus de compréhension',
    sublabel: 'avec le double encodage',
  },
  {
    value: 563,
    suffix: '',
    label: 'cours structurés',
    sublabel: 'sur la plateforme',
  },
]

function MetricItem({ value, suffix, label, sublabel, delay, active }: {
  value: number; suffix: string; label: string; sublabel: string; delay: number; active: boolean
}) {
  const count = useCountUp(value, 1400 + delay * 200, active)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: delay * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{ textAlign: 'center', flex: 1 }}
    >
      <div style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 'clamp(40px, 5vw, 60px)',
        fontWeight: 700, color: 'white',
        lineHeight: 1, marginBottom: '12px',
        letterSpacing: '-2px',
      }}>
        {count}{suffix}
      </div>
      <div style={{
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontSize: '14px', fontWeight: 500,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: '4px',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.25)',
      }}>
        {sublabel}
      </div>
    </motion.div>
  )
}

export default function ScienceMetrics() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{
      background: '#0A0A0A',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '80px 0',
    }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          flexWrap: 'wrap',
        }}>
          {METRICS.map((m, i) => (
            <div key={m.label} style={{ display: 'flex', flex: 1, minWidth: '200px' }}>
              <MetricItem {...m} delay={i} active={inView} />
              {i < METRICS.length - 1 && (
                <div style={{
                  width: '1px',
                  height: '48px',
                  background: 'rgba(255,255,255,0.08)',
                  alignSelf: 'center',
                  flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
