import type { Metadata } from 'next'
import Navbar from '@/components/marketing/Navbar'
import Pricing from '@/components/marketing/Pricing'
import Footer from '@/components/marketing/Footer'

export const metadata: Metadata = { title: 'Tarifs — TUTOR' }

export default function PricingPage() {
  return (
    <main className="marketing-wrapper min-h-screen">
      <Navbar />
      <div className="pt-24">
        <Pricing />
      </div>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--avalon-brown)', marginBottom: '32px', textAlign: 'center' }}>
          Questions fréquentes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            {
              q: 'Puis-je annuler à tout moment ?',
              a: 'Oui, vous pouvez annuler votre abonnement Pro à tout moment depuis votre espace compte. Vous conservez l\'accès jusqu\'à la fin de la période payée.',
            },
            {
              q: 'Y a-t-il une période d\'essai ?',
              a: 'Le plan Starter est gratuit et vous permet de découvrir la plateforme. Vous pouvez passer à Pro à tout moment avec une garantie remboursement 14 jours.',
            },
            {
              q: 'Comment fonctionne la facturation ?',
              a: 'La facturation est automatique selon la périodicité choisie (mensuelle ou semestrielle). Vous recevez une facture par email à chaque renouvellement.',
            },
            {
              q: 'Mes données sont-elles sécurisées ?',
              a: 'Oui. Toutes les données sont chiffrées et stockées de manière sécurisée. Les paiements sont traités par Stripe, leader mondial de la sécurité des paiements.',
            },
          ].map(({ q, a }) => (
            <div key={q} style={{
              background: 'white',
              border: '1px solid var(--avalon-border)',
              borderRadius: '14px',
              padding: '24px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--avalon-brown)', marginBottom: '8px' }}>{q}</h3>
              <p style={{ fontSize: '13px', color: 'var(--avalon-brown-muted)', lineHeight: 1.7 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
