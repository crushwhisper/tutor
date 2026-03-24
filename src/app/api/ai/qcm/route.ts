import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { anthropic, PROMPTS } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, content } = await request.json()

  // 1. Try to fetch pre-existing QCM questions from the bank
  if (courseId) {
    // First try course-specific questions
    const { data: courseQuestions } = await supabaseAdmin
      .from('qcm_questions')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .limit(20)

    if (courseQuestions && courseQuestions.length > 0) {
      // Shuffle and return up to 10
      const shuffled = courseQuestions.sort(() => Math.random() - 0.5).slice(0, 10)
      return NextResponse.json({ questions: shuffled, source: 'bank' })
    }

    // Try module-level questions (get the course's module_id first)
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('module_id')
      .eq('id', courseId)
      .single()

    if (course?.module_id) {
      const { data: moduleQuestions } = await supabaseAdmin
        .from('qcm_questions')
        .select('*')
        .eq('module_id', course.module_id)
        .is('course_id', null)
        .eq('is_active', true)
        .limit(20)

      if (moduleQuestions && moduleQuestions.length > 0) {
        const shuffled = moduleQuestions.sort(() => Math.random() - 0.5).slice(0, 10)
        return NextResponse.json({ questions: shuffled, source: 'bank' })
      }
    }
  }

  // 2. Fall back to AI generation
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

    const questions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ questions, source: 'ai' })
  } catch (error) {
    console.error('QCM generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
