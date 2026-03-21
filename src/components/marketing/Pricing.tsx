'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from '@phosphor-icons/react'

const STARTER_FEATURES = [
  '5 modules accessibles',
  'Cartes mentales basiques',
  'QCM limités (10 / jour)',
  'Flashcards (20 / jour)',
  'Tableau de bord basique',
]

const PRO_FEATURES = [
  'Tous les cours illimités',
  'Audio du cours (voix naturelle)',
  'QCM illimités',
  'Flashcards illimitées',
  'Examen Blanc complet',
  'Programmes 90j & 180j',
  'Journal de révision',
  'Analyse avancée',
  'Support prioritaire',
]

export default function Pricing() {
  const [sixMonths, setSixMonths] = useState(false)

  return (
    <section id="pricing" style={{ padding: '120px 0', background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
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
            TARIFS
          </p>
          <h2
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(32px, 4vw, 48px)',
              color: '#09090B',
              lineHeight: 1.15,
              marginBottom: '12px',
            }}
          >
            Investissez dans votre réussite.
          </h2>
          <p
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '15px',
              color: '#71717A',
              maxWidth: '480px',
            }}
          >
            Accédez à TUTOR sans carte bancaire. Passez Pro quand vous êtes prêt.
          </p>
        </div>

        {/* Toggle */}
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#F4F4F5',
              borderRadius: '999px',
              padding: '4px',
            }}
          >
            <button
              onClick={() => setSixMonths(false)}
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: !sixMonths ? 600 : 400,
                color: !sixMonths ? '#09090B' : '#71717A',
                background: !sixMonths ? 'white' : 'transparent',
                boxShadow: !sixMonths ? '0 1px 2px rgba(0,0,0,0.03)' : 'none',
                border: 'none',
                borderRadius: '999px',
                padding: '8px 20px',
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
            >
              Mensuel
            </button>
            <button
              onClick={() => setSixMonths(true)}
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: sixMonths ? 600 : 400,
                color: sixMonths ? '#09090B' : '#71717A',
                background: sixMonths ? 'white' : 'transparent',
                boxShadow: sixMonths ? '0 1px 2px rgba(0,0,0,0.03)' : 'none',
                border: 'none',
                borderRadius: '999px',
                padding: '8px 20px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 200ms',
              }}
            >
              6 mois
              <span
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#F59E0B',
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '999px',
                  padding: '2px 6px',
                }}
              >
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            maxWidth: '820px',
          }}
          className="grid-cols-1 md:grid-cols-2"
        >
          {/* STARTER */}
          <div
            style={{
              border: '1px solid #E4E4E7',
              borderRadius: '24px',
              padding: '40px',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: '#09090B',
                marginBottom: '16px',
              }}
            >
              Starter
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <span
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#09090B',
                }}
              >
                Gratuit
              </span>
            </div>
            <div style={{ borderTop: '1px solid #E4E4E7', marginBottom: '24px', paddingTop: '24px' }}>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {STARTER_FEATURES.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSize: '14px',
                      color: '#3F3F46',
                    }}
                  >
                    <Check size={16} weight="bold" style={{ color: '#A1A1AA', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1 }} />
            <Link
              href="/auth/signup"
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#3F3F46',
                textDecoration: 'none',
                textAlign: 'center',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #E4E4E7',
                display: 'block',
                transition: 'background 200ms',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = '#F4F4F5')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = 'transparent')
              }
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* PRO */}
          <div
            style={{
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '24px',
              padding: '40px',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 0 40px rgba(99,102,241,0.06)',
            }}
          >
            {/* Recommended badge */}
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#6366F1',
                color: 'white',
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 16px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
              }}
            >
              Recommandé
            </div>

            <h3
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: '#09090B',
                marginBottom: '16px',
              }}
            >
              Pro
            </h3>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '48px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {sixMonths ? '79' : '99'}
              </span>
              <span
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '16px',
                  color: '#71717A',
                }}
              >
                DH / {sixMonths ? 'mois (×6)' : 'mois'}
              </span>
            </div>
            <div style={{ borderTop: '1px solid #E4E4E7', marginBottom: '24px', paddingTop: '24px' }}>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSize: '14px',
                      color: '#3F3F46',
                    }}
                  >
                    <Check size={16} weight="bold" style={{ color: '#6366F1', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1 }} />
            <Link
              href="/auth/signup?plan=pro"
              className="btn-glow"
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                textDecoration: 'none',
                textAlign: 'center',
                padding: '14px',
                borderRadius: '12px',
                display: 'block',
              }}
            >
              Passer à Pro
            </Link>
          </div>
        </div>

        <p
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '12px',
            color: '#A1A1AA',
            textAlign: 'center',
            marginTop: '32px',
          }}
        >
          Satisfait ou remboursé sous 14 jours · Annulation à tout moment · Aucune carte bancaire requise pour démarrer
        </p>
      </div>
    </section>
  )
}
