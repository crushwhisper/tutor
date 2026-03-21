'use client'

import { motion } from 'framer-motion'

const PROBLEMS = [
  {
    number: '01',
    title: 'Des ressources dispersées',
    description:
      "Les cours sont éparpillés entre polycopiés, sites web et groupes de messagerie — impossible de construire une révision cohérente sans perdre des heures à chercher.",
  },
  {
    number: '02',
    title: 'Impossible de tout mémoriser',
    description:
      "Des milliers de pages à retenir en peu de temps, sans méthode structurée. La surcharge d'information bloque la rétention et creuse l'anxiété.",
  },
  {
    number: '03',
    title: 'Pas de suivi de progression',
    description:
      "Sans données précises sur vos lacunes, il est impossible de savoir où concentrer vos efforts. Vous révisez à l'aveugle.",
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 20 } },
}

export default function Problem() {
  return (
    <section style={{ padding: '120px 0', background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Left — 40% */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <p
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#71717A',
                marginBottom: '24px',
              }}
            >
              LE CONSTAT
            </p>
            <h2
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: '#09090B',
                lineHeight: 1.15,
                marginBottom: '20px',
              }}
            >
              Étudier la médecine{' '}
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  display: 'block',
                }}
              >
                ne devrait pas être aussi difficile.
              </span>
            </h2>
            <p
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '15px',
                color: '#3F3F46',
                maxWidth: '360px',
                lineHeight: 1.7,
              }}
            >
              Des milliers d&apos;étudiants passent des heures à chercher, trier et mémoriser — sans
              méthode. Le résultat : une fatigue qui s&apos;installe bien avant le concours.
            </p>
          </div>

          {/* Right — 60% */}
          <motion.div
            className="lg:col-span-7"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {PROBLEMS.map(({ number, title, description }, index) => (
              <motion.div
                key={number}
                variants={itemVariants}
                style={{
                  borderTop: '1px solid #E4E4E7',
                  padding: '28px 0',
                  display: 'flex',
                  gap: '32px',
                  alignItems: 'flex-start',
                }}
                whileHover={{ borderColor: '#6366F1' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '40px',
                    color: '#A1A1AA',
                    lineHeight: 1,
                    flexShrink: 0,
                    width: '56px',
                    textAlign: 'right',
                    transition: 'color 500ms',
                    userSelect: 'none',
                  }}
                  whileHover={{ color: '#71717A' }}
                >
                  {number}
                </motion.div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#09090B',
                      marginBottom: '8px',
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSize: '14px',
                      color: '#71717A',
                      lineHeight: 1.7,
                    }}
                  >
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
            {/* closing border */}
            <div style={{ borderTop: '1px solid #E4E4E7' }} />
          </motion.div>

        </div>
      </div>
    </section>
  )
}
