'use client'

const SOURCES = ['PubMed', 'Cochrane', 'NEJM', 'The Lancet', 'Nature Medicine']

export default function PlatformLogos() {
  return (
    <div style={{
      background: '#F8F8F8',
      borderTop: '1px solid #E5E5E5',
      borderBottom: '1px solid #E5E5E5',
      padding: '20px 48px',
    }}>
      <div className="max-w-7xl mx-auto" style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '13px', fontWeight: 500,
          color: '#A3A3A3', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          Méthodes basées sur la recherche de :
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          {SOURCES.map((src) => (
            <span
              key={src}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px', fontWeight: 600,
                color: '#A3A3A3', letterSpacing: '0.05em',
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#525252')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#A3A3A3')}
            >
              {src}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
