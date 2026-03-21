'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { BookOpen } from '@phosphor-icons/react'

function ForgetCurve({ animated }: { animated: boolean }) {
  return (
    <svg viewBox="0 0 240 110" style={{ width: '100%', marginTop: '28px', overflow: 'visible' }}>
      <line x1="20" y1="10" x2="20" y2="95" stroke="#e8d3c0" strokeWidth="1" />
      <line x1="20" y1="95" x2="230" y2="95" stroke="#e8d3c0" strokeWidth="1" />
      <text x="125" y="108" textAnchor="middle" fontSize="8" fill="#94877c" fontFamily="JetBrains Mono, monospace">Temps</text>
      <text x="8" y="55" textAnchor="middle" fontSize="8" fill="#94877c" fontFamily="JetBrains Mono, monospace" transform="rotate(-90, 8, 55)">Rétention</text>
      <path
        d="M 25,18 C 55,20 75,60 90,75 C 110,88 140,92 225,93"
        fill="none" stroke="#dab697" strokeWidth="1.5"
        strokeDasharray="320" strokeDashoffset={animated ? 0 : 320}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s' }}
        strokeLinecap="round"
      />
      <path
        d="M 25,18 L 65,42 L 65,20 L 105,36 L 105,18 L 145,30 L 145,18 L 185,26 L 185,18 L 225,22"
        fill="none" stroke="#0099ff" strokeWidth="2"
        strokeDasharray="400" strokeDashoffset={animated ? 0 : 400}
        style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)' }}
        strokeLinecap="round" strokeLinejoin="round"
      />
      {[65, 105, 145, 185].map((x, i) => (
        <circle key={x} cx={x} cy={20} r="3" fill="#0099ff"
          opacity={animated ? 1 : 0}
          style={{ transition: `opacity 300ms ${600 + i * 200}ms` }}
        />
      ))}
      <line x1="130" y1="75" x2="148" y2="75" stroke="#dab697" strokeWidth="1.5" />
      <text x="152" y="78" fontSize="7.5" fill="#94877c" fontFamily="Outfit, system-ui">Sans SR</text>
      <line x1="130" y1="85" x2="148" y2="85" stroke="#0099ff" strokeWidth="2" />
      <text x="152" y="88" fontSize="7.5" fill="#94877c" fontFamily="Outfit, system-ui">Avec SR</text>
    </svg>
  )
}

type CardProps = {
  number: string; title: string; summary: string; source: string
  children?: React.ReactNode; delay?: number
}

function PrincipleCard({ number, title, summary, source, children, delay = 0 }: CardProps) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.55)',
        backdropFilter: 'saturate(1.75) blur(12px)',
        border: hovered ? '1px solid rgba(0,153,255,0.25)' : '1px solid #e8d3c0',
        borderRadius: '32px',
        padding: '36px',
        boxShadow: hovered
          ? '0 0 0 1px rgba(0,153,255,0.08), 0 20px 40px rgba(43,24,10,0.08)'
          : '0 2px 12px rgba(43,24,10,0.05)',
        transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column', height: '100%',
      }}
    >
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '52px', fontWeight: 600,
        color: hovered ? 'rgba(0,153,255,0.15)' : '#e8d3c0',
        lineHeight: 1, marginBottom: '16px',
        transition: 'color 400ms',
        userSelect: 'none',
      }}>{number}</div>

      <h3 style={{
        fontFamily: "'Halant', Georgia, serif",
        fontSize: '19px', fontWeight: 600,
        color: '#2b180a', marginBottom: '12px',
      }}>{title}</h3>

      <p style={{
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontSize: '14px', fontWeight: 400,
        color: '#94877c', lineHeight: 1.7,
        marginBottom: '20px', flex: 1,
      }}>{summary}</p>

      {children}

      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginTop: children ? '16px' : '0',
        paddingTop: '16px',
        borderTop: '1px solid #e8d3c0',
      }}>
        <BookOpen size={13} style={{ color: '#0099ff', flexShrink: 0 }} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px', color: '#0099ff', lineHeight: 1.5,
        }}>{source}</span>
      </div>
    </motion.div>
  )
}

const METHOD_ITEMS = [
  { tool: 'Mindmaps', principle: 'Double encodage' },
  { tool: 'Audio', principle: 'Encodage multiple' },
  { tool: 'QCM', principle: 'Testing Effect' },
  { tool: 'Flashcards', principle: 'Répétition espacée' },
  { tool: 'Programmes', principle: 'Interleaving' },
  { tool: 'Examens', principle: 'Conditions réelles' },
]

function MethodCard({ delay }: { delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'saturate(1.75) blur(12px)',
        border: '1px solid #e8d3c0',
        borderRadius: '32px',
        padding: '40px 48px',
        boxShadow: '0 2px 12px rgba(43,24,10,0.05)',
      }}
    >
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '52px', fontWeight: 600,
          color: '#e8d3c0', lineHeight: 1, marginBottom: '16px',
          userSelect: 'none',
        }}>06</div>
        <h3 style={{
          fontFamily: "'Halant', Georgia, serif",
          fontSize: '19px', fontWeight: 600, color: '#2b180a',
        }}>
          Chaque outil TUTOR est un principe en action.
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: '0', flexWrap: 'wrap' }}>
        {METHOD_ITEMS.map((item, i) => (
          <div key={item.tool} style={{
            flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: '6px',
            padding: '20px 24px',
            borderLeft: i > 0 ? '1px solid #e8d3c0' : 'none',
          }}>
            <span style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '15px', fontWeight: 600, color: '#2b180a',
            }}>{item.tool}</span>
            <span style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '12px', color: '#0099ff',
            }}>{item.principle}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function SciencePrinciples() {
  const [card1Hovered, setCard1Hovered] = useState(false)
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })

  return (
    <section id="principes" style={{ background: '#f6f0e9', padding: '160px 0' }}>
      <div className="max-w-7xl mx-auto px-6">

        <div ref={headerRef} style={{ marginBottom: '80px' }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px', fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '4px',
              color: '#0099ff', marginBottom: '24px',
            }}
          >La Recherche</motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Halant', Georgia, serif",
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 600, color: '#2b180a',
              lineHeight: 1.1, marginBottom: '8px',
            }}
          >Ce que la science dit</motion.h2>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Halant', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 400, color: '#94877c',
              lineHeight: 1.1, marginBottom: '32px',
            }}
          >sur l&apos;apprentissage.</motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.28 }}
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '16px', fontWeight: 400,
              color: '#94877c', maxWidth: '560px', lineHeight: 1.75,
            }}
          >
            Chaque outil TUTOR est construit sur des principes validés par des décennies
            de recherche en neurosciences et en pédagogie.
          </motion.p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div onMouseEnter={() => setCard1Hovered(true)} onMouseLeave={() => setCard1Hovered(false)} style={{ height: '100%' }}>
              <PrincipleCard number="01" title="La répétition espacée"
                summary="Revoir l'information à des intervalles croissants multiplie par 4 la rétention à long terme par rapport à la relecture massive. L'algorithme cible automatiquement vos points faibles."
                source="Ebbinghaus, 1885 · Cepeda et al., 2006 · Karpicke & Roediger, 2008" delay={0}>
                <ForgetCurve animated={card1Hovered} />
              </PrincipleCard>
            </div>
            <PrincipleCard number="02" title="L'effet de test"
              summary="Se tester activement est plus efficace que relire. Les QCM renforcent la mémoire même quand on se trompe — l'erreur devient un vecteur d'apprentissage."
              source="Roediger & Karpicke, 2006 · Butler, 2010" delay={0.08} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <PrincipleCard number="03" title="Le rappel actif"
              summary="Forcer son cerveau à retrouver l'information, plutôt que la relire passivement, crée des connexions neuronales plus solides et durables."
              source="Karpicke & Blunt, 2011 · Smith et al., 2013" delay={0.14} />
            <PrincipleCard number="04" title="Le double encodage"
              summary="Combiner le texte avec des représentations visuelles (mindmaps, schémas) améliore la compréhension et la rétention de façon significative."
              source="Paivio, 1986 · Mayer, 2009" delay={0.20} />
            <PrincipleCard number="05" title="L'entrelacement"
              summary="Alterner entre différents sujets pendant la révision améliore la capacité à distinguer et appliquer les concepts en situation réelle."
              source="Rohrer & Taylor, 2007 · Kornell & Bjork, 2008" delay={0.26} />
          </div>

          <MethodCard delay={0.32} />
        </div>
      </div>
    </section>
  )
}
