import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'CGU — TUTOR' }

export default function CGUPage() {
  return (
    <article className="prose-tutor">
      <h1 className="text-3xl font-semibold text-white mb-2">Conditions Générales d&apos;Utilisation</h1>
      <p className="text-muted text-sm mb-12">Dernière mise à jour : janvier 2025</p>

      <h2>1. Acceptation des conditions</h2>
      <p>
        En accédant et en utilisant la plateforme TUTOR, vous acceptez d&apos;être lié par les présentes Conditions Générales d&apos;Utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre service.
      </p>

      <h2>2. Description du service</h2>
      <p>
        TUTOR est une plateforme de préparation aux concours médicaux proposant des cours structurés, des outils de révision et des programmes personnalisés. Le service est disponible en deux formules : Starter (gratuit) et Pro (payant).
      </p>

      <h2>3. Compte utilisateur</h2>
      <p>
        Pour accéder au service, vous devez créer un compte avec une adresse email valide. Vous êtes responsable de la confidentialité de vos identifiants. Toute activité effectuée depuis votre compte est sous votre responsabilité.
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur TUTOR (cours, QCM, cartes mentales, flashcards, textes, graphiques) sont protégés par le droit d&apos;auteur et appartiennent à TUTOR ou à ses partenaires. Toute reproduction sans autorisation est interdite.
      </p>

      <h2>5. Usage personnel</h2>
      <p>
        L&apos;accès à TUTOR est strictement personnel et non transférable. Il est interdit de partager votre compte, de redistribuer les contenus ou d&apos;utiliser le service à des fins commerciales sans autorisation écrite préalable.
      </p>

      <h2>6. Abonnements et paiements</h2>
      <p>
        Les abonnements Pro sont facturés selon la périodicité choisie (mensuelle ou semestrielle). Les paiements sont traités de manière sécurisée via Stripe. En cas de non-paiement, l&apos;accès Pro sera suspendu.
      </p>

      <h2>7. Résiliation</h2>
      <p>
        Vous pouvez résilier votre abonnement à tout moment depuis votre espace compte. La résiliation prend effet à la fin de la période en cours. Aucun remboursement partiel ne sera effectué sauf dans les cas prévus par notre politique de remboursement.
      </p>

      <h2>8. Limitation de responsabilité</h2>
      <p>
        TUTOR met tout en œuvre pour fournir des contenus de qualité. Cependant, la plateforme ne garantit pas la réussite aux concours. TUTOR ne saurait être tenu responsable des résultats obtenus par les utilisateurs.
      </p>

      <h2>9. Modifications</h2>
      <p>
        TUTOR se réserve le droit de modifier les présentes CGU à tout moment. Les modifications seront notifiées par email. L&apos;utilisation continue du service vaut acceptation des nouvelles conditions.
      </p>

      <h2>10. Contact</h2>
      <p>
        Pour toute question relative aux présentes CGU, contactez-nous à : <strong>contact@tutor.ma</strong>
      </p>
    </article>
  )
}
