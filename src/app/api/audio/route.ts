import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST: create a new audio generation job
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, format = 'deep-dive', length = 'default' } = await request.json()
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 })

  const validFormats = ['deep-dive', 'brief', 'critique', 'debate']
  const validLengths = ['short', 'default', 'long']
  if (!validFormats.includes(format) || !validLengths.includes(length)) {
    return NextResponse.json({ error: 'Invalid format or length' }, { status: 400 })
  }

  // Check if a completed or pending job already exists for this course+format+length
  const { data: existing } = await supabase
    .from('audio_generations')
    .select('id, status, audio_url, created_at')
    .eq('course_id', courseId)
    .eq('format', format)
    .eq('length', length)
    .in('status', ['done', 'pending', 'processing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    return NextResponse.json({ job: existing })
  }

  // Create new job
  const { data: job, error } = await supabase
    .from('audio_generations')
    .insert({
      course_id: courseId,
      user_id: user.id,
      format,
      length,
      status: 'pending',
    })
    .select('id, status, audio_url, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ job })
}

// GET: check job status by id
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const jobId = url.searchParams.get('jobId')
  const courseId = url.searchParams.get('courseId')
  const format = url.searchParams.get('format')
  const length = url.searchParams.get('length')

  if (jobId) {
    const { data: job } = await supabase
      .from('audio_generations')
      .select('id, status, audio_url, error_message, created_at, updated_at')
      .eq('id', jobId)
      .single()
    return NextResponse.json({ job })
  }

  if (courseId) {
    const query = supabase
      .from('audio_generations')
      .select('id, status, audio_url, format, length, created_at, updated_at')
      .eq('course_id', courseId)
      .in('status', ['done', 'pending', 'processing'])
      .order('created_at', { ascending: false })

    if (format) query.eq('format', format)
    if (length) query.eq('length', length)

    const { data: jobs } = await query
    return NextResponse.json({ jobs: jobs ?? [] })
  }

  return NextResponse.json({ error: 'jobId or courseId required' }, { status: 400 })
}
