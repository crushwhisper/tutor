'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const STEPS = [
  {
    number: '01',
    title: 'Choisissez votre module',
    description:
      'Anatomie, Biologie, Médecine, Chirurgie ou Urgences — accédez à 563 cours structurés, classés par thème et niveau de difficulté.',
  },
  {
    number: '02',
    title: 'Révisez avec méthode',
    description:
      'Cartes mentales, audio, QCM et flashcards transforment chaque cours en une expérience de révision complète et efficace.',
  },
  {
    number: '03',
    title: 'Mesurez votre progression',
    description:
      'Des examens blancs et un tableau de bord personnalisé vous indiquent exactement où vous en êtes et où concentrer vos efforts.',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-100px' })

  const circleStyle = (delay: number): React.CSSProperties => ({
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: inView ? '1.5px solid #6366F1' : '1.5px solid #E4E4E7',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: `border-color 400ms ease ${delay}ms`,
  })

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      style={{ background: '#FAFAFA', padding: '120px 0' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header — centered */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
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
            COMMENT ÇA MARCHE
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
            Trois étapes.{' '}
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
              }}
            >
              C&apos;est tout.
            </span>
          </h2>
        </div>

        {/* Three-step layout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '80px',
          }}
        >
          {STEPS.map((step, index) => (
            <div key={step.number} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
              {/* Step */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  flex: 1,
                }}
              >
                {/* Circle */}
                <div style={circleStyle(index * 600)}>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '20px',
                      color: '#09090B',
                    }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Text */}
                <div style={{ textAlign: 'center', maxWidth: '260px' }}>
                  <h3
                    style={{
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#09090B',
                      marginBottom: '8px',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSize: '14px',
                      color: '#71717A',
                      lineHeight: 1.7,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector line between steps */}
              {index < STEPS.length - 1 && (
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'flex-start',
                    paddingTop: '28px',
                    width: '60px',
                  }}
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: inView ? 1 : 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index === 0 ? 0.3 : 0.9,
                      ease: 'easeInOut',
                    }}
                    style={{
                      height: '1px',
                      width: '100%',
                      borderTop: '1px dashed #E4E4E7',
                      transformOrigin: 'left center',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA block */}
        <div
          style={{
            background: 'white',
            border: '1px solid #E4E4E7',
            borderRadius: '24px',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
          }}
          className="lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#71717A',
                marginBottom: '12px',
              }}
            >
              Programmes structurés
            </p>
            <h3
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '22px',
                fontWeight: 600,
                color: '#09090B',
                marginBottom: '8px',
              }}
            >
              Chaque jour planifié pour vous.
            </h3>
            <p
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                color: '#71717A',
                lineHeight: 1.7,
                maxWidth: '460px',
              }}
            >
              Choisissez entre le programme 90 jours intensif ou le programme 180 jours complet —
              une feuille de route quotidienne, sans improvisation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '40px',
                  fontWeight: 800,
                  color: '#6366F1',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                90j
              </div>
              <div
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '12px',
                  color: '#71717A',
                }}
              >
                Intensif
              </div>
            </div>
            <div style={{ width: '1px', height: '48px', background: '#E4E4E7' }} />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '40px',
                  fontWeight: 800,
                  color: '#6366F1',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                180j
              </div>
              <div
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '12px',
                  color: '#71717A',
                }}
              >
                Complet
              </div>
            </div>
            <Link
              href="/auth/signup"
              className="btn-glow"
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                display: 'inline-block',
                marginLeft: '8px',
              }}
            >
              Choisir mon programme
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
