import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy">
      {/* Simple top bar */}
      <div className="border-b border-gold/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-xl text-white">TUTOR</Link>
          <Link href="/" className="text-sm text-muted hover:text-gold transition-colors">← Retour</Link>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-16">
        {children}
      </div>
    </div>
  )
}
