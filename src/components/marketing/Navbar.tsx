'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { List, X } from '@phosphor-icons/react'

function OwlLogo({ size = 32 }: { size?: number }) {
  const [blinking, setBlinking] = useState(false)
  const [hovered, setHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function scheduleBlink() {
      timerRef.current = setTimeout(() => {
        setBlinking(true)
        setTimeout(() => {
          setBlinking(false)
          scheduleBlink()
        }, 200)
      }, 5000)
    }
    scheduleBlink()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const eyeFilter = hovered
    ? 'drop-shadow(0 0 4px rgba(99,102,241,0.8))'
    : 'none'

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ rotate: hovered ? 5 : 0 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
      style={{ cursor: 'pointer' }}
    >
      {/* Left ear */}
      <path d="M9 11 L7 4 L13 9Z" fill="#09090B" />
      {/* Right ear */}
      <path d="M23 11 L25 4 L19 9Z" fill="#09090B" />
      {/* Head */}
      <ellipse cx="16" cy="19" rx="10" ry="11" fill="none" stroke="#09090B" strokeWidth="1.5" />
      {/* Left eye outer */}
      <circle cx="11.5" cy="17" r="3.5" fill="rgba(99,102,241,0.15)" stroke="#6366F1" strokeWidth="1.5" style={{ filter: eyeFilter }} />
      {/* Left pupil */}
      <motion.circle
        cx="11.5"
        cy="17"
        r="1.8"
        fill="#6366F1"
        animate={{ scaleY: blinking ? 0.1 : 1 }}
        transition={{ duration: 0.08 }}
        style={{ transformOrigin: '11.5px 17px', filter: eyeFilter }}
      />
      {/* Right eye outer */}
      <circle cx="20.5" cy="17" r="3.5" fill="rgba(99,102,241,0.15)" stroke="#6366F1" strokeWidth="1.5" style={{ filter: eyeFilter }} />
      {/* Right pupil */}
      <motion.circle
        cx="20.5"
        cy="17"
        r="1.8"
        fill="#6366F1"
        animate={{ scaleY: blinking ? 0.1 : 1 }}
        transition={{ duration: 0.08 }}
        style={{ transformOrigin: '20.5px 17px', filter: eyeFilter }}
      />
      {/* Beak */}
      <path d="M14.5 21 L16 23 L17.5 21Z" fill="#09090B" />
    </motion.svg>
  )
}

const NAV_LINKS = [
  { href: '#features', label: 'Fonctionnalités' },
  { href: '#programmes', label: 'Programmes' },
  { href: '#how-it-works', label: 'Méthode' },
  { href: '#pricing', label: 'Tarifs' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 100, damping: 25 }}
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? {
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(24px) saturate(180%)',
              borderBottom: '1px solid #E4E4E7',
            }
          : { background: 'transparent' }
      }
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <OwlLogo size={28} />
          <span
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: '15px',
              color: '#09090B',
              letterSpacing: '-0.02em',
            }}
          >
            TUTOR
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#71717A',
                textDecoration: 'none',
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#09090B')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#71717A')}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#3F3F46',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #E4E4E7',
              transition: 'background 200ms',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = '#F4F4F5')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = 'transparent')
            }
          >
            Connexion
          </Link>
          <motion.div whileHover={{ y: -1 }}>
            <Link
              href="/auth/signup"
              className="btn-cta"
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                textDecoration: 'none',
                padding: '8px 20px',
                borderRadius: '10px',
                display: 'inline-block',
              }}
            >
              Commencer
            </Link>
          </motion.div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          style={{ color: '#09090B', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
          className="md:hidden"
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid #E4E4E7',
            }}
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#3F3F46',
                    textDecoration: 'none',
                  }}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              ))}
              <div style={{ borderTop: '1px solid #E4E4E7', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link
                  href="/auth/login"
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontWeight: 500,
                    color: '#3F3F46',
                    textAlign: 'center',
                    padding: '10px',
                    textDecoration: 'none',
                  }}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-cta"
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontWeight: 600,
                    color: 'white',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  Commencer
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
