'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app'

/* ── Owl SVG (geometric, minimal) ── */
function OwlSVG({ size = 56, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 64" fill="none" aria-hidden>
      {/* Ear tufts */}
      <path d="M16 20 L12 6 L22 16Z" fill="var(--owl-body)" />
      <path d="M40 20 L44 6 L34 16Z" fill="var(--owl-body)" />
      {/* Body */}
      <ellipse cx="28" cy="40" rx="18" ry="20" fill="var(--owl-body)" />
      {/* Chest lighter patch */}
      <ellipse cx="28" cy="44" rx="10" ry="13" fill="rgba(255,255,255,0.06)" />
      {/* Eye rings */}
      <circle cx="19" cy="34" r="8"
        fill={glow ? 'rgba(196,149,74,0.18)' : 'rgba(196,149,74,0.10)'}
        stroke="var(--owl-gold)" strokeWidth="1.5"
      />
      <circle cx="37" cy="34" r="8"
        fill={glow ? 'rgba(196,149,74,0.18)' : 'rgba(196,149,74,0.10)'}
        stroke="var(--owl-gold)" strokeWidth="1.5"
      />
      {/* Pupils — animated blink via CSS class */}
      <ellipse cx="19" cy="34" rx="4" ry="4" fill="var(--owl-gold)" className="owl-eye" />
      <circle cx="20.2" cy="32.8" r="1.2" fill="white" opacity="0.85" />
      <ellipse cx="37" cy="34" rx="4" ry="4" fill="var(--owl-gold)" className="owl-eye owl-eye-r" />
      <circle cx="38.2" cy="32.8" r="1.2" fill="white" opacity="0.85" />
      {/* Beak */}
      <path d="M25.5 41 L28 44.5 L30.5 41Z" fill="var(--owl-gold)" opacity="0.75" />
    </svg>
  )
}

/* ── Mood face SVG (5 moods, no emojis) ── */
const MOUTH_PATHS = [
  'M 10 20 Q 16 14 22 20',  // 1 — sad
  'M 10 19 Q 16 15 22 19',  // 2 — slightly sad
  'M 10 18 L 22 18',        // 3 — neutral
  'M 10 18 Q 16 22 22 18',  // 4 — happy
  'M 9 17 Q 16 24 23 17',   // 5 — very happy
]
const MOOD_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981']
const MOOD_LABELS = ['Épuisé', 'Difficile', 'Neutre', 'Bien', 'Excellent']

function MoodFace({ mood, selected, onClick }: {
  mood: number; selected: boolean; onClick: () => void
}) {
  const color = MOOD_COLORS[mood - 1]
  const mouth = MOUTH_PATHS[mood - 1]
  return (
    <button
      onClick={onClick}
      title={MOOD_LABELS[mood - 1]}
      style={{
        background: 'none', border: 'none', padding: '4px',
        cursor: 'pointer', borderRadius: '50%',
        transform: selected ? 'scale(1.15)' : 'scale(1)',
        transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <svg viewBox="0 0 32 32" width="40" height="40">
        <circle cx="16" cy="16" r="14"
          fill={selected ? color + '18' : 'var(--app-bg)'}
          stroke={selected ? color : 'var(--app-border)'}
          strokeWidth={selected ? 2 : 1.5}
        />
        {/* Eyes */}
        <circle cx="11" cy="13" r={mood === 1 ? 1.5 : 2}
          fill={selected ? color : 'var(--app-text-ghost)'}
        />
        <circle cx="21" cy="13" r={mood === 1 ? 1.5 : 2}
          fill={selected ? color : 'var(--app-text-ghost)'}
        />
        {/* Eyebrows for sad */}
        {mood <= 2 && (
          <>
            <path d="M8.5 10 Q11 8.5 13.5 10" stroke={selected ? color : 'var(--app-text-ghost)'} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M18.5 10 Q21 8.5 23.5 10" stroke={selected ? color : 'var(--app-text-ghost)'} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </>
        )}
        {/* Mouth */}
        <path d={mouth} stroke={selected ? color : 'var(--app-text-ghost)'}
          strokeWidth="2" fill="none" strokeLinecap="round"
        />
      </svg>
    </button>
  )
}

/* ── Spontaneous message bubble ── */
function SpontaneousMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.3 }}
      onClick={onDismiss}
      style={{
        position: 'absolute', right: '70px', top: '50%',
        transform: 'translateY(-50%)',
        background: 'var(--app-surface)',
        border: '1px solid var(--app-border)',
        borderRadius: '10px',
        padding: '8px 14px',
        fontSize: '13px', fontWeight: 500,
        color: 'var(--app-text-body)',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {message}
    </motion.div>
  )
}

/* ── Main component ── */
export default function OwlJournal() {
  const { user, addToast } = useAppStore()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [mood, setMood] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [spontaneous, setSpontaneous] = useState<string | null>(null)
  const [history, setHistory] = useState<Array<{ id: string; content: string; mood: number | null; created_at: string; ai_feedback?: string | null }>>([])
  const [historyExpanded, setHistoryExpanded] = useState<string | null>(null)

  /* Load history when panel opens */
  useEffect(() => {
    if (!open || !user) return
    const supabase = createClient()
    supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => setHistory(data ?? []))
  }, [open, user])

  /* Spontaneous messages (max once per 24h) */
  useEffect(() => {
    const lastMsg = localStorage.getItem('tutor_owl_last_msg')
    const now = Date.now()
    if (lastMsg && now - parseInt(lastMsg) < 86_400_000) return

    const day = new Date().getDay()
    const isMonday = day === 1
    const rand = Math.random()

    if (isMonday && rand < 0.25) {
      setTimeout(() => {
        setSpontaneous('Nouvelle semaine. On repart.')
        localStorage.setItem('tutor_owl_last_msg', String(now))
      }, 4000)
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) return
    setLoading(true)
    setResponse(null)

    try {
      const supabase = createClient()
      const res = await fetch('/api/ai/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, mood }),
      })
      const json = await res.json()
      const feedback = json.feedback ?? ''

      await supabase.from('journal_entries').insert({
        content: text,
        mood: mood ?? 3,
        ai_feedback: feedback,
      })

      setResponse(feedback)
      setText('')
      setMood(null)
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible d\'obtenir un retour.' })
    }
    setLoading(false)
  }, [text, mood, addToast])

  return (
    <>
      {/* Owl peeking from right edge */}
      <motion.div
        style={{
          position: 'fixed',
          right: 0,
          bottom: '30%',
          zIndex: 50,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
        animate={{ x: hovered || open ? 0 : 28 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onMouseEnter={() => !open && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { setOpen(true); setHovered(false) }}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {hovered && !open && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              style={{
                position: 'absolute', right: '72px',
                background: 'var(--app-surface)',
                border: '1px solid var(--app-border)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'var(--app-text-muted)',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            >
              Mon journal
            </motion.span>
          )}
        </AnimatePresence>

        {/* Owl body */}
        <motion.div
          animate={{ rotate: hovered ? 0 : 0 }}
          style={{ animation: 'owl-sway 6s ease-in-out infinite' }}
        >
          <OwlSVG size={56} glow={hovered} />
        </motion.div>
      </motion.div>

      {/* Spontaneous message */}
      <AnimatePresence>
        {spontaneous && !open && (
          <SpontaneousMessage
            message={spontaneous}
            onDismiss={() => setSpontaneous(null)}
          />
        )}
      </AnimatePresence>

      {/* Journal panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 55,
                background: 'rgba(0,0,0,0.04)',
              }}
            />

            {/* Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              style={{
                position: 'fixed', right: 0, top: '64px', bottom: 0,
                width: '360px', zIndex: 60,
                background: 'var(--app-surface)',
                borderLeft: '1px solid var(--app-border)',
                boxShadow: '-8px 0 24px rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--app-border)',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <OwlSVG size={44} glow />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--app-text)' }}>
                    Mon journal
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--app-text-muted)', marginTop: '2px' }}>
                    Comment s&apos;est passée ta journée ?
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '6px', borderRadius: '8px',
                    color: 'var(--app-text-muted)',
                    display: 'flex', alignItems: 'center',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--app-surface-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                {/* Mood */}
                <p style={{
                  fontSize: '12px', fontWeight: 500, textTransform: 'uppercase',
                  letterSpacing: '1.5px', color: 'var(--app-text-muted)',
                  marginBottom: '12px',
                }}>
                  Comment tu te sens ?
                </p>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                  {[1, 2, 3, 4, 5].map((m) => (
                    <MoodFace key={m} mood={m} selected={mood === m} onClick={() => setMood(m)} />
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Qu'est-ce qui t'a marqué aujourd'hui ?"
                  rows={4}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--app-bg)',
                    border: '1px solid var(--app-border)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontFamily: 'inherit', fontSize: '14px',
                    color: 'var(--app-text)',
                    resize: 'none', outline: 'none',
                    lineHeight: 1.6,
                    transition: 'border-color 200ms',
                    marginBottom: '12px',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)' }}
                />

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !text.trim()}
                  style={{
                    width: '100%', padding: '13px',
                    background: text.trim() ? 'var(--accent)' : 'var(--app-border)',
                    color: text.trim() ? 'white' : 'var(--app-text-ghost)',
                    border: 'none', borderRadius: '12px',
                    fontFamily: 'inherit', fontSize: '14px', fontWeight: 600,
                    cursor: text.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)',
                    boxShadow: text.trim() ? '0 0 0 3px var(--accent-glow)' : 'none',
                    marginBottom: '20px',
                  }}
                >
                  {loading ? 'En cours...' : 'Obtenir mon feedback'}
                </button>

                {/* AI Response */}
                <AnimatePresence>
                  {response && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'var(--accent-soft)',
                        border: '1px solid rgba(59,130,246,0.15)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        marginBottom: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <OwlSVG size={24} />
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', marginBottom: '6px' }}>
                            TUTOR
                          </p>
                          <p style={{ fontSize: '14px', color: 'var(--app-text-body)', lineHeight: 1.6 }}>
                            {response}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* History */}
                {history.length > 0 && (
                  <>
                    <p style={{
                      fontSize: '12px', fontWeight: 500, textTransform: 'uppercase',
                      letterSpacing: '1.5px', color: 'var(--app-text-muted)',
                      marginBottom: '10px',
                    }}>
                      Historique
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {history.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => setHistoryExpanded(historyExpanded === entry.id ? null : entry.id)}
                          style={{
                            background: 'var(--app-bg)',
                            border: '1px solid var(--app-border)',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            textAlign: 'left', cursor: 'pointer',
                            transition: 'border-color 150ms',
                            width: '100%',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--app-border-hover)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--app-border)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--app-text-muted)' }}>
                              {new Date(entry.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'short',
                              })}
                            </span>
                            {entry.mood && (
                              <span style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: MOOD_COLORS[(entry.mood ?? 3) - 1],
                                display: 'inline-block', marginTop: '2px',
                              }} />
                            )}
                          </div>
                          <p style={{
                            fontSize: '13px', color: 'var(--app-text-body)',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: historyExpanded === entry.id ? 'unset' : 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.5,
                          }}>
                            {entry.content}
                          </p>
                          {historyExpanded === entry.id && entry.ai_feedback && (
                            <div style={{
                              marginTop: '8px', paddingTop: '8px',
                              borderTop: '1px solid var(--app-border)',
                              fontSize: '13px', color: 'var(--accent)',
                              lineHeight: 1.5,
                            }}>
                              {entry.ai_feedback}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
