'use client'

import { useState } from 'react'
import { Brain, Headphones, ClipboardText, Trophy, Cards, ChartLineUp } from '@phosphor-icons/react'

function MindmapSVG() {
  return (
    <svg viewBox="0 0 280 160" className="w-full mt-4" style={{ opacity: 0.6 }}>
      <circle cx="140" cy="80" r="18" fill="none" stroke="#2563EB" strokeWidth="1.5" />
      <text x="140" y="85" textAnchor="middle" fontSize="9" fill="#2563EB">Cours</text>
      <line x1="140" y1="62" x2="100" y2="30" stroke="#E4E4E7" strokeWidth="1" />
      <circle cx="100" cy="30" r="12" fill="none" stroke="#D4D4D8" strokeWidth="1" />
      <line x1="140" y1="62" x2="180" y2="28" stroke="#E4E4E7" strokeWidth="1" />
      <circle cx="180" cy="28" r="12" fill="none" stroke="#D4D4D8" strokeWidth="1" />
      <line x1="122" y1="80" x2="65" y2="80" stroke="#E4E4E7" strokeWidth="1" />
      <circle cx="65" cy="80" r="12" fill="none" stroke="#D4D4D8" strokeWidth="1" />
      <line x1="158" y1="80" x2="215" y2="80" stroke="#E4E4E7" strokeWidth="1" />
      <circle cx="215" cy="80" r="12" fill="none" stroke="#D4D4D8" strokeWidth="1" />
      <line x1="140" y1="98" x2="140" y2="135" stroke="#E4E4E7" strokeWidth="1" />
      <circle cx="140" cy="135" r="12" fill="none" stroke="#D4D4D8" strokeWidth="1" />
    </svg>
  )
}

function WaveformBars() {
  return (
    <div className="flex items-end gap-1 h-10 mt-4">
      {[40, 75, 55, 90, 65, 85, 50, 80, 60, 95, 45, 70].map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full animate-waveform"
          style={{
            height: `${h}%`,
            background: '#2563EB',
            opacity: 0.5,
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  )
}

type CardProps = {
  Icon: React.ComponentType<{ size?: number; weight?: 'regular' | 'bold' | 'fill' | 'duotone' | 'thin' | 'light'; style?: React.CSSProperties }>
  tag: string
  title: string
  description: string
  children?: React.ReactNode
  style?: React.CSSProperties
}

function FeatureCard({ Icon, tag, title, description, children, style }: CardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        border: hovered ? '1px solid transparent' : '1px solid #E4E4E7',
        borderRadius: '20px',
        padding: '28px 32px',
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 0 0 1px rgba(37,99,235,0.3), 0 0 20px rgba(37,99,235,0.06), 0 8px 32px rgba(0,0,0,0.06)'
          : '0 1px 2px rgba(0,0,0,0.03)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 500ms cubic-bezier(0.16,1,0.3,1)',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Icon
          size={20}
          style={{ color: '#71717A' }}
        />
        <span
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#71717A',
          }}
        >
          {tag}
        </span>
      </div>
      <h3
        style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '18px',
          fontWeight: 600,
          color: '#09090B',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '14px',
          color: '#71717A',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      {children}
    </div>
  )
}

export default function Features() {
  return (
    <section id="features" style={{ background: '#FAFAFA', padding: '120px 0' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div style={{ marginBottom: '56px' }}>
          <p
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#71717A',
              marginBottom: '16px',
            }}
          >
            FONCTIONNALITÉS
          </p>
          <h2
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: '#09090B',
              lineHeight: 1.15,
            }}
          >
            Un cours en entrée.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #2563EB, #60A5FA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Six outils
            </span>{' '}
            en sortie.
          </h2>
        </div>

        {/* Bento Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1: Mindmap (2/3) + Audio (1/3) */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <FeatureCard
              Icon={Brain}
              tag="Mémorisation"
              title="Carte Mentale"
              description="Chaque cours génère automatiquement une carte mentale visuelle pour comprendre et ancrer les concepts durablement dans la mémoire."
            >
              <MindmapSVG />
            </FeatureCard>
            <FeatureCard
              Icon={Headphones}
              tag="Mobilité"
              title="Audio Pro"
              description="Écoutez vos cours avec une voix naturelle. Révisez pendant vos déplacements, sans effort supplémentaire."
            >
              <WaveformBars />
            </FeatureCard>
          </div>

          {/* Row 2: QCM + Flashcards + Examen Blanc */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <FeatureCard
              Icon={ClipboardText}
              tag="Entraînement"
              title="QCM Générés"
              description="Des questions créées à partir du contenu exact de chaque cours pour tester vos connaissances avec précision."
            />
            <FeatureCard
              Icon={Cards}
              tag="Rétention"
              title="Flashcards"
              description="Système de répétition espacée pour ancrer définitions et concepts clés — adapté à votre courbe d'oubli personnelle."
            />
            <FeatureCard
              Icon={Trophy}
              tag="Simulation"
              title="Examen Blanc"
              description="Simulez les conditions du concours avec un timer et obtenez un radar détaillé de vos performances par module."
            />
          </div>

          {/* Row 3: Suivi (full width) */}
          <FeatureCard
            Icon={ChartLineUp}
            tag="Analyse"
            title="Suivi Personnalisé"
            description="Visualisez votre progression, identifiez vos lacunes et optimisez chaque session de révision avec des données réelles."
          />
        </div>
      </div>
    </section>
  )
}
