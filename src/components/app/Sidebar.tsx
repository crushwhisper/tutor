'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/app'
import {
  House,
  Books,
  Lightning,
  CalendarDots,
  ClipboardText,
  ChartBar,
  Gear,
  Lock,
  FilePdf,
} from '@phosphor-icons/react'

interface NavItem {
  href: string
  label: string
  sublabel?: string
  Icon: React.ElementType
  proOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/app', label: 'Cockpit', Icon: House },
  { href: '/app/preparation', label: 'Préparation', Icon: Books },
  { href: '/app/programmes/90j', label: 'Programme 3 Mois', sublabel: 'Intensif', Icon: Lightning, proOnly: true },
  { href: '/app/programmes/180j', label: 'Programme 6 Mois', sublabel: 'Recommandé', Icon: CalendarDots, proOnly: true },
  { href: '/app/examen-blanc', label: 'Examens Blancs', Icon: ClipboardText, proOnly: true },
  { href: '/app/progression', label: 'Progression', Icon: ChartBar, proOnly: true },
  { href: '/app/mes-cours', label: 'Mes Cours', sublabel: 'PDF personnels', Icon: FilePdf },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAppStore()
  const isPro = user?.role === 'admin' || (user?.subscription_plan === 'pro' && user?.subscription_status === 'active')

  function isActive(href: string) {
    if (href === '/app') return pathname === '/app'
    return pathname.startsWith(href)
  }

  return (
    <aside style={{
      position: 'fixed',
      left: 0, top: '64px', bottom: 0,
      width: '240px',
      background: 'var(--app-surface)',
      borderRight: '1px solid var(--app-border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 30,
      overflowY: 'auto',
    }}>
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const locked = (item.proOnly ?? false) && !isPro

          return (
            <NavLink
              key={item.href}
              item={item}
              active={active}
              locked={locked}
            />
          )
        })}

        {/* Separator */}
        <div style={{
          height: '1px',
          background: 'var(--app-border)',
          margin: '8px 14px',
        }} />

        <NavLink
          item={{ href: '/app/settings', label: 'Paramètres', Icon: Gear }}
          active={pathname.startsWith('/app/settings')}
          locked={false}
        />
      </nav>

      {/* Upgrade CTA — Starter only */}
      {!isPro && (
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--app-border)' }}>
          <Link
            href="/pricing"
            style={{
              display: 'block', textAlign: 'center',
              padding: '12px', borderRadius: '12px',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-glow)',
              textDecoration: 'none',
              fontSize: '13px', fontWeight: 600,
              color: 'var(--accent)',
              transition: 'background 200ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.14)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-soft)' }}
          >
            Passer à Pro →
          </Link>
        </div>
      )}
    </aside>
  )
}

function NavLink({
  item, active, locked,
}: {
  item: NavItem
  active: boolean
  locked: boolean
}) {
  const baseStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '10px',
    textDecoration: 'none',
    marginBottom: '2px',
    transition: 'all 200ms ease',
    cursor: locked ? 'default' : 'pointer',
    opacity: locked ? 0.55 : 1,
    color: active ? 'var(--accent)' : 'var(--app-text-muted)',
    background: active ? 'var(--accent-soft)' : 'transparent',
    fontFamily: 'var(--font-geist-sans), system-ui',
    fontSize: '14px', fontWeight: active ? 600 : 500,
  }

  const inner = (
    <>
      <item.Icon
        size={20}
        weight={active ? 'fill' : 'regular'}
        style={{ color: active ? 'var(--accent)' : 'var(--app-text-muted)', flexShrink: 0 }}
      />
      <span style={{ flex: 1, lineHeight: 1.2 }}>
        {item.label}
        {item.sublabel && (
          <span style={{
            display: 'block', fontSize: '10px', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.5px',
            color: active ? 'var(--accent)' : 'var(--app-text-ghost)',
            marginTop: '1px',
          }}>
            {item.sublabel}
          </span>
        )}
      </span>
      {locked && (
        <Lock size={12} style={{ color: 'var(--app-text-ghost)', flexShrink: 0 }} />
      )}
    </>
  )

  if (locked) {
    return (
      <Link
        href="/pricing"
        style={baseStyle}
        title="Passez au Pro pour débloquer"
      >
        {inner}
      </Link>
    )
  }

  return (
    <Link
      href={item.href}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'var(--app-surface-hover)'
          e.currentTarget.style.color = 'var(--app-text-body)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--app-text-muted)'
        }
      }}
    >
      {inner}
    </Link>
  )
}
