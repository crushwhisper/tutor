import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await request.json()
  if (!courseId) return NextResponse.json({ error: 'Missing courseId' }, { status: 400 })

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: user.id,
      course_id: courseId,
      completed: true,
      last_accessed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,course_id', ignoreDuplicates: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
