'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArrowRight, Books, Brain, Lightning } from '@phosphor-icons/react'

function OwlMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <path d="M9 11 L7 4 L13 9Z" fill="rgba(43,24,10,0.25)" />
      <path d="M23 11 L25 4 L19 9Z" fill="rgba(43,24,10,0.25)" />
      <ellipse cx="16" cy="19" rx="10" ry="11" fill="none" stroke="rgba(43,24,10,0.25)" strokeWidth="1.5" />
      <circle cx="11.5" cy="17" r="3.5" fill="rgba(0,153,255,0.12)" stroke="#0099ff" strokeWidth="1.5" />
      <circle cx="11.5" cy="17" r="1.8" fill="#0099ff" />
      <circle cx="20.5" cy="17" r="3.5" fill="rgba(0,153,255,0.12)" stroke="#0099ff" strokeWidth="1.5" />
      <circle cx="20.5" cy="17" r="1.8" fill="#0099ff" />
      <path d="M14.5 21 L16 23 L17.5 21Z" fill="rgba(43,24,10,0.25)" />
    </svg>
  )
}

/* Floating product mockup shown on the right side */
function ProductMockup() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '480px',
      userSelect: 'none',
    }}>
      {/* Glow backdrop */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '360px', height: '360px',
        background: 'radial-gradient(circle, rgba(0,153,255,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* Main card — course viewer */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: -1 }}
        transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(43,24,10,0.08)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Course header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(0,153,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Books size={16} weight="duotone" style={{ color: '#0099ff' }} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#2b180a', fontFamily: 'Outfit, sans-serif' }}>
              Anatomie — Module 2
            </div>
            <div style={{ fontSize: '10px', color: '#94877c', fontFamily: 'Outfit, sans-serif' }}>
              Le péricarde et ses rapports
            </div>
          </div>
          <div style={{
            marginLeft: 'auto',
            fontSize: '10px', fontWeight: 700,
            color: '#10B981', background: 'rgba(16,185,129,0.1)',
            padding: '3px 8px', borderRadius: '999px',
            fontFamily: 'Outfit, sans-serif',
          }}>
            Complété
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', background: '#f0ebe5', borderRadius: '999px', marginBottom: '20px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '72%' }}
            transition={{ duration: 1.2, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #0099ff, #0099ff88)', borderRadius: '999px' }}
          />
        </div>

        {/* Mini content lines */}
        {[
          { w: '90%', dark: true },
          { w: '75%', dark: false },
          { w: '85%', dark: false },
          { w: '55%', dark: false },
        ].map((l, i) => (
          <div key={i} style={{
            height: '8px',
            width: l.w,
            background: l.dark ? 'rgba(43,24,10,0.12)' : 'rgba(43,24,10,0.06)',
            borderRadius: '4px',
            marginBottom: '8px',
          }} />
        ))}

        {/* QCM question preview */}
        <div style={{
          marginTop: '16px',
          background: 'rgba(0,153,255,0.05)',
          border: '1px solid rgba(0,153,255,0.12)',
          borderRadius: '12px',
          padding: '14px',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#0099ff', fontFamily: 'Outfit, sans-serif', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            QCM · Question 3/10
          </div>
          <div style={{ height: '7px', background: 'rgba(43,24,10,0.08)', borderRadius: '4px', width: '88%', marginBottom: '10px' }} />
          {['A', 'B', 'C'].map((opt, i) => (
            <div key={opt} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 10px', borderRadius: '8px', marginBottom: '4px',
              background: i === 1 ? 'rgba(16,185,129,0.08)' : 'transparent',
              border: `1px solid ${i === 1 ? 'rgba(16,185,129,0.25)' : 'rgba(43,24,10,0.06)'}`,
            }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                background: i === 1 ? '#10B981' : 'rgba(43,24,10,0.06)',
                border: i === 1 ? 'none' : '1px solid rgba(43,24,10,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {i === 1 && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <div style={{ height: '6px', background: i === 1 ? 'rgba(16,185,129,0.3)' : 'rgba(43,24,10,0.07)', borderRadius: '3px', width: `${[60, 70, 45][i]}%` }} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating stat badge — top right */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: '-20px', right: '-16px',
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(43,24,10,0.08)',
          borderRadius: '14px',
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
          zIndex: 3,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <Lightning size={14} weight="duotone" style={{ color: '#F59E0B' }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2b180a', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>808 cours</div>
          <div style={{ fontSize: '10px', color: '#94877c', fontFamily: 'Outfit, sans-serif' }}>en bibliothèque</div>
        </div>
      </motion.div>

      {/* Floating brain badge — bottom left */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          bottom: '-16px', left: '-20px',
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(43,24,10,0.08)',
          borderRadius: '14px',
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
          zIndex: 3,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <Brain size={14} weight="duotone" style={{ color: '#0099ff' }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2b180a', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>Spaced repetition</div>
          <div style={{ fontSize: '10px', color: '#94877c', fontFamily: 'Outfit, sans-serif' }}>mémorisation prouvée</div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ScienceHero() {
  const [ctaHovered, setCtaHovered] = useState(false)

  return (
    <section style={{
      minHeight: '100dvh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
      overflow: 'hidden',
    }}>
      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(to top, rgba(246,240,233,0.75) 40%, transparent)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '28px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <OwlMark />
          <span style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontWeight: 700, fontSize: '16px',
            color: '#2b180a', letterSpacing: '-0.02em',
          }}>TUTOR</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link href="/platform" style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '14px', fontWeight: 400,
            color: '#94877c', textDecoration: 'none',
            transition: 'color 200ms',
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2b180a' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#94877c' }}
          >
            La Plateforme
          </Link>
          <Link href="/pricing" style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '14px', fontWeight: 400,
            color: '#94877c', textDecoration: 'none',
            transition: 'color 200ms',
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2b180a' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#94877c' }}
          >
            Tarifs
          </Link>
          <Link href="/auth/login" style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '13px', fontWeight: 500,
            color: '#2b180a', textDecoration: 'none',
            border: '1px solid #e8d3c0', borderRadius: '999px',
            padding: '8px 20px',
            background: 'rgba(255,255,255,0.6)',
            transition: 'all 250ms',
          }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = '#0099ff'
              el.style.color = '#0099ff'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = '#e8d3c0'
              el.style.color = '#2b180a'
            }}
          >
            Connexion
          </Link>
        </div>
      </nav>

      {/* Hero — Asymmetric split */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        gap: '64px',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 48px',
        paddingTop: '120px',
        paddingBottom: '80px',
        position: 'relative',
        zIndex: 1,
        width: '100%',
      }}>
        {/* Left — Typography stack */}
        <div>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              marginBottom: '40px',
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(43,24,10,0.1)',
              borderRadius: '999px', padding: '6px 14px 6px 8px',
            }}
          >
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#0099ff', display: 'inline-block',
            }} />
            <span style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '12px', fontWeight: 500,
              color: '#94877c', letterSpacing: '0.02em',
            }}>
              Fondé sur la recherche en sciences cognitives
            </span>
          </motion.div>

          {/* Headline */}
          <div style={{ overflow: 'hidden', marginBottom: '8px' }}>
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "'Halant', Georgia, serif",
                fontSize: 'clamp(44px, 5.5vw, 80px)',
                fontWeight: 600, color: '#2b180a',
                lineHeight: 1.0, letterSpacing: '-1.5px',
              }}
            >
              La science de
            </motion.h1>
          </div>

          <div style={{ overflow: 'hidden', marginBottom: '36px' }}>
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "'Halant', Georgia, serif",
                fontSize: 'clamp(44px, 5.5vw, 80px)',
                fontWeight: 400, fontStyle: 'italic',
                color: '#94877c',
                lineHeight: 1.0, letterSpacing: '-1.5px',
              }}
            >
              la réussite médicale.
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '17px', fontWeight: 300,
              color: '#94877c', lineHeight: 1.75,
              maxWidth: '440px', marginBottom: '48px',
            }}
          >
            808 cours structurés, des QCM ciblés et des programmes sur mesure
            pour réussir votre concours médical.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <Link
              href="/auth/signup"
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '15px', fontWeight: 600,
                color: ctaHovered ? 'white' : '#2b180a',
                textDecoration: 'none',
                border: '1px solid #2b180a',
                borderRadius: '999px',
                padding: '13px 32px',
                background: ctaHovered ? '#2b180a' : 'transparent',
                transition: 'all 350ms cubic-bezier(0.16,1,0.3,1)',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}
            >
              Commencer gratuitement
              <ArrowRight size={16} weight="bold" />
            </Link>

            <Link
              href="#principes"
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px', fontWeight: 400,
                color: '#94877c', textDecoration: 'none',
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2b180a' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#94877c' }}
            >
              En savoir plus →
            </Link>
          </motion.div>

          {/* Social proof row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '40px' }}
          >
            <div style={{ display: 'flex' }}>
              {['#dab697', '#c9a57a', '#e8c4a0'].map((c, i) => (
                <div key={i} style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: c, border: '2px solid white',
                  marginLeft: i > 0 ? '-8px' : 0,
                }} />
              ))}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#2b180a', fontFamily: 'Outfit, sans-serif' }}>
                +500 étudiants
              </div>
              <div style={{ fontSize: '11px', color: '#94877c', fontFamily: 'Outfit, sans-serif' }}>
                en préparation active
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right — Product mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.0, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '40px',
          }}
        >
          <ProductMockup />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        style={{
          position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          zIndex: 1,
        }}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px', letterSpacing: '3px',
          color: '#e8d3c0', textTransform: 'uppercase',
        }}>Scroll</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-bounce-scroll">
          <path d="M2 5l6 6 6-6" stroke="#dab697" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  )
}
