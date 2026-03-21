'use client'

export default function ScienceFooter() {
  const SOCIALS = [
    { label: 'Instagram', href: '#' },
    { label: 'WhatsApp', href: '#' },
    { label: 'Telegram', href: '#' },
  ]

  return (
    <footer style={{
      background: '#0A0A0A',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '40px 48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
    }}>
      <p style={{
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.2)',
      }}>
        © 2026 TUTOR
      </p>

      <div style={{ display: 'flex', gap: '24px' }}>
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.25)',
              textDecoration: 'none',
              transition: 'color 200ms',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)')}
          >
            {s.label}
          </a>
        ))}
      </div>
    </footer>
  )
}
