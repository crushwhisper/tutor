import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Remboursement — TUTOR' }

export default function RemboursementPage() {
  return (
    <article className="prose-tutor">
      <h1 className="text-3xl font-semibold text-white mb-2">Politique de Remboursement</h1>
      <p className="text-muted text-sm mb-12">Dernière mise à jour : janvier 2025</p>

      <h2>Garantie satisfait ou remboursé</h2>
      <p>
        TUTOR offre une garantie de remboursement de <strong>14 jours</strong> à compter de votre premier paiement Pro. Si vous n&apos;êtes pas entièrement satisfait, nous vous remboursons intégralement, sans condition et sans question.
      </p>

      <h2>Comment demander un remboursement</h2>
      <p>Pour initier un remboursement dans les 14 jours :</p>
      <ul>
        <li>Envoyez un email à <strong>support@tutor.ma</strong> avec votre email de compte</li>
        <li>Indiquez en objet : &quot;Demande de remboursement&quot;</li>
        <li>Le remboursement sera traité dans les 5 à 10 jours ouvrables</li>
      </ul>

      <h2>Après 14 jours</h2>
      <p>
        Passé le délai de 14 jours, les remboursements ne sont plus possibles. Cependant, vous pouvez annuler votre abonnement à tout moment depuis votre espace compte — vous conservez l&apos;accès Pro jusqu&apos;à la fin de la période payée.
      </p>

      <h2>Cas spéciaux</h2>
      <p>
        En cas de problème technique majeur imputable à TUTOR empêchant l&apos;accès au service pendant plus de 72 heures consécutives, un remboursement au prorata pourra être accordé. Contactez-nous à <strong>support@tutor.ma</strong>.
      </p>

      <h2>Modalités de remboursement</h2>
      <p>
        Les remboursements sont effectués sur le moyen de paiement original utilisé lors de l&apos;abonnement. Le délai de crédit dépend de votre établissement bancaire (généralement 5 à 10 jours ouvrables).
      </p>

      <h2>Contact</h2>
      <p>Pour toute question : <strong>support@tutor.ma</strong></p>
    </article>
  )
}
