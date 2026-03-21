'use client'

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

export interface ModuleRow {
  id: string
  name: string
  slug: string
  courses: { count: number }[]
}

export interface ProgressRow {
  course_id: string
  completed: boolean
  // Supabase returns a joined row as a single-element array when using select('courses(module_id)')
  courses: { module_id: string }[] | { module_id: string } | null
}

export interface MockExamRow {
  total_score: number
  module_scores: Record<string, number>
  created_at: string
}

interface ActivityItem {
  last_accessed_at: string
}

interface Props {
  completedCourses: number
  modules: ModuleRow[]
  progressByModule: ProgressRow[]
  mockExams: MockExamRow[]
  recentActivity: ActivityItem[]
}

const MODULE_SHORT: Record<string, string> = {
  'anatomie-biologie': 'Anatomie',
  'medecine': 'Médecine',
  'chirurgie': 'Chirurgie',
  'urgences-medicales': 'Urg. Méd.',
  'urgences-chirurgicales': 'Urg. Chir.',
}

function calcStreak(activity: ActivityItem[]): number {
  if (activity.length === 0) return 0
  const dates = new Set(
    activity.map((a) => new Date(a.last_accessed_at).toDateString())
  )
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (dates.has(d.toDateString())) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export default function ProgressionClient({
  completedCourses,
  modules,
  progressByModule,
  mockExams,
  recentActivity,
}: Props) {
  const streak = calcStreak(recentActivity)

  // Build module completion data
  const moduleCompletionMap: Record<string, { completed: number }> = {}
  progressByModule.forEach((p) => {
    // Supabase may return the joined row as an array or a single object depending on the query shape
    const courseJoin = Array.isArray(p.courses) ? p.courses[0] : p.courses
    const moduleId = courseJoin?.module_id
    if (!moduleId) return
    if (!moduleCompletionMap[moduleId]) moduleCompletionMap[moduleId] = { completed: 0 }
    if (p.completed) moduleCompletionMap[moduleId].completed++
  })

  const moduleProgressData = modules.map((mod) => {
    const total = mod.courses?.[0]?.count ?? 0
    const completed = moduleCompletionMap[mod.id]?.completed ?? 0
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { name: MODULE_SHORT[mod.slug] ?? mod.name, pct, completed, total, slug: mod.slug }
  })

  // Radar data from latest mock exam
  const latestExam = mockExams[0]
  const radarData = modules.map((mod) => ({
    module: MODULE_SHORT[mod.slug] ?? mod.name,
    score: latestExam?.module_scores?.[mod.slug] ?? 0,
    fullMark: 100,
  }))

  // Score history
  const scoreHistory = [...mockExams].reverse().map((e, i) => ({
    exam: `Exam ${i + 1}`,
    score: e.total_score,
  }))

  // Weak points (modules with lowest score in latest exam)
  const weakPoints = latestExam
    ? modules
        .map((mod) => ({
          slug: mod.slug,
          name: MODULE_SHORT[mod.slug] ?? mod.name,
          score: latestExam.module_scores[mod.slug] ?? 0,
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
    : []

  const avgScore = mockExams.length > 0
    ? Math.round(mockExams.reduce((sum, e) => sum + e.total_score, 0) / mockExams.length)
    : null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="text-3xl font-bold text-gold mb-1">{completedCourses}</div>
          <p className="text-muted text-sm">Cours complétés</p>
        </div>
        <div className="glass-card p-5">
          <div className="text-3xl font-bold text-gold mb-1">{streak}j</div>
          <p className="text-muted text-sm">Série en cours</p>
        </div>
        <div className="glass-card p-5">
          <div className="text-3xl font-bold text-gold mb-1">{mockExams.length}</div>
          <p className="text-muted text-sm">Examens blancs</p>
        </div>
        <div className="glass-card p-5">
          <div className="text-3xl font-bold text-gold mb-1">{avgScore !== null ? `${avgScore}%` : '—'}</div>
          <p className="text-muted text-sm">Score moyen</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4">
            {latestExam ? 'Dernier examen — par module' : 'Performances par module'}
          </h2>
          {latestExam ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(232,168,62,0.15)" />
                <PolarAngleAxis dataKey="module" tick={{ fill: '#8892a4', fontSize: 11 }} />
                <Radar dataKey="score" stroke="#e8a83e" fill="#e8a83e" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted text-sm">
              Passez un examen blanc pour voir votre radar.
            </div>
          )}
        </div>

        {/* Score history bar chart */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4">Historique des scores</h2>
          {scoreHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="exam" tick={{ fill: '#8892a4', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8892a4', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1a2540', border: '1px solid rgba(232,168,62,0.2)', borderRadius: 8 }}
                  labelStyle={{ color: '#e8eaf0' }}
                  itemStyle={{ color: '#e8a83e' }}
                />
                <Bar dataKey="score" fill="#e8a83e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted text-sm">
              Aucun examen blanc encore.
            </div>
          )}
        </div>
      </div>

      {/* Module progress */}
      <div className="glass-card p-6">
        <h2 className="text-white font-semibold mb-4">Progression par module</h2>
        <div className="space-y-4">
          {moduleProgressData.map((mod) => (
            <div key={mod.slug}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">{mod.name}</span>
                <span className="text-white">{mod.completed} / {mod.total} cours</span>
              </div>
              <div className="w-full bg-navy-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gold transition-all"
                  style={{ width: `${mod.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak points */}
      {weakPoints.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4">Points à améliorer</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {weakPoints.map((wp) => (
              <div key={wp.slug} className="glass-card p-4 border-red-500/20">
                <div className="text-2xl font-bold text-red-400 mb-1">{wp.score}%</div>
                <div className="text-muted text-sm">{wp.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
