'use client'

export default function ScienceFooter() {
  const SOCIALS = [
    { label: 'Instagram', href: '#' },
    { label: 'WhatsApp', href: '#' },
    { label: 'Telegram', href: '#' },
  ]

  return (
    <footer style={{
      background: '#fcf6ef',
      borderTop: '1px solid #e8d3c0',
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
        color: '#dab697',
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
              color: '#94877c',
              textDecoration: 'none',
              transition: 'color 200ms',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2b180a')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#94877c')}
          >
            {s.label}
          </a>
        ))}
      </div>
    </footer>
  )
}
