'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Books, Lightning, CalendarDots,
  Fire, ChartBar, ArrowRight, GraduationCap,
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

/* Animated SVG progress ring */
function ProgressRing({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: '128px', height: '128px' }}>
        <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx="64" cy="64" r={r}
            fill="none"
            stroke="var(--app-border)"
            strokeWidth="8"
          />
          {/* Progress */}
          <motion.circle
            cx="64" cy="64" r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '28px', fontWeight: 700,
            color: 'var(--app-text)', letterSpacing: '-1px',
            fontFamily: 'var(--font-geist-sans)',
            lineHeight: 1,
          }}>
            {pct}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--app-text-muted)', fontWeight: 500 }}>%</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)' }}>
          {value} cours
        </div>
        <div style={{ fontSize: '11px', color: 'var(--app-text-muted)' }}>complétés</div>
      </div>
    </div>
  )
}

/* Bento card wrapper */
function BentoCard({
  children, style, delay = 0,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      style={{
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: '18px',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

/* Individual voie card inside bento */
function VoieCard({
  href, icon, title, badge, description, ctaLabel,
  accentColor, glowColor, locked = false,
}: {
  href: string
  icon: React.ReactNode
  title: string
  badge?: { label: string; color: string; bg: string }
  description: string
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
        padding: '28px',
        textDecoration: 'none',
        transition: 'background 200ms',
        height: '100%',
        position: 'relative',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--app-surface-hover)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '100px', height: '100px',
        background: glowColor, borderRadius: '50%',
        filter: 'blur(36px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', position: 'relative' }}>
        {icon}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {badge && (
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.8px',
              textTransform: 'uppercase', background: badge.bg, color: badge.color,
              padding: '3px 8px', borderRadius: '999px',
            }}>
              {badge.label}
            </span>
          )}
          {locked && (
            <span style={{
              fontSize: '9px', fontWeight: 600,
              background: 'var(--app-bg)', color: 'var(--app-text-ghost)',
              border: '1px solid var(--app-border)',
              padding: '3px 8px', borderRadius: '999px',
            }}>
              Pro
            </span>
          )}
        </div>
      </div>

      <h2 style={{
        fontSize: '18px', fontWeight: 700, color: 'var(--app-text)',
        marginBottom: '8px', letterSpacing: '-0.3px', position: 'relative',
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: '13px', color: 'var(--app-text-muted)',
        lineHeight: 1.6, marginBottom: '20px', position: 'relative',
      }}>
        {description}
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', fontWeight: 600, color: accentColor,
        position: 'relative',
      }}>
        {ctaLabel}
        <ArrowRight size={14} weight="bold" />
      </div>
    </Link>
  )
}

export default function DashboardClient({ profile, completedCount, isPro }: Props) {
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Étudiant'
  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  // Approximate total for progress ring (real total could come from DB)
  const TOTAL_COURSES = 808

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{
          fontSize: '26px', fontWeight: 700,
          color: 'var(--app-text)', letterSpacing: '-0.5px', marginBottom: '4px',
        }}>
          Bonjour {firstName}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--app-text-muted)', textTransform: 'capitalize' }}>
          {date}
        </p>
      </motion.div>

      {/* ── Bento Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 280px',
        gridTemplateRows: 'auto auto',
        gap: '16px',
      }}>

        {/* [1] Préparation Libre — spans 2 rows, col 1-2 top */}
        <BentoCard delay={0.05} style={{ gridColumn: '1 / 3', gridRow: '1' }}>
          <VoieCard
            href="/app/preparation"
            icon={<Books size={28} weight="duotone" style={{ color: 'var(--accent)' }} />}
            title="Préparation Libre"
            description="Naviguez librement dans 808 cours répartis en 5 modules. Choisissez votre rythme et votre sujet."
            ctaLabel="Explorer les cours"
            accentColor="var(--accent)"
            glowColor="rgba(59,130,246,0.10)"
          />
        </BentoCard>

        {/* [2] Progress ring — col 3, row 1-2 */}
        <BentoCard delay={0.1} style={{ gridColumn: '3', gridRow: '1 / 3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', gap: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--app-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'flex-start' }}>
            Progression
          </div>
          <ProgressRing value={completedCount} total={TOTAL_COURSES} />

          {/* Streak */}
          <div style={{
            width: '100%', padding: '14px 16px',
            background: 'var(--app-bg)', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <Fire size={20} weight="duotone" style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--app-text)', lineHeight: 1, letterSpacing: '-0.5px' }}>
                0
              </div>
              <div style={{ fontSize: '11px', color: 'var(--app-text-muted)' }}>jours de streak</div>
            </div>
          </div>

          {/* QCM score */}
          <div style={{
            width: '100%', padding: '14px 16px',
            background: 'var(--app-bg)', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <ChartBar size={20} weight="duotone" style={{ color: 'var(--success)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--app-text)', lineHeight: 1, letterSpacing: '-0.5px' }}>
                —
              </div>
              <div style={{ fontSize: '11px', color: 'var(--app-text-muted)' }}>score QCM moyen</div>
            </div>
          </div>

          {/* Plan badge */}
          <div style={{
            width: '100%', padding: '10px 14px',
            background: isPro ? 'rgba(196,149,74,0.08)' : 'var(--app-bg)',
            border: `1px solid ${isPro ? 'rgba(196,149,74,0.2)' : 'var(--app-border)'}`,
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <GraduationCap size={16} weight="duotone" style={{ color: isPro ? 'var(--owl-gold)' : 'var(--app-text-ghost)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: isPro ? 'var(--owl-gold)' : 'var(--app-text-ghost)' }}>
              {isPro ? 'Plan Pro actif' : 'Plan Starter'}
            </span>
            {!isPro && (
              <Link href="/pricing" style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                Passer Pro
              </Link>
            )}
          </div>
        </BentoCard>

        {/* [3] Programme 90j — col 1, row 2 */}
        <BentoCard delay={0.15} style={{ gridColumn: '1', gridRow: '2' }}>
          <VoieCard
            href="/app/programmes/90j"
            icon={<Lightning size={28} weight="duotone" style={{ color: 'var(--warning)' }} />}
            title="Programme 3 Mois"
            badge={{ label: 'INTENSIF', color: 'var(--warning)', bg: 'var(--warning-soft)' }}
            description="90 jours. Rythme accéléré. Pour ceux qui ont peu de temps et beaucoup de détermination."
            ctaLabel={isPro ? 'Commencer' : 'Essayer le Jour 1'}
            accentColor="var(--warning)"
            glowColor="rgba(245,158,11,0.08)"
            locked={!isPro}
          />
        </BentoCard>

        {/* [4] Programme 180j — col 2, row 2 */}
        <BentoCard delay={0.2} style={{ gridColumn: '2', gridRow: '2' }}>
          <VoieCard
            href="/app/programmes/180j"
            icon={<CalendarDots size={28} weight="duotone" style={{ color: 'var(--success)' }} />}
            title="Programme 6 Mois"
            badge={{ label: 'RECOMMANDÉ', color: 'var(--success)', bg: 'var(--success-soft)' }}
            description="180 jours. Couverture complète. La méthode la plus sûre pour tout maîtriser."
            ctaLabel={isPro ? 'Commencer' : 'Essayer le Jour 1'}
            accentColor="var(--success)"
            glowColor="rgba(16,185,129,0.08)"
            locked={!isPro}
          />
        </BentoCard>
      </div>
    </div>
  )
}
