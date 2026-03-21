import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import DayCompletionForm from '@/components/app/DayCompletionForm'
import type { Program, ProgramDay, DayCompletion } from '@/types'

interface Props {
  params: Promise<{ programType: string; dayNumber: string }>
}

interface CourseWithModule {
  id: string
  title: string
  slug: string
  modules: { slug: string } | null
}

export default async function ProgramDayPage({ params }: Props) {
  const { programType, dayNumber } = await params
  const dayNum = parseInt(dayNumber, 10)
  if (isNaN(dayNum)) notFound()

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
    .single()

  if (!program) notFound()

  const typedProgram = program as Program

  // Fetch program day
  const { data: programDay } = await supabase
    .from('program_days')
    .select('*')
    .eq('program_id', typedProgram.id)
    .eq('day_number', dayNum)
    .single()

  const typedProgramDay = programDay as ProgramDay | null

  // Fetch existing completion
  const { data: completion } = await supabase
    .from('day_completions')
    .select('*')
    .eq('user_id', user.id)
    .eq('program_id', typedProgram.id)
    .eq('day_number', dayNum)
    .single()

  const typedCompletion = completion as DayCompletion | null

  // Fetch courses for this day if any
  const courseIds: string[] = typedProgramDay?.course_ids ?? []
  const { data: courses } = courseIds.length > 0
    ? await supabase
        .from('courses')
        .select('id, title, slug, modules(slug)')
        .in('id', courseIds)
    : { data: [] as CourseWithModule[] }

  const typedCourses = (courses ?? []) as CourseWithModule[]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted flex-wrap">
        <Link href="/app/programmes" className="hover:text-gold">
          Programmes
        </Link>
        <span>/</span>
        <Link href={`/app/programmes/${programType}`} className="hover:text-gold">
          {typedProgram.title}
        </Link>
        <span>/</span>
        <span className="text-white">Jour {dayNum}</span>
      </div>

      {/* Day header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="section-tag">Jour {dayNum}</span>
          {typedCompletion?.completed && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              Complété
            </span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-white mb-1">
          {typedProgramDay?.title ?? `Jour ${dayNum}`}
        </h1>
        {typedProgramDay?.description && (
          <p className="text-muted text-sm">{typedProgramDay.description}</p>
        )}
        <div className="flex gap-4 mt-4 text-sm text-muted">
          <span>{typedProgramDay?.estimated_hours ?? 3}h estimées</span>
          <span>{typedProgramDay?.qcm_count ?? 10} QCM</span>
        </div>
      </div>

      {/* Objectives */}
      {typedProgramDay?.objectives && typedProgramDay.objectives.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4">Objectifs du jour</h2>
          <ul className="space-y-2">
            {typedProgramDay.objectives.map((obj: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted">
                <span className="text-gold mt-0.5 shrink-0">→</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Courses */}
      {typedCourses.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4">Cours du jour</h2>
          <ul className="space-y-3">
            {typedCourses.map((course) => (
              <li key={course.id}>
                <Link
                  href={`/app/preparation/${course.modules?.slug ?? ''}/${course.slug}`}
                  className="flex items-center gap-3 text-sm text-muted hover:text-white transition-colors group"
                >
                  <span className="text-gold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                  {course.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        {dayNum > 1 && (
          <Link
            href={`/app/programmes/${programType}/${dayNum - 1}`}
            className="btn-ghost"
          >
            ← Jour précédent
          </Link>
        )}
        {dayNum < typedProgram.total_days && (
          <Link
            href={`/app/programmes/${programType}/${dayNum + 1}`}
            className="btn-ghost ml-auto"
          >
            Jour suivant →
          </Link>
        )}
      </div>

      {/* Completion form */}
      <DayCompletionForm
        programId={typedProgram.id}
        dayNumber={dayNum}
        programType={programType}
        existingCompletion={typedCompletion}
      />
    </div>
  )
}
