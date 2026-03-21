import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Course, UserProgress } from '@/types/database'

const DIFFICULTY_LABELS: Record<string, string> = {
  facile: 'Facile',
  moyen: 'Moyen',
  difficile: 'Difficile',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  facile: 'text-green-400 bg-green-400/10',
  moyen: 'text-yellow-400 bg-yellow-400/10',
  difficile: 'text-red-400 bg-red-400/10',
}

interface Props {
  params: Promise<{ moduleSlug: string }>
  searchParams: Promise<{ difficulty?: string; search?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { moduleSlug } = await params
  return { title: `${moduleSlug} — TUTOR` }
}

export default async function ModuleCoursesPage({ params, searchParams }: Props) {
  const { moduleSlug } = await params
  const { difficulty, search } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch module
  const { data: module } = await supabase
    .from('modules')
    .select('*')
    .eq('slug', moduleSlug)
    .eq('is_active', true)
    .single()

  if (!module) notFound()

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = userProfile?.subscription_plan === 'pro' && userProfile?.subscription_status === 'active'

  // Build course query
  let query = supabase
    .from('courses')
    .select('*')
    .eq('module_id', module.id)
    .eq('is_published', true)
    .order('order_index')

  if (difficulty) query = query.eq('difficulty', difficulty)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data: courses } = await query

  // Fetch user progress for these courses
  const courseIds = ((courses ?? []) as Course[]).map((c) => c.id)
  const { data: progress } = courseIds.length > 0
    ? await supabase
        .from('user_progress')
        .select('course_id, completed, score')
        .eq('user_id', user.id)
        .in('course_id', courseIds)
    : { data: [] as Pick<UserProgress, 'course_id' | 'completed' | 'score'>[] }

  const progressMap = Object.fromEntries(
    ((progress ?? []) as Pick<UserProgress, 'course_id' | 'completed' | 'score'>[]).map((p) => [p.course_id, p])
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/preparation" className="text-muted hover:text-gold transition-colors text-sm">
          ← Modules
        </Link>
        <span className="text-muted">/</span>
        <h1 className="text-xl font-semibold text-white">{module.name}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/app/preparation/${moduleSlug}`}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            !difficulty ? 'border-gold/50 bg-gold/10 text-gold' : 'border-white/10 text-muted hover:border-white/20'
          }`}
        >
          Tous
        </Link>
        {(['facile', 'moyen', 'difficile'] as const).map((d) => (
          <Link
            key={d}
            href={`/app/preparation/${moduleSlug}?difficulty=${d}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              difficulty === d ? 'border-gold/50 bg-gold/10 text-gold' : 'border-white/10 text-muted hover:border-white/20'
            }`}
          >
            {DIFFICULTY_LABELS[d]}
          </Link>
        ))}
      </div>

      {/* Course count */}
      <p className="text-muted text-sm">{(courses ?? []).length} cours</p>

      {/* Course list */}
      <div className="space-y-3">
        {((courses ?? []) as Course[]).map((course) => {
          const prog = progressMap[course.id]
          const isLocked = course.is_premium && !isPro

          return (
            <div
              key={course.id}
              className={`glass-card p-5 ${isLocked ? 'opacity-60' : 'hover:border-gold/30 transition-all'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-medium text-sm">{course.title}</h3>
                    {course.is_premium && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gold/20 text-gold">Pro</span>
                    )}
                    {prog?.completed && (
                      <span className="text-xs text-green-400">✓ Complété</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className={`px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[course.difficulty]}`}>
                      {DIFFICULTY_LABELS[course.difficulty]}
                    </span>
                    <span>{course.duration_minutes} min</span>
                    {prog?.score != null && (
                      <span>Score : {prog.score}%</span>
                    )}
                  </div>
                  {course.summary && (
                    <p className="text-muted text-xs mt-2 line-clamp-1">{course.summary}</p>
                  )}
                </div>

                {isLocked ? (
                  <Link
                    href="/app/settings?tab=subscription"
                    className="btn-secondary text-xs py-1.5 px-4 shrink-0"
                  >
                    🔒 Pro
                  </Link>
                ) : (
                  <Link
                    href={`/app/preparation/${moduleSlug}/${course.slug}`}
                    className="btn-primary text-xs py-1.5 px-4 shrink-0"
                  >
                    {prog?.completed ? 'Revoir' : 'Étudier'}
                  </Link>
                )}
              </div>
            </div>
          )
        })}

        {(courses ?? []).length === 0 && (
          <div className="text-center py-12 text-muted">
            <p className="text-4xl mb-3">📭</p>
            <p>Aucun cours disponible pour ces critères.</p>
          </div>
        )}
      </div>
    </div>
  )
}
