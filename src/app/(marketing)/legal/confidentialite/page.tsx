import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Confidentialité — TUTOR' }

export default function ConfidentialitePage() {
  return (
    <article className="prose-tutor">
      <h1 className="text-3xl font-semibold text-white mb-2">Politique de Confidentialité</h1>
      <p className="text-muted text-sm mb-12">Dernière mise à jour : janvier 2025</p>

      <h2>1. Données collectées</h2>
      <p>
        TUTOR collecte les données suivantes lors de votre inscription et utilisation du service :
      </p>
      <ul>
        <li><strong>Données d&apos;identification :</strong> nom, adresse email</li>
        <li><strong>Données de connexion :</strong> adresse IP, date et heure de connexion</li>
        <li><strong>Données d&apos;utilisation :</strong> cours consultés, scores, temps de révision</li>
        <li><strong>Données de paiement :</strong> traitées directement par Stripe (nous ne stockons pas vos données bancaires)</li>
      </ul>

      <h2>2. Utilisation des données</h2>
      <p>Vos données sont utilisées pour :</p>
      <ul>
        <li>Fournir et améliorer nos services</li>
        <li>Personnaliser votre expérience de révision</li>
        <li>Traiter les paiements</li>
        <li>Vous envoyer des communications relatives à votre compte</li>
        <li>Assurer la sécurité de la plateforme</li>
      </ul>

      <h2>3. Partage des données</h2>
      <p>
        Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées uniquement avec nos prestataires techniques (Supabase pour l&apos;hébergement, Stripe pour les paiements, Resend pour les emails) dans le cadre strict de l&apos;exécution du service.
      </p>

      <h2>4. Conservation des données</h2>
      <p>
        Vos données sont conservées pendant toute la durée de votre compte, puis supprimées dans un délai de 30 jours après la clôture de votre compte, sauf obligation légale contraire.
      </p>

      <h2>5. Vos droits</h2>
      <p>Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
      <ul>
        <li>Droit d&apos;accès à vos données</li>
        <li>Droit de rectification</li>
        <li>Droit à l&apos;effacement</li>
        <li>Droit à la portabilité</li>
        <li>Droit d&apos;opposition au traitement</li>
      </ul>
      <p>Pour exercer ces droits, contactez-nous à : <strong>privacy@tutor.ma</strong></p>

      <h2>6. Cookies</h2>
      <p>
        TUTOR utilise des cookies essentiels au fonctionnement du service (authentification, préférences). Aucun cookie publicitaire n&apos;est utilisé.
      </p>

      <h2>7. Sécurité</h2>
      <p>
        Vos données sont protégées par des mesures de sécurité conformes aux standards de l&apos;industrie : chiffrement TLS, accès restreint, surveillance continue.
      </p>

      <h2>8. Contact</h2>
      <p>Pour toute question : <strong>privacy@tutor.ma</strong></p>
    </article>
  )
}
