'use client'

import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/app'

const PAGE_TITLES: Record<string, string> = {
  '/app': 'Tableau de bord',
  '/app/preparation': 'Préparation Libre',
  '/app/programmes': 'Programmes',
  '/app/examen-blanc': 'Examen Blanc',
  '/app/progression': 'Progression',
  '/app/journal': 'Journal de révision',
  '/app/settings': 'Paramètres',
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Check prefixes
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (key !== '/app' && pathname.startsWith(key)) return val
  }
  return 'TUTOR'
}

export default function Topbar() {
  const pathname = usePathname()
  const { user } = useAppStore()

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'T'

  const isPro = user?.subscription_plan === 'pro' && user?.subscription_status === 'active'

  return (
    <header className="h-16 border-b border-gold/10 bg-navy-800/50 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-white font-semibold">{getPageTitle(pathname)}</h1>

      <div className="flex items-center gap-3">
        {/* Pro badge */}
        {isPro && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-gold/20 text-gold font-medium border border-gold/30">
            Pro
          </span>
        )}

        {/* User avatar */}
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name ?? 'Avatar'}
            className="w-8 h-8 rounded-full border border-gold/20"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-sm font-semibold">
            {initials}
          </div>
        )}
      </div>
    </header>
  )
}
