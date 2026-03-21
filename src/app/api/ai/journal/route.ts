import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const MOOD_LABELS: Record<number, string> = {
  1: 'épuisé',
  2: 'difficile',
  3: 'neutre',
  4: 'bien',
  5: 'excellent',
}

export async function POST(req: Request) {
  const { content, mood } = await req.json()

  if (!content?.trim()) {
    return NextResponse.json({ feedback: '' }, { status: 400 })
  }

  const moodLabel = mood ? MOOD_LABELS[mood] ?? 'neutre' : 'neutre'

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: `Tu es TUTOR, un micro-coach pour des étudiants en médecine préparant un concours.
Tu réponds au journal quotidien de l'étudiant. Ton ton est direct, chaleureux, concis.
Jamais condescendant, jamais vague. Maximum 3-4 phrases courtes.
Pas de formules de politesse ni de bonjour/bonsoir.
Commence directement par quelque chose de concret et utile.`,
    messages: [
      {
        role: 'user',
        content: `État du jour : ${moodLabel}. Journal : ${content.trim()}`,
      },
    ],
  })

  const feedback = message.content[0].type === 'text' ? message.content[0].text : ''

  return NextResponse.json({ feedback })
}
