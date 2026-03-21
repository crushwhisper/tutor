'use client'

import React, { useState } from 'react'
import Link from 'next/link'

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.008 9.46c-.15.672-.54.836-1.093.52l-3.02-2.226-1.457 1.4c-.16.16-.295.295-.605.295l.216-3.067 5.577-5.035c.243-.215-.053-.334-.376-.12L7.48 14.4l-2.98-.928c-.647-.203-.66-.647.135-.957l11.642-4.49c.54-.196 1.012.12.285.223z" />
    </svg>
  )
}

const SOCIALS = [
  { label: 'Instagram', Icon: InstagramIcon, href: '#' },
  { label: 'Telegram', Icon: TelegramIcon, href: '#' },
]

function SocialLink({ label, Icon, href }: { label: string; Icon: () => React.ReactElement; href: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        border: hovered ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '10px 20px',
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontSize: '13px',
        fontWeight: 500,
        color: hovered ? 'white' : 'rgba(255,255,255,0.5)',
        textDecoration: 'none',
        transition: 'all 200ms',
      }}
    >
      <Icon />
      {label}
    </a>
  )
}

export default function CTAFinal() {
  return (
    <section
      style={{
        background: '#09090B',
        padding: '100px 0',
        textAlign: 'center',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 4vw, 56px)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '16px',
          }}
        >
          Prêt à commencer ?
        </h2>
        <p
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '40px',
          }}
        >
          Rejoignez des milliers d&apos;étudiants qui préparent leur concours avec méthode.
        </p>

        <Link
          href="/auth/signup"
          className="btn-glow"
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            color: 'white',
            textDecoration: 'none',
            padding: '16px 40px',
            borderRadius: '12px',
            display: 'inline-block',
            marginBottom: '40px',
          }}
        >
          Créer mon compte gratuitement
        </Link>

        {/* Social links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {SOCIALS.map((s) => (
            <SocialLink key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
