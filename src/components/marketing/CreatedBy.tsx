export default function CreatedBy() {
  return (
    <section className="py-24 px-6">
      <div
        className="max-w-[900px] mx-auto flex flex-col md:flex-row gap-8 items-center"
        style={{
          background: '#FAFAFA',
          border: '1px solid #E4E4E7',
          borderRadius: '24px',
          padding: '48px 64px',
        }}
      >
        {/* Owl avatar */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M9 10 L7 4 L12 8Z" fill="#09090B" />
            <path d="M23 10 L25 4 L20 8Z" fill="#09090B" />
            <ellipse cx="16" cy="19" rx="10" ry="11" fill="none" stroke="#09090B" strokeWidth="1.5" />
            <circle cx="11.5" cy="17" r="3.5" fill="rgba(99,102,241,0.15)" stroke="#6366F1" strokeWidth="1.5" />
            <circle cx="11.5" cy="17" r="1.8" fill="#6366F1" />
            <circle cx="20.5" cy="17" r="3.5" fill="rgba(99,102,241,0.15)" stroke="#6366F1" strokeWidth="1.5" />
            <circle cx="20.5" cy="17" r="1.8" fill="#6366F1" />
            <path d="M14.5 21 L16 23 L17.5 21Z" fill="#09090B" />
          </svg>
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: '24px',
              color: '#09090B',
              marginBottom: '16px',
            }}
          >
            Conçu par ceux qui sont passés par là.
          </h3>
          <p
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '15px',
              color: '#3F3F46',
              lineHeight: 1.8,
              maxWidth: '560px',
            }}
          >
            TUTOR a été créé par des étudiants en médecine qui ont vécu la difficulté de préparer le
            concours de résidanat. Chaque fonctionnalité répond à un vrai besoin de révision.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {['Médecins résidents', 'Pédagogie active', 'Retour terrain'].map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#71717A',
                  border: '1px solid #E4E4E7',
                  borderRadius: '999px',
                  padding: '4px 12px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
