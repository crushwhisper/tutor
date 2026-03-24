import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import CourseContent from '@/components/app/CourseContent'
import { checkIsPro } from '@/lib/isPro'

interface Props {
  params: Promise<{ moduleSlug: string; courseSlug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { courseSlug } = await params
  return { title: `${courseSlug} — TUTOR` }
}

export default async function CoursePage({ params }: Props) {
  const { moduleSlug, courseSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: course }, { data: userProfile }] = await Promise.all([
    supabaseAdmin.from('courses').select('*, modules(*)').eq('slug', courseSlug).single(),
    supabaseAdmin.from('users').select('role, subscription_plan, subscription_status').eq('id', user.id).single(),
  ])

  if (!course) notFound()

  const isPro = checkIsPro(userProfile)

  if (course.is_premium && !isPro) {
    redirect('/pricing')
  }

  // Mark as accessed
  await supabaseAdmin
    .from('user_progress')
    .upsert({
      user_id: user.id,
      course_id: course.id,
      last_accessed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,course_id', ignoreDuplicates: false })

  // Get current progress
  const { data: progress } = await supabaseAdmin
    .from('user_progress')
    .select('completed, score')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single()

  const moduleName = (course as any).modules?.name ?? moduleSlug

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Link
          href={`/app/preparation/${moduleSlug}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: 'var(--app-text-muted)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} />
          {moduleName}
        </Link>
        <span style={{ color: 'var(--app-border)', fontSize: '13px' }}>/</span>
        <span style={{
          fontSize: '13px', color: 'var(--app-text)', fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: '320px',
        }}>
          {course.title}
        </span>
      </div>

      <CourseContent
        course={course as any}
        isPro={isPro}
        userId={user.id}
        moduleSlug={moduleSlug}
        isCompleted={progress?.completed ?? false}
        initialScore={progress?.score ?? null}
      />
    </div>
  )
}
