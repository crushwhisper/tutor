'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Brain, ClipboardText, Cards, ChatCircle, CheckCircle, ArrowClockwise, CaretLeft, CaretRight } from '@phosphor-icons/react'
import type { QCMQuestion, Flashcard } from '@/types'
import { useAppStore } from '@/store/app'

interface UploadItem {
  id: string
  content: {
    title: string
    summary: string
    difficulty: string
    duration_minutes: number
    text: string
    file_name: string
  }
}

type Tool = 'mindmap' | 'qcm' | 'flashcards' | 'question'

export default function PersonalCourseViewer({ item, onBack }: { item: UploadItem; onBack: () => void }) {
  const { addToast } = useAppStore()
  const [activeTool, setActiveTool] = useState<Tool | null>(null)

  const [mindmapMd, setMindmapMd] = useState<string | null>(null)
  const [mindmapLoading, setMindmapLoading] = useState(false)
  const mindmapRef = useRef<HTMLDivElement>(null)

  const [qcmQuestions, setQcmQuestions] = useState<QCMQuestion[]>([])
  const [qcmLoading, setQcmLoading] = useState(false)
  const [qcmAnswers, setQcmAnswers] = useState<(number | null)[]>([])
  const [qcmSubmitted, setQcmSubmitted] = useState(false)

  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [flashcardsLoading, setFlashcardsLoading] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [questionLoading, setQuestionLoading] = useState(false)

  const content = item.content.text || ''

  async function generateMindmap() {
    if (mindmapMd) return
    setMindmapLoading(true)
    try {
      const res = await fetch('/api/ai/mindmap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
      const data = await res.json()
      if (data.markdown) setMindmapMd(data.markdown)
    } catch { addToast({ type: 'error', title: 'Erreur', message: 'Impossible de générer.' }) }
    setMindmapLoading(false)
  }

  useEffect(() => {
    if (!mindmapMd || !mindmapRef.current) return
    import('markmap-lib').then(({ Transformer }) => {
      import('markmap-view').then(({ Markmap }: { Markmap: any }) => {
        const { root } = new Transformer().transform(mindmapMd)
        mindmapRef.current!.innerHTML = ''
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.style.width = '100%'; svg.style.height = '400px'
        mindmapRef.current!.appendChild(svg)
        Markmap.create(svg, undefined, root)
      })
    })
  }, [mindmapMd])

  async function generateQCM() {
    if (qcmQuestions.length > 0) return
    setQcmLoading(true)
    try {
      const res = await fetch('/api/ai/qcm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
      const data = await res.json()
      if (data.questions) { setQcmQuestions(data.questions); setQcmAnswers(new Array(data.questions.length).fill(null)) }
    } catch { addToast({ type: 'error', title: 'Erreur', message: 'Impossible de générer.' }) }
    setQcmLoading(false)
  }

  async function generateFlashcards() {
    if (flashcards.length > 0) return
    setFlashcardsLoading(true)
    try {
      const res = await fetch('/api/ai/flashcards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
      const data = await res.json()
      if (data.flashcards) setFlashcards(data.flashcards)
    } catch { addToast({ type: 'error', title: 'Erreur', message: 'Impossible de générer.' }) }
    setFlashcardsLoading(false)
  }

  async function askQuestion() {
    if (!question.trim()) return
    setQuestionLoading(true); setAnswer(null)
    try {
      const res = await fetch('/api/ai/question', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context: content.slice(0, 3000) }) })
      const data = await res.json()
      setAnswer(data.answer)
    } catch { addToast({ type: 'error', title: 'Erreur', message: 'Impossible.' }) }
    setQuestionLoading(false)
  }

  function handleToolClick(tool: Tool) {
    setActiveTool(activeTool === tool ? null : tool)
    if (tool === 'mindmap' && activeTool !== 'mindmap') generateMindmap()
    if (tool === 'qcm' && activeTool !== 'qcm') generateQCM()
    if (tool === 'flashcards' && activeTool !== 'flashcards') generateFlashcards()
  }

  const qcmScore = qcmSubmitted ? Math.round((qcmAnswers.filter((a, i) => a === qcmQuestions[i]?.correct_answer).length / qcmQuestions.length) * 100) : null

  const TOOLS = [
    { id: 'mindmap' as Tool, label: 'Carte mentale', Icon: Brain },
    { id: 'qcm' as Tool, label: 'QCM', Icon: ClipboardText },
    { id: 'flashcards' as Tool, label: 'Flashcards', Icon: Cards },
    { id: 'question' as Tool, label: 'Question', Icon: ChatCircle },
  ]

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: 'var(--app-text-muted)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--app-text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--app-text-muted)' }}
        >
          <ArrowLeft size={14} />
          Mes Cours
        </button>
        <span style={{ color: 'var(--app-border)', fontSize: '13px' }}>/</span>
        <span style={{ fontSize: '13px', color: 'var(--app-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
          {item.content.title}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        {/* LEFT: Content */}
        <div>
          {/* Header card */}
          <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '14px', padding: '24px 28px', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '10px', letterSpacing: '-0.3px' }}>
              {item.content.title}
            </h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: item.content.summary ? '12px' : '0' }}>
              <span style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>Personnel</span>
              <span style={{ color: 'var(--app-border)' }}>·</span>
              <span style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>{item.content.duration_minutes} min</span>
              {item.content.file_name && (
                <>
                  <span style={{ color: 'var(--app-border)' }}>·</span>
                  <span style={{ fontSize: '12px', color: 'var(--app-text-ghost)' }}>{item.content.file_name}</span>
                </>
              )}
            </div>
            {item.content.summary && (
              <p style={{ fontSize: '13px', color: 'var(--app-text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--app-border)', paddingTop: '12px' }}>
                {item.content.summary}
              </p>
            )}
          </div>

          {/* Text content */}
          <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '14px', padding: '28px 32px' }}>
            {content ? (
              <pre style={{
                fontSize: '14px', color: 'var(--app-text)', lineHeight: 1.8,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                fontFamily: 'inherit', margin: 0,
              }}>
                {content}
              </pre>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--app-text-muted)', fontSize: '14px' }}>
                Contenu non disponible.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Tools */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '14px', overflow: 'hidden', marginBottom: activeTool ? '12px' : '0' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--app-border)' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--app-text-ghost)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Outils IA</p>
            </div>
            {TOOLS.map((tool, i) => {
              const isActive = activeTool === tool.id
              const isLast = i === TOOLS.length - 1
              return (
                <button key={tool.id} onClick={() => handleToolClick(tool.id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '13px 16px',
                  borderBottom: isLast ? 'none' : '1px solid var(--app-border)',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 150ms',
                }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.02)' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <tool.Icon size={17} weight={isActive ? 'fill' : 'regular'} style={{ color: isActive ? 'var(--accent)' : 'var(--app-text-muted)' }} />
                    <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--accent)' : 'var(--app-text)' }}>{tool.label}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {activeTool && (
            <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--app-border)' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--app-text)' }}>{TOOLS.find(t => t.id === activeTool)?.label}</p>
              </div>
              <div style={{ padding: '16px' }}>
                {activeTool === 'mindmap' && (
                  mindmapLoading ? <Spinner label="Génération..." /> :
                  mindmapMd ? <div ref={mindmapRef} style={{ width: '100%', minHeight: '280px', background: 'white', borderRadius: '8px' }} /> :
                  <EmptyPanel icon={<Brain size={28} />} label="Générer une carte mentale." onAction={generateMindmap} btnLabel="Générer" />
                )}
                {activeTool === 'qcm' && (
                  qcmLoading ? <Spinner label="Génération des QCM..." /> :
                  qcmQuestions.length === 0 ? <EmptyPanel icon={<ClipboardText size={28} />} label="Générer des QCM IA." onAction={generateQCM} btnLabel="Générer" /> :
                  <QCMView questions={qcmQuestions} answers={qcmAnswers} submitted={qcmSubmitted} score={qcmScore}
                    onAnswer={(qi, oi) => setQcmAnswers(p => { const n = [...p]; n[qi] = oi; return n })}
                    onSubmit={() => setQcmSubmitted(true)}
                    onReset={() => { setQcmSubmitted(false); setQcmAnswers(new Array(qcmQuestions.length).fill(null)) }}
                  />
                )}
                {activeTool === 'flashcards' && (
                  flashcardsLoading ? <Spinner label="Génération..." /> :
                  flashcards.length === 0 ? <EmptyPanel icon={<Cards size={28} />} label="Générer des flashcards IA." onAction={generateFlashcards} btnLabel="Générer" /> :
                  <FlashcardsView cards={flashcards} current={currentCard} revealed={revealed}
                    onReveal={() => setRevealed(!revealed)}
                    onPrev={() => { setCurrentCard(Math.max(0, currentCard - 1)); setRevealed(false) }}
                    onNext={() => { setCurrentCard(Math.min(flashcards.length - 1, currentCard + 1)); setRevealed(false) }}
                  />
                )}
                {activeTool === 'question' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea
                      value={question} onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), askQuestion())}
                      placeholder="Posez une question sur le cours..." rows={3}
                      style={{ width: '100%', resize: 'vertical', background: 'var(--app-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: 'var(--app-text)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                    <button onClick={askQuestion} disabled={questionLoading || !question.trim()}
                      style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, cursor: questionLoading || !question.trim() ? 'not-allowed' : 'pointer', opacity: questionLoading || !question.trim() ? 0.6 : 1 }}>
                      {questionLoading ? 'Réflexion...' : 'Envoyer →'}
                    </button>
                    {answer && (
                      <div style={{ background: 'var(--app-bg)', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '12px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Réponse</p>
                        <p style={{ fontSize: '13px', color: 'var(--app-text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{answer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Spinner({ label }: { label: string }) {
  return <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--app-text-muted)', fontSize: '13px' }}>{label}</div>
}

function EmptyPanel({ icon, label, onAction, btnLabel }: { icon: React.ReactNode; label: string; onAction: () => void; btnLabel: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', color: 'var(--app-text-ghost)' }}>{icon}</div>
      <p style={{ fontSize: '12px', color: 'var(--app-text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>{label}</p>
      <button onClick={onAction} style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{btnLabel}</button>
    </div>
  )
}

function QCMView({ questions, answers, submitted, score, onAnswer, onSubmit, onReset }: {
  questions: QCMQuestion[]; answers: (number | null)[]; submitted: boolean; score: number | null;
  onAnswer: (qi: number, oi: number) => void; onSubmit: () => void; onReset: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {submitted && score !== null && (
        <div style={{ textAlign: 'center', padding: '14px', background: score >= 60 ? 'rgba(16,185,129,0.08)' : 'rgba(232,85,85,0.08)', border: `1px solid ${score >= 60 ? 'rgba(16,185,129,0.2)' : 'rgba(232,85,85,0.2)'}`, borderRadius: '10px' }}>
          <p style={{ fontSize: '20px', fontWeight: 700, color: score >= 60 ? 'var(--success)' : '#E85555' }}>{score}%</p>
          <p style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>{answers.filter((a, i) => a === questions[i]?.correct_answer).length} / {questions.length}</p>
        </div>
      )}
      {questions.map((q, qi) => (
        <div key={qi}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--app-text)', marginBottom: '8px' }}>{qi + 1}. {q.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi
              const isCorrect = submitted && oi === q.correct_answer
              const isWrong = submitted && isSelected && oi !== q.correct_answer
              return (
                <button key={oi} onClick={() => !submitted && onAnswer(qi, oi)} style={{
                  textAlign: 'left', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: submitted ? 'default' : 'pointer', transition: 'all 150ms',
                  border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.4)' : isWrong ? 'rgba(232,85,85,0.4)' : isSelected ? 'var(--accent)' : 'var(--app-border)'}`,
                  background: isCorrect ? 'rgba(16,185,129,0.08)' : isWrong ? 'rgba(232,85,85,0.08)' : isSelected ? 'var(--accent-soft)' : 'transparent',
                  color: isCorrect ? 'var(--success)' : isWrong ? '#E85555' : isSelected ? 'var(--accent)' : 'var(--app-text)',
                }}>
                  <span style={{ fontWeight: 600, marginRight: '6px' }}>{['A', 'B', 'C', 'D', 'E'][oi]}.</span>{opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button onClick={onSubmit} disabled={answers.some(a => a === null)} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: answers.some(a => a === null) ? 'not-allowed' : 'pointer', opacity: answers.some(a => a === null) ? 0.5 : 1 }}>Valider</button>
      ) : (
        <button onClick={onReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'transparent', color: 'var(--app-text-muted)', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: 'pointer' }}>
          <ArrowClockwise size={13} /> Recommencer
        </button>
      )}
    </div>
  )
}

function FlashcardsView({ cards, current, revealed, onReveal, onPrev, onNext }: {
  cards: Flashcard[]; current: number; revealed: boolean; onReveal: () => void; onPrev: () => void; onNext: () => void;
}) {
  const card = cards[current]
  return (
    <div>
      <p style={{ fontSize: '11px', color: 'var(--app-text-ghost)', textAlign: 'center', marginBottom: '10px' }}>{current + 1} / {cards.length}</p>
      <div onClick={onReveal} style={{ background: 'var(--app-bg)', border: '1px solid var(--app-border)', borderRadius: '10px', padding: '20px 16px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '8px', textAlign: 'center' }}>
        {!revealed ? <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--app-text)', lineHeight: 1.5 }}>{card.front}</p> :
          <div>
            <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>Réponse</p>
            <p style={{ fontSize: '13px', color: 'var(--app-text)', lineHeight: 1.5 }}>{card.back}</p>
          </div>}
      </div>
      <p style={{ fontSize: '11px', color: 'var(--app-text-ghost)', textAlign: 'center', marginBottom: '12px' }}>Cliquez pour révéler</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onPrev} disabled={current === 0} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'transparent', color: 'var(--app-text-muted)', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.4 : 1 }}>
          <CaretLeft size={13} /> Préc.
        </button>
        <button onClick={onNext} disabled={current === cards.length - 1} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: 'transparent', color: 'var(--app-text-muted)', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: current === cards.length - 1 ? 'not-allowed' : 'pointer', opacity: current === cards.length - 1 ? 0.4 : 1 }}>
          Suiv. <CaretRight size={13} />
        </button>
      </div>
    </div>
  )
}
