import { createClient } from '@/lib/supabase/server'
import { generateSpeech } from '@/lib/openai'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Audio is Pro only
  const { data: profile } = await supabase
    .from('users')
    .select('subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscription_plan === 'pro' && profile?.subscription_status === 'active'
  if (!isPro) return NextResponse.json({ error: 'Pro required' }, { status: 403 })

  const { text } = await request.json()
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  try {
    const audioBuffer = await generateSpeech(text.slice(0, 4000))
    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  } catch (error) {
    console.error('Audio generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
