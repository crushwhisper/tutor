import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { checkIsPro } from '@/lib/isPro'
import { anthropic } from '@/lib/anthropic'

export const maxDuration = 60

const FAL_KEY = process.env.FAL_KEY
// fal.ai synchronous endpoint for Chatterbox TTS
// Docs: https://fal.ai/models/fal-ai/chatterbox
const FAL_CHATTERBOX_URL = 'https://fal.run/fal-ai/chatterbox'

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

  if (!FAL_KEY) {
    return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 })
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

    // 2. Chatterbox TTS via fal.ai
    // Input: { text, exaggeration?, cfg_weight?, audio_prompt_url? }
    // Output: { audio: { url, content_type, file_name, file_size } }
    const falRes = await fetch(FAL_CHATTERBOX_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: narration,
        exaggeration: 0.4,  // 0-1: expressivité naturelle (0.4 = tonalité pédagogique calme)
        cfg_weight: 0.5,    // 0-1: fidélité à la prononciation (0.5 = équilibré)
      }),
      signal: AbortSignal.timeout(55000),
    })

    if (!falRes.ok) {
      const err = await falRes.text()
      console.error('fal.ai Chatterbox error:', err)
      return NextResponse.json({ error: 'Génération audio échouée', detail: err }, { status: 500 })
    }

    const falData = await falRes.json() as {
      audio?: { url: string; content_type?: string }
      audio_url?: string | { url: string }
    }

    // Handle different possible response shapes
    let audioUrl: string | null = null
    if (falData.audio?.url) {
      audioUrl = falData.audio.url
    } else if (typeof falData.audio_url === 'string') {
      audioUrl = falData.audio_url
    } else if (typeof falData.audio_url === 'object' && falData.audio_url?.url) {
      audioUrl = falData.audio_url.url
    }

    if (!audioUrl) {
      console.error('Unexpected fal.ai response shape:', JSON.stringify(falData).slice(0, 300))
      return NextResponse.json({ error: 'Format de réponse inattendu' }, { status: 500 })
    }

    // 3. Fetch the audio file and stream it back
    const audioRes = await fetch(audioUrl)
    if (!audioRes.ok) {
      return NextResponse.json({ error: 'Impossible de récupérer le fichier audio' }, { status: 500 })
    }

    const audioBuffer = await audioRes.arrayBuffer()
    const contentType = falData.audio?.content_type ?? 'audio/wav'

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: { 'Content-Type': contentType },
    })
  } catch (error) {
    console.error('Audio generation error:', error)
    return NextResponse.json({ error: 'Génération échouée' }, { status: 500 })
  }
}
