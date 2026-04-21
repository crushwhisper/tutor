import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { anthropic, PROMPTS } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, content } = await request.json()

  // 1. Try course-specific bank questions only (not module-wide fallback)
  if (courseId) {
    const { data: courseQuestions } = await supabaseAdmin
      .from('qcm_questions')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .limit(20)

    if (courseQuestions && courseQuestions.length > 0) {
      const shuffled = courseQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map((q) => ({ ...q, source: 'bank' as const }))
      return NextResponse.json({ questions: shuffled, source: 'bank' })
    }
  }

  // 2. Always generate course-specific QCMs via AI from the actual course content
  if (!content) return NextResponse.json({ error: 'No content' }, { status: 400 })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{ role: 'user', content: PROMPTS.QCM(content) }],
    })

    const text = (message.content[0] as { text: string }).text
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Invalid JSON response')

    const rawQuestions = JSON.parse(jsonMatch[0])
    const questions = rawQuestions.map((q: Record<string, unknown>, idx: number) => ({
      ...q,
      id: q.id ?? `ai-course-${courseId ?? 'unknown'}-${Date.now()}-${idx}`,
      source: 'ai_generated' as const,
    }))
    return NextResponse.json({ questions, source: 'ai_generated' })
  } catch (error) {
    console.error('QCM generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
