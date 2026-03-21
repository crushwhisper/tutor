'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Books, Lightning, CalendarDots,
  Fire, ChartBar, Star, CheckCircle,
  ArrowRight,
} from '@phosphor-icons/react'

interface Props {
  profile: {
    full_name?: string | null
    subscription_plan?: string | null
    subscription_status?: string | null
  } | null
  completedCount: number
  isPro: boolean
}

export default function DashboardClient({ profile, completedCount, isPro }: Props) {
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Étudiant'
  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* ── Section 1 : Bienvenue ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0 }}
        style={{ marginBottom: '40px' }}
      >
        <h1 style={{
          fontSize: '28px', fontWeight: 700,
          color: 'var(--app-text)', letterSpacing: '-0.5px',
          marginBottom: '6px',
        }}>
          Bonjour {firstName}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', textTransform: 'capitalize' }}>
          {date}
        </p>
      </motion.div>

      {/* ── Section 2 : Les 3 voies ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 }}
        style={{ marginBottom: '40px' }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          <VoieCard
            href="/app/preparation"
            icon={<Books size={32} weight="duotone" style={{ color: 'var(--accent)' }} />}
            title="Préparation Libre"
            description="Naviguez librement dans les cours. Choisissez votre module et votre rythme."
            tags={['Anatomie', 'Médecine', 'Chirurgie', 'Urgences']}
            ctaLabel="Explorer"
            accentColor="var(--accent)"
            glowColor="rgba(59,130,246,0.12)"
          />
          <VoieCard
            href="/app/programmes/90"
            icon={<Lightning size={32} weight="duotone" style={{ color: 'var(--warning)' }} />}
            title="Programme 3 Mois"
            badge={{ label: 'INTENSIF', color: 'var(--warning)', bg: 'var(--warning-soft)' }}
            description="90 jours. Rythme accéléré. Pour ceux qui ont peu de temps et beaucoup de détermination."
            ctaLabel={isPro ? 'Commencer' : 'Essayer le Jour 1'}
            accentColor="var(--warning)"
            glowColor="rgba(245,158,11,0.10)"
            locked={!isPro}
          />
          <VoieCard
            href="/app/programmes/180"
            icon={<CalendarDots size={32} weight="duotone" style={{ color: 'var(--success)' }} />}
            title="Programme 6 Mois"
            badge={{ label: 'RECOMMANDÉ', color: 'var(--success)', bg: 'var(--success-soft)' }}
            description="180 jours. Couverture complète. La méthode la plus sûre pour tout maîtriser."
            ctaLabel={isPro ? 'Commencer' : 'Essayer le Jour 1'}
            accentColor="var(--success)"
            glowColor="rgba(16,185,129,0.10)"
            locked={!isPro}
          />
        </div>
      </motion.div>

      {/* ── Section 3 : Stats rapides ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.16 }}
        style={{ borderTop: '1px solid var(--app-border)', paddingTop: '32px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <StatCell
            value={completedCount}
            label="Cours complétés"
            icon={<CheckCircle size={18} weight="duotone" style={{ color: 'var(--accent)' }} />}
          />
          <StatCell
            value={0}
            label="Jours de streak"
            icon={<Fire size={18} weight="duotone" style={{ color: 'var(--warning)' }} />}
            bordered
          />
          <StatCell
            value="—"
            label="Score QCM moyen"
            icon={<ChartBar size={18} weight="duotone" style={{ color: 'var(--success)' }} />}
            bordered
          />
          <StatCell
            value={0}
            label="Cours favoris"
            icon={<Star size={18} weight="duotone" style={{ color: 'var(--owl-gold)' }} />}
            bordered
          />
        </div>
      </motion.div>
    </div>
  )
}

/* ── Voie Card ── */
function VoieCard({
  href, icon, title, badge, description, tags, ctaLabel,
  accentColor, glowColor, locked = false,
}: {
  href: string
  icon: React.ReactNode
  title: string
  badge?: { label: string; color: string; bg: string }
  description: string
  tags?: string[]
  ctaLabel: string
  accentColor: string
  glowColor: string
  locked?: boolean
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: '16px',
        padding: '32px',
        textDecoration: 'none',
        transition: 'border-color 300ms, box-shadow 300ms, transform 300ms',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor + '50'
        e.currentTarget.style.boxShadow = `0 8px 32px ${glowColor}`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--app-border)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '120px', height: '120px',
        background: glowColor,
        borderRadius: '50%',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* Icon + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        {icon}
        {badge && (
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px',
            textTransform: 'uppercase',
            background: badge.bg, color: badge.color,
            padding: '3px 10px', borderRadius: '999px',
          }}>
            {badge.label}
          </span>
        )}
        {locked && !badge && (
          <span style={{
            fontSize: '10px', fontWeight: 600,
            background: 'var(--app-bg)', color: 'var(--app-text-ghost)',
            border: '1px solid var(--app-border)',
            padding: '3px 10px', borderRadius: '999px',
          }}>
            Pro
          </span>
        )}
      </div>

      <h2 style={{
        fontSize: '20px', fontWeight: 700,
        color: 'var(--app-text)', marginBottom: '10px', letterSpacing: '-0.3px',
      }}>
        {title}
      </h2>

      <p style={{
        fontSize: '14px', color: 'var(--app-text-muted)',
        lineHeight: 1.6, marginBottom: '20px',
      }}>
        {description}
      </p>

      {tags && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontSize: '11px', fontWeight: 500,
              background: 'var(--app-bg)', border: '1px solid var(--app-border)',
              color: 'var(--app-text-muted)',
              padding: '3px 10px', borderRadius: '999px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '14px', fontWeight: 600,
        color: accentColor,
      }}>
        {ctaLabel}
        <ArrowRight size={16} weight="bold" />
      </div>
    </Link>
  )
}

/* ── Stat Cell ── */
function StatCell({
  value, label, icon, bordered = false,
}: {
  value: number | string
  label: string
  icon: React.ReactNode
  bordered?: boolean
}) {
  return (
    <div style={{
      padding: '24px 28px',
      borderLeft: bordered ? '1px solid var(--app-border)' : 'none',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '12px',
      }}>
        <span style={{ fontSize: '12px', color: 'var(--app-text-muted)', fontWeight: 500 }}>
          {label}
        </span>
        {icon}
      </div>
      <span style={{
        fontSize: '36px', fontWeight: 700,
        fontFamily: 'var(--font-geist-mono), monospace',
        color: 'var(--app-text)',
        letterSpacing: '-1px', lineHeight: 1,
      }}>
        {value}
      </span>
    </div>
  )
}
