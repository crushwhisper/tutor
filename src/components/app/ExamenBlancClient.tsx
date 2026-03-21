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

    // Calculate module scores
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

    // Pre-compute results locally so the results phase shows the correct score immediately
    const localResult: Partial<MockExamResult> & { total_score: number; module_scores: Record<string, number>; duration_minutes: number } = {
      total_score: totalScore,
      module_scores: moduleScoresPct,
      duration_minutes: duration,
    }
    setResults(localResult as MockExamResult)
    setPhase('results')

    // Fetch the authenticated user's id for the insert
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      addToast({ type: 'error', title: 'Erreur', message: 'Session expirée. Reconnectez-vous pour sauvegarder.' })
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
      isSubmitting.current = false  // allow retry on next exam
    } else if (saved) {
      setResults(saved as MockExamResult)
    }
  }, [phase, questions, answers, duration, addToast])

  // Timer countdown — only decrements; does NOT call handleSubmit inline
  useEffect(() => {
    if (phase !== 'exam' || timeLeft <= 0) return
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, timeLeft])

  // Trigger submit when time runs out
  useEffect(() => {
    if (phase === 'exam' && timeLeft === 0) {
      handleSubmit()
    }
  }, [timeLeft, phase, handleSubmit])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  async function startExam() {
    if (isStarting.current) return
    isStarting.current = true
    isSubmitting.current = false  // reset for new exam session
    setLoading(true)
    try {
      const supabase = createClient()

      // Fetch questions from all modules
      const { data: modules } = await supabase
        .from('modules')
        .select('id, slug')
        .eq('is_active', true)

      const allQuestions: (QCMQuestion & { moduleSlug: string })[] = []

      for (const mod of modules ?? []) {
        const { data: qs } = await supabase
          .from('qcm_questions')
          .select('*')
          .eq('module_id', mod.id)
          .eq('is_active', true)
          .limit(10)

        allQuestions.push(...(qs ?? []).map((q) => ({ ...q, moduleSlug: mod.slug as string })))
      }

      // Shuffle
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

  // PHASE: Config
  if (phase === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Examen Blanc</h1>
          <p className="text-muted text-sm">Simulez les conditions du concours.</p>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2">Durée (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input-field"
              >
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
                <option value={180}>180 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Past results */}
        {pastResults.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-white font-semibold mb-4">Résultats précédents</h2>
            <div className="space-y-3">
              {pastResults.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <span className="text-white text-sm">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                    <span className="text-muted text-xs ml-3">{r.duration_minutes} min</span>
                  </div>
                  <span className={`text-lg font-bold ${r.total_score >= 70 ? 'text-gold' : r.total_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
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
          className="btn-primary w-full text-lg py-4 disabled:opacity-50"
        >
          {loading ? 'Chargement des questions...' : "Commencer l'examen"}
        </button>
      </div>
    )
  }

  // PHASE: Exam
  if (phase === 'exam') {
    const q = questions[currentQ]
    if (!q) return null
    const progress = Math.round(((currentQ + 1) / questions.length) * 100)
    const isUrgent = timeLeft < 300 // < 5 min

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between glass-card px-6 py-4">
          <div className="text-sm text-muted">
            Question <span className="text-white font-medium">{currentQ + 1}</span> / {questions.length}
          </div>
          <div className={`text-xl font-mono font-bold ${isUrgent ? 'text-red-400' : 'text-gold'}`}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleSubmit}
            className="btn-secondary text-sm py-1.5"
          >
            Terminer
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-navy-800 rounded-full h-1.5">
          <div className="bg-gold h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Question */}
        <div className="glass-card p-6">
          <p className="text-muted text-xs mb-3">{MODULE_NAMES[q.moduleSlug] ?? q.moduleSlug}</p>
          <p className="text-white font-medium text-lg mb-6">{q.question}</p>
          <div className="space-y-3">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setAnswers((prev) => {
                  const next = [...prev]; next[currentQ] = oi; return next
                })}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  answers[currentQ] === oi
                    ? 'border-gold/50 bg-gold/10 text-gold'
                    : 'border-white/10 text-muted hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="font-semibold mr-2">{['A', 'B', 'C', 'D'][oi]}.</span>{opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="btn-ghost disabled:opacity-30"
          >
            ← Précédente
          </button>
          <button
            onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
            disabled={currentQ === questions.length - 1}
            className="btn-primary"
          >
            Suivante →
          </button>
        </div>
      </div>
    )
  }

  // PHASE: Results
  if (phase === 'results') {
    const moduleScoresPct = (results?.module_scores ?? {}) as Record<string, number>
    const radarData: ModuleScore[] = Object.entries(MODULE_NAMES).map(([slug, name]) => ({
      module: name,
      score: moduleScoresPct[slug] ?? 0,
      fullMark: 100,
    }))

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass-card p-8 text-center border-gold/30">
          <div className="text-5xl font-bold text-gold mb-2">{results?.total_score ?? 0}%</div>
          <p className="text-white font-semibold text-xl mb-1">Score global</p>
          <p className="text-muted text-sm">
            {questions.filter((_, i) => answers[i] === questions[i]?.correct_answer).length} / {questions.length} bonnes réponses
          </p>
        </div>

        {/* Radar chart */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4">Performance par module</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(232,168,62,0.2)" />
              <PolarAngleAxis dataKey="module" tick={{ fill: '#8892a4', fontSize: 12 }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#e8a83e"
                fill="#e8a83e"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Module breakdown */}
        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4">Détail par module</h2>
          <div className="space-y-4">
            {Object.entries(MODULE_NAMES).map(([slug, name]) => {
              const score = moduleScoresPct[slug] ?? 0
              return (
                <div key={slug}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted">{name}</span>
                    <span className={`font-medium ${score >= 70 ? 'text-gold' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full bg-navy-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${score >= 70 ? 'bg-gold' : score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={() => setPhase('config')} className="btn-secondary w-full">
          Recommencer un examen
        </button>
      </div>
    )
  }

  return null
}
