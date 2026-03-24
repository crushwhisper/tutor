import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { Program, DayCompletion } from '@/types'
import ProgramDayGrid from '@/components/app/ProgramDayGrid'

interface Props {
  params: Promise<{ programType: string }>
}

export default async function ProgramDayGridPage({ params }: Props) {
  const { programType } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('type', programType)
    .eq('is_active', true)
    .single()

  if (!program) notFound()

  const typedProgram = program as Program

  const { data: completions } = await supabase
    .from('day_completions')
    .select('day_number, completed, score')
    .eq('user_id', user.id)
    .eq('program_id', typedProgram.id)

  const typedCompletions = (completions ?? []) as Pick<DayCompletion, 'day_number' | 'completed' | 'score'>[]
  const completionMap = Object.fromEntries(typedCompletions.map((c) => [c.day_number, c]))
  const completedDays = typedCompletions.filter((c) => c.completed).length

  return (
    <ProgramDayGrid
      program={typedProgram}
      completionMap={completionMap}
      completedDays={completedDays}
      programType={programType}
    />
  )
}
