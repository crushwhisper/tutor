import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question, expectedAnswer, keywords, studentAnswer } = await request.json()

  if (!question || !expectedAnswer || !studentAnswer) {
    return NextResponse.json({ error: 'question, expectedAnswer and studentAnswer are required' }, { status: 400 })
  }

  if (studentAnswer.trim().length < 10) {
    return NextResponse.json({ error: 'Student answer is too short' }, { status: 400 })
  }

  const keywordsList = (keywords as string[]).join(', ')

  const prompt = `Tu es un correcteur de concours médical français. Évalue la réponse d'un étudiant.

QUESTION:
${question}

RÉPONSE MODÈLE:
${expectedAnswer}

MOTS-CLÉS ATTENDUS: ${keywordsList}

RÉPONSE DE L'ÉTUDIANT:
${studentAnswer}

Évalue objectivement et donne un score sur 20. Sois précis, juste et pédagogique.
Format JSON strict (aucun texte avant ou après l'objet JSON):
{
  "score": <nombre entre 0 et 20>,
  "feedback": "Commentaire général sur la qualité de la réponse (2-3 phrases)...",
  "goodPoints": ["Point fort 1", "Point fort 2", "..."],
  "missingPoints": ["Point manquant 1", "Point manquant 2", "..."]
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { text: string }).text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid JSON response')

    const parsed = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      score: Math.min(20, Math.max(0, Math.round(parsed.score))),
      feedback: parsed.feedback ?? '',
      goodPoints: parsed.goodPoints ?? [],
      missingPoints: parsed.missingPoints ?? [],
    })
  } catch (error) {
    console.error('Evaluation error:', error)
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 })
  }
}
