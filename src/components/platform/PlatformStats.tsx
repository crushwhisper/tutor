'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(step)
      else setValue(target)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return value
}

const STATS = [
  { raw: 563, display: (n: number) => `${n}`, label: 'cours structurés' },
  { raw: 11260, display: (n: number) => `${n.toLocaleString('fr-FR')}+`, label: 'QCM disponibles' },
  { raw: 180, display: (n: number) => `${n}j`, label: 'programme complet' },
  { raw: 6, display: (n: number) => `${n}`, label: 'outils de révision' },
]

export default function PlatformStats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{
      background: '#FFFFFF',
      borderTop: '1px solid #e8d3c0',
      borderBottom: '1px solid #e8d3c0',
      padding: '80px 0',
    }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0' }}>
          {STATS.map((s, i) => {
            const count = useCountUp(s.raw, 1600 + i * 150, inView)
            return (
              <div key={s.label} style={{ display: 'flex', flex: '1 1 200px' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '0 24px' }}>
                  <div style={{
                    fontFamily: "'Halant', Georgia, serif",
                    fontSize: 'clamp(36px, 4vw, 52px)',
                    fontWeight: 700, color: '#2b180a',
                    lineHeight: 1, marginBottom: '8px', letterSpacing: '-2px',
                  }}>
                    {s.display(count)}
                  </div>
                  <div style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '14px', color: '#94877c', fontWeight: 400 }}>
                    {s.label}
                  </div>
                </div>
                {i < STATS.length - 1 && (
                  <div style={{ width: '1px', height: '48px', background: '#e8d3c0', alignSelf: 'center', flexShrink: 0 }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
