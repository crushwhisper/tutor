'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PlayCircle } from '@phosphor-icons/react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 80, damping: 20 },
  },
}

function AppMockup() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: 'white',
        border: '1px solid #E4E4E7',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        transform: 'perspective(1200px) rotateY(-6deg) rotateX(3deg)',
        width: '100%',
        maxWidth: '420px',
      }}
    >
      {/* App header */}
      <div
        style={{
          background: '#0C1222',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
        </div>
        <span
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.4)',
            marginLeft: '8px',
          }}
        >
          TUTOR — Tableau de Bord
        </span>
      </div>

      {/* Dashboard content */}
      <div style={{ padding: '20px', background: '#0C1222' }}>
        {/* Stat boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Progression', value: '68%' },
            { label: "Jour actuel", value: 'J·47' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: '#18181B',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Module list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { name: 'Cardiologie', pct: 85 },
            { name: 'Neurologie', pct: 62 },
            { name: 'Pneumologie', pct: 40 },
          ].map((m) => (
            <div key={m.name}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {m.name}
                </span>
                <span
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: '12px',
                    color: '#E8A83E',
                  }}
                >
                  {m.pct}%
                </span>
              </div>
              <div
                style={{
                  height: '4px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${m.pct}%`,
                    background: '#E8A83E',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const underlineRef = useRef<HTMLDivElement>(null)
  const [underlineReady, setUnderlineReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setUnderlineReady(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      className="relative min-h-[100dvh] flex items-center pt-24 pb-20 overflow-hidden"
      style={{ background: '#FFFFFF' }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 20% 50%, rgba(37,99,235,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 30%, rgba(245,158,11,0.04) 0%, transparent 50%), #FFFFFF',
          }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.04 }}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.6), #FFFFFF)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 items-center">

          {/* LEFT — 55% */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            style={{ flex: '0 0 55%', maxWidth: '55%', display: 'flex', flexDirection: 'column' }}
            className="w-full lg:max-w-none max-w-full"
          >
            {/* Eyebrow */}
            <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
              <div
                style={{
                  width: '32px',
                  height: '2px',
                  background: '#2563EB',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#71717A',
                }}
              >
                PRÉPARATION MÉDICALE
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1 variants={item} style={{ marginBottom: '24px' }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(52px, 7vw, 80px)',
                  fontWeight: 700,
                  color: '#09090B',
                  lineHeight: 1.0,
                  letterSpacing: '-3px',
                }}
              >
                Votre concours,
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(52px, 7vw, 80px)',
                  fontWeight: 700,
                  lineHeight: 1.0,
                  letterSpacing: '-3px',
                  position: 'relative',
                  width: 'fit-content',
                }}
              >
                <span
                  style={{
                    background: 'linear-gradient(135deg, #2563EB, #60A5FA)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  structuré.
                </span>
                <div
                  ref={underlineRef}
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    height: '3px',
                    background: '#2563EB',
                    borderRadius: '2px',
                    width: underlineReady ? '100%' : '0%',
                    transition: 'width 800ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={item}
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '18px',
                fontWeight: 400,
                color: '#3F3F46',
                maxWidth: '460px',
                lineHeight: 1.7,
                marginBottom: '0',
              }}
            >
              563 cours. Programmes jour par jour. Outils de révision intégrés.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={item}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '36px', flexWrap: 'wrap' }}
            >
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  href="/auth/signup"
                  className="btn-cta"
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'white',
                    textDecoration: 'none',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    display: 'inline-block',
                  }}
                >
                  Commencer gratuitement
                </Link>
              </motion.div>

              <a
                href="#how-it-works"
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#3F3F46',
                  textDecoration: 'none',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid #E4E4E7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'border-color 200ms',
                }}
              >
                <PlayCircle size={18} weight="fill" style={{ color: '#2563EB' }} />
                Voir la démo
              </a>
            </motion.div>
          </motion.div>

          {/* RIGHT — 45% (hidden on mobile) */}
          <div
            className="hidden lg:block"
            style={{ flex: '0 0 45%', maxWidth: '45%', position: 'relative' }}
          >
            <AppMockup />

            {/* Badge 1 — bottom-left */}
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '-24px',
                background: 'white',
                border: '1px solid #E4E4E7',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                borderRadius: '12px',
                padding: '10px 16px',
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#09090B',
                animation: 'float-badge 6s ease-in-out infinite',
                animationDelay: '0s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#10B981' }}>✓</span> Jour 47 complété
            </div>

            {/* Badge 2 — top-right */}
            <div
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                background: 'rgba(37,99,235,0.1)',
                border: '1px solid rgba(37,99,235,0.2)',
                borderRadius: '12px',
                padding: '10px 16px',
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#2563EB',
                animation: 'float-badge 6s ease-in-out infinite',
                animationDelay: '2s',
                whiteSpace: 'nowrap',
              }}
            >
              Score : 82%
            </div>

            {/* Badge 3 — right-center */}
            <div
              style={{
                position: 'absolute',
                right: '-40px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                borderRadius: '12px',
                border: '1px solid #E4E4E7',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'float-badge 6s ease-in-out infinite',
                animationDelay: '4s',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '20px' }}>
                {[60, 100, 40, 80, 55].map((h, i) => (
                  <div
                    key={i}
                    className="animate-waveform"
                    style={{
                      width: '3px',
                      height: `${h}%`,
                      background: '#2563EB',
                      borderRadius: '2px',
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#3F3F46',
                }}
              >
                Mode écoute
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
