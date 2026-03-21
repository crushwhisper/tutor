'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { CaretDown } from '@phosphor-icons/react'

const FAQ = [
  {
    q: 'Comment fonctionne le programme jour par jour ?',
    a: 'Chaque jour, TUTOR vous assigne un ensemble de cours, QCM et flashcards adaptés à votre programme (90 ou 180 jours). Vous voyez vos objectifs du jour, votre avancement et votre streak de motivation.',
  },
  {
    q: 'Puis-je utiliser TUTOR avec mes propres cours ?',
    a: "TUTOR propose 563 cours structurés. Vous pouvez les utiliser tels quels ou les compléter avec vos propres notes. Les QCM et flashcards sont générés à partir du contenu de nos cours.",
  },
  {
    q: 'Les QCM sont-ils adaptés à mon concours ?',
    a: "Nos QCM sont calibrés sur les banques d'annales des concours médicaux et sur le contenu scientifique validé. Ils couvrent l'ensemble des modules : Anatomie, Biologie, Médecine, Chirurgie et Urgences.",
  },
  {
    q: "Puis-je annuler mon abonnement à tout moment ?",
    a: "Oui, sans engagement. Vous annulez en un clic depuis votre espace compte. Vous conservez l'accès jusqu'à la fin de votre période payée. Remboursement garanti sous 14 jours.",
  },
  {
    q: 'Comment fonctionne le mode écoute ?',
    a: "Chaque cours est converti en audio naturel de 3 à 5 minutes. Vous pouvez l'écouter directement dans l'application ou le télécharger en MP3 pour réviser hors connexion.",
  },
  {
    q: 'TUTOR remplace-t-il les cours officiels ?',
    a: "TUTOR est un complément structuré, pas un remplacement. Notre contenu est basé sur les programmes officiels et enrichi par des méthodes pédagogiques validées par la recherche.",
  },
  {
    q: 'Puis-je changer de programme (3 mois → 6 mois) ?',
    a: "Oui, vous pouvez changer de programme depuis votre espace à tout moment. Votre progression est conservée et le programme est recalculé à partir de là où vous en êtes.",
  },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      style={{ borderBottom: '1px solid #e8d3c0' }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
          padding: '20px 0', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '16px', fontWeight: 600, color: '#2b180a',
        }}>{q}</span>
        <CaretDown
          size={18}
          style={{
            color: '#94877c', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '15px', color: '#94877c', lineHeight: 1.75,
              paddingBottom: '20px',
            }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function PlatformFAQ() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} style={{ background: '#f6f0e9', padding: '120px 0' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '64px', textAlign: 'center' }}>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '4px', color: '#0099ff', marginBottom: '20px' }}
          >FAQ</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
            style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 3.5vw, 44px)', color: '#2b180a', marginBottom: '12px' }}
          >
            Vos questions, nos réponses.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.15 }}
            style={{ fontFamily: 'Outfit, system-ui, sans-serif', fontSize: '15px', color: '#94877c' }}
          >
            Tout ce que vous devez savoir.{' '}
            <a href="#contact" style={{ color: '#0099ff', textDecoration: 'none' }}>Une autre question ?</a>
          </motion.p>
        </div>

        {/* Accordion */}
        {inView && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {FAQ.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
