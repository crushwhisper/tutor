import { createClient } from '@/lib/supabase/server'
import { anthropic, PROMPTS } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await request.json()
  if (!content) return NextResponse.json({ error: 'No content' }, { status: 400 })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{ role: 'user', content: PROMPTS.FLASHCARDS(content) }],
    })

    const text = (message.content[0] as { text: string }).text
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Invalid JSON response')

    const flashcards = JSON.parse(jsonMatch[0])
    return NextResponse.json({ flashcards })
  } catch (error) {
    console.error('Flashcards generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
