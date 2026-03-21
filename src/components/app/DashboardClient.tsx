'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'
import type { User, JournalEntry } from '@/types'
import {
  CheckCircle,
  Books,
  Dna,
  Hospital,
  Syringe,
  Ambulance,
  FirstAidKit,
  CalendarCheck,
  ArrowRight,
  ChartLineUp,
  Brain
} from '@phosphor-icons/react'

interface ProgressWithRelations {
  id: string
  completed: boolean
  courses: {
    title: string
    module_id: string
    modules: {
      name: string
      color: string | null
    } | null
  } | null
}

interface Props {
  profile: User | null
  recentProgress: ProgressWithRelations[]
  completedCount: number
  lastJournal: JournalEntry | null
}

const MODULES = [
  { slug: 'anatomie-biologie', name: 'Anatomie & Biologie', icon: Dna, color: '#4A90D9' },
  { slug: 'medecine', name: 'Médecine Interne', icon: Hospital, color: '#E8A83E' },
  { slug: 'chirurgie', name: 'Chirurgie', icon: Syringe, color: '#E85555' },
  { slug: 'urgences-medicales', name: 'Urgences Méd', icon: Ambulance, color: '#9B59B6' },
  { slug: 'urgences-chirurgicales', name: 'Urgences Chir', icon: FirstAidKit, color: '#E67E22' },
]

export default function DashboardClient({ profile, recentProgress, completedCount, lastJournal }: Props) {
  const [journalText, setJournalText] = useState('')
  const [saving, setSaving] = useState(false)
  const { addToast } = useAppStore()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Étudiant'

  async function saveJournal() {
    if (!journalText.trim()) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase.from('journal_entries').insert({
      content: journalText,
    })

    if (error) {
      addToast({ type: 'error', title: 'Erreur', message: "Impossible d'enregistrer le journal." })
    } else {
      addToast({ type: 'success', title: 'Journal enregistré', message: 'Votre entrée a été sauvegardée.' })
      setJournalText('')
    }
    setSaving(false)
  }

  const QUICK_STATS = [
    { label: 'Cours complétés', value: completedCount, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'En cours', value: recentProgress.length, icon: ChartLineUp, color: 'text-gold' },
    { label: 'Modules', value: 5, icon: Books, color: 'text-blue-400' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-12 max-w-7xl mx-auto py-8"
    >
      {/* Aesthetic Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl tracking-tight text-white mb-2 font-sans flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Espace de Travail
          </h1>
          <p className="text-text-secondary">Bienvenue, <span className="text-white font-medium">{firstName}</span>. Votre préparation est en cours de synchronisation.</p>
        </div>
        <Link href="/app/preparation" className="group rounded-xl bg-white text-navy font-semibold px-6 py-3 transition-transform active:scale-[0.98] flex items-center gap-2">
          Reprendre l&apos;étude <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Stats & Modules) - 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Quick Stats: Clean grid without card boxes (Anti-Card) */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-6">
            {QUICK_STATS.map((stat) => (
              <div key={stat.label} className="px-6 flex flex-col items-start first:pl-0 last:pr-0">
                <div className="flex justify-between items-start w-full mb-4">
                  <span className="text-text-secondary text-sm font-medium">{stat.label}</span>
                  <stat.icon weight="duotone" size={20} className={stat.color} />
                </div>
                <span className="text-4xl font-mono text-white tracking-tighter">{stat.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Modules Grid - Glass Cards */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white font-sans tracking-tight">Modules d&apos;Expertise</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {MODULES.map((mod) => (
                <Link
                  key={mod.slug}
                  href={`/app/preparation?module=${mod.slug}`}
                  className="glass-card group p-5 hover:border-white/20 transition-all flex items-center gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner"
                    style={{ backgroundColor: `${mod.color}15` }}
                  >
                    <mod.icon weight="duotone" size={24} style={{ color: mod.color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium tracking-tight group-hover:text-gold transition-colors">
                      {mod.name}
                    </h3>
                    <p className="text-text-secondary text-xs mt-1">Explorer le curriculum →</p>
                  </div>
                </Link>
              ))}
              
              <Link
                href="/app/programmes"
                className="glass-card p-5 border-gold/20 hover:border-gold/40 transition-all bg-gradient-to-br from-gold/10 to-transparent col-span-1 sm:col-span-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center text-gold">
                    <CalendarCheck weight="fill" size={24} />
                  </div>
                  <div>
                    <p className="text-gold font-medium tracking-tight">Programmes de Planification</p>
                    <p className="text-gold/70 text-sm mt-0.5">Séquences optimisées sur 90 / 180 jours.</p>
                  </div>
                </div>
                <ArrowRight weight="bold" className="text-gold" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Column (Intelligent List & Status) - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Animated Activity List */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-4">Flux de Progression</h3>
            <div className="glass-card p-6 min-h-[220px]">
              {recentProgress.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <AnimatePresence>
                    {recentProgress.slice(0, 4).map((p, i) => (
                      <motion.div 
                        key={p.id} 
                        layoutId={`progress-${p.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                        className="flex items-start gap-3 group cursor-pointer"
                      >
                        <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-1.5 shadow-[0_0_8px_rgba(232,168,62,0.8)]" />
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm truncate font-medium group-hover:text-gold transition-colors">{p.courses?.title ?? 'Cours Actif'}</p>
                          <p className="text-text-secondary text-xs truncate mt-0.5">{p.courses?.modules?.name ?? 'Traitement de données'}</p>
                        </div>
                        {p.completed && <CheckCircle weight="fill" size={16} className="text-emerald-400 shrink-0 mt-0.5" />}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-6 opacity-50">
                  <Brain weight="duotone" size={32} className="text-text-secondary mb-3" />
                  <p className="text-text-secondary text-sm">Système inactif.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Contextual Input (Journal) */}
          <motion.div variants={itemVariants}>
            <h3 className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-4">Synthèse Cognitive</h3>
            <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5">
              {lastJournal && (
                <div className="mb-4 pl-3 border-l-2 border-indigo-500/50">
                  <p className="text-text-secondary text-sm italic line-clamp-2">
                    {lastJournal.content}
                  </p>
                </div>
              )}
              <div className="relative">
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Capturez un état mental ou un concept clé..."
                  rows={2}
                  className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-text-secondary focus:outline-none focus:border-indigo-500/50 focus:bg-navy-800 transition-all resize-none shadow-inner"
                />
                {/* Magnetic-style button without full physics loop for simplicity */}
                <button
                  onClick={saveJournal}
                  disabled={saving || !journalText.trim()}
                  className="absolute right-2 bottom-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-0"
                >
                  {saving ? '...' : 'Ancrer'}
                </button>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </motion.div>
  )
}
