import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { checkIsPro } from '@/lib/isPro'
import { anthropic } from '@/lib/anthropic'

export const maxDuration = 60

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb' // George — multilingual, excellent en français
const MODEL_ID = 'eleven_multilingual_v2'

const NARRATION_PROMPTS: Record<string, (title: string, content: string) => string> = {
  short: (title, content) => `Tu es un professeur de médecine passionné. Crée une narration audio COURTE (environ 400 mots) du cours "${title}" destinée à des étudiants en médecine préparant leur concours.

Style : conversationnel, pédagogique, mémorable. Pas de puces ni de titres — uniquement du texte fluide comme si tu parlais à voix haute. Commence directement par le contenu, sans introduction du type "Bonjour".

Cours :
${content.slice(0, 3000)}

Narration (400 mots max) :`,

  default: (title, content) => `Tu es un professeur de médecine passionné. Crée une narration audio COMPLÈTE (environ 800 mots) du cours "${title}" destinée à des étudiants en médecine préparant leur concours.

Style : conversationnel, structuré, avec des transitions naturelles. Explique les mécanismes, insiste sur les points importants à retenir pour le concours. Pas de puces ni de titres — uniquement du texte fluide parlé. Commence directement.

Cours :
${content.slice(0, 5000)}

Narration (800 mots) :`,

  long: (title, content) => `Tu es un professeur de médecine passionné. Crée une narration audio APPROFONDIE (environ 1400 mots) du cours "${title}" destinée à des étudiants en médecine préparant leur concours.

Style : conversationnel, exhaustif, avec exemples cliniques et mnémotechniques. Couvre tous les aspects : physiopathologie, diagnostic, traitement, complications. Pas de puces — uniquement du texte fluide parlé. Commence directement.

Cours :
${content.slice(0, 8000)}

Narration (1400 mots) :`,
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role, subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = checkIsPro(profile)
  if (!isPro) return NextResponse.json({ error: 'Pro required' }, { status: 403 })

  const { content, title, length = 'default' } = await request.json()
  if (!content) return NextResponse.json({ error: 'No content' }, { status: 400 })

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 })
  }

  try {
    // 1. Claude génère une narration conversationnelle
    const promptFn = NARRATION_PROMPTS[length] ?? NARRATION_PROMPTS.default
    const claudeRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: length === 'short' ? 600 : length === 'long' ? 2000 : 1200,
      messages: [{ role: 'user', content: promptFn(title ?? 'Cours médical', content) }],
    })
    const narration = (claudeRes.content[0] as { text: string }).text.trim()

    // 2. ElevenLabs TTS
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: narration,
          model_id: MODEL_ID,
          voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.2 },
        }),
      }
    )

    if (!ttsRes.ok) {
      const err = await ttsRes.text()
      console.error('ElevenLabs error:', err)
      return NextResponse.json({ error: 'Génération audio échouée' }, { status: 500 })
    }

    const audioBuffer = await ttsRes.arrayBuffer()
    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  } catch (error) {
    console.error('Audio generation error:', error)
    return NextResponse.json({ error: 'Génération échouée' }, { status: 500 })
  }
}
