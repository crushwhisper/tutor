'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

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

function NavLink({ href, children, isExternal }: { href: string; children: React.ReactNode; isExternal?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const style: React.CSSProperties = {
    fontFamily: 'Outfit, system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: hovered ? '#2b180a' : '#94877c',
    textDecoration: 'none',
    transition: 'color 250ms',
    cursor: 'pointer',
  }
  if (isExternal) {
    return (
      <a href={href} style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {children}
    </Link>
  )
}

export default function ScienceHero() {
  const [ctaHovered, setCtaHovered] = useState(false)

  return (
    <section style={{ minHeight: '100dvh', position: 'relative', display: 'flex', flexDirection: 'column', background: '#fcf6ef' }}>

      {/* Warm mesh background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="science-orb science-orb-1" />
        <div className="science-orb science-orb-2" />
        <div className="science-orb science-orb-3" />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top, #fcf6ef 40%, transparent)' }} />
      </div>

      {/* Navigation */}
      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <OwlMark />
          <span style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontWeight: 700, fontSize: '16px',
            color: '#2b180a',
            letterSpacing: '-0.02em',
          }}>TUTOR</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <NavLink href="#principes" isExternal>La Science</NavLink>
          <NavLink href="/platform">La Plateforme</NavLink>
          <Link href="/auth/signup" style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '13px', fontWeight: 500,
            color: '#2b180a',
            textDecoration: 'none',
            border: '1px solid #e8d3c0',
            borderRadius: '999px',
            padding: '8px 20px',
            background: 'rgba(255,255,255,0.6)',
            transition: 'all 250ms',
          }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#0099ff'
              ;(e.currentTarget as HTMLElement).style.color = '#0099ff'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#e8d3c0'
              ;(e.currentTarget as HTMLElement).style.color = '#2b180a'
            }}
          >
            Connexion
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '160px 24px 120px',
        position: 'relative', zIndex: 1,
      }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}
        >
          <div style={{ width: '40px', height: '1px', background: '#e8d3c0' }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '4px',
            color: '#94877c',
          }}>Fondé sur la recherche</span>
          <div style={{ width: '40px', height: '1px', background: '#e8d3c0' }} />
        </motion.div>

        {/* Line 1 */}
        <div style={{ overflow: 'hidden' }}>
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Halant', Georgia, serif",
              fontSize: 'clamp(52px, 8vw, 96px)',
              fontWeight: 600, color: '#2b180a',
              lineHeight: 1.05, letterSpacing: '-2px',
              marginBottom: '4px',
            }}
          >
            La science de
          </motion.h1>
        </div>

        {/* Line 2 — italic, muted brown */}
        <div style={{ overflow: 'hidden', marginBottom: '40px' }}>
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Halant', Georgia, serif",
              fontSize: 'clamp(52px, 8vw, 96px)',
              fontWeight: 400, fontStyle: 'italic',
              color: '#94877c',
              lineHeight: 1.05, letterSpacing: '-2px',
            }}
          >
            la réussite médicale.
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '18px', fontWeight: 300,
            color: '#94877c',
            maxWidth: '520px', lineHeight: 1.75,
            marginBottom: '56px',
          }}
        >
          Des techniques de mémorisation et de compréhension
          validées par la recherche, à portée de main.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <a
            href="#principes"
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '15px', fontWeight: 500,
              color: ctaHovered ? 'white' : '#2b180a',
              textDecoration: 'none',
              border: '1px solid #2b180a',
              borderRadius: '999px',
              padding: '14px 36px',
              background: ctaHovered ? '#2b180a' : 'transparent',
              transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
              display: 'inline-block',
            }}
          >
            Découvrir →
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        style={{
          position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          zIndex: 1,
        }}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px', letterSpacing: '3px',
          color: '#e8d3c0', textTransform: 'uppercase',
        }}>Scroll</span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          className="animate-bounce-scroll"
        >
          <path d="M2 5l6 6 6-6" stroke="#dab697" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  )
}
