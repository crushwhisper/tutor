import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { anthropic } from '@/lib/anthropic'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
  const { token, pdfBase64, moduleId, subject, replaceExisting } = await req.json()

  if (token !== 'tutor-qcm-batch-secret-9f2k') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!pdfBase64 || pdfBase64 === 'test') {
    return NextResponse.json({ ok: true, msg: 'auth ok, no pdf' })
  }

  const response = await (anthropic as any).beta.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 8000,
    betas: ['pdfs-2024-09-25'],
    system: `Tu es un expert en médecine spécialisé dans les concours médicaux français (UM6SS, PASS/LAS). Tu extrais des QCM depuis des PDF. Tu réponds UNIQUEMENT avec du JSON valide, jamais de texte explicatif.`,
    messages: [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
        { type: 'text', text: `Extrais TOUTES les questions QCM de ce document de ${subject}.
Instructions:
1. Extrais chaque question avec ses 4 options (A, B, C, D)
2. correct_answer = index 0-3 de la bonne réponse (identifiée dans le doc ou par tes connaissances)
3. Ne garde QUE les questions avec exactement 4 options
4. Nettoie les artefacts PDF
5. difficulty: "facile"/"moyen"/"difficile"

Réponds UNIQUEMENT avec un JSON array:
[{"question":"...","options":["A...","B...","C...","D..."],"correct_answer":1,"explanation":"...","difficulty":"moyen"}]` }
      ]
    }],
  })

  const block = response.content.find((b: any) => b.type === 'text')
  const raw = block?.text ?? ''
  const cleaned = raw.trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim()

  let questions: any[]
  try { questions = JSON.parse(cleaned) } catch {
    return NextResponse.json({ error: 'JSON parse failed', raw: raw.slice(0,300) }, { status: 422 })
  }

  const valid = questions.filter(q =>
    q.question && Array.isArray(q.options) && q.options.length === 4 &&
    typeof q.correct_answer === 'number' && q.correct_answer >= 0 && q.correct_answer <= 3
  )

  if (replaceExisting) {
    await supabaseAdmin.from('qcm_questions').delete().eq('module_id', moduleId)
  }

  const rows = valid.map(q => ({
    module_id: moduleId, question: q.question, options: q.options,
    correct_answer: q.correct_answer, explanation: q.explanation ?? '',
    difficulty: q.difficulty ?? 'moyen', tags: [subject], is_active: true,
  }))

  const { error } = await supabaseAdmin.from('qcm_questions').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, count: valid.length, total: questions.length })
  } catch (err: any) {
    console.error('batch-extract crash:', err)
    return NextResponse.json({ error: err?.message ?? 'unknown crash', stack: err?.stack?.slice(0,300) }, { status: 500 })
  }
}
