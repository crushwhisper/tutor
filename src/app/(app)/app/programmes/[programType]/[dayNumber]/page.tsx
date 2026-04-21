import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import type { Program, ProgramDay, DayCompletion } from '@/types'
import ProgramDayPageClient from '@/components/app/ProgramDayPage'

interface Props {
  params: Promise<{ programType: string; dayNumber: string }>
}

interface CourseWithModule {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string | null
  duration_minutes: number | null
  modules: { slug: string; name: string } | null
}

export default async function ProgramDayPage({ params }: Props) {
  const { programType, dayNumber } = await params
  const dayNum = parseInt(dayNumber, 10)
  if (isNaN(dayNum)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('type', programType)
    .single()

  if (!program) notFound()
  const typedProgram = program as Program

  const { data: programDay } = await supabase
    .from('program_days')
    .select('*')
    .eq('program_id', typedProgram.id)
    .eq('day_number', dayNum)
    .single()

  const { data: completion } = await supabase
    .from('day_completions')
    .select('*')
    .eq('user_id', user.id)
    .eq('program_id', typedProgram.id)
    .eq('day_number', dayNum)
    .single()

  const courseIds: string[] = (programDay as ProgramDay | null)?.course_ids ?? []
  const { data: courses } = courseIds.length > 0
    ? await supabaseAdmin.from('courses').select('id, title, slug, summary, content, duration_minutes, modules(slug, name)').in('id', courseIds)
    : { data: [] as CourseWithModule[] }

  return (
    <ProgramDayPageClient
      program={typedProgram}
      programDay={programDay as ProgramDay | null}
      completion={completion as DayCompletion | null}
      courses={(courses ?? []) as CourseWithModule[]}
      dayNum={dayNum}
      programType={programType}
    />
  )
}
