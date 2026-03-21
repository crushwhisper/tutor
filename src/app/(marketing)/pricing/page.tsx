import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/marketing/Navbar'
import Pricing from '@/components/marketing/Pricing'
import Footer from '@/components/marketing/Footer'

export const metadata: Metadata = { title: 'Tarifs — TUTOR' }

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-navy">
      <Navbar />
      <div className="pt-24">
        <Pricing />
      </div>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-8 text-center">Questions fréquentes</h2>
        <div className="space-y-4">
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
            <div key={q} className="glass-card p-6">
              <h3 className="text-white font-semibold mb-2">{q}</h3>
              <p className="text-muted text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
