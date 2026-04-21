import { createClient } from '@/lib/supabase/server'
import { anthropic, PROMPTS } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question, context } = await request.json()
  if (!question) return NextResponse.json({ error: 'No question' }, { status: 400 })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: PROMPTS.DIRECT_QUESTION(question, context) }],
    })

    const answer = (message.content[0] as { text: string }).text
    return NextResponse.json({ answer })
  } catch (error) {
    console.error('Question error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
