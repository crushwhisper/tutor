import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Dna, Heartbeat, Scissors, Siren, Lightning, ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import type { Course, UserProgress } from '@/types/database'
import { checkIsPro } from '@/lib/isPro'
import { supabaseAdmin } from '@/lib/supabase/admin'
import CourseRow from '@/components/app/CourseRow'

const MODULE_META: Record<string, { Icon: React.ElementType; color: string }> = {
  'anatomie-biologie': { Icon: Dna, color: '#4A90D9' },
  'medecine': { Icon: Heartbeat, color: '#E8A83E' },
  'chirurgie': { Icon: Scissors, color: '#E85555' },
  'urgences-medicales': { Icon: Siren, color: '#9B59B6' },
  'urgences-chirurgicales': { Icon: Lightning, color: '#E67E22' },
}

interface Props {
  params: Promise<{ moduleSlug: string }>
  searchParams: Promise<{ difficulty?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { moduleSlug } = await params
  return { title: `${moduleSlug} — TUTOR` }
}

export default async function ModuleCoursesPage({ params, searchParams }: Props) {
  const { moduleSlug } = await params
  const { difficulty } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Use admin client to bypass RLS
  const [{ data: module }, { data: userProfile }] = await Promise.all([
    supabaseAdmin.from('modules').select('*').eq('slug', moduleSlug).eq('is_active', true).single(),
    supabaseAdmin.from('users').select('role,subscription_plan,subscription_status').eq('id', user.id).single(),
  ])

  if (!module) notFound()

  const isPro = checkIsPro(userProfile)

  let query = supabaseAdmin
    .from('courses')
    .select('*')
    .eq('module_id', module.id)
    .eq('is_published', true)
    .order('order_index')

  if (difficulty) query = query.eq('difficulty', difficulty)

  const { data: courses } = await query
  const list = (courses ?? []) as Course[]

  // Filter out subsection headers mistakenly extracted as courses
  const validCourses = list.filter((c) => {
    const t = c.title.trim()
    if (t.length <= 5) return false
    if (t.startsWith('CONTENU')) return false
    // Section numbers like "1 – Plan superficiel" or "3 – Lymphatiques"
    if (/^\d+\s*[–\-.]\s/.test(t)) return false
    // Lettered subsections: "A – ", "B- ", "I. ", "II."
    if (/^[A-Z]{1,3}[\s–\-\.]\s/.test(t)) return false
    // Titles ending with " :" are section headers ("RAPPORTS :", "VASCULARISATION :")
    if (t.endsWith(' :') || t.endsWith(':')) return false
    // Bare anatomical subsection headers without colon ("Rapports", "Vascularisation", "Innervation")
    if (/^(rapports|vascularisation|innervation|lymphatiques?|situation|configuration|g[ée]n[ée]ralit[ée]s?)$/i.test(t)) return false
    // Roman numerals subsections "I.", "II.", "III."
    if (/^[IVX]+\.\s/.test(t)) return false
    // Very short content = subsection without real body
    if ((c.content?.length ?? 0) < 300) return false
    return true
  })

  const courseIds = validCourses.map((c) => c.id)
  const { data: progress } = courseIds.length > 0
    ? await supabaseAdmin
        .from('user_progress')
        .select('course_id, completed, score')
        .eq('user_id', user.id)
        .in('course_id', courseIds)
    : { data: [] as Pick<UserProgress, 'course_id' | 'completed' | 'score'>[] }

  const progressMap = Object.fromEntries(
    ((progress ?? []) as Pick<UserProgress, 'course_id' | 'completed' | 'score'>[])
      .map((p) => [p.course_id, p])
  )

  const meta = MODULE_META[moduleSlug]
  const ModuleIcon = meta?.Icon
  const accentColor = meta?.color ?? 'var(--accent)'
  const completedCount = validCourses.filter((c) => progressMap[c.id]?.completed).length

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <Link
          href="/app/preparation"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--app-text-muted)', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} />
          Préparation Libre
        </Link>
        <span style={{ color: 'var(--app-border)', fontSize: '13px' }}>/</span>
        <span style={{ fontSize: '13px', color: 'var(--app-text)', fontWeight: 500 }}>{module.name}</span>
      </div>

      {/* Module header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {ModuleIcon && (
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: accentColor + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ModuleIcon size={22} weight="duotone" style={{ color: accentColor }} />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.3px', marginBottom: '2px' }}>{module.name}</h1>
            <p style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>{completedCount}/{validCourses.length} cours complétés</p>
          </div>
        </div>

        {validCourses.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ width: '120px', height: '4px', background: 'var(--app-border)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((completedCount / validCourses.length) * 100)}%`, background: accentColor, borderRadius: '999px' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--app-text-ghost)', marginTop: '4px', display: 'block' }}>
              {Math.round((completedCount / validCourses.length) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Difficulty filters */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { value: undefined, label: 'Tous' },
          { value: 'facile', label: 'Facile' },
          { value: 'moyen', label: 'Moyen' },
          { value: 'difficile', label: 'Difficile' },
        ].map(({ value, label }) => {
          const active = difficulty === value || (!difficulty && !value)
          return (
            <Link
              key={label}
              href={value ? `/app/preparation/${moduleSlug}?difficulty=${value}` : `/app/preparation/${moduleSlug}`}
              style={{
                fontSize: '12px', fontWeight: 500, padding: '5px 14px', borderRadius: '999px', textDecoration: 'none',
                border: `1px solid ${active ? accentColor + '60' : 'var(--app-border)'}`,
                background: active ? accentColor + '12' : 'transparent',
                color: active ? accentColor : 'var(--app-text-muted)',
              }}
            >
              {label}
            </Link>
          )
        })}
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--app-text-ghost)', display: 'flex', alignItems: 'center' }}>
          {validCourses.length} cours
        </span>
      </div>

      {/* Course list */}
      {validCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 40px', color: 'var(--app-text-muted)', fontSize: '14px' }}>
          Aucun cours disponible pour ces critères.
        </div>
      ) : (
        <div style={{ border: '1px solid var(--app-border)', borderRadius: '14px', overflow: 'hidden', background: 'var(--app-surface)' }}>
          {validCourses.map((course, index) => {
            const prog = progressMap[course.id]
            return (
              <CourseRow
                key={course.id}
                course={course}
                index={index}
                total={validCourses.length}
                isLocked={course.is_premium && !isPro}
                isCompleted={prog?.completed === true}
                score={prog?.score ?? null}
                moduleSlug={moduleSlug}
                accentColor={accentColor}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
