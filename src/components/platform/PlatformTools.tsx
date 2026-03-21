'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Check } from '@phosphor-icons/react'

const TABS = [
  {
    id: 'mindmaps', label: 'Mindmaps', num: '01',
    title: 'Cartes mentales interactives',
    description: 'Chaque cours génère une carte mentale navigable. Visualisez les connexions entre concepts, zoomez sur les branches, et ancrez durablement la structure du cours.',
    points: ['Générées pour 563 cours', 'Navigation intuitive par branches', 'Export PDF couleur imprimable'],
    visual: <MindmapVisual />,
  },
  {
    id: 'audio', label: 'Audio', num: '02',
    title: 'Mode écoute',
    description: 'Vos cours transformés en audio naturel haute qualité. Révisez pendant vos trajets, en marchant, partout. Chaque cours dure entre 3 et 5 minutes.',
    points: ['Voix naturelle synthétisée', 'Téléchargeable en MP3', 'Durée 3–5 min par cours'],
    visual: <AudioVisual />,
  },
  {
    id: 'qcm', label: 'QCM', num: '03',
    title: 'QCM calibrés',
    description: '20 questions par cours, avec corrections détaillées pour chaque proposition. Difficulté progressive, score en temps réel, analyse des erreurs récurrentes.',
    points: ['Corrections détaillées par option', 'Difficulté ajustable', 'Historique des scores'],
    visual: <QCMVisual />,
  },
  {
    id: 'flashcards', label: 'Flashcards', num: '04',
    title: 'Flashcards intelligentes',
    description: "Répétition espacée automatique. L'algorithme cible vos points faibles et optimise vos sessions selon votre courbe d'oubli personnelle.",
    points: ['Répétition espacée (algorithme SM-2)', 'Cible automatiquement les faiblesses', '15 flashcards par cours'],
    visual: <FlashcardVisual />,
  },
  {
    id: 'examens', label: 'Examens', num: '05',
    title: 'Examens blancs',
    description: "Conditions réelles : chronomètre, tirage aléatoire, score par section. Obtenez une analyse détaillée de vos performances et identifiez vos lacunes.",
    points: ['Conditions chronométrées réelles', 'Analyse par section et module', 'Historique de progression'],
    visual: <ExamenVisual />,
  },
  {
    id: 'suivi', label: 'Suivi', num: '06',
    title: 'Suivi personnalisé',
    description: "Dashboard de progression, journal quotidien avec feedback intelligent, identification des lacunes, streak de motivation pour maintenir la régularité.",
    points: ['Dashboard visuel de progression', 'Journal + feedback quotidien', 'Streak et objectifs'],
    visual: <SuiviVisual />,
  },
]

// ── Tool Visuals ──────────────────────────────────────────────────────────────

function VisualWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#f6f0e9', border: '1px solid #e8d3c0',
      borderRadius: '16px', padding: '32px',
      minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </div>
  )
}

function MindmapVisual() {
  return (
    <VisualWrapper>
      <svg viewBox="0 0 280 200" style={{ width: '100%', maxWidth: '280px' }}>
        {/* Central node */}
        <ellipse cx="140" cy="100" rx="36" ry="22" fill="none" stroke="#0099ff" strokeWidth="1.5" />
        <text x="140" y="105" textAnchor="middle" fontSize="11" fill="#0099ff" fontFamily="Outfit, system-ui" fontWeight="600">Cours</text>
        {/* Branches */}
        {[
          { x2: 60, y2: 40, cx: 50, cy: 38, label: 'Partie I' },
          { x2: 220, y2: 40, cx: 230, cy: 38, label: 'Partie II' },
          { x2: 40, y2: 100, cx: 28, cy: 100, label: 'Intro' },
          { x2: 240, y2: 100, cx: 252, cy: 100, label: 'Résumé' },
          { x2: 80, y2: 160, cx: 68, cy: 162, label: 'QCM' },
          { x2: 200, y2: 160, cx: 212, cy: 162, label: 'Fiche' },
        ].map(({ x2, y2, cx, cy, label }, i) => (
          <g key={i}>
            <line x1="140" y1="100" x2={x2} y2={y2} stroke="#e8d3c0" strokeWidth="1.2" />
            <ellipse cx={cx} cy={cy} rx="24" ry="14" fill="white" stroke="#D4D4D4" strokeWidth="1" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="#94877c" fontFamily="Outfit, system-ui">{label}</text>
          </g>
        ))}
      </svg>
    </VisualWrapper>
  )
}

function AudioVisual() {
  return (
    <VisualWrapper>
      <div style={{ width: '100%', maxWidth: '300px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px', marginBottom: '20px', justifyContent: 'center' }}>
          {[35, 60, 45, 80, 55, 90, 40, 75, 50, 85, 38, 70, 52, 88, 44].map((h, i) => (
            <div key={i} className="animate-waveform" style={{
              flex: 1, background: '#0099ff', borderRadius: '2px',
              height: `${h}%`, opacity: 0.7,
              animationDelay: `${i * 70}ms`,
            }} />
          ))}
        </div>
        <div style={{ background: '#fcf6ef', border: '1px solid #e8d3c0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontFamily: 'Outfit, system-ui', fontSize: '13px', fontWeight: 600, color: '#2b180a', marginBottom: '8px' }}>Anatomie — Cours 04</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0099ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderLeft: '10px solid white', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', marginLeft: '2px' }} />
            </div>
            <div style={{ flex: 1, height: '3px', background: '#e8d3c0', borderRadius: '2px' }}>
              <div style={{ width: '38%', height: '100%', background: '#0099ff', borderRadius: '2px' }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#94877c' }}>4:12</span>
          </div>
        </div>
      </div>
    </VisualWrapper>
  )
}

function QCMVisual() {
  const OPTIONS = ['Voie afférente sensitive', 'Voie efférente motrice', 'Interneurones spinaux', 'Racine postérieure']
  return (
    <VisualWrapper>
      <div style={{ width: '100%', maxWidth: '300px' }}>
        <div style={{ fontFamily: 'Outfit, system-ui', fontSize: '13px', fontWeight: 600, color: '#2b180a', marginBottom: '16px', lineHeight: 1.5 }}>
          Quelle structure transmet l&apos;influx moteur vers le muscle ?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {OPTIONS.map((opt, i) => (
            <div key={i} style={{
              padding: '10px 14px', borderRadius: '10px',
              border: i === 1 ? '1.5px solid #10B981' : '1px solid #e8d3c0',
              background: i === 1 ? 'rgba(16,185,129,0.06)' : 'white',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                border: i === 1 ? '1.5px solid #10B981' : '1.5px solid #D4D4D4',
                background: i === 1 ? '#10B981' : 'white',
              }} />
              <span style={{ fontFamily: 'Outfit, system-ui', fontSize: '12px', color: i === 1 ? '#10B981' : '#94877c' }}>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </VisualWrapper>
  )
}

function FlashcardVisual() {
  return (
    <VisualWrapper>
      <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
        {/* Stack effect */}
        <div style={{ position: 'absolute', top: 6, left: 6, right: -6, bottom: -6, background: '#e8d3c0', borderRadius: '14px' }} />
        <div style={{ position: 'absolute', top: 3, left: 3, right: -3, bottom: -3, background: '#F1F1F1', borderRadius: '14px' }} />
        <div style={{
          position: 'relative', background: '#fcf6ef',
          border: '1px solid #e8d3c0', borderRadius: '14px',
          padding: '32px 24px', textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#94877c', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Définition</div>
          <div style={{ fontFamily: 'Outfit, system-ui', fontSize: '15px', fontWeight: 600, color: '#2b180a', lineHeight: 1.5, marginBottom: '20px' }}>
            Qu&apos;est-ce que la plasticité synaptique ?
          </div>
          <div style={{ height: '1px', background: '#F1F1F1', marginBottom: '16px' }} />
          <div style={{ fontFamily: 'Outfit, system-ui', fontSize: '12px', color: '#94877c', lineHeight: 1.6 }}>
            Capacité des synapses à modifier leur efficacité en fonction de l&apos;activité
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            {[['#F43F5E', '✕'], ['#F59E0B', '~'], ['#10B981', '✓']].map(([color, icon]) => (
              <div key={color} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color }}>
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualWrapper>
  )
}

function ExamenVisual() {
  return (
    <VisualWrapper>
      <div style={{ width: '100%', maxWidth: '280px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'Outfit, system-ui', fontSize: '13px', fontWeight: 600, color: '#2b180a' }}>Examen Blanc #3</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 600, color: '#F43F5E', background: 'rgba(244,63,94,0.08)', padding: '4px 10px', borderRadius: '6px' }}>1:24:08</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'Outfit, system-ui', fontSize: '12px', color: '#94877c' }}>Progression</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#0099ff' }}>34 / 60</span>
          </div>
          <div style={{ height: '6px', background: '#F1F1F1', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '57%', height: '100%', background: '#0099ff', borderRadius: '3px' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[['28', 'Correctes', '#10B981'], ['6', 'Erreurs', '#F43F5E'], ['0', 'Restantes', '#94877c']].map(([n, l, c]) => (
            <div key={l} style={{ background: '#fcf6ef', border: '1px solid #e8d3c0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit, system-ui', fontSize: '20px', fontWeight: 700, color: c }}>{n}</div>
              <div style={{ fontFamily: 'Outfit, system-ui', fontSize: '10px', color: '#94877c', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </VisualWrapper>
  )
}

function SuiviVisual() {
  const BARS = [40, 65, 50, 80, 60, 90, 75]
  const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  return (
    <VisualWrapper>
      <div style={{ width: '100%', maxWidth: '280px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'Outfit, system-ui', fontSize: '13px', fontWeight: 600, color: '#2b180a' }}>Cette semaine</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600, color: '#10B981' }}>+23%</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px', marginBottom: '12px' }}>
          {BARS.map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '100%', height: `${h}%`,
                background: i === 5 ? '#0099ff' : '#e8d3c0',
                borderRadius: '4px 4px 0 0',
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: i === 5 ? '#0099ff' : '#94877c' }}>{d}</div>
          ))}
        </div>
      </div>
    </VisualWrapper>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PlatformTools() {
  const [activeTab, setActiveTab] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const tab = TABS[activeTab]

  return (
    <section id="outils" ref={ref} style={{ background: '#FFFFFF', padding: '120px 0' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '4px', color: '#0099ff', marginBottom: '20px' }}
          >Outils</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}>
            <h2 style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', color: '#2b180a', lineHeight: 1.1, marginBottom: '4px' }}>
              Tout ce dont vous avez besoin.
            </h2>
            <h2 style={{ fontFamily: "'Halant', Georgia, serif", fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 52px)', color: '#94877c', lineHeight: 1.1 }}>
              Rien de superflu.
            </h2>
          </motion.div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e8d3c0', marginBottom: '48px', overflowX: 'auto', gap: '0' }}>
          {TABS.map((t, i) => (
            <button key={t.id} onClick={() => setActiveTab(i)} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px', fontWeight: 600,
              color: i === activeTab ? '#2b180a' : '#94877c',
              background: 'none', border: 'none',
              borderBottom: i === activeTab ? '2px solid #0099ff' : '2px solid transparent',
              padding: '12px 24px', cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 200ms, border-color 200ms',
              marginBottom: '-1px',
            }}
              onMouseEnter={(e) => { if (i !== activeTab) (e.currentTarget as HTMLElement).style.color = '#2b180a' }}
              onMouseLeave={(e) => { if (i !== activeTab) (e.currentTarget as HTMLElement).style.color = '#94877c' }}
            >
              {t.num} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}
            className="grid-cols-1 lg:grid-cols-2"
          >
            {/* Text */}
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '64px', fontWeight: 600, color: '#F1F1F1', lineHeight: 1, marginBottom: '16px', userSelect: 'none' }}>{tab.num}</div>
              <h3 style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '28px', fontWeight: 700, color: '#2b180a', marginBottom: '16px' }}>{tab.title}</h3>
              <p style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '15px', color: '#94877c', lineHeight: 1.75, marginBottom: '28px' }}>{tab.description}</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tab.points.map((pt) => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '14px', fontWeight: 500, color: '#2b180a' }}>
                    <Check size={16} weight="bold" style={{ color: '#0099ff', flexShrink: 0 }} />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div>{tab.visual}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
