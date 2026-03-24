'use client'

import { useState, useRef } from 'react'
import { UploadSimple, X, FilePdf, CheckCircle, Warning } from '@phosphor-icons/react'
import { useAppStore } from '@/store/app'

interface Props {
  onClose: () => void
  onSuccess: (title: string, contentId: string) => void
}

const MODULES = [
  { slug: 'anatomie-biologie', label: 'Anatomie & Biologie' },
  { slug: 'medecine', label: 'Pathologie Médicale' },
  { slug: 'chirurgie', label: 'Pathologie Chirurgicale' },
  { slug: 'urgences-medicales', label: 'Urgences Médicales' },
  { slug: 'urgences-chirurgicales', label: 'Urgences Chirurgicales' },
]

export default function UploadCourseModal({ onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [module, setModule] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useAppStore()

  function handleFile(f: File) {
    if (!f.name.endsWith('.pdf')) {
      setError('Uniquement les fichiers PDF sont acceptés.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 Mo).')
      return
    }
    setError(null)
    setFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)

    const fd = new FormData()
    fd.append('file', file)
    if (module) fd.append('module', module)

    try {
      const res = await fetch('/api/upload/pdf', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erreur lors du téléchargement.')
        return
      }
      addToast({ type: 'success', title: 'Cours importé !', message: `"${data.title}" est disponible dans Mes Cours.` })
      onSuccess(data.title, data.content_id)
    } catch {
      setError('Connexion impossible. Réessayez.')
    } finally {
      setUploading(false)
    }
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px',
  }

  const modalStyle: React.CSSProperties = {
    background: 'var(--app-surface)',
    border: '1px solid var(--app-border)',
    borderRadius: '20px',
    padding: '32px',
    width: '100%', maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '2px' }}>
              Importer un cours
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--app-text-muted)' }}>
              Uploadez un PDF pour l'analyser avec l'IA
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--app-text-ghost)', padding: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--app-border)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !file && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : file ? 'var(--success)' : 'var(--app-border)'}`,
            borderRadius: '14px',
            padding: '28px 20px',
            textAlign: 'center',
            cursor: file ? 'default' : 'pointer',
            background: dragOver ? 'var(--accent-soft)' : file ? 'rgba(16,185,129,0.04)' : 'var(--app-bg)',
            transition: 'all 200ms',
            marginBottom: '16px',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <div>
              <FilePdf size={32} weight="duotone" style={{ color: 'var(--success)', marginBottom: '8px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '4px' }}>
                {file.name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--app-text-ghost)' }}>
                {(file.size / 1024 / 1024).toFixed(1)} Mo
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                style={{
                  marginTop: '10px',
                  background: 'none', border: '1px solid var(--app-border)',
                  borderRadius: '8px', padding: '4px 14px',
                  fontSize: '12px', color: 'var(--app-text-muted)',
                  cursor: 'pointer',
                }}
              >
                Changer
              </button>
            </div>
          ) : (
            <div>
              <UploadSimple size={32} weight="light" style={{ color: 'var(--app-text-ghost)', marginBottom: '10px' }} />
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--app-text)', marginBottom: '4px' }}>
                Glissez votre PDF ici
              </p>
              <p style={{ fontSize: '12px', color: 'var(--app-text-ghost)' }}>
                ou cliquez pour sélectionner · Max 10 Mo
              </p>
            </div>
          )}
        </div>

        {/* Module selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--app-text-muted)', marginBottom: '6px' }}>
            Module associé (optionnel)
          </label>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              background: 'var(--app-bg)',
              border: '1px solid var(--app-border)',
              borderRadius: '10px',
              fontSize: '14px', color: 'var(--app-text)',
              fontFamily: 'inherit',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">— Aucun module —</option>
            {MODULES.map((m) => (
              <option key={m.slug} value={m.slug}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px', padding: '10px 14px',
            marginBottom: '16px',
          }}>
            <Warning size={16} style={{ color: '#EF4444', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#EF4444' }}>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px',
              background: 'none',
              border: '1px solid var(--app-border)',
              borderRadius: '10px',
              fontSize: '14px', fontWeight: 500,
              color: 'var(--app-text-muted)',
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              flex: 2, padding: '11px',
              background: !file || uploading ? 'var(--app-border)' : 'var(--accent)',
              color: !file || uploading ? 'var(--app-text-ghost)' : 'white',
              border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 600,
              cursor: !file || uploading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 150ms',
            }}
          >
            {uploading ? (
              <>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Analyse en cours...
              </>
            ) : (
              <>
                <UploadSimple size={15} weight="bold" />
                Importer et analyser
              </>
            )}
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
