import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

// Module ID → display name mapping
const MODULE_META: Record<string, { name: string; slug: string }> = {
  '651843ca-50f3-43c1-847e-e4330bdbae52': { name: 'Anatomie & Biologie', slug: 'anatomie-biologie' },
  '8bb0f613-2aa0-42ae-b4d1-c583b05af512': { name: 'Pathologie Médicale', slug: 'pathologie-medicale' },
  '08246cd4-a56f-46a5-a13f-1afa92b5f77f': { name: 'Pathologie Chirurgicale', slug: 'pathologie-chirurgicale' },
  '3fd64d3f-a9d4-4005-9ecd-a2deb63cb845': { name: 'Urgences Médicales', slug: 'urgences-medicales' },
  'ca3fd03e-5989-4772-8a86-4efac9a7ffff': { name: 'Urgences Chirurgicales', slug: 'urgences-chirurgicales' },
}

async function generateAIQuestions(moduleId: string, count: number) {
  const moduleName = MODULE_META[moduleId]?.name ?? 'Médecine'
  const prompt = `Tu es un expert en préparation aux concours médicaux français. Génère ${count} QCM originaux sur le module "${moduleName}".
Format JSON strict (tableau uniquement, aucun texte avant ou après):
[{
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct_answer": 0,
  "explanation": "..."
}]
correct_answer est l'index (0-3) de la bonne réponse. Sois précis et cliniquement pertinent.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = (message.content[0] as { text: string }).text
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Invalid AI JSON response')

  const parsed = JSON.parse(jsonMatch[0])
  // Attach module metadata to each AI-generated question
  return parsed.map((q: Record<string, unknown>, idx: number) => ({
    ...q,
    id: `ai-${moduleId}-${Date.now()}-${idx}`,
    module_id: moduleId,
    moduleSlug: MODULE_META[moduleId]?.slug ?? 'unknown',
    moduleName: MODULE_META[moduleId]?.name ?? moduleName,
    is_active: true,
    course_id: null,
    difficulty: 'moyen',
    tags: [],
    created_at: new Date().toISOString(),
    source: 'ai_generated' as const,
  }))
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function shuffleOptions(question: Record<string, unknown>) {
  const options = question.options as string[]
  const correctAnswer = question.correct_answer as number
  const correctText = options[correctAnswer]

  const indexed = options.map((opt, i) => ({ opt, original: i }))
  const shuffled = shuffleArray(indexed)
  const newCorrectIndex = shuffled.findIndex((item) => item.original === correctAnswer)

  return {
    ...question,
    options: shuffled.map((item) => item.opt),
    correct_answer: newCorrectIndex,
    _correctText: correctText, // debug aid, won't hurt client
  }
}

export async function GET(request: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const moduleIdsParam = searchParams.get('moduleIds') ?? ''
  const count = Math.min(parseInt(searchParams.get('count') ?? '20', 10), 60)

  const moduleIds = moduleIdsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (moduleIds.length === 0) {
    return NextResponse.json({ error: 'No moduleIds provided' }, { status: 400 })
  }

  const perModule = Math.ceil(count / moduleIds.length)
  const allBanked: Record<string, unknown>[] = []

  // Fetch from DB bank
  for (const moduleId of moduleIds) {
    const { data: qs } = await supabaseAdmin
      .from('qcm_questions')
      .select('*')
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .limit(perModule * 3) // fetch extra to allow shuffling

    if (qs && qs.length > 0) {
      const withSlug = qs.map((q) => ({
        ...q,
        moduleSlug: MODULE_META[moduleId]?.slug ?? 'unknown',
        moduleName: MODULE_META[moduleId]?.name ?? moduleId,
        source: 'bank' as const,
      }))
      allBanked.push(...withSlug)
    }
  }

  // Shuffle and pick banked questions
  const shuffledBank = shuffleArray(allBanked).slice(0, count)
  const needed = count - shuffledBank.length

  let source: 'bank' | 'mixed' | 'ai' = 'bank'
  let aiQuestions: Record<string, unknown>[] = []

  if (needed > 0) {
    source = shuffledBank.length === 0 ? 'ai' : 'mixed'
    // Distribute AI generation across modules that are missing questions
    const moduleNeedMap: Record<string, number> = {}
    const bankedByModule: Record<string, number> = {}

    for (const q of shuffledBank) {
      const mid = q.module_id as string
      bankedByModule[mid] = (bankedByModule[mid] ?? 0) + 1
    }

    for (const moduleId of moduleIds) {
      const have = bankedByModule[moduleId] ?? 0
      const want = perModule
      if (have < want) {
        moduleNeedMap[moduleId] = want - have
      }
    }

    // If no specific gaps, just distribute across all selected modules
    if (Object.keys(moduleNeedMap).length === 0) {
      const perMod = Math.ceil(needed / moduleIds.length)
      for (const mid of moduleIds) {
        moduleNeedMap[mid] = perMod
      }
    }

    const aiPromises = Object.entries(moduleNeedMap).map(([mid, n]) =>
      generateAIQuestions(mid, n).catch(() => [] as Record<string, unknown>[])
    )
    const aiResults = await Promise.all(aiPromises)
    aiQuestions = aiResults.flat()
  }

  const combined = shuffleArray([...shuffledBank, ...aiQuestions]).slice(0, count)

  // Shuffle options within each question
  const finalQuestions = combined.map(shuffleOptions)

  return NextResponse.json({ questions: finalQuestions, source })
}
