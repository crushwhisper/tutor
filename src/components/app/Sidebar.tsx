'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/app'

interface NavItem {
  href: string
  label: string
  icon: string
  isPro?: boolean
}

interface NavSection {
  label: string | null
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: null,
    items: [
      { href: '/app', label: 'Tableau de bord', icon: '🏠' },
    ],
  },
  {
    label: 'Préparation',
    items: [
      { href: '/app/preparation', label: 'Préparation Libre', icon: '📚' },
      { href: '/app/programmes', label: 'Programmes', icon: '📅' },
      { href: '/app/examen-blanc', label: 'Examen Blanc', icon: '🏆', isPro: true },
    ],
  },
  {
    label: 'Suivi',
    items: [
      { href: '/app/progression', label: 'Progression', icon: '📊' },
      { href: '/app/journal', label: 'Journal', icon: '📝' },
    ],
  },
  {
    label: 'Compte',
    items: [
      { href: '/app/settings', label: 'Paramètres', icon: '⚙️' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <aside
      className={`flex flex-col bg-navy-800 border-r border-gold/10 transition-all duration-300 shrink-0 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gold/10">
        {!sidebarCollapsed && (
          <Link href="/app" className="font-serif text-xl text-white">TUTOR</Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-muted hover:text-gold hover:bg-gold/10 transition-all"
          aria-label="Réduire le menu"
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.label && !sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-muted uppercase tracking-widest">
                {section.label}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/app' && pathname.startsWith(item.href))
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? 'bg-gold/15 text-gold'
                          : 'text-muted hover:text-white hover:bg-white/5'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span className="text-lg shrink-0">{item.icon}</span>
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium truncate">{item.label}</span>
                      )}
                      {!sidebarCollapsed && item.isPro && (
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-gold/20 text-gold font-medium">
                          Pro
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom — upgrade CTA for free users */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-gold/10">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <p className="text-xs text-muted mb-3">Débloquez toutes les fonctionnalités</p>
            <Link href="/app/settings?tab=subscription" className="btn-primary text-xs py-2 px-4 block text-center">
              Passer à Pro
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}
