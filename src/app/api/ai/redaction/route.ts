import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

const MODULE_NAMES: Record<string, string> = {
  '651843ca-50f3-43c1-847e-e4330bdbae52': 'Anatomie & Biologie',
  '8bb0f613-2aa0-42ae-b4d1-c583b05af512': 'Pathologie Médicale',
  '08246cd4-a56f-46a5-a13f-1afa92b5f77f': 'Pathologie Chirurgicale',
  '3fd64d3f-a9d4-4005-9ecd-a2deb63cb845': 'Urgences Médicales',
  'ca3fd03e-5989-4772-8a86-4efac9a7ffff': 'Urgences Chirurgicales',
}

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { moduleId, topic } = await request.json()

  if (!moduleId) {
    return NextResponse.json({ error: 'moduleId is required' }, { status: 400 })
  }

  const moduleName = MODULE_NAMES[moduleId] ?? 'Médecine'
  const topicClause = topic ? ` sur le thème "${topic}"` : ''

  const prompt = `Tu es un examinateur de concours médical français. Génère une question rédactionnelle de ${moduleName}${topicClause} (cas clinique ou question de cours ouverte).
La question doit être réaliste, précise et calibrée pour un concours de médecine.
Format JSON strict (aucun texte avant ou après l'objet JSON):
{
  "question": "La question complète avec tout le contexte nécessaire...",
  "expectedAnswer": "La réponse modèle détaillée que l'examinateur attend...",
  "keywords": ["mot-clé1", "mot-clé2", "..."],
  "points": 20
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { text: string }).text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid JSON response')

    const parsed = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      question: parsed.question,
      expectedAnswer: parsed.expectedAnswer,
      keywords: parsed.keywords ?? [],
      points: parsed.points ?? 20,
    })
  } catch (error) {
    console.error('Redaction generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
