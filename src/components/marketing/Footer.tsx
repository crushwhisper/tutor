'use client'

import Link from 'next/link'

const LINKS: Record<string, { label: string; href: string }[]> = {
  Produit: [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'Programmes', href: '#programmes' },
    { label: 'Méthode', href: '#how-it-works' },
  ],
  Légal: [
    { label: 'CGU', href: '/legal/cgu' },
    { label: 'Confidentialité', href: '/legal/confidentialite' },
    { label: 'Remboursement', href: '/legal/remboursement' },
  ],
  Compte: [
    { label: 'Connexion', href: '/auth/login' },
    { label: 'Inscription', href: '/auth/signup' },
  ],
}

function OwlSmall() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path d="M9 11 L7 4 L13 9Z" fill="rgba(255,255,255,0.7)" />
      <path d="M23 11 L25 4 L19 9Z" fill="rgba(255,255,255,0.7)" />
      <ellipse cx="16" cy="19" rx="10" ry="11" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <circle cx="11.5" cy="17" r="3.5" fill="rgba(37,99,235,0.15)" stroke="#2563EB" strokeWidth="1.5" />
      <circle cx="11.5" cy="17" r="1.8" fill="#2563EB" />
      <circle cx="20.5" cy="17" r="3.5" fill="rgba(37,99,235,0.15)" stroke="#2563EB" strokeWidth="1.5" />
      <circle cx="20.5" cy="17" r="1.8" fill="#2563EB" />
      <path d="M14.5 21 L16 23 L17.5 21Z" fill="rgba(255,255,255,0.7)" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer
      style={{
        background: '#09090B',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '64px 24px 40px',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <OwlSmall />
              <span
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: 'white',
                  letterSpacing: '-0.02em',
                }}
              >
                TUTOR
              </span>
            </div>
            <p
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.7,
              }}
            >
              La plateforme de préparation pour les concours médicaux.
            </p>
          </div>

          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '16px',
                }}
              >
                {category}
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        fontFamily: 'Outfit, system-ui, sans-serif',
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.5)',
                        textDecoration: 'none',
                        transition: 'color 200ms',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = 'white')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)')
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            &copy; 2026 TUTOR. Tous droits réservés.
          </p>
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            Conçu pour les futurs médecins.
          </p>
        </div>
      </div>
    </footer>
  )
}
