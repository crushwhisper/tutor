import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export const FROM_EMAIL = 'TUTOR <noreply@tutor.ma>'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

if (!APP_URL && process.env.NODE_ENV === 'production') {
  console.error('[resend] NEXT_PUBLIC_APP_URL is not set — email links will be broken')
}

/** Escape user-controlled strings before interpolating into HTML email templates. */
function h(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Bienvenue sur TUTOR — Votre préparation commence maintenant',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0c1222; color: #e8eaf0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #e8a83e; font-size: 28px;">Bienvenue, ${h(name)} !</h1>
        <p style="color: #9fa7bc; line-height: 1.6;">
          Votre compte TUTOR est prêt. Commencez votre préparation dès maintenant.
        </p>
        <a href="${APP_URL}/app"
           style="display: inline-block; background: #e8a83e; color: #0c1222; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 24px;">
          Accéder à mon espace
        </a>
      </div>
    `,
  })
}

export async function sendProUpgradeEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'TUTOR Pro activé — Accès illimité débloqué',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0c1222; color: #e8eaf0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #e8a83e; font-size: 28px;">Bienvenue dans TUTOR Pro, ${h(name)} !</h1>
        <p style="color: #9fa7bc; line-height: 1.6;">
          Votre accès Pro est maintenant actif. Profitez de toutes les fonctionnalités sans restriction.
        </p>
        <a href="${APP_URL}/app"
           style="display: inline-block; background: #e8a83e; color: #0c1222; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 24px;">
          Explorer TUTOR Pro
        </a>
      </div>
    `,
  })
}

export async function sendDailyReminderEmail({
  to,
  name,
  dayNumber,
  programType,
}: {
  to: string
  name: string
  dayNumber: number
  programType: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `TUTOR — Jour ${dayNumber} vous attend !`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0c1222; color: #e8eaf0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #e8a83e; font-size: 28px;">Bonjour ${h(name)} !</h1>
        <p style="color: #9fa7bc; line-height: 1.6;">
          Votre programme du <strong style="color: #e8eaf0;">Jour ${dayNumber}</strong> vous attend.
          Chaque session compte — restez régulier et vous progresserez plus vite que vous ne le pensez.
        </p>
        <p style="color: #9fa7bc; line-height: 1.6;">
          Quelques minutes de révision aujourd'hui feront une grande différence demain. Vous avez déjà prouvé
          que vous en êtes capable. Continuez sur cette lancée !
        </p>
        <a href="${APP_URL}/app/programmes/${programType}/${dayNumber}"
           style="display: inline-block; background: #e8a83e; color: #0c1222; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 24px;">
          Commencer le Jour ${dayNumber}
        </a>
        <p style="color: #9fa7bc; font-size: 12px; margin-top: 32px;">
          Vous recevez cet e-mail car les rappels quotidiens sont activés sur votre compte TUTOR.
        </p>
      </div>
    `,
  })
}

export async function sendWeeklyDigestEmail({
  to,
  name,
  completedThisWeek,
  streak,
  nextMilestone,
}: {
  to: string
  name: string
  completedThisWeek: number
  streak: number
  nextMilestone: number
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'TUTOR — Votre bilan de la semaine',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0c1222; color: #e8eaf0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #e8a83e; font-size: 28px;">Bilan de la semaine, ${h(name)} !</h1>
        <p style="color: #9fa7bc; line-height: 1.6;">
          Voici un récapitulatif de vos progrès sur les 7 derniers jours.
        </p>

        <div style="background: #131d33; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <div style="margin-bottom: 16px;">
            <span style="color: #9fa7bc; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Cours complétés cette semaine</span>
            <p style="color: #e8a83e; font-size: 32px; font-weight: 700; margin: 4px 0;">${completedThisWeek}</p>
          </div>
          <div style="margin-bottom: 16px;">
            <span style="color: #9fa7bc; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Série en cours</span>
            <p style="color: #e8eaf0; font-size: 24px; font-weight: 600; margin: 4px 0;">${streak} jour${streak > 1 ? 's' : ''}</p>
          </div>
          <div>
            <span style="color: #9fa7bc; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Prochain palier</span>
            <p style="color: #e8eaf0; font-size: 20px; font-weight: 600; margin: 4px 0;">${nextMilestone} cours</p>
          </div>
        </div>

        <p style="color: #9fa7bc; line-height: 1.6;">
          ${completedThisWeek > 0
            ? `Excellent travail ! Vous avez accompli ${completedThisWeek} cours cette semaine. Maintenez ce rythme pour atteindre votre prochain palier.`
            : `Cette semaine a été calme — pas de panique ! Reprenez dès aujourd'hui et retrouvez votre élan.`
          }
        </p>

        <a href="${APP_URL}/app/progression"
           style="display: inline-block; background: #e8a83e; color: #0c1222; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 24px;">
          Voir ma progression complète
        </a>
        <p style="color: #9fa7bc; font-size: 12px; margin-top: 32px;">
          Vous recevez cet e-mail car les bilans hebdomadaires sont activés sur votre compte TUTOR.
        </p>
      </div>
    `,
  })
}
