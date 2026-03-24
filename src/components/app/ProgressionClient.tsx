'use client'

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { Fire } from '@phosphor-icons/react'

export interface ModuleRow {
  id: string
  name: string
  slug: string
  courses: { count: number }[]
}

export interface ProgressRow {
  course_id: string
  completed: boolean
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
  const dates = new Set(activity.map((a) => new Date(a.last_accessed_at).toDateString()))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (dates.has(d.toDateString())) { streak++ } else { break }
  }
  return streak
}

const statCard = {
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  borderRadius: '14px',
  padding: '20px 24px',
}

const sectionCard = {
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  borderRadius: '16px',
  padding: '28px 32px',
}

const sectionTitle = {
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--app-text)',
  marginBottom: '20px',
}

export default function ProgressionClient({
  completedCourses,
  modules,
  progressByModule,
  mockExams,
  recentActivity,
}: Props) {
  const streak = calcStreak(recentActivity)

  const moduleCompletionMap: Record<string, { completed: number }> = {}
  progressByModule.forEach((p) => {
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

  const latestExam = mockExams[0]
  const radarData = modules.map((mod) => ({
    module: MODULE_SHORT[mod.slug] ?? mod.name,
    score: latestExam?.module_scores?.[mod.slug] ?? 0,
    fullMark: 100,
  }))

  const scoreHistory = [...mockExams].reverse().map((e, i) => ({
    exam: `#${i + 1}`,
    score: e.total_score,
  }))

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

  const tooltipStyle = {
    background: 'var(--app-surface)',
    border: '1px solid var(--app-border)',
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--app-text)',
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '4px' }}>
          Ma Progression
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--app-text-muted)' }}>
          Vue d&apos;ensemble de votre avancement.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { value: completedCourses, label: 'Cours complétés', color: 'var(--accent)' },
          {
            value: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {streak}j <Fire size={20} weight="fill" style={{ color: 'var(--warning)' }} />
            </span>,
            label: 'Série en cours',
            color: 'var(--warning)',
          },
          { value: mockExams.length, label: 'Examens blancs', color: 'var(--accent)' },
          { value: avgScore !== null ? `${avgScore}%` : '—', label: 'Score moyen', color: avgScore !== null && avgScore >= 70 ? 'var(--success)' : 'var(--accent)' },
        ].map((stat, i) => (
          <div key={i} style={statCard}>
            <div style={{
              fontSize: '28px', fontWeight: 700,
              color: typeof stat.color === 'string' ? stat.color : 'var(--accent)',
              fontFamily: 'var(--font-geist-mono), monospace',
              marginBottom: '4px',
            }}>
              {stat.value}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Radar */}
        <div style={sectionCard}>
          <p style={sectionTitle}>{latestExam ? 'Dernier examen — par module' : 'Performance par module'}</p>
          {latestExam ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(232,232,232,0.9)" />
                <PolarAngleAxis dataKey="module" tick={{ fill: '#888888', fontSize: 11 }} />
                <Radar dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '200px', color: 'var(--app-text-muted)', fontSize: '14px',
            }}>
              Passez un examen blanc pour voir votre radar.
            </div>
          )}
        </div>

        {/* Score history */}
        <div style={sectionCard}>
          <p style={sectionTitle}>Historique des scores</p>
          {scoreHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,232,232,0.9)" />
                <XAxis dataKey="exam" tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#888888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(59,130,246,0.04)' }} />
                <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '200px', color: 'var(--app-text-muted)', fontSize: '14px',
            }}>
              Aucun examen blanc encore.
            </div>
          )}
        </div>
      </div>

      {/* Module progress */}
      <div style={{ ...sectionCard, marginBottom: '16px' }}>
        <p style={sectionTitle}>Progression par module</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {moduleProgressData.map((mod) => (
            <div key={mod.slug}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', color: 'var(--app-text-muted)' }}>{mod.name}</span>
                <span style={{
                  fontSize: '13px', fontFamily: 'var(--font-geist-mono), monospace',
                  color: 'var(--app-text)',
                }}>
                  {mod.completed} / {mod.total}
                </span>
              </div>
              <div style={{
                width: '100%', height: '6px',
                background: 'var(--app-border)', borderRadius: '999px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${mod.pct}%`,
                  background: mod.pct >= 70 ? 'var(--success)' : 'var(--accent)',
                  borderRadius: '999px', transition: 'width 600ms ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak points */}
      {weakPoints.length > 0 && (
        <div style={sectionCard}>
          <p style={sectionTitle}>Points à améliorer</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {weakPoints.map((wp) => (
              <div key={wp.slug} style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '12px', padding: '16px 20px',
              }}>
                <div style={{
                  fontSize: '24px', fontWeight: 700, color: '#EF4444',
                  fontFamily: 'var(--font-geist-mono), monospace', marginBottom: '4px',
                }}>
                  {wp.score}%
                </div>
                <div style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>{wp.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
