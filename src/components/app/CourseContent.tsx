'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Course, QCMQuestion, Flashcard } from '@/types'
import { useAppStore } from '@/store/app'
import { formatMedicalContent } from '@/lib/formatMedicalContent'
import {
  Brain, Headphones, ClipboardText, Cards, ChatCircle,
  CheckCircle, ArrowClockwise, CaretLeft, CaretRight,
  ArrowRight, BookOpen, X, GitFork, ArrowsOut, DownloadSimple,
} from '@phosphor-icons/react'

interface CourseWithModule extends Course {
  modules: { name: string } | null
}

interface Props {
  course: CourseWithModule
  isPro: boolean
  userId: string
  moduleSlug: string
  isCompleted: boolean
  initialScore: number | null
}

type Tool = 'mindmap' | 'qcm' | 'flashcards' | 'audio' | 'question' | 'diagram'

const TOOLS: { id: Tool; label: string; Icon: React.ElementType; proOnly?: boolean }[] = [
  { id: 'mindmap', label: 'Carte mentale', Icon: Brain },
  { id: 'diagram', label: 'Schéma', Icon: GitFork },
  { id: 'qcm', label: 'QCM', Icon: ClipboardText },
  { id: 'flashcards', label: 'Flashcards', Icon: Cards },
  { id: 'audio', label: 'Audio', Icon: Headphones, proOnly: true },
  { id: 'question', label: 'Question', Icon: ChatCircle },
]

export default function CourseContent({ course, isPro, userId, isCompleted: initCompleted, initialScore }: Props) {
  const { addToast } = useAppStore()
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [completed, setCompleted] = useState(initCompleted)
  const [markingDone, setMarkingDone] = useState(false)

  // --- Mindmap ---
  const [mindmapMd, setMindmapMd] = useState<string | null>(null)
  const [mindmapLoading, setMindmapLoading] = useState(false)

  // --- Audio ---
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioLength, setAudioLength] = useState<'short' | 'default' | 'long' | null>(null)

  // --- QCM ---
  const [qcmQuestions, setQcmQuestions] = useState<QCMQuestion[]>([])
  const [qcmLoading, setQcmLoading] = useState(false)
  const [qcmAnswers, setQcmAnswers] = useState<(number | null)[]>([])
  const [qcmSubmitted, setQcmSubmitted] = useState(false)
  const [qcmSource, setQcmSource] = useState<'bank' | 'ai' | null>(null)

  // --- Flashcards ---
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [flashcardsLoading, setFlashcardsLoading] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)
  const [revealed, setRevealed] = useState(false)

  // --- Diagram (SMART images) ---
  type SmartImage = { title: string; url: string; thumbUrl: string }
  const [diagramImages, setDiagramImages] = useState<SmartImage[]>([])
  const [diagramKeywords, setDiagramKeywords] = useState<string[]>([])
  const [diagramLoading, setDiagramLoading] = useState(false)

  // --- Question ---
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [questionLoading, setQuestionLoading] = useState(false)

  // --- Mindmap fullscreen ---
  const [mindmapFullscreen, setMindmapFullscreen] = useState(false)

  async function generateMindmap() {
    if (mindmapMd) return
    setMindmapLoading(true)
    try {
      const res = await fetch('/api/ai/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, content: course.content }),
      })
      const data = await res.json()
      if (data.markdown) setMindmapMd(data.markdown)
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de générer la carte mentale.' })
    }
    setMindmapLoading(false)
  }

  // Mindmap rendering is handled inside MindmapPanel via its own useEffect,
  // so that the div ref is guaranteed to be mounted before the effect runs.

  async function generateDiagram() {
    if (diagramImages.length > 0) return
    setDiagramLoading(true)
    try {
      const res = await fetch('/api/ai/diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: course.content, title: course.title }),
      })
      const data = await res.json()
      if (data.images) setDiagramImages(data.images)
      if (data.keywords) setDiagramKeywords(data.keywords)
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger les illustrations.' })
    }
    setDiagramLoading(false)
  }

  async function generateAudio(len: 'short' | 'default' | 'long') {
    if (audioLoading) return
    setAudioLoading(true)
    setAudioLength(len)
    setAudioUrl(null)
    try {
      const res = await fetch('/api/ai/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: course.content, title: course.title, length: len }),
      })
      if (!res.ok) throw new Error('failed')
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
        setQcmSource(data.source === 'bank' ? 'bank' : 'ai')
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
      if (data.flashcards) setFlashcards(data.flashcards)
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

  function handleToolClick(tool: Tool) {
    const isProTool = TOOLS.find(t => t.id === tool)?.proOnly
    if (isProTool && !isPro) return
    setActiveTool(activeTool === tool ? null : tool)
    // audio: open panel, user picks length there
    if (tool === 'qcm' && activeTool !== 'qcm') generateQCM()
    if (tool === 'flashcards' && activeTool !== 'flashcards') generateFlashcards()
    if (tool === 'mindmap' && activeTool !== 'mindmap') generateMindmap()
    if (tool === 'diagram' && activeTool !== 'diagram' && diagramImages.length === 0) generateDiagram()
  }

  async function markComplete() {
    if (markingDone) return
    setMarkingDone(true)
    try {
      await fetch('/api/progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id }),
      })
      setCompleted(true)
      addToast({ type: 'success', title: 'Cours complété !', message: 'Votre progression a été enregistrée.' })
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible d\'enregistrer la progression.' })
    }
    setMarkingDone(false)
  }

  const qcmScore = qcmSubmitted
    ? Math.round((qcmAnswers.filter((a, i) => a === qcmQuestions[i]?.correct_answer).length / qcmQuestions.length) * 100)
    : null

  const formattedContent = course.content ? formatMedicalContent(course.content) : null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 192px', gap: '28px', alignItems: 'start' }}>

      {/* ── LEFT: content ── */}
      <div>

      {/* ── Course header ── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.4px', lineHeight: 1.3, marginBottom: '10px' }}>
          {course.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>{course.modules?.name}</span>
          <span style={{ color: 'var(--app-border)' }}>·</span>
          <span style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>{course.duration_minutes} min</span>
          <span style={{ color: 'var(--app-border)' }}>·</span>
          <span style={{ fontSize: '12px', color: 'var(--app-text-muted)', textTransform: 'capitalize' }}>{course.difficulty}</span>
        </div>
        {course.summary && (
          <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', lineHeight: 1.6, marginTop: '10px', borderTop: '1px solid var(--app-border)', paddingTop: '10px' }}>
            {course.summary}
          </p>
        )}
      </div>

      {/* ── Course content ── */}
      <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '16px', padding: '40px 48px', marginBottom: '20px' }}>
        {formattedContent ? (
          <div className="prose-tutor">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{formattedContent}</ReactMarkdown>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--app-text-muted)', fontSize: '14px' }}>
            <BookOpen size={32} style={{ color: 'var(--app-border)', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
            <p>Le contenu de ce cours n&apos;est pas encore disponible.</p>
          </div>
        )}
      </div>

      </div>{/* end LEFT */}

      {/* ── RIGHT: Sticky toolbar ── */}
      <div style={{ position: 'sticky', top: '80px' }}>
        <div style={{
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--app-text-ghost)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Outils IA
            </p>
            {completed && <CheckCircle size={13} weight="fill" style={{ color: 'var(--success)', flexShrink: 0 }} />}
          </div>
          {TOOLS.map((tool, idx) => {
            const isProTool = tool.proOnly && !isPro
            const isActive = activeTool === tool.id
            const isLast = idx === TOOLS.length - 1
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                disabled={isProTool}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', padding: '10px 14px',
                  borderBottom: isLast ? 'none' : '1px solid var(--app-border)',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  border: 'none',
                  cursor: isProTool ? 'not-allowed' : 'pointer',
                  opacity: isProTool ? 0.45 : 1,
                  transition: 'background 150ms',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => { if (!isActive && !isProTool) e.currentTarget.style.background = 'var(--app-surface-hover, rgba(0,0,0,0.025))' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <tool.Icon size={15} weight={isActive ? 'fill' : 'regular'} style={{ color: isActive ? 'var(--accent)' : 'var(--app-text-muted)', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--accent)' : 'var(--app-text)', flex: 1 }}>
                  {tool.label}
                </span>
                {tool.proOnly && !isPro && (
                  <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', padding: '1px 5px', borderRadius: '999px' }}>PRO</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Complete button */}
        <div style={{ marginTop: '8px' }}>
          {completed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>
              <CheckCircle size={13} weight="fill" /> Complété
            </div>
          ) : (
            <button
              onClick={markComplete}
              disabled={markingDone}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', padding: '9px', fontSize: '12px', fontWeight: 600, cursor: markingDone ? 'not-allowed' : 'pointer', opacity: markingDone ? 0.7 : 1 }}
            >
              <CheckCircle size={13} weight="bold" />
              {markingDone ? '...' : 'Marquer complété'}
            </button>
          )}
        </div>
      </div>{/* end RIGHT */}

      {/* ── Tool panel: fixed overlay when active ── */}
      {activeTool && (
        <div style={{
          position: 'fixed',
          right: '24px',
          top: '80px',
          width: '360px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          zIndex: 50,
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--app-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--app-surface)', zIndex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--app-text)' }}>
              {TOOLS.find(t => t.id === activeTool)?.label}
            </p>
            <button onClick={() => setActiveTool(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}>
              <X size={15} />
            </button>
          </div>
          <div style={{ padding: '16px' }}>
            {activeTool === 'mindmap' && (
              <MindmapPanel
                loading={mindmapLoading}
                markdown={mindmapMd}
                onGenerate={generateMindmap}
                onFullscreen={() => setMindmapFullscreen(true)}
              />
            )}
            {activeTool === 'diagram' && (
              <DiagramPanel
                loading={diagramLoading}
                images={diagramImages}
                keywords={diagramKeywords}
                onGenerate={generateDiagram}
              />
            )}
            {activeTool === 'audio' && (
              <AudioPanel
                loading={audioLoading}
                audioUrl={audioUrl}
                length={audioLength}
                onGenerate={generateAudio}
              />
            )}
            {activeTool === 'qcm' && (
              <QCMPanel
                loading={qcmLoading}
                questions={qcmQuestions}
                answers={qcmAnswers}
                submitted={qcmSubmitted}
                score={qcmScore}
                source={qcmSource}
                onAnswer={(qi, oi) => setQcmAnswers(prev => { const n = [...prev]; n[qi] = oi; return n })}
                onSubmit={() => setQcmSubmitted(true)}
                onReset={() => { setQcmSubmitted(false); setQcmAnswers(new Array(qcmQuestions.length).fill(null)) }}
                onGenerate={generateQCM}
              />
            )}
            {activeTool === 'flashcards' && (
              <FlashcardsPanel
                loading={flashcardsLoading}
                flashcards={flashcards}
                currentCard={currentCard}
                revealed={revealed}
                onReveal={() => setRevealed(!revealed)}
                onPrev={() => { setCurrentCard(Math.max(0, currentCard - 1)); setRevealed(false) }}
                onNext={() => { setCurrentCard(Math.min(flashcards.length - 1, currentCard + 1)); setRevealed(false) }}
                onGenerate={generateFlashcards}
              />
            )}
            {activeTool === 'question' && (
              <QuestionPanel
                question={question}
                answer={answer}
                loading={questionLoading}
                onChange={setQuestion}
                onAsk={askQuestion}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Mindmap fullscreen modal ── */}
      {mindmapFullscreen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', flexDirection: 'column',
          }}
          onClick={() => setMindmapFullscreen(false)}
        >
          <div
            style={{
              flex: 1, margin: '32px', background: 'white',
              borderRadius: '16px', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid var(--app-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--app-surface)',
            }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--app-text)' }}>Carte mentale</p>
              <button
                onClick={() => setMindmapFullscreen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
              >
                <X size={16} />
              </button>
            </div>
            <MindmapFullscreenContent markdown={mindmapMd} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Tool Panels ── */

function MindmapPanel({ loading, markdown, onGenerate, onFullscreen }: {
  loading: boolean; markdown: string | null;
  onGenerate: () => void; onFullscreen: () => void
}) {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!markdown || !divRef.current) return
    const container = divRef.current
    import('markmap-lib').then(({ Transformer }) => {
      import('markmap-view').then(({ Markmap }: { Markmap: any }) => {
        const { root } = new Transformer().transform(markdown)
        container.innerHTML = ''
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.style.width = '100%'
        svg.style.height = '100%'
        svg.style.minHeight = '380px'
        container.appendChild(svg)
        Markmap.create(svg, undefined, root)
      })
    })
  }, [markdown])

  function exportPNG() {
    if (!divRef.current) return
    const svgEl = divRef.current.querySelector('svg')
    if (!svgEl) return
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const canvas = document.createElement('canvas')
    const bbox = svgEl.getBoundingClientRect()
    canvas.width = bbox.width * 2
    canvas.height = bbox.height * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const a = document.createElement('a')
      a.download = 'carte-mentale.png'
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  if (loading) return <LoadingState label="Génération de la carte mentale..." />
  if (markdown) return (
    <div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={exportPNG}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'transparent', border: '1px solid var(--app-border)',
            borderRadius: '6px', padding: '4px 8px',
            fontSize: '11px', color: 'var(--app-text-muted)', cursor: 'pointer',
          }}
        >
          <DownloadSimple size={12} /> PNG
        </button>
        <button
          onClick={onFullscreen}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'transparent', border: '1px solid var(--app-border)',
            borderRadius: '6px', padding: '4px 8px',
            fontSize: '11px', color: 'var(--app-text-muted)', cursor: 'pointer',
          }}
        >
          <ArrowsOut size={12} /> Plein écran
        </button>
      </div>
      <div ref={divRef} style={{ width: '100%', height: '380px', borderRadius: '8px', overflow: 'hidden', background: 'white' }} />
    </div>
  )
  return (
    <EmptyState
      icon={<Brain size={28} style={{ color: 'var(--app-text-ghost)' }} />}
      label="Générez une carte mentale à partir du cours."
      buttonLabel="Générer"
      onAction={onGenerate}
    />
  )
}

function MindmapFullscreenContent({ markdown }: { markdown: string | null }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!markdown || !ref.current) return
    const container = ref.current
    import('markmap-lib').then(({ Transformer }) => {
      import('markmap-view').then(({ Markmap }: { Markmap: any }) => {
        const { root } = new Transformer().transform(markdown)
        container.innerHTML = ''
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.style.width = '100%'
        svg.style.height = '100%'
        container.appendChild(svg)
        Markmap.create(svg, undefined, root)
      })
    })
  }, [markdown])
  return <div ref={ref} style={{ flex: 1, background: 'white', overflow: 'hidden' }} />
}

type SmartImage = { title: string; url: string; thumbUrl: string }

function DiagramPanel({ loading, images, keywords, onGenerate }: {
  loading: boolean
  images: SmartImage[]
  keywords: string[]
  onGenerate: () => void
}) {
  const [lightbox, setLightbox] = useState<SmartImage | null>(null)

  if (loading) return <LoadingState label="Recherche d'illustrations médicales..." />

  if (images.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {keywords.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {keywords.map(k => (
            <span key={k} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', color: 'var(--app-text-muted)', fontWeight: 500 }}>
              {k}
            </span>
          ))}
        </div>
      )}
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--app-text-muted)', fontSize: '13px' }}>
        Aucune illustration trouvée pour ce cours.
      </div>
      <button onClick={onGenerate} style={{ background: 'none', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '6px', fontSize: '11px', color: 'var(--app-text-muted)', cursor: 'pointer' }}>
        Réessayer
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {keywords.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {keywords.map(k => (
            <span key={k} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '999px', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 500 }}>
              {k}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setLightbox(img)}
            style={{
              background: 'white', border: '1px solid var(--app-border)',
              borderRadius: '6px', overflow: 'hidden', cursor: 'zoom-in',
              padding: 0, aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title={img.title}
          >
            <img
              src={img.thumbUrl}
              alt={img.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              loading="lazy"
            />
          </button>
        ))}
      </div>
      <p style={{ fontSize: '10px', color: 'var(--app-text-ghost)', textAlign: 'center' }}>
        Servier Medical Art · CC BY 4.0
      </p>
      <button
        onClick={onGenerate}
        style={{ background: 'none', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '6px', fontSize: '11px', color: 'var(--app-text-muted)', cursor: 'pointer' }}
      >
        Actualiser la recherche
      </button>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--app-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--app-text)', flex: 1 }}>{lightbox.title}</p>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <a
                  href={lightbox.url}
                  download
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <DownloadSimple size={13} /> PNG
                </a>
                <button onClick={() => setLightbox(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--app-text-muted)', display: 'flex' }}>
                  <X size={15} />
                </button>
              </div>
            </div>
            <img src={lightbox.url} alt={lightbox.title} style={{ maxWidth: '80vw', maxHeight: '70vh', objectFit: 'contain' }} />
            <p style={{ fontSize: '10px', color: 'var(--app-text-ghost)', textAlign: 'center', padding: '6px' }}>Servier Medical Art · CC BY 4.0</p>
          </div>
        </div>
      )}
    </div>
  )
}

const AUDIO_LENGTHS: { len: 'short' | 'default' | 'long'; label: string; desc: string; emoji: string }[] = [
  { len: 'short',   label: 'Résumé rapide',     desc: '~3 min · points essentiels',      emoji: '⚡' },
  { len: 'default', label: 'Narration complète', desc: '~8 min · cours complet narré',    emoji: '🎙️' },
  { len: 'long',    label: 'Version approfondie',desc: '~15 min · tout dans le détail',   emoji: '📚' },
]

function AudioPanel({ loading, audioUrl, length, onGenerate }: {
  loading: boolean
  audioUrl: string | null
  length: 'short' | 'default' | 'long' | null
  onGenerate: (len: 'short' | 'default' | 'long') => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  function togglePlay() {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else { el.play(); setPlaying(true) }
  }

  function fmt(s: number) {
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }

  if (loading) {
    const opt = AUDIO_LENGTHS.find(o => o.len === length)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '12px 0' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid var(--app-border)', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '13px', color: 'var(--app-text-muted)', textAlign: 'center' }}>
          {opt?.emoji} Génération en cours...
        </p>
        <p style={{ fontSize: '11px', color: 'var(--app-text-ghost)', textAlign: 'center' }}>
          Claude prépare la narration, ElevenLabs génère l&apos;audio.
        </p>
      </div>
    )
  }

  if (audioUrl) {
    const opt = AUDIO_LENGTHS.find(o => o.len === length)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ background: 'var(--accent-soft)', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: 'var(--accent)', fontWeight: 500 }}>
          {opt?.emoji} {opt?.label}
        </div>
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            const el = audioRef.current
            if (!el || !el.duration) return
            setCurrentTime(el.currentTime)
            setProgress((el.currentTime / el.duration) * 100)
          }}
          onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration) }}
          onEnded={() => setPlaying(false)}
          style={{ display: 'none' }}
        />
        <button
          onClick={togglePlay}
          style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent)', border: 'none', cursor: 'pointer', color: 'white', fontSize: '18px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: 'var(--app-text-muted)', minWidth: '28px' }}>{fmt(currentTime)}</span>
          <input type="range" min={0} max={100} value={progress}
            onChange={e => { const el = audioRef.current; if (!el) return; el.currentTime = (parseFloat(e.target.value) / 100) * el.duration; setProgress(parseFloat(e.target.value)) }}
            style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer', height: '4px' }}
          />
          <span style={{ fontSize: '10px', color: 'var(--app-text-muted)', minWidth: '28px', textAlign: 'right' }}>{duration ? fmt(duration) : '--:--'}</span>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--app-text-ghost)', textAlign: 'center' }}>Narration · ElevenLabs TTS</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {AUDIO_LENGTHS.filter(o => o.len !== length).map(opt => (
            <button key={opt.len} onClick={() => onGenerate(opt.len)}
              style={{ background: 'none', border: '1px solid var(--app-border)', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', color: 'var(--app-text-muted)', cursor: 'pointer', textAlign: 'left' }}>
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <p style={{ fontSize: '11px', color: 'var(--app-text-ghost)', marginBottom: '4px' }}>
        Narration du cours · Choisissez un format
      </p>
      {AUDIO_LENGTHS.map(opt => (
        <button key={opt.len} onClick={() => onGenerate(opt.len)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--app-border)', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 150ms' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <span style={{ fontSize: '18px', flexShrink: 0 }}>{opt.emoji}</span>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)' }}>{opt.label}</p>
            <p style={{ fontSize: '11px', color: 'var(--app-text-ghost)' }}>{opt.desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function QCMPanel({ loading, questions, answers, submitted, score, source, onAnswer, onSubmit, onReset, onGenerate }: {
  loading: boolean; questions: QCMQuestion[]; answers: (number | null)[];
  submitted: boolean; score: number | null; source: 'bank' | 'ai' | null;
  onAnswer: (qi: number, oi: number) => void
  onSubmit: () => void; onReset: () => void; onGenerate: () => void
}) {
  if (loading) return <LoadingState label="Génération des QCM..." />
  if (questions.length === 0) return (
    <EmptyState
      icon={<ClipboardText size={28} style={{ color: 'var(--app-text-ghost)' }} />}
      label="Générez des QCM spécifiques à ce cours pour tester vos connaissances."
      buttonLabel="Générer les QCM"
      onAction={onGenerate}
    />
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {source && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px',
            padding: '2px 8px', borderRadius: '999px',
            background: source === 'bank' ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.1)',
            color: source === 'bank' ? 'var(--success)' : '#8B5CF6',
            border: `1px solid ${source === 'bank' ? 'rgba(16,185,129,0.25)' : 'rgba(139,92,246,0.25)'}`,
          }}>
            {source === 'bank' ? 'Banque officielle' : 'Généré par IA'}
          </span>
        </div>
      )}
      {submitted && score !== null && (
        <div style={{
          textAlign: 'center', padding: '14px',
          background: score >= 60 ? 'rgba(16,185,129,0.08)' : 'rgba(232,85,85,0.08)',
          border: `1px solid ${score >= 60 ? 'rgba(16,185,129,0.2)' : 'rgba(232,85,85,0.2)'}`,
          borderRadius: '10px',
        }}>
          <p style={{ fontSize: '20px', fontWeight: 700, color: score >= 60 ? 'var(--success)' : '#E85555' }}>
            {score}%
          </p>
          <p style={{ fontSize: '12px', color: 'var(--app-text-muted)' }}>
            {answers.filter((a, i) => a === questions[i]?.correct_answer).length} / {questions.length} bonnes réponses
          </p>
        </div>
      )}
      {questions.map((q, qi) => (
        <div key={qi}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--app-text)', marginBottom: '8px' }}>
            {qi + 1}. {q.question}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi
              const isCorrect = submitted && oi === q.correct_answer
              const isWrong = submitted && isSelected && oi !== q.correct_answer
              return (
                <button
                  key={oi}
                  onClick={() => !submitted && onAnswer(qi, oi)}
                  style={{
                    textAlign: 'left', padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.4)' : isWrong ? 'rgba(232,85,85,0.4)' : isSelected ? 'var(--accent)' : 'var(--app-border)'}`,
                    background: isCorrect ? 'rgba(16,185,129,0.08)' : isWrong ? 'rgba(232,85,85,0.08)' : isSelected ? 'var(--accent-soft)' : 'transparent',
                    color: isCorrect ? 'var(--success)' : isWrong ? '#E85555' : isSelected ? 'var(--accent)' : 'var(--app-text)',
                    fontSize: '12px', cursor: submitted ? 'default' : 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  <span style={{ fontWeight: 600, marginRight: '6px' }}>{['A', 'B', 'C', 'D', 'E'][oi]}.</span>
                  {opt}
                </button>
              )
            })}
          </div>
          {submitted && q.explanation && (
            <p style={{
              fontSize: '11px', color: 'var(--app-text-muted)',
              background: 'var(--app-bg)', borderRadius: '6px',
              padding: '8px 10px', marginTop: '6px',
            }}>
              {q.explanation}
            </p>
          )}
        </div>
      ))}
      {!submitted ? (
        <button
          onClick={onSubmit}
          disabled={answers.some(a => a === null)}
          style={{
            background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: '8px',
            padding: '10px', fontSize: '13px', fontWeight: 600,
            cursor: answers.some(a => a === null) ? 'not-allowed' : 'pointer',
            opacity: answers.some(a => a === null) ? 0.5 : 1,
          }}
        >
          Valider mes réponses
        </button>
      ) : (
        <button
          onClick={onReset}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: 'transparent', color: 'var(--app-text-muted)',
            border: '1px solid var(--app-border)', borderRadius: '8px',
            padding: '8px', fontSize: '12px', cursor: 'pointer',
          }}
        >
          <ArrowClockwise size={13} />
          Recommencer
        </button>
      )}
    </div>
  )
}

function FlashcardsPanel({ loading, flashcards, currentCard, revealed, onReveal, onPrev, onNext, onGenerate }: {
  loading: boolean; flashcards: Flashcard[]; currentCard: number;
  revealed: boolean; onReveal: () => void; onPrev: () => void; onNext: () => void; onGenerate: () => void
}) {
  if (loading) return <LoadingState label="Génération des flashcards..." />
  if (flashcards.length === 0) return (
    <EmptyState
      icon={<Cards size={28} style={{ color: 'var(--app-text-ghost)' }} />}
      label="Révisez avec des flashcards générées par IA."
      buttonLabel="Générer les flashcards"
      onAction={onGenerate}
    />
  )
  const card = flashcards[currentCard]
  return (
    <div>
      <p style={{ fontSize: '11px', color: 'var(--app-text-ghost)', textAlign: 'center', marginBottom: '10px' }}>
        {currentCard + 1} / {flashcards.length}
      </p>
      {/* Flip card container */}
      <div
        onClick={onReveal}
        style={{
          perspective: '1000px',
          minHeight: '140px',
          marginBottom: '8px',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '140px',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
            transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front face */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'var(--app-bg)',
              border: '1px solid var(--app-border)',
              borderRadius: '10px',
              padding: '20px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--app-text)', lineHeight: 1.5 }}>
              {card.front}
            </p>
          </div>
          {/* Back face */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-glow, rgba(59,130,246,0.2))',
              borderRadius: '10px',
              padding: '20px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Réponse
            </p>
            <p style={{ fontSize: '13px', color: 'var(--app-text)', lineHeight: 1.5 }}>
              {card.back}
            </p>
          </div>
        </div>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--app-text-ghost)', textAlign: 'center', marginBottom: '12px' }}>
        Cliquez pour retourner
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onPrev}
          disabled={currentCard === 0}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            background: 'transparent', color: 'var(--app-text-muted)',
            border: '1px solid var(--app-border)', borderRadius: '8px',
            padding: '8px', fontSize: '12px', cursor: currentCard === 0 ? 'not-allowed' : 'pointer',
            opacity: currentCard === 0 ? 0.4 : 1,
          }}
        >
          <CaretLeft size={13} /> Préc.
        </button>
        <button
          onClick={onNext}
          disabled={currentCard === flashcards.length - 1}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            background: 'transparent', color: 'var(--app-text-muted)',
            border: '1px solid var(--app-border)', borderRadius: '8px',
            padding: '8px', fontSize: '12px', cursor: currentCard === flashcards.length - 1 ? 'not-allowed' : 'pointer',
            opacity: currentCard === flashcards.length - 1 ? 0.4 : 1,
          }}
        >
          Suiv. <CaretRight size={13} />
        </button>
      </div>
    </div>
  )
}

function QuestionPanel({ question, answer, loading, onChange, onAsk }: {
  question: string; answer: string | null; loading: boolean;
  onChange: (v: string) => void; onAsk: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <textarea
        value={question}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onAsk())}
        placeholder="Posez une question sur le cours..."
        rows={3}
        style={{
          width: '100%', resize: 'vertical',
          background: 'var(--app-bg)',
          border: '1px solid var(--app-border)',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '13px', color: 'var(--app-text)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <button
        onClick={onAsk}
        disabled={loading || !question.trim()}
        style={{
          background: 'var(--accent)', color: 'white',
          border: 'none', borderRadius: '8px',
          padding: '9px', fontSize: '13px', fontWeight: 600,
          cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
          opacity: loading || !question.trim() ? 0.6 : 1,
        }}
      >
        {loading ? 'Réflexion...' : 'Envoyer →'}
      </button>
      {answer && (
        <div style={{
          background: 'var(--app-bg)',
          border: '1px solid var(--app-border)',
          borderRadius: '8px',
          padding: '12px',
        }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Réponse
          </p>
          <p style={{ fontSize: '13px', color: 'var(--app-text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

function LoadingState({ label }: { label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--app-text-muted)', fontSize: '13px' }}>
      <div style={{ marginBottom: '8px', opacity: 0.5 }}>⏳</div>
      {label}
    </div>
  )
}

function EmptyState({ icon, label, buttonLabel, onAction }: {
  icon: React.ReactNode; label: string; buttonLabel: string; onAction: () => void
}) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <p style={{ fontSize: '12px', color: 'var(--app-text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>{label}</p>
      <button
        onClick={onAction}
        style={{
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          border: '1px solid var(--accent-glow, rgba(59,130,246,0.2))',
          borderRadius: '8px', padding: '8px 16px',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
