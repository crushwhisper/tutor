'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function OwlMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <path d="M9 11 L7 4 L13 9Z" fill="rgba(10,10,10,0.25)" />
      <path d="M23 11 L25 4 L19 9Z" fill="rgba(10,10,10,0.25)" />
      <ellipse cx="16" cy="19" rx="10" ry="11" fill="none" stroke="rgba(10,10,10,0.25)" strokeWidth="1.5" />
      <circle cx="11.5" cy="17" r="3.5" fill="rgba(59,130,246,0.12)" stroke="#3B82F6" strokeWidth="1.5" />
      <circle cx="11.5" cy="17" r="1.8" fill="#3B82F6" />
      <circle cx="20.5" cy="17" r="3.5" fill="rgba(59,130,246,0.12)" stroke="#3B82F6" strokeWidth="1.5" />
      <circle cx="20.5" cy="17" r="1.8" fill="#3B82F6" />
      <path d="M14.5 21 L16 23 L17.5 21Z" fill="rgba(10,10,10,0.25)" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Outils', href: '#outils' },
  { label: 'Programmes', href: '#programmes' },
  { label: 'Tarifs', href: '#tarifs' },
  { label: 'Science', href: '/' },
]

export default function PlatformNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px',
      background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
      transition: 'background 400ms ease, border-color 400ms ease, backdrop-filter 400ms ease',
    }}>
      {/* Logo */}
      <Link href="/platform" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <OwlMark />
        <span style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontWeight: 700, fontSize: '16px',
          color: '#0A0A0A', letterSpacing: '-0.02em',
        }}>TUTOR</span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {NAV_LINKS.map((link) => (
          <a key={link.label} href={link.href} style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '14px', fontWeight: 500,
            color: '#737373', textDecoration: 'none',
            transition: 'color 200ms',
          }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#0A0A0A')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#737373')}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/auth/login" style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '14px', fontWeight: 500,
          color: '#737373', textDecoration: 'none',
          transition: 'color 200ms',
        }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#0A0A0A')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#737373')}
        >
          Connexion
        </Link>
        <Link href="/auth/signup" style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '14px', fontWeight: 600,
          color: 'white', textDecoration: 'none',
          background: '#3B82F6',
          borderRadius: '10px', padding: '10px 22px',
          boxShadow: '0 0 20px rgba(59,130,246,0.25)',
          transition: 'box-shadow 300ms, transform 200ms',
        }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(59,130,246,0.45)'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(59,130,246,0.25)'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          }}
        >
          Commencer
        </Link>
      </div>
    </nav>
  )
}
