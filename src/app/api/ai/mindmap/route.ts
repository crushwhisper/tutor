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
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: PROMPTS.MINDMAP(content) }],
    })

    const markdown = (message.content[0] as { text: string }).text
    return NextResponse.json({ markdown })
  } catch (error) {
    console.error('Mindmap generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
