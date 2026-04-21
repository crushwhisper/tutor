'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'
import type { MockExamResult } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'qcm' | 'redaction'
type QCMPhase = 'config' | 'exam' | 'results'

interface QCMQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string | null
  module_id: string | null
  moduleSlug: string
  moduleName: string
}

interface RedactionQuestion {
  question: string
  expectedAnswer: string
  keywords: string[]
  points: number
}

interface EvaluationResult {
  score: number
  feedback: string
  goodPoints: string[]
  missingPoints: string[]
}

interface ModuleScore {
  module: string
  score: number
  fullMark: number
}

interface Props {
  pastResults: MockExamResult[]
}

// ─── Module Metadata ──────────────────────────────────────────────────────────

const SUBJECT_OPTIONS = [
  { label: 'Anatomie', moduleId: '651843ca-50f3-43c1-847e-e4330bdbae52', slug: 'anatomie' },
  { label: 'Biologie', moduleId: '651843ca-50f3-43c1-847e-e4330bdbae52', slug: 'biologie' },
  { label: 'Pathologie Médicale', moduleId: '8bb0f613-2aa0-42ae-b4d1-c583b05af512', slug: 'pathologie-medicale' },
  { label: 'Pathologie Chirurgicale', moduleId: '08246cd4-a56f-46a5-a13f-1afa92b5f77f', slug: 'pathologie-chirurgicale' },
  { label: 'Urgences Médicales', moduleId: '3fd64d3f-a9d4-4005-9ecd-a2deb63cb845', slug: 'urgences-medicales' },
  { label: 'Urgences Chirurgicales', moduleId: 'ca3fd03e-5989-4772-8a86-4efac9a7ffff', slug: 'urgences-chirurgicales' },
]

const REDACTION_MODULES = [
  { label: 'Anatomie & Biologie', moduleId: '651843ca-50f3-43c1-847e-e4330bdbae52' },
  { label: 'Pathologie Médicale', moduleId: '8bb0f613-2aa0-42ae-b4d1-c583b05af512' },
  { label: 'Pathologie Chirurgicale', moduleId: '08246cd4-a56f-46a5-a13f-1afa92b5f77f' },
  { label: 'Urgences Médicales', moduleId: '3fd64d3f-a9d4-4005-9ecd-a2deb63cb845' },
  { label: 'Urgences Chirurgicales', moduleId: 'ca3fd03e-5989-4772-8a86-4efac9a7ffff' },
]

// slug → display name for radar / breakdown
const SLUG_NAMES: Record<string, string> = {
  'anatomie-biologie': 'Anatomie & Bio.',
  'pathologie-medicale': 'Path. Méd.',
  'pathologie-chirurgicale': 'Path. Chir.',
  'urgences-medicales': 'Urg. Méd.',
  'urgences-chirurgicales': 'Urg. Chir.',
}

// ─── Style Helpers ────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  borderRadius: '16px',
  padding: '28px 32px',
}

const btn = (variant: 'primary' | 'ghost' | 'danger' = 'primary', disabled = false): React.CSSProperties => ({
  padding: '12px 24px',
  background: disabled
    ? 'var(--app-border)'
    : variant === 'primary'
    ? 'var(--accent)'
    : variant === 'danger'
    ? '#EF4444'
    : 'var(--app-surface)',
  color: disabled
    ? 'var(--app-text-ghost)'
    : variant === 'ghost'
    ? 'var(--app-text-muted)'
    : 'white',
  border: variant === 'ghost' ? '1px solid var(--app-border)' : 'none',
  borderRadius: '10px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'inherit',
  transition: 'all 150ms',
  opacity: disabled ? 0.6 : 1,
})

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExamenBlancClient({ pastResults }: Props) {
  const { addToast } = useAppStore()
  const [activeTab, setActiveTab] = useState<Tab>('qcm')

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '4px' }}>
          Examen Blanc
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--app-text-muted)' }}>
          Simulez les conditions du concours.
        </p>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '24px',
        width: 'fit-content',
      }}>
        {([
          { key: 'qcm', label: 'QCM' },
          { key: 'redaction', label: 'Rédactionnel' },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '8px 20px',
              background: activeTab === key ? 'var(--accent)' : 'transparent',
              color: activeTab === key ? 'white' : 'var(--app-text-muted)',
              border: 'none',
              borderRadius: '9px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 150ms',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'qcm' && (
        <QCMTab pastResults={pastResults} addToast={addToast} />
      )}
      {activeTab === 'redaction' && (
        <RedactionTab addToast={addToast} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// QCM TAB
// ═══════════════════════════════════════════════════════════════════════════════

function QCMTab({
  pastResults,
  addToast,
}: {
  pastResults: MockExamResult[]
  addToast: (toast: { type: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string }) => void
}) {
  const [phase, setPhase] = useState<QCMPhase>('config')
  const [questions, setQuestions] = useState<QCMQuestion[]>([])
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [questionCount, setQuestionCount] = useState(20)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    SUBJECT_OPTIONS.map((s) => s.moduleId)
  )
  const [currentQ, setCurrentQ] = useState(0)
  const [results, setResults] = useState<MockExamResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const isSubmitting = useRef(false)
  const isStarting = useRef(false)

  // ── Timer ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (phase !== 'exam') return
    if (isSubmitting.current) return
    isSubmitting.current = true

    const supabase = createClient()

    // Compute per-module scores keyed by moduleSlug
    const moduleScores: Record<string, { correct: number; total: number }> = {}
    questions.forEach((q, i) => {
      const slug = q.moduleSlug
      if (!moduleScores[slug]) moduleScores[slug] = { correct: 0, total: 0 }
      moduleScores[slug].total++
      if (answers[i] === q.correct_answer) moduleScores[slug].correct++
    })

    // Dedupe "anatomie" and "biologie" → both map to same module ID, unify under 'anatomie-biologie'
    const moduleScoresPct: Record<string, number> = {}
    for (const [slug, data] of Object.entries(moduleScores)) {
      const key = slug === 'anatomie' || slug === 'biologie' ? 'anatomie-biologie' : slug
      if (!moduleScoresPct[key]) {
        moduleScoresPct[key] = 0
      }
      // Average if both anatomie and biologie appear
      const existing = moduleScoresPct[key]
      const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
      moduleScoresPct[key] = existing > 0 ? Math.round((existing + pct) / 2) : pct
    }

    const totalCorrect = answers.filter((a, i) => a === questions[i]?.correct_answer).length
    const totalScore = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0

    const questionResults = questions.map((q, i) => ({
      questionId: q.id,
      answer: answers[i],
      correct: answers[i] === q.correct_answer,
    }))

    const localResult = {
      id: '',
      user_id: '',
      total_score: totalScore,
      module_scores: moduleScoresPct,
      duration_minutes: durationMinutes,
      question_results: questionResults,
      created_at: new Date().toISOString(),
    }
    setResults(localResult as MockExamResult)
    setPhase('results')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      addToast({ type: 'error', title: 'Erreur', message: 'Session expirée.' })
      isSubmitting.current = false
      return
    }

    const { data: saved, error } = await supabase
      .from('mock_exam_results')
      .insert({
        user_id: user.id,
        module_scores: moduleScoresPct,
        total_score: totalScore,
        duration_minutes: durationMinutes,
        question_results: questionResults,
      })
      .select()
      .single()

    if (error) {
      addToast({ type: 'error', title: 'Erreur', message: 'Résultat non sauvegardé.' })
      isSubmitting.current = false
    } else if (saved) {
      setResults(saved as MockExamResult)
    }
  }, [phase, questions, answers, durationMinutes, addToast])

  useEffect(() => {
    if (phase !== 'exam' || timeLeft <= 0) return
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, timeLeft])

  useEffect(() => {
    if (phase === 'exam' && timeLeft === 0) handleSubmit()
  }, [timeLeft, phase, handleSubmit])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ── Start Exam ─────────────────────────────────────────────────────────────
  async function startExam() {
    if (isStarting.current) return
    if (selectedSubjects.length === 0) {
      addToast({ type: 'error', title: 'Erreur', message: 'Sélectionnez au moins une matière.' })
      return
    }
    isStarting.current = true
    isSubmitting.current = false
    setLoading(true)
    try {
      // Deduplicate module IDs (Anatomie + Biologie share the same ID)
      const uniqueModuleIds = [...new Set(selectedSubjects)]
      const params = new URLSearchParams({
        moduleIds: uniqueModuleIds.join(','),
        count: String(questionCount),
      })
      const res = await fetch(`/api/exam/session?${params}`)
      if (!res.ok) throw new Error('Failed to fetch questions')
      const { questions: fetched } = await res.json()

      if (!fetched || fetched.length === 0) {
        addToast({ type: 'error', title: 'Erreur', message: 'Aucune question disponible.' })
        return
      }

      setQuestions(fetched)
      setAnswers(new Array(fetched.length).fill(null))
      setTimeLeft(durationMinutes * 60)
      setCurrentQ(0)
      setShowReview(false)
      setPhase('exam')
    } catch (err) {
      console.error(err)
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger les questions.' })
    } finally {
      setLoading(false)
      isStarting.current = false
    }
  }

  function toggleSubject(moduleId: string) {
    setSelectedSubjects((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    )
  }

  // ── CONFIG PHASE ───────────────────────────────────────────────────────────
  if (phase === 'config') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Subject filter */}
        <div style={card}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>
            Matières
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {SUBJECT_OPTIONS.map((s) => {
              const isSelected = selectedSubjects.includes(s.moduleId)
              return (
                <button
                  key={s.slug}
                  onClick={() => toggleSubject(s.moduleId)}
                  style={{
                    padding: '8px 16px',
                    background: isSelected ? 'var(--accent)' : 'var(--app-bg)',
                    color: isSelected ? 'white' : 'var(--app-text-muted)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--app-border)'}`,
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 150ms',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Count + Timer */}
        <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--app-text-muted)', marginBottom: '10px' }}>
              Nombre de questions
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[20, 40, 60].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: questionCount === n ? 'var(--accent)' : 'var(--app-bg)',
                    color: questionCount === n ? 'white' : 'var(--app-text-muted)',
                    border: `1px solid ${questionCount === n ? 'var(--accent)' : 'var(--app-border)'}`,
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 150ms',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--app-text-muted)', marginBottom: '10px' }}>
              Durée
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { label: '30 min', value: 30 },
                { label: '60 min', value: 60 },
                { label: '90 min', value: 90 },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setDurationMinutes(value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: durationMinutes === value ? 'var(--accent)' : 'var(--app-bg)',
                    color: durationMinutes === value ? 'white' : 'var(--app-text-muted)',
                    border: `1px solid ${durationMinutes === value ? 'var(--accent)' : 'var(--app-border)'}`,
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 150ms',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Past Results */}
        {pastResults.length > 0 && (
          <div style={card}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>
              Résultats précédents
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {pastResults.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < pastResults.length - 1 ? '1px solid var(--app-border)' : 'none',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '14px', color: 'var(--app-text)' }}>
                      {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--app-text-muted)', marginLeft: '12px' }}>
                      {r.duration_minutes} min
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-geist-mono), monospace',
                      color:
                        r.total_score >= 70
                          ? 'var(--success)'
                          : r.total_score >= 50
                          ? 'var(--warning)'
                          : '#EF4444',
                    }}
                  >
                    {r.total_score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Launch button */}
        <button
          onClick={startExam}
          disabled={loading || selectedSubjects.length === 0}
          style={{
            ...btn('primary', loading || selectedSubjects.length === 0),
            width: '100%',
            padding: '16px',
            fontSize: '15px',
            borderRadius: '12px',
          }}
        >
          {loading ? 'Chargement des questions...' : "Lancer l'examen →"}
        </button>
      </div>
    )
  }

  // ── EXAM PHASE ─────────────────────────────────────────────────────────────
  if (phase === 'exam') {
    const q = questions[currentQ]
    if (!q) return null
    const progress = Math.round(((currentQ + 1) / questions.length) * 100)
    const answered = answers.filter((a) => a !== null).length
    const isUrgent = timeLeft < 300

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
        {/* Sticky header */}
        <div
          style={{
            position: 'sticky',
            top: '0',
            zIndex: 10,
            background: 'var(--app-surface)',
            border: '1px solid var(--app-border)',
            borderRadius: '14px',
            padding: '14px 24px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>
            Question <strong style={{ color: 'var(--app-text)' }}>{currentQ + 1}</strong> / {questions.length}
            <span style={{ marginLeft: '12px', color: 'var(--app-text-ghost)' }}>
              ({answered} répondues)
            </span>
          </span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: 'var(--font-geist-mono), monospace',
              color: isUrgent ? '#EF4444' : 'var(--app-text)',
            }}
          >
            {formatTime(timeLeft)}
          </span>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 16px',
              background: 'var(--app-bg)',
              border: '1px solid var(--app-border)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--app-text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Terminer
          </button>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: '4px',
            background: 'var(--app-border)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--accent)',
              borderRadius: '999px',
              transition: 'width 300ms',
            }}
          />
        </div>

        {/* Question card */}
        <div style={{ ...card, marginBottom: '12px' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--app-text-ghost)',
              marginBottom: '12px',
            }}
          >
            {q.moduleName ?? q.moduleSlug}
          </p>
          <p
            style={{
              fontSize: '17px',
              fontWeight: 500,
              color: 'var(--app-text)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {q.question}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {q.options.map((opt, oi) => {
              const isSelected = answers[currentQ] === oi
              return (
                <button
                  key={oi}
                  onClick={() =>
                    setAnswers((prev) => {
                      const next = [...prev]
                      next[currentQ] = oi
                      return next
                    })
                  }
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 18px',
                    background: isSelected ? 'var(--accent-soft)' : 'var(--app-bg)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--app-border)'}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: isSelected ? 'var(--accent)' : 'var(--app-text)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 150ms',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      flexShrink: 0,
                      borderRadius: '8px',
                      border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--app-border)'}`,
                      background: isSelected ? 'var(--accent)' : 'transparent',
                      color: isSelected ? 'white' : 'var(--app-text-ghost)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-geist-mono), monospace',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {['A', 'B', 'C', 'D'][oi]}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            style={{
              ...btn('ghost', currentQ === 0),
              opacity: currentQ === 0 ? 0.4 : 1,
            }}
          >
            ← Précédente
          </button>
          <button
            onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
            disabled={currentQ === questions.length - 1}
            style={{
              ...btn('primary', currentQ === questions.length - 1),
              opacity: currentQ === questions.length - 1 ? 0.4 : 1,
            }}
          >
            Suivante →
          </button>
        </div>
      </div>
    )
  }

  // ── RESULTS PHASE ──────────────────────────────────────────────────────────
  if (phase === 'results') {
    const moduleScoresPct = (results?.module_scores ?? {}) as Record<string, number>
    const radarData: ModuleScore[] = Object.entries(SLUG_NAMES).map(([slug, name]) => ({
      module: name,
      score: moduleScoresPct[slug] ?? 0,
      fullMark: 100,
    }))
    const score = results?.total_score ?? 0
    const correct = questions.filter((_, i) => answers[i] === questions[i]?.correct_answer).length

    const scoreColor =
      score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : '#EF4444'
    const scoreBorderColor =
      score >= 70 ? 'rgba(16,185,129,0.3)' : score >= 50 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'

    return (
      <div>
        {/* Score header */}
        <div
          style={{
            ...card,
            textAlign: 'center',
            borderColor: scoreBorderColor,
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              fontFamily: 'var(--font-geist-mono), monospace',
              color: scoreColor,
              marginBottom: '8px',
            }}
          >
            {score}%
          </div>
          <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '4px' }}>
            Score global
          </p>
          <p style={{ fontSize: '14px', color: 'var(--app-text-muted)' }}>
            {correct} / {questions.length} bonnes réponses
          </p>
        </div>

        {/* Charts + Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Radar */}
          <div style={card}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>
              Performance par module
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(232,232,232,0.9)" />
                <PolarAngleAxis dataKey="module" tick={{ fill: '#888888', fontSize: 11 }} />
                <Radar
                  dataKey="score"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Module breakdown */}
          <div style={card}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>
              Détail par module
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(SLUG_NAMES).map(([slug, name]) => {
                const s = moduleScoresPct[slug] ?? 0
                const c = s >= 70 ? 'var(--success)' : s >= 50 ? 'var(--warning)' : '#EF4444'
                return (
                  <div key={slug}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>{name}</span>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: c,
                          fontFamily: 'var(--font-geist-mono), monospace',
                        }}
                      >
                        {s}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: '5px',
                        background: 'var(--app-border)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${s}%`,
                          background: c,
                          borderRadius: '999px',
                          transition: 'width 600ms',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Review toggle */}
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => setShowReview((v) => !v)}
            style={{
              ...btn('ghost'),
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              borderRadius: '12px',
              border: '1px solid var(--app-border)',
            }}
          >
            {showReview ? 'Masquer la correction' : 'Voir la correction détaillée'}
          </button>
        </div>

        {/* Question review */}
        {showReview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {questions.map((q, i) => {
              const userAnswer = answers[i]
              const isCorrect = userAnswer === q.correct_answer
              return (
                <div
                  key={q.id}
                  style={{
                    ...card,
                    borderColor: isCorrect
                      ? 'rgba(16,185,129,0.3)'
                      : userAnswer !== null
                      ? 'rgba(239,68,68,0.3)'
                      : 'var(--app-border)',
                    padding: '20px 24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                      gap: '12px',
                    }}
                  >
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--app-text)', lineHeight: 1.5, flex: 1 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--app-text-ghost)',
                          marginRight: '8px',
                          fontFamily: 'var(--font-geist-mono), monospace',
                        }}
                      >
                        #{i + 1}
                      </span>
                      {q.question}
                    </p>
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: '18px',
                      }}
                    >
                      {isCorrect ? '✅' : userAnswer !== null ? '❌' : '—'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    {q.options.map((opt, oi) => {
                      const isCorrectOpt = oi === q.correct_answer
                      const isUserOpt = oi === userAnswer
                      let bg = 'transparent'
                      let textColor = 'var(--app-text-muted)'
                      let borderColor = 'transparent'
                      if (isCorrectOpt) {
                        bg = 'rgba(16,185,129,0.08)'
                        textColor = 'var(--success)'
                        borderColor = 'rgba(16,185,129,0.3)'
                      } else if (isUserOpt && !isCorrect) {
                        bg = 'rgba(239,68,68,0.08)'
                        textColor = '#EF4444'
                        borderColor = 'rgba(239,68,68,0.3)'
                      }
                      return (
                        <div
                          key={oi}
                          style={{
                            padding: '10px 14px',
                            background: bg,
                            border: `1px solid ${borderColor}`,
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: textColor,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-geist-mono), monospace',
                              fontSize: '11px',
                              fontWeight: 700,
                              minWidth: '18px',
                            }}
                          >
                            {['A', 'B', 'C', 'D'][oi]}
                          </span>
                          {opt}
                          {isCorrectOpt && (
                            <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 600 }}>
                              ✓ Bonne réponse
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {q.explanation && (
                    <div
                      style={{
                        padding: '12px 14px',
                        background: 'var(--app-bg)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'var(--app-text-muted)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--app-text)' }}>Explication : </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={() => {
            setPhase('config')
            setResults(null)
            setShowReview(false)
          }}
          style={{
            ...btn('ghost'),
            width: '100%',
            padding: '14px',
            fontSize: '14px',
            borderRadius: '12px',
            border: '1px solid var(--app-border)',
          }}
        >
          Recommencer un examen
        </button>
      </div>
    )
  }

  return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// REDACTION TAB
// ═══════════════════════════════════════════════════════════════════════════════

function RedactionTab({ addToast }: { addToast: (toast: { type: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string }) => void }) {
  const [selectedModuleId, setSelectedModuleId] = useState(REDACTION_MODULES[0].moduleId)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [loadingEval, setLoadingEval] = useState(false)
  const [question, setQuestion] = useState<RedactionQuestion | null>(null)
  const [studentAnswer, setStudentAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)

  async function generateQuestion() {
    setLoadingQuestion(true)
    setQuestion(null)
    setStudentAnswer('')
    setEvaluation(null)
    try {
      const res = await fetch('/api/ai/redaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: selectedModuleId }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()
      setQuestion(data)
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de générer la question.' })
    } finally {
      setLoadingQuestion(false)
    }
  }

  async function evaluateAnswer() {
    if (!question || studentAnswer.trim().length < 10) {
      addToast({ type: 'error', title: 'Erreur', message: 'Votre réponse est trop courte.' })
      return
    }
    setLoadingEval(true)
    setEvaluation(null)
    try {
      const res = await fetch('/api/ai/evaluate-redaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          expectedAnswer: question.expectedAnswer,
          keywords: question.keywords,
          studentAnswer,
        }),
      })
      if (!res.ok) throw new Error('Evaluation failed')
      const data = await res.json()
      setEvaluation(data)
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: "Impossible d'évaluer la réponse." })
    } finally {
      setLoadingEval(false)
    }
  }

  const scoreColor = evaluation
    ? evaluation.score >= 14
      ? 'var(--success)'
      : evaluation.score >= 10
      ? 'var(--warning)'
      : '#EF4444'
    : 'var(--app-text)'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '20px',
        alignItems: 'start',
      }}
    >
      {/* Left Panel — subject selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={card}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '14px' }}>
            Matière
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {REDACTION_MODULES.map((m) => {
              const isSelected = selectedModuleId === m.moduleId
              return (
                <button
                  key={m.moduleId}
                  onClick={() => {
                    setSelectedModuleId(m.moduleId)
                    setQuestion(null)
                    setStudentAnswer('')
                    setEvaluation(null)
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    background: isSelected ? 'var(--accent)' : 'var(--app-bg)',
                    color: isSelected ? 'white' : 'var(--app-text-muted)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--app-border)'}`,
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 150ms',
                  }}
                >
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={generateQuestion}
          disabled={loadingQuestion}
          style={{
            ...btn('primary', loadingQuestion),
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
          }}
        >
          {loadingQuestion ? 'Génération...' : 'Générer une question'}
        </button>
      </div>

      {/* Right Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Empty state */}
        {!question && !loadingQuestion && (
          <div
            style={{
              ...card,
              textAlign: 'center',
              padding: '48px 32px',
            }}
          >
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>📝</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '6px' }}>
              Prêt pour l'épreuve rédactionnelle ?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--app-text-muted)', lineHeight: 1.6 }}>
              Sélectionnez une matière et cliquez sur "Générer une question" pour commencer.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {loadingQuestion && (
          <div style={{ ...card, padding: '28px 32px' }}>
            <div
              style={{
                height: '14px',
                background: 'var(--app-border)',
                borderRadius: '8px',
                marginBottom: '10px',
                width: '30%',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <div
              style={{
                height: '14px',
                background: 'var(--app-border)',
                borderRadius: '8px',
                marginBottom: '10px',
                width: '90%',
              }}
            />
            <div
              style={{
                height: '14px',
                background: 'var(--app-border)',
                borderRadius: '8px',
                marginBottom: '10px',
                width: '80%',
              }}
            />
            <div
              style={{
                height: '14px',
                background: 'var(--app-border)',
                borderRadius: '8px',
                width: '60%',
              }}
            />
          </div>
        )}

        {/* Question display */}
        {question && (
          <>
            <div style={card}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--app-text-ghost)',
                  }}
                >
                  Question rédactionnelle · {question.points} points
                </span>
                <button
                  onClick={generateQuestion}
                  disabled={loadingQuestion}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid var(--app-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--app-text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Nouvelle question
                </button>
              </div>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'var(--app-text)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {question.question}
              </p>

              {/* Keywords hint */}
              {question.keywords.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {question.keywords.map((kw, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--app-bg)',
                        border: '1px solid var(--app-border)',
                        borderRadius: '999px',
                        fontSize: '11px',
                        color: 'var(--app-text-ghost)',
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Answer textarea */}
            <div style={card}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--app-text)',
                  marginBottom: '12px',
                }}
              >
                Votre réponse
              </label>
              <textarea
                value={studentAnswer}
                onChange={(e) => {
                  setStudentAnswer(e.target.value)
                  setEvaluation(null)
                }}
                placeholder="Rédigez votre réponse ici..."
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '14px 16px',
                  background: 'var(--app-bg)',
                  border: '1px solid var(--app-border)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: 'var(--app-text)',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                }}
              >
                <span style={{ fontSize: '12px', color: 'var(--app-text-ghost)' }}>
                  {studentAnswer.trim().split(/\s+/).filter(Boolean).length} mots
                </span>
                <button
                  onClick={evaluateAnswer}
                  disabled={loadingEval || studentAnswer.trim().length < 10}
                  style={{
                    ...btn('primary', loadingEval || studentAnswer.trim().length < 10),
                    padding: '10px 20px',
                  }}
                >
                  {loadingEval ? 'Évaluation en cours...' : 'Évaluer ma réponse'}
                </button>
              </div>
            </div>

            {/* Evaluation result */}
            {evaluation && (
              <div
                style={{
                  ...card,
                  borderColor:
                    evaluation.score >= 14
                      ? 'rgba(16,185,129,0.3)'
                      : evaluation.score >= 10
                      ? 'rgba(245,158,11,0.3)'
                      : 'rgba(239,68,68,0.3)',
                }}
              >
                {/* Score */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '20px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid var(--app-border)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-geist-mono), monospace',
                      color: scoreColor,
                      lineHeight: 1,
                    }}
                  >
                    {evaluation.score}
                    <span style={{ fontSize: '24px', color: 'var(--app-text-muted)' }}>/20</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '4px' }}>
                      Note finale
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--app-text-muted)', lineHeight: 1.5 }}>
                      {evaluation.feedback}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Good points */}
                  <div>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--success)',
                        marginBottom: '10px',
                      }}
                    >
                      Points forts
                    </p>
                    {evaluation.goodPoints.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--app-text-ghost)' }}>Aucun point fort identifié.</p>
                    ) : (
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {evaluation.goodPoints.map((pt, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: '13px',
                              color: 'var(--app-text-muted)',
                              display: 'flex',
                              gap: '8px',
                              alignItems: 'flex-start',
                              lineHeight: 1.4,
                            }}
                          >
                            <span style={{ color: 'var(--success)', flexShrink: 0 }}>✅</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Missing points */}
                  <div>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#EF4444',
                        marginBottom: '10px',
                      }}
                    >
                      Points manquants
                    </p>
                    {evaluation.missingPoints.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--app-text-ghost)' }}>Aucun point manquant.</p>
                    ) : (
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {evaluation.missingPoints.map((pt, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: '13px',
                              color: 'var(--app-text-muted)',
                              display: 'flex',
                              gap: '8px',
                              alignItems: 'flex-start',
                              lineHeight: 1.4,
                            }}
                          >
                            <span style={{ color: '#EF4444', flexShrink: 0 }}>❌</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Retry */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--app-border)', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setStudentAnswer('')
                      setEvaluation(null)
                    }}
                    style={{ ...btn('ghost'), padding: '10px 18px' }}
                  >
                    Réécrire la réponse
                  </button>
                  <button
                    onClick={generateQuestion}
                    disabled={loadingQuestion}
                    style={{ ...btn('primary', loadingQuestion), padding: '10px 18px' }}
                  >
                    Nouvelle question
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
