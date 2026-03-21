'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Course, QCMQuestion, Flashcard } from '@/types'
import { useAppStore } from '@/store/app'

interface CourseWithModule extends Course {
  modules: { name: string } | null
}

interface Props {
  course: CourseWithModule
  isPro: boolean
  userId: string
}

type Tab = 'cours' | 'mindmap' | 'audio' | 'qcm' | 'flashcards' | 'question'

const TABS: { id: Tab; label: string; icon: string; isPro?: boolean }[] = [
  { id: 'cours', label: 'Cours', icon: '📖' },
  { id: 'mindmap', label: 'Carte mentale', icon: '🧠' },
  { id: 'audio', label: 'Audio', icon: '🎧', isPro: true },
  { id: 'qcm', label: 'QCM', icon: '📝' },
  { id: 'flashcards', label: 'Flashcards', icon: '🃏' },
  { id: 'question', label: 'Question directe', icon: '💬' },
]

export default function CourseContent({ course, isPro, userId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('cours')
  const { addToast } = useAppStore()

  // --- Mindmap state ---
  const [mindmapMarkdown, setMindmapMarkdown] = useState<string | null>(null)
  const [mindmapLoading, setMindmapLoading] = useState(false)
  const mindmapRef = useRef<HTMLDivElement>(null)

  // --- Audio state ---
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)

  // --- QCM state ---
  const [qcmQuestions, setQcmQuestions] = useState<QCMQuestion[]>([])
  const [qcmLoading, setQcmLoading] = useState(false)
  const [qcmAnswers, setQcmAnswers] = useState<(number | null)[]>([])
  const [qcmSubmitted, setQcmSubmitted] = useState(false)

  // --- Flashcards state ---
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [flashcardsLoading, setFlashcardsLoading] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)
  const [revealed, setRevealed] = useState(false)

  // --- Direct question state ---
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [questionLoading, setQuestionLoading] = useState(false)

  async function generateMindmap() {
    if (mindmapMarkdown) return
    setMindmapLoading(true)
    try {
      const res = await fetch('/api/ai/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, content: course.content }),
      })
      const data = await res.json()
      if (data.markdown) {
        setMindmapMarkdown(data.markdown)
      }
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de générer la carte mentale.' })
    }
    setMindmapLoading(false)
  }

  // Render mindmap with markmap when markdown is ready
  useEffect(() => {
    if (!mindmapMarkdown || !mindmapRef.current) return
    const container = mindmapRef.current

    import('markmap-lib').then(({ Transformer }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      import('markmap-view').then(({ Markmap }: { Markmap: any }) => {
        const transformer = new Transformer()
        const { root } = transformer.transform(mindmapMarkdown)
        container.innerHTML = ''
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.style.width = '100%'
        svg.style.height = '500px'
        container.appendChild(svg)
        Markmap.create(svg, undefined, root)
      })
    })
  }, [mindmapMarkdown])

  async function generateAudio() {
    if (audioUrl) return
    setAudioLoading(true)
    try {
      const res = await fetch('/api/ai/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, text: course.summary ?? course.content?.slice(0, 2000) }),
      })
      const blob = await res.blob()
      setAudioUrl(URL.createObjectURL(blob))
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: "Impossible de générer l'audio." })
    }
    setAudioLoading(false)
  }

  async function generateQCM() {
    if (qcmQuestions.length > 0) return
    setQcmLoading(true)
    try {
      const res = await fetch('/api/ai/qcm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, content: course.content }),
      })
      const data = await res.json()
      if (data.questions) {
        setQcmQuestions(data.questions)
        setQcmAnswers(new Array(data.questions.length).fill(null))
      }
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de générer les QCM.' })
    }
    setQcmLoading(false)
  }

  async function generateFlashcards() {
    if (flashcards.length > 0) return
    setFlashcardsLoading(true)
    try {
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, content: course.content }),
      })
      const data = await res.json()
      if (data.flashcards) {
        setFlashcards(data.flashcards)
      }
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de générer les flashcards.' })
    }
    setFlashcardsLoading(false)
  }

  async function askQuestion() {
    if (!question.trim()) return
    setQuestionLoading(true)
    setAnswer(null)
    try {
      const res = await fetch('/api/ai/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, courseId: course.id, context: course.content?.slice(0, 3000) }),
      })
      const data = await res.json()
      setAnswer(data.answer)
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: "Impossible d'obtenir une réponse." })
    }
    setQuestionLoading(false)
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    // Audio auto-loads when switching to the tab (it's a Pro feature with no manual trigger needed)
    if (tab === 'audio') generateAudio()
  }

  const qcmScore = qcmSubmitted
    ? Math.round((qcmAnswers.filter((a, i) => a === qcmQuestions[i]?.correct_answer).length / qcmQuestions.length) * 100)
    : null

  return (
    <div>
      {/* Course header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white mb-2">{course.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted">
              <span>{course.modules?.name}</span>
              <span>·</span>
              <span>{course.duration_minutes} min</span>
              <span>·</span>
              <span className="capitalize">{course.difficulty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-navy-800 p-1 rounded-2xl overflow-x-auto">
        {TABS.map((tab) => {
          const isProTab = tab.isPro && !isPro
          return (
            <button
              key={tab.id}
              onClick={() => !isProTab && handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gold text-navy-900'
                  : isProTab
                  ? 'text-muted cursor-not-allowed'
                  : 'text-muted hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {isProTab && <span className="text-xs px-1 rounded bg-gold/20 text-gold">Pro</span>}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="glass-card p-6">
        {/* Cours tab */}
        {activeTab === 'cours' && (
          <div className="prose-tutor max-w-none">
            {course.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{course.content}</ReactMarkdown>
            ) : (
              <p className="text-muted text-center py-8">Contenu du cours non disponible.</p>
            )}
          </div>
        )}

        {/* Mindmap tab */}
        {activeTab === 'mindmap' && (
          <div>
            {mindmapLoading ? (
              <div className="text-center py-12 text-muted">
                <div className="text-3xl mb-3 animate-pulse">🧠</div>
                <p>Génération de la carte mentale...</p>
              </div>
            ) : mindmapMarkdown ? (
              <div ref={mindmapRef} className="w-full min-h-96 bg-white rounded-xl" />
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🧠</div>
                <p className="text-muted mb-6">Générez une carte mentale à partir du contenu de ce cours.</p>
                <button onClick={generateMindmap} className="btn-primary">
                  Générer la carte mentale
                </button>
              </div>
            )}
          </div>
        )}

        {/* Audio tab */}
        {activeTab === 'audio' && (
          <div className="text-center py-8">
            {audioLoading ? (
              <div>
                <div className="text-4xl mb-3 animate-pulse">🎧</div>
                <p className="text-muted">Génération de l&apos;audio...</p>
                <p className="text-xs text-muted mt-2">Cela peut prendre quelques secondes</p>
              </div>
            ) : audioUrl ? (
              <div className="space-y-4">
                <div className="text-3xl">🎧</div>
                <p className="text-white font-medium">Audio du cours</p>
                <audio controls className="w-full max-w-md mx-auto" src={audioUrl} />
              </div>
            ) : (
              <p className="text-muted">Chargement...</p>
            )}
          </div>
        )}

        {/* QCM tab */}
        {activeTab === 'qcm' && (
          <div>
            {qcmLoading ? (
              <div className="text-center py-12 text-muted">
                <div className="text-3xl mb-3 animate-pulse">📝</div>
                <p>Génération des QCM...</p>
              </div>
            ) : qcmQuestions.length > 0 ? (
              <div className="space-y-6">
                {qcmSubmitted && (
                  <div className="glass-card p-4 text-center border-gold/30">
                    <p className="text-white font-semibold text-lg">Score : <span className="text-gold">{qcmScore}%</span></p>
                    <p className="text-muted text-sm mt-1">
                      {qcmAnswers.filter((a, i) => a === qcmQuestions[i]?.correct_answer).length} / {qcmQuestions.length} bonnes réponses
                    </p>
                  </div>
                )}
                {qcmQuestions.map((q, qi) => (
                  <div key={qi} className="space-y-3">
                    <p className="text-white font-medium">{qi + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const isSelected = qcmAnswers[qi] === oi
                        const isCorrect = qcmSubmitted && oi === q.correct_answer
                        const isWrong = qcmSubmitted && isSelected && oi !== q.correct_answer
                        return (
                          <button
                            key={oi}
                            onClick={() => !qcmSubmitted && setQcmAnswers((prev) => {
                              const next = [...prev]; next[qi] = oi; return next
                            })}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                              isCorrect ? 'border-green-500/50 bg-green-500/10 text-green-400'
                              : isWrong ? 'border-red-500/50 bg-red-500/10 text-red-400'
                              : isSelected ? 'border-gold/50 bg-gold/10 text-gold'
                              : 'border-white/10 text-muted hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <span className="font-semibold mr-2">{['A', 'B', 'C', 'D'][oi]}.</span>{opt}
                          </button>
                        )
                      })}
                    </div>
                    {qcmSubmitted && q.explanation && (
                      <p className="text-xs text-muted bg-navy-800 rounded-lg px-3 py-2">{q.explanation}</p>
                    )}
                  </div>
                ))}
                {!qcmSubmitted && (
                  <button
                    onClick={() => setQcmSubmitted(true)}
                    disabled={qcmAnswers.some((a) => a === null)}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    Soumettre mes réponses
                  </button>
                )}
                {qcmSubmitted && (
                  <button
                    onClick={() => {
                      setQcmSubmitted(false)
                      setQcmAnswers(new Array(qcmQuestions.length).fill(null))
                    }}
                    className="btn-secondary w-full"
                  >
                    Recommencer
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-muted mb-6">Générez des QCM à partir du contenu de ce cours.</p>
                <button onClick={generateQCM} className="btn-primary">
                  Générer les QCM
                </button>
              </div>
            )}
          </div>
        )}

        {/* Flashcards tab */}
        {activeTab === 'flashcards' && (
          <div>
            {flashcardsLoading ? (
              <div className="text-center py-12 text-muted">
                <div className="text-3xl mb-3 animate-pulse">🃏</div>
                <p>Génération des flashcards...</p>
              </div>
            ) : flashcards.length > 0 ? (
              <div className="max-w-md mx-auto">
                <div className="text-center text-sm text-muted mb-4">
                  {currentCard + 1} / {flashcards.length}
                </div>
                <div
                  className="glass-card p-8 min-h-48 flex items-center justify-center cursor-pointer border-gold/20 hover:border-gold/40 transition-colors"
                  onClick={() => setRevealed(!revealed)}
                >
                  <div className="text-center">
                    {!revealed ? (
                      <p className="text-white font-medium text-lg">{flashcards[currentCard].front}</p>
                    ) : (
                      <div>
                        <p className="text-gold text-xs mb-3 uppercase tracking-widest">Réponse</p>
                        <p className="text-white">{flashcards[currentCard].back}</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-muted text-xs text-center mt-3">Cliquez pour révéler</p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setRevealed(false) }}
                    disabled={currentCard === 0}
                    className="btn-ghost flex-1 disabled:opacity-30"
                  >
                    Précédente
                  </button>
                  <button
                    onClick={() => { setCurrentCard(Math.min(flashcards.length - 1, currentCard + 1)); setRevealed(false) }}
                    disabled={currentCard === flashcards.length - 1}
                    className="btn-ghost flex-1 disabled:opacity-30"
                  >
                    Suivante
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🃏</div>
                <p className="text-muted mb-6">Générez des flashcards à partir du contenu de ce cours.</p>
                <button onClick={generateFlashcards} className="btn-primary">
                  Générer les flashcards
                </button>
              </div>
            )}
          </div>
        )}

        {/* Direct Question tab */}
        {activeTab === 'question' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-muted text-sm">Posez une question sur le contenu de ce cours.</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                placeholder="Votre question..."
                className="input-field flex-1"
              />
              <button
                onClick={askQuestion}
                disabled={questionLoading || !question.trim()}
                className="btn-primary shrink-0 disabled:opacity-50"
              >
                {questionLoading ? '...' : 'Envoyer'}
              </button>
            </div>
            {answer && (
              <div className="glass-card p-5 border-gold/20">
                <p className="text-xs text-gold mb-2 uppercase tracking-widest">Réponse</p>
                <div className="prose-tutor text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
