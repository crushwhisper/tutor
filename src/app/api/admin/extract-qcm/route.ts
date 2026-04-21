import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { anthropic } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  // Admin auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // Parse request body
  let body: { pdfBase64: string; moduleId: string; subject: string; replaceExisting: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { pdfBase64, moduleId, subject, replaceExisting } = body

  if (!pdfBase64 || !moduleId || !subject) {
    return NextResponse.json({ error: 'Champs manquants: pdfBase64, moduleId, subject requis' }, { status: 400 })
  }

  // Build Claude prompt
  const userPrompt = `Voici une banque de QCM de ${subject} pour les concours médicaux français (UM6SS, PASS/LAS).

INSTRUCTIONS STRICTES:
1. Extrais TOUTES les questions du document (il peut y en avoir 50 à 200)
2. Pour chaque question, identifie la RÉPONSE CORRECTE:
   - Si la réponse est marquée dans le document (Réponse: X, Bonne réponse: X, etc.) → utilise-la
   - Sinon → utilise tes connaissances médicales pour identifier la bonne réponse
3. correct_answer = INDEX 0-3 (0=première option, 1=deuxième, etc.)
4. Ne garde QUE les questions avec exactement 4 options
5. Nettoie les numéros de page et artefacts PDF dans les textes
6. difficulty: "facile" si notion de base, "moyen" si intermédiaire, "difficile" si spécialisé

Réponds UNIQUEMENT avec un JSON array valide, AUCUN texte avant ou après:
[{"question":"...","options":["A...","B...","C...","D..."],"correct_answer":1,"explanation":"Explication courte de la bonne réponse","difficulty":"moyen"}]`

  // Call Anthropic with PDF beta
  let claudeText: string
  try {
    const response = await (anthropic as any).beta.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8000,
      system: `Tu es un expert en médecine spécialisé dans les concours médicaux français. Tu extrais des QCM depuis des documents PDF de manière précise et exhaustive. Tu identifies toujours la bonne réponse en te basant sur les marqueurs dans le document ou tes connaissances médicales. Tu réponds UNIQUEMENT avec du JSON valide, jamais de texte explicatif.`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
      betas: ['pdfs-2024-09-25'],
    })

    const block = response.content.find((b: any) => b.type === 'text')
    claudeText = block?.text ?? ''
  } catch (err: any) {
    console.error('Anthropic error:', err)
    return NextResponse.json(
      { error: `Erreur Anthropic: ${err?.message ?? 'inconnue'}` },
      { status: 502 }
    )
  }

  // Parse JSON from Claude's response
  let questions: Array<{
    question: string
    options: string[]
    correct_answer: number
    explanation: string
    difficulty: string
  }>

  try {
    // Strip any accidental markdown code fences
    const cleaned = claudeText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    questions = JSON.parse(cleaned)

    if (!Array.isArray(questions)) {
      throw new Error('La réponse n\'est pas un tableau JSON')
    }
  } catch (err: any) {
    console.error('JSON parse error. Raw response:', claudeText.slice(0, 500))
    return NextResponse.json(
      { error: `Impossible de parser la réponse Claude: ${err?.message}` },
      { status: 422 }
    )
  }

  // Filter: keep only questions with exactly 4 options and valid correct_answer
  const valid = questions.filter(
    (q) =>
      q.question &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correct_answer === 'number' &&
      q.correct_answer >= 0 &&
      q.correct_answer <= 3
  )

  if (valid.length === 0) {
    return NextResponse.json(
      { error: 'Aucune question valide extraite (besoin de 4 options + correct_answer 0-3)' },
      { status: 422 }
    )
  }

  // Optionally delete existing questions for this module
  if (replaceExisting) {
    const { error: deleteError } = await supabaseAdmin
      .from('qcm_questions')
      .delete()
      .eq('module_id', moduleId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: `Erreur lors de la suppression des questions existantes: ${deleteError.message}` },
        { status: 500 }
      )
    }
  }

  // Insert extracted questions
  const rows = valid.map((q) => ({
    module_id: moduleId,
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation ?? '',
    difficulty: q.difficulty ?? 'moyen',
    tags: [subject],
    is_active: true,
  }))

  const { error: insertError } = await supabaseAdmin
    .from('qcm_questions')
    .insert(rows)

  if (insertError) {
    console.error('Insert error:', insertError)
    return NextResponse.json(
      { error: `Erreur d'insertion Supabase: ${insertError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    count: valid.length,
    sample: valid.slice(0, 3),
  })
}
