import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TUTOR — Connexion',
}

function OwlMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
      <path d="M9 11 L7 4 L13 9Z" fill="rgba(37,99,235,0.5)" />
      <path d="M23 11 L25 4 L19 9Z" fill="rgba(37,99,235,0.5)" />
      <ellipse cx="16" cy="19" rx="10" ry="11" fill="none" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5" />
      <circle cx="11.5" cy="17" r="3.5" fill="rgba(37,99,235,0.08)" stroke="#2563EB" strokeWidth="1.5" />
      <circle cx="11.5" cy="17" r="1.8" fill="#2563EB" />
      <circle cx="20.5" cy="17" r="3.5" fill="rgba(37,99,235,0.08)" stroke="#2563EB" strokeWidth="1.5" />
      <circle cx="20.5" cy="17" r="1.8" fill="#2563EB" />
      <path d="M14.5 21 L16 23 L17.5 21Z" fill="rgba(37,99,235,0.5)" />
    </svg>
  )
}

const STATS = [
  { value: '563+', label: 'Cours structurés' },
  { value: '5', label: 'Modules' },
  { value: '90j', label: 'Programme intensif' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="marketing-wrapper"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        background: '#FFFFFF',
      }}
    >
      {/* Left branding panel */}
      <div
        className="hidden lg:flex"
        style={{
          width: '44%',
          flexShrink: 0,
          background: '#FAFAFA',
          borderRight: '1px solid #E4E4E7',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle gradient mesh */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(ellipse 60% 50% at 80% 90%, rgba(37,99,235,0.06) 0%, transparent 70%),' +
              'radial-gradient(ellipse 40% 40% at 20% 10%, rgba(37,99,235,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top: wordmark */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <OwlMark />
            <span
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                color: '#09090B',
                letterSpacing: '-0.02em',
              }}
            >
              TUTOR
            </span>
          </Link>
        </div>

        {/* Center: headline + stats */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#2563EB',
              marginBottom: '20px',
            }}
          >
            Préparation médicale
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(28px, 3vw, 40px)',
              color: '#09090B',
              lineHeight: 1.2,
              marginBottom: '40px',
            }}
          >
            Votre concours,<br />
            entre de bonnes mains.
          </h2>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STATS.map((stat, i) => (
              <div
                key={stat.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '20px 0',
                  borderTop: i === 0 ? '1px solid #E4E4E7' : 'none',
                  borderBottom: '1px solid #E4E4E7',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: '32px',
                    fontWeight: 800,
                    color: '#2563EB',
                    lineHeight: 1,
                    minWidth: '72px',
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: '14px',
                    color: '#71717A',
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: trust note */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: '13px',
              color: '#A1A1AA',
              lineHeight: 1.6,
            }}
          >
            &ldquo;Conçu par des étudiants en médecine, pour les étudiants en médecine.&rdquo;
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          minHeight: '100dvh',
        }}
      >
        {/* Mobile logo */}
        <div
          className="lg:hidden"
          style={{ marginBottom: '40px', textAlign: 'center' }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <OwlMark />
            <span
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                color: '#09090B',
                letterSpacing: '-0.02em',
              }}
            >
              TUTOR
            </span>
          </Link>
        </div>

        <div style={{ width: '100%', maxWidth: '440px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
