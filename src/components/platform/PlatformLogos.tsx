'use client'

const SOURCES = ['PubMed', 'Cochrane', 'NEJM', 'The Lancet', 'Nature Medicine']

export default function PlatformLogos() {
  return (
    <div style={{
      background: '#f6f0e9',
      borderTop: '1px solid #e8d3c0',
      borderBottom: '1px solid #e8d3c0',
      padding: '20px 48px',
    }}>
      <div className="max-w-7xl mx-auto" style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{
          fontFamily: 'Outfit, system-ui, sans-serif',
          fontSize: '13px', fontWeight: 500,
          color: '#94877c', whiteSpace: 'nowrap', flexShrink: 0,
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
                color: '#94877c', letterSpacing: '0.05em',
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2b180a')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#94877c')}
            >
              {src}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
