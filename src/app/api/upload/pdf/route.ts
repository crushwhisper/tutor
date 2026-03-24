import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import pdfParse from 'pdf-parse'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const moduleSlug = formData.get('module') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

    // Parse PDF
    const buffer = Buffer.from(await file.arrayBuffer())
    let rawText: string
    try {
      const parsed = await pdfParse(buffer)
      rawText = parsed.text
    } catch {
      return NextResponse.json({ error: 'Impossible de lire le PDF' }, { status: 422 })
    }

    if (!rawText || rawText.trim().length < 100) {
      return NextResponse.json({ error: 'Le PDF ne contient pas assez de texte lisible' }, { status: 422 })
    }

    // Use Claude to structure the content
    const contentSample = rawText.slice(0, 8000)
    const aiResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Voici du texte extrait d'un PDF de cours médical. Génère un résumé structuré en JSON avec:
- title: titre du cours (string, max 80 chars)
- summary: résumé en 2-3 phrases (string, max 300 chars)
- difficulty: "facile" | "moyen" | "difficile"
- duration_minutes: estimation du temps de lecture en minutes (number)

Réponds UNIQUEMENT avec le JSON valide, rien d'autre.

Texte:
${contentSample}`,
      }],
    })

    let metadata = { title: file.name.replace(/\.pdf$/i, ''), summary: '', difficulty: 'moyen', duration_minutes: 30 }
    try {
      const aiText = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : '{}'
      const cleaned = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned)
      metadata = { ...metadata, ...parsed }
    } catch { /* keep defaults */ }

    // Get module_id
    let moduleId: string | null = null
    if (moduleSlug) {
      const { data: mod } = await supabase.from('modules').select('id').eq('slug', moduleSlug).single()
      moduleId = mod?.id ?? null
    }

    // Slugify title
    const slug = `user-${user.id.slice(0, 8)}-${Date.now()}`

    // Save to user_uploads
    const { data: upload } = await supabase.from('user_uploads').insert({
      user_id: user.id,
      file_name: file.name,
      file_url: '',  // no storage needed
      file_type: 'pdf',
      file_size: file.size,
      processed: true,
      extracted_text: rawText.slice(0, 50000),
    }).select().single()

    // Save as a course in user_generated_content
    const { data: genContent } = await supabase.from('user_generated_content').insert({
      user_id: user.id,
      upload_id: upload?.id ?? null,
      content_type: 'summary',
      content: {
        title: metadata.title,
        summary: metadata.summary,
        difficulty: metadata.difficulty,
        duration_minutes: metadata.duration_minutes,
        slug,
        module_slug: moduleSlug,
        module_id: moduleId,
        text: rawText.slice(0, 50000),
        file_name: file.name,
        created_at: new Date().toISOString(),
      },
    }).select().single()

    return NextResponse.json({
      success: true,
      content_id: genContent?.id,
      title: metadata.title,
      summary: metadata.summary,
    })
  } catch (err) {
    console.error('PDF upload error:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabase
      .from('user_generated_content')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PDF delete error:', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
