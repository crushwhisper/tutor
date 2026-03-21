import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import CourseContent from '@/components/app/CourseContent'

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

  // Fetch course with module info
  const { data: course } = await supabase
    .from('courses')
    .select('*, modules(*)')
    .eq('slug', courseSlug)
    .single()

  if (!course) notFound()

  // Fetch user profile (for pro check)
  const { data: userProfile } = await supabase
    .from('users')
    .select('subscription_plan, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = userProfile?.subscription_plan === 'pro' && userProfile?.subscription_status === 'active'

  // Check if user can access this course
  if (course.is_premium && !isPro) {
    redirect('/app/settings?tab=subscription')
  }

  // Update/create progress entry
  await supabase
    .from('user_progress')
    .upsert({
      user_id: user.id,
      course_id: course.id,
      last_accessed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,course_id', ignoreDuplicates: false })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted flex-wrap">
        <Link href="/app/preparation" className="hover:text-gold transition-colors">Modules</Link>
        <span>/</span>
        <Link href={`/app/preparation/${moduleSlug}`} className="hover:text-gold transition-colors">
          {(course as any).modules?.name ?? moduleSlug}
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-xs">{course.title}</span>
      </div>

      <CourseContent course={course as any} isPro={isPro} userId={user.id} />
    </div>
  )
}
