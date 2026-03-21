'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass, Gear, CreditCard, SignOut, UserCircle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/app'
import { createClient } from '@/lib/supabase/client'

function OwlMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M10 12 L8 4 L14 10Z" fill="var(--app-text)" opacity="0.45" />
      <path d="M22 12 L24 4 L18 10Z" fill="var(--app-text)" opacity="0.45" />
      <ellipse cx="16" cy="20" rx="10" ry="10.5" stroke="var(--app-text)" strokeWidth="1.4" fill="none" opacity="0.5" />
      <circle cx="11.5" cy="18" r="3.5" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
      <circle cx="11.5" cy="18" r="1.7" fill="var(--accent)" />
      <circle cx="20.5" cy="18" r="3.5" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
      <circle cx="20.5" cy="18" r="1.7" fill="var(--accent)" />
      <path d="M14.5 22 L16 24 L17.5 22Z" fill="var(--app-text)" opacity="0.35" />
    </svg>
  )
}

const DROPDOWN_ITEMS = [
  { label: 'Profil', icon: UserCircle, href: '/app/settings?tab=profile' },
  { label: 'Paramètres', icon: Gear, href: '/app/settings' },
  { label: 'Gérer l\'abonnement', icon: CreditCard, href: '/app/settings?tab=subscription' },
]

export default function Topbar() {
  const router = useRouter()
  const { user } = useAppStore()
  const [search, setSearch] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'T'

  const isPro = user?.subscription_plan === 'pro' && user?.subscription_status === 'active'

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) router.push(`/app/preparation?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      background: 'var(--app-surface)',
      borderBottom: '1px solid var(--app-border)',
    }}>
      {/* Left — Logo */}
      <Link href="/app" style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        textDecoration: 'none', flexShrink: 0,
      }}>
        <OwlMark />
        <span style={{
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          fontSize: '16px', fontWeight: 700,
          color: 'var(--app-text)', letterSpacing: '-0.3px',
        }}>TUTOR</span>
      </Link>

      {/* Centre — Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', margin: '0 32px' }}>
        <div style={{ position: 'relative' }}>
          <MagnifyingGlass
            size={16}
            style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--app-text-ghost)', pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cours..."
            style={{
              width: '100%', height: '40px',
              background: 'var(--app-bg)',
              border: '1px solid var(--app-border)',
              borderRadius: '10px',
              paddingLeft: '38px', paddingRight: '16px',
              fontFamily: 'inherit', fontSize: '14px',
              color: 'var(--app-text)',
              outline: 'none',
              transition: 'border-color 200ms',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)' }}
          />
        </div>
      </form>

      {/* Right — Badge + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Plan badge */}
        <span style={{
          fontSize: '12px', fontWeight: 500,
          padding: '4px 10px', borderRadius: '999px',
          background: isPro ? 'var(--accent-soft)' : 'var(--app-bg)',
          color: isPro ? 'var(--accent)' : 'var(--app-text-muted)',
          border: isPro ? '1px solid var(--accent-glow)' : '1px solid var(--app-border)',
          fontFamily: 'var(--font-geist-sans), system-ui',
        }}>
          {isPro ? 'Pro' : 'Starter'}
        </span>

        {/* Avatar + dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--app-border)',
              border: '1.5px solid var(--app-border-hover)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              fontFamily: 'var(--font-geist-sans), system-ui',
              fontSize: '13px', fontWeight: 600,
              color: 'var(--app-text)',
              transition: 'border-color 200ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--app-border-hover)' }}
          >
            {initials}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: '200px',
                  background: 'var(--app-surface)',
                  border: '1px solid var(--app-border)',
                  borderRadius: '14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}
              >
                {/* User info */}
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--app-border)',
                }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '2px' }}>
                    {user?.full_name ?? 'Mon compte'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>
                    {user?.email ?? ''}
                  </p>
                </div>

                {/* Nav items */}
                <div style={{ padding: '6px' }}>
                  {DROPDOWN_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 10px', borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'var(--app-text-body)',
                        fontSize: '13px', fontWeight: 500,
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--app-surface-hover)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <item.icon size={16} style={{ color: 'var(--app-text-muted)', flexShrink: 0 }} />
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Sign out */}
                <div style={{ padding: '6px', borderTop: '1px solid var(--app-border)' }}>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '9px 10px', borderRadius: '8px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--danger)', fontSize: '13px', fontWeight: 500,
                      transition: 'background 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-soft)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <SignOut size={16} style={{ flexShrink: 0 }} />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
