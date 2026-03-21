// Note: requires `twilio` package — already present in package.json (v5.13.0)
import twilio from 'twilio'

// Lazy client — only instantiated when actually called so that missing env vars
// do not crash the notifications route at module load time (Twilio is optional;
// email reminders must not fail because Twilio is unconfigured).
function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set')
  }
  return twilio(sid, token)
}

function getFrom(): string {
  const from = process.env.TWILIO_WHATSAPP_FROM
  if (!from) throw new Error('TWILIO_WHATSAPP_FROM must be set')
  return from
}

export async function sendWhatsAppReminder({
  to,
  name,
  dayNumber,
}: {
  to: string
  name: string
  dayNumber: number
}) {
  return getClient().messages.create({
    from: getFrom(),
    to: `whatsapp:${to}`,
    body: `Bonjour ${name} 👋 N'oubliez pas votre révision du jour ${dayNumber} sur TUTOR ! Continuez votre élan 🎯`,
  })
}
