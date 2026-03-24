'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'
import type { QCMQuestion, MockExamResult } from '@/types'

type Phase = 'config' | 'exam' | 'results'

interface ModuleScore {
  module: string
  score: number
  fullMark: number
}

interface Props {
  pastResults: MockExamResult[]
}

const MODULE_NAMES: Record<string, string> = {
  'anatomie-biologie': 'Anatomie',
  'medecine': 'Médecine',
  'chirurgie': 'Chirurgie',
  'urgences-medicales': 'Urg. Méd.',
  'urgences-chirurgicales': 'Urg. Chir.',
}

const surface = {
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  borderRadius: '16px',
  padding: '28px 32px',
}

export default function ExamenBlancClient({ pastResults }: Props) {
  const { addToast } = useAppStore()
  const [phase, setPhase] = useState<Phase>('config')
  const [questions, setQuestions] = useState<(QCMQuestion & { moduleSlug: string })[]>([])
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [duration, setDuration] = useState(120)
  const [currentQ, setCurrentQ] = useState(0)
  const [results, setResults] = useState<MockExamResult | null>(null)
  const [loading, setLoading] = useState(false)
  const isSubmitting = useRef(false)
  const isStarting = useRef(false)

  const handleSubmit = useCallback(async () => {
    if (phase !== 'exam') return
    if (isSubmitting.current) return
    isSubmitting.current = true

    const supabase = createClient()

    const moduleScores: Record<string, { correct: number; total: number }> = {}
    questions.forEach((q, i) => {
      const slug = q.moduleSlug
      if (!moduleScores[slug]) moduleScores[slug] = { correct: 0, total: 0 }
      moduleScores[slug].total++
      if (answers[i] === q.correct_answer) moduleScores[slug].correct++
    })

    const moduleScoresPct: Record<string, number> = {}
    for (const [slug, data] of Object.entries(moduleScores)) {
      moduleScoresPct[slug] = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    }

    const totalCorrect = answers.filter((a, i) => a === questions[i]?.correct_answer).length
    const totalScore = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0

    const questionResults = questions.map((q, i) => ({
      questionId: q.id,
      answer: answers[i],
      correct: answers[i] === q.correct_answer,
    }))

    const localResult = {
      total_score: totalScore,
      module_scores: moduleScoresPct,
      duration_minutes: duration,
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
        duration_minutes: duration,
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
  }, [phase, questions, answers, duration, addToast])

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

  async function startExam() {
    if (isStarting.current) return
    isStarting.current = true
    isSubmitting.current = false
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: modules } = await supabase.from('modules').select('id, slug').eq('is_active', true)
      const allQuestions: (QCMQuestion & { moduleSlug: string })[] = []
      for (const mod of modules ?? []) {
        const { data: qs } = await supabase
          .from('qcm_questions').select('*')
          .eq('module_id', mod.id).eq('is_active', true).limit(10)
        allQuestions.push(...(qs ?? []).map((q) => ({ ...q, moduleSlug: mod.slug as string })))
      }
      allQuestions.sort(() => Math.random() - 0.5)
      setQuestions(allQuestions)
      setAnswers(new Array(allQuestions.length).fill(null))
      setTimeLeft(duration * 60)
      setCurrentQ(0)
      setPhase('exam')
    } finally {
      setLoading(false)
      isStarting.current = false
    }
  }

  // ── CONFIG ────────────────────────────────────────────────────────
  if (phase === 'config') {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '4px' }}>
            Examen Blanc
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--app-text-muted)' }}>
            Simulez les conditions du concours.
          </p>
        </div>

        <div style={{ ...surface, marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>
            Configuration
          </p>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--app-text-muted)', marginBottom: '8px' }}>
            Durée
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{
              width: '100%', padding: '10px 14px',
              background: 'var(--app-bg)', border: '1px solid var(--app-border)',
              borderRadius: '10px', fontSize: '14px', color: 'var(--app-text)',
              outline: 'none', fontFamily: 'inherit',
            }}
          >
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
            <option value={180}>180 minutes</option>
          </select>
        </div>

        {pastResults.length > 0 && (
          <div style={{ ...surface, marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>
              Résultats précédents
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {pastResults.map((r, i) => (
                <div key={r.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < pastResults.length - 1 ? '1px solid var(--app-border)' : 'none',
                }}>
                  <div>
                    <span style={{ fontSize: '14px', color: 'var(--app-text)' }}>
                      {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--app-text-muted)', marginLeft: '12px' }}>
                      {r.duration_minutes} min
                    </span>
                  </div>
                  <span style={{
                    fontSize: '16px', fontWeight: 700,
                    fontFamily: 'var(--font-geist-mono), monospace',
                    color: r.total_score >= 70 ? 'var(--success)' : r.total_score >= 50 ? 'var(--warning)' : '#EF4444',
                  }}>
                    {r.total_score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={startExam}
          disabled={loading}
          style={{
            width: '100%', padding: '16px',
            background: loading ? 'var(--app-border)' : 'var(--accent)',
            color: loading ? 'var(--app-text-ghost)' : 'white',
            border: 'none', borderRadius: '12px',
            fontFamily: 'inherit', fontSize: '15px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 200ms',
          }}
        >
          {loading ? 'Chargement des questions...' : "Commencer l'examen →"}
        </button>
      </div>
    )
  }

  // ── EXAM ─────────────────────────────────────────────────────────
  if (phase === 'exam') {
    const q = questions[currentQ]
    if (!q) return null
    const progress = Math.round(((currentQ + 1) / questions.length) * 100)
    const isUrgent = timeLeft < 300

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
        {/* Sticky header */}
        <div style={{
          position: 'sticky', top: '0', zIndex: 10,
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          borderRadius: '14px',
          padding: '14px 24px',
          marginBottom: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>
            Question <strong style={{ color: 'var(--app-text)' }}>{currentQ + 1}</strong> / {questions.length}
          </span>
          <span style={{
            fontSize: '20px', fontWeight: 700,
            fontFamily: 'var(--font-geist-mono), monospace',
            color: isUrgent ? '#EF4444' : 'var(--app-text)',
          }}>
            {formatTime(timeLeft)}
          </span>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 16px',
              background: 'var(--app-bg)', border: '1px solid var(--app-border)',
              borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              color: 'var(--app-text-muted)', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Terminer
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', background: 'var(--app-border)', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: '999px', transition: 'width 300ms' }} />
        </div>

        {/* Question card */}
        <div style={{ ...surface, marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--app-text-ghost)', marginBottom: '12px' }}>
            {MODULE_NAMES[q.moduleSlug] ?? q.moduleSlug}
          </p>
          <p style={{ fontSize: '17px', fontWeight: 500, color: 'var(--app-text)', lineHeight: 1.5, marginBottom: '24px' }}>
            {q.question}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {q.options.map((opt, oi) => {
              const isSelected = answers[currentQ] === oi
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers((prev) => { const next = [...prev]; next[currentQ] = oi; return next })}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '14px 18px',
                    background: isSelected ? 'var(--accent-soft)' : 'var(--app-bg)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--app-border)'}`,
                    borderRadius: '12px',
                    fontSize: '14px', color: isSelected ? 'var(--accent)' : 'var(--app-text)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 150ms',
                    display: 'flex', alignItems: 'center', gap: '14px',
                  }}
                >
                  <span style={{
                    width: '28px', height: '28px', flexShrink: 0,
                    borderRadius: '8px',
                    border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--app-border)'}`,
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    color: isSelected ? 'white' : 'var(--app-text-ghost)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '12px', fontWeight: 700,
                  }}>
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
              padding: '10px 20px',
              background: 'var(--app-surface)', border: '1px solid var(--app-border)',
              borderRadius: '10px', fontSize: '13px', color: 'var(--app-text-muted)',
              cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
              opacity: currentQ === 0 ? 0.4 : 1,
              fontFamily: 'inherit',
            }}
          >
            ← Précédente
          </button>
          <button
            onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
            disabled={currentQ === questions.length - 1}
            style={{
              padding: '10px 20px',
              background: 'var(--accent)', border: 'none',
              borderRadius: '10px', fontSize: '13px', color: 'white', fontWeight: 600,
              cursor: currentQ === questions.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentQ === questions.length - 1 ? 0.4 : 1,
              fontFamily: 'inherit',
            }}
          >
            Suivante →
          </button>
        </div>
      </div>
    )
  }

  // ── RESULTS ───────────────────────────────────────────────────────
  if (phase === 'results') {
    const moduleScoresPct = (results?.module_scores ?? {}) as Record<string, number>
    const radarData: ModuleScore[] = Object.entries(MODULE_NAMES).map(([slug, name]) => ({
      module: name,
      score: moduleScoresPct[slug] ?? 0,
      fullMark: 100,
    }))
    const score = results?.total_score ?? 0
    const correct = questions.filter((_, i) => answers[i] === questions[i]?.correct_answer).length

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Score header */}
        <div style={{
          ...surface, textAlign: 'center',
          borderColor: score >= 70 ? 'rgba(16,185,129,0.3)' : score >= 50 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
          marginBottom: '16px',
        }}>
          <div style={{
            fontSize: '56px', fontWeight: 700,
            fontFamily: 'var(--font-geist-mono), monospace',
            color: score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : '#EF4444',
            marginBottom: '8px',
          }}>
            {score}%
          </div>
          <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '4px' }}>
            Score global
          </p>
          <p style={{ fontSize: '14px', color: 'var(--app-text-muted)' }}>
            {correct} / {questions.length} bonnes réponses
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Radar */}
          <div style={surface}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>
              Performance par module
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(232,232,232,0.9)" />
                <PolarAngleAxis dataKey="module" tick={{ fill: '#888888', fontSize: 11 }} />
                <Radar dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Module breakdown */}
          <div style={surface}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '16px' }}>
              Détail par module
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(MODULE_NAMES).map(([slug, name]) => {
                const s = moduleScoresPct[slug] ?? 0
                const color = s >= 70 ? 'var(--success)' : s >= 50 ? 'var(--warning)' : '#EF4444'
                return (
                  <div key={slug}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>{name}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color, fontFamily: 'var(--font-geist-mono), monospace' }}>{s}%</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--app-border)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s}%`, background: color, borderRadius: '999px', transition: 'width 600ms' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <button
          onClick={() => setPhase('config')}
          style={{
            width: '100%', padding: '14px',
            background: 'var(--app-surface)', border: '1px solid var(--app-border)',
            borderRadius: '12px', fontFamily: 'inherit',
            fontSize: '14px', fontWeight: 500, color: 'var(--app-text-muted)',
            cursor: 'pointer', transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--app-border-hover)'; e.currentTarget.style.color = 'var(--app-text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)'; e.currentTarget.style.color = 'var(--app-text-muted)' }}
        >
          Recommencer un examen
        </button>
      </div>
    )
  }

  return null
}
