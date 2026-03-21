import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProgressionClient from '@/components/app/ProgressionClient'

export default async function ProgressionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Total completed courses
  const { count: completedCourses } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completed', true)

  // Progress by module
  const { data: modules } = await supabase
    .from('modules')
    .select('id, name, slug, courses(count)')
    .eq('is_active', true)

  const { data: progressByModule } = await supabase
    .from('user_progress')
    .select('course_id, completed, courses(module_id)')
    .eq('user_id', user.id)

  // Mock exam results
  const { data: mockExams } = await supabase
    .from('mock_exam_results')
    .select('total_score, module_scores, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Recent activity (last 14 days for streak)
  const { data: recentActivity } = await supabase
    .from('user_progress')
    .select('last_accessed_at')
    .eq('user_id', user.id)
    .gte('last_accessed_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
    .order('last_accessed_at', { ascending: false })

  return (
    <ProgressionClient
      completedCourses={completedCourses ?? 0}
      modules={(modules ?? []) as ModuleRow[]}
      progressByModule={(progressByModule ?? []) as unknown as ProgressRow[]}
      mockExams={(mockExams ?? []) as MockExamRow[]}
      recentActivity={recentActivity ?? []}
    />
  )
}

// Explicit types for the casted data passed to client
import type { ModuleRow, ProgressRow, MockExamRow } from '@/components/app/ProgressionClient'
