import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Program, DayCompletion } from '@/types'

interface Props {
  params: Promise<{ programType: string }>
}

export default async function ProgramDayGridPage({ params }: Props) {
  const { programType } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check pro
  const { data: userProfile } = await supabase
    .from('users')
    .select('subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro =
    userProfile?.subscription_plan === 'pro' &&
    userProfile?.subscription_status === 'active'
  if (!isPro) redirect('/app/programmes')

  // Fetch program
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('type', programType)
    .eq('is_active', true)
    .single()

  if (!program) notFound()

  const typedProgram = program as Program

  // Fetch all day completions for user
  const { data: completions } = await supabase
    .from('day_completions')
    .select('day_number, completed, score')
    .eq('user_id', user.id)
    .eq('program_id', typedProgram.id)

  const typedCompletions = (completions ?? []) as Pick<
    DayCompletion,
    'day_number' | 'completed' | 'score'
  >[]

  const completionMap = Object.fromEntries(
    typedCompletions.map((c) => [c.day_number, c])
  )

  const completedDays = typedCompletions.filter((c) => c.completed).length
  const progressPct = Math.round((completedDays / typedProgram.total_days) * 100)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/app/programmes" className="text-muted hover:text-gold text-sm">
          ← Programmes
        </Link>
        <span className="text-muted">/</span>
        <h1 className="text-xl font-semibold text-white">{typedProgram.title}</h1>
      </div>

      {/* Progress bar */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white font-medium">Progression globale</span>
          <span className="text-gold font-bold">{progressPct}%</span>
        </div>
        <div className="w-full bg-navy-800 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-gold to-gold-300 h-3 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-muted text-sm mt-2">
          {completedDays} / {typedProgram.total_days} jours complétés
        </p>
      </div>

      {/* Day grid */}
      <div>
        <p className="text-muted text-sm mb-4">
          {typedProgram.total_days} jours de préparation
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {Array.from({ length: typedProgram.total_days }, (_, i) => {
            const day = i + 1
            const comp = completionMap[day]
            const isCompleted = comp?.completed
            const isToday = day === completedDays + 1

            return (
              <Link
                key={day}
                href={`/app/programmes/${programType}/${day}`}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all border ${
                  isCompleted
                    ? 'bg-gold/20 border-gold/40 text-gold'
                    : isToday
                    ? 'bg-gold text-navy-900 border-gold animate-pulse-gold'
                    : 'bg-navy-800 border-white/10 text-muted hover:border-white/20 hover:text-white'
                }`}
              >
                {day}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
