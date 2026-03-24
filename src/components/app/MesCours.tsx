'use client'

import { useState } from 'react'
import { FilePdf, UploadSimple, Trash, Clock, BookOpen, ArrowRight } from '@phosphor-icons/react'
import UploadCourseModal from './UploadCourseModal'
import PersonalCourseViewer from './PersonalCourseViewer'
import { useAppStore } from '@/store/app'

interface UploadItem {
  id: string
  content_type: string
  content: {
    title: string
    summary: string
    difficulty: string
    duration_minutes: number
    slug: string
    module_slug?: string
    file_name: string
    text: string
    created_at: string
  }
  created_at: string
}

interface Props {
  initialUploads: UploadItem[]
}

const DIFFICULTY_COLOR: Record<string, string> = {
  facile: 'var(--success)',
  moyen: 'var(--warning)',
  difficile: '#EF4444',
}

const DIFFICULTY_LABEL: Record<string, string> = {
  facile: 'Facile',
  moyen: 'Moyen',
  difficile: 'Difficile',
}

export default function MesCours({ initialUploads }: Props) {
  const [uploads, setUploads] = useState<UploadItem[]>(initialUploads)
  const [showUpload, setShowUpload] = useState(false)
  const [viewing, setViewing] = useState<UploadItem | null>(null)
  const { addToast } = useAppStore()

  function handleSuccess(title: string, contentId: string) {
    setShowUpload(false)
    // Refresh by adding placeholder
    setUploads(prev => [{
      id: contentId,
      content_type: 'summary',
      content: {
        title, summary: 'Analyse terminée.', difficulty: 'moyen',
        duration_minutes: 30, slug: contentId, file_name: '',
        text: '', created_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    }, ...prev])
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/upload/pdf?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setUploads(prev => prev.filter(u => u.id !== id))
        addToast({ type: 'success', title: 'Cours supprimé' })
      }
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de supprimer.' })
    }
  }

  const surface: React.CSSProperties = {
    background: 'var(--app-surface)',
    border: '1px solid var(--app-border)',
    borderRadius: '16px',
  }

  if (viewing) {
    return (
      <PersonalCourseViewer
        item={viewing}
        onBack={() => setViewing(null)}
      />
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '4px' }}>
            Mes Cours
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--app-text-muted)' }}>
            Vos cours personnels importés depuis vos PDF.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '13px', fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          <UploadSimple size={15} weight="bold" />
          Importer un PDF
        </button>
      </div>

      {/* Empty state */}
      {uploads.length === 0 ? (
        <div style={{ ...surface, textAlign: 'center', padding: '64px 40px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'var(--accent-soft)',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FilePdf size={26} weight="duotone" style={{ color: 'var(--accent)' }} />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '8px' }}>
            Aucun cours importé
          </p>
          <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', lineHeight: 1.6, marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px' }}>
            Importez vos propres PDF de cours pour les étudier avec les outils IA.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            style={{
              background: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: '10px',
              padding: '11px 24px',
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Importer mon premier cours
          </button>
        </div>
      ) : (
        <div style={surface}>
          {uploads.map((item, index) => {
            const c = item.content
            const isLast = index === uploads.length - 1
            const diffColor = DIFFICULTY_COLOR[c.difficulty] ?? 'var(--app-text-ghost)'

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px',
                  borderBottom: isLast ? 'none' : '1px solid var(--app-border)',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(239,68,68,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <FilePdf size={20} weight="duotone" style={{ color: '#EF4444' }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '14px', fontWeight: 600,
                    color: 'var(--app-text)', marginBottom: '4px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {c.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: diffColor }}>
                      {DIFFICULTY_LABEL[c.difficulty] ?? c.difficulty}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--app-text-ghost)' }}>
                      <Clock size={11} />
                      {c.duration_minutes} min
                    </span>
                    {c.file_name && (
                      <span style={{ fontSize: '11px', color: 'var(--app-text-ghost)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                        {c.file_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => setViewing(item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent)' }}
                  >
                    <BookOpen size={13} />
                    Étudier
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '30px', height: '30px',
                      background: 'none',
                      border: '1px solid var(--app-border)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: 'var(--app-text-ghost)',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--app-text-ghost)'; e.currentTarget.style.borderColor = 'var(--app-border)' }}
                  >
                    <Trash size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadCourseModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
