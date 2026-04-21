'use client'

import { useState, useRef } from 'react'

const MODULES = [
  { label: 'Anatomie & Biologie', id: '651843ca-50f3-43c1-847e-e4330bdbae52' },
  { label: 'Pathologie Médicale', id: '8bb0f613-2aa0-42ae-b4d1-c583b05af512' },
  { label: 'Pathologie Chirurgicale', id: '08246cd4-a56f-46a5-a13f-1afa92b5f77f' },
  { label: 'Urgences Médicales', id: '3fd64d3f-a9d4-4005-9ecd-a2deb63cb845' },
  { label: 'Urgences Chirurgicales', id: 'ca3fd03e-5989-4772-8a86-4efac9a7ffff' },
]

type Status = 'idle' | 'reading' | 'extracting' | 'done' | 'error'

export default function QcmExtractor() {
  const [moduleId, setModuleId] = useState(MODULES[0].id)
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [resultCount, setResultCount] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedModule = MODULES.find((m) => m.id === moduleId)!

  async function handleExtract() {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      alert('Veuillez sélectionner un fichier PDF.')
      return
    }
    if (file.type !== 'application/pdf') {
      alert('Le fichier doit être un PDF.')
      return
    }

    setStatus('reading')
    setErrorMsg(null)
    setResultCount(null)

    // Convert PDF to base64
    let pdfBase64: string
    try {
      pdfBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Strip the data URL prefix (data:application/pdf;base64,)
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    } catch {
      setStatus('error')
      setErrorMsg('Erreur lors de la lecture du fichier PDF.')
      return
    }

    setStatus('extracting')

    try {
      const res = await fetch('/api/admin/extract-qcm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          moduleId,
          subject: selectedModule.label,
          replaceExisting,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `Erreur HTTP ${res.status}`)
      }

      setResultCount(data.count)
      setStatus('done')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err?.message ?? 'Erreur inconnue')
    }
  }

  const surface: React.CSSProperties = {
    background: 'var(--app-surface)',
    border: '1px solid var(--app-border)',
    borderRadius: '16px',
    padding: '24px 28px',
    marginTop: '20px',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: 'var(--app-text-ghost)',
    marginBottom: '8px',
    display: 'block',
  }

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--app-border)',
    background: 'var(--app-bg)',
    color: 'var(--app-text)',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--app-border)',
    background: 'var(--app-bg)',
    color: 'var(--app-text)',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  }

  const isLoading = status === 'reading' || status === 'extracting'

  return (
    <div style={surface}>
      {/* Section header */}
      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '6px' }}>
        Extraction Banque QCM
      </p>
      <p style={{ fontSize: '13px', color: 'var(--app-text-muted)', marginBottom: '20px' }}>
        Charge un PDF de QCM médicaux et extrait automatiquement les questions via Claude.
      </p>

      {/* Warning banner */}
      <div style={{
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'rgba(245,158,11,0.08)',
        border: '1px solid rgba(245,158,11,0.3)',
        color: 'var(--warning)',
        fontSize: '13px',
        marginBottom: '20px',
        lineHeight: '1.5',
      }}>
        <strong>Attention :</strong> Les 901 questions actuelles ont toutes correct_answer=0 (extraction incorrecte).
        Cocher &quot;Remplacer&quot; et re-uploader chaque PDF pour corriger.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Module selector */}
        <div>
          <label style={labelStyle}>Module</label>
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            style={selectStyle}
            disabled={isLoading}
          >
            {MODULES.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* File input */}
        <div>
          <label style={labelStyle}>Fichier PDF</label>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            style={inputStyle}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Replace checkbox */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <input
          type="checkbox"
          id="replace-existing"
          checked={replaceExisting}
          onChange={(e) => setReplaceExisting(e.target.checked)}
          disabled={isLoading}
          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
        />
        <label
          htmlFor="replace-existing"
          style={{ fontSize: '14px', color: 'var(--app-text)', cursor: 'pointer', userSelect: 'none' }}
        >
          Remplacer les questions existantes de ce module
        </label>
      </div>

      {/* Extract button */}
      <button
        onClick={handleExtract}
        disabled={isLoading}
        style={{
          padding: '10px 24px',
          borderRadius: '10px',
          border: 'none',
          background: isLoading ? 'var(--app-border)' : 'var(--accent)',
          color: isLoading ? 'var(--app-text-muted)' : '#fff',
          fontSize: '14px',
          fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.15s',
        }}
      >
        {isLoading ? (
          status === 'reading' ? 'Lecture du PDF...' : 'Extraction en cours...'
        ) : (
          'Extraire les QCMs'
        )}
      </button>

      {/* Progress indicator */}
      {isLoading && (
        <div style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          color: 'var(--app-text-muted)',
        }}>
          <span style={{
            display: 'inline-block',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            border: '2px solid var(--app-border)',
            borderTopColor: 'var(--accent)',
            animation: 'qcm-spin 0.8s linear infinite',
          }} />
          {status === 'reading'
            ? 'Encodage du PDF en base64...'
            : `Claude analyse le PDF "${selectedModule.label}"... (peut prendre 30–90s)`}
        </div>
      )}

      {/* Success */}
      {status === 'done' && resultCount !== null && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.3)',
          color: 'var(--success)',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          {resultCount} question{resultCount > 1 ? 's' : ''} extraite{resultCount > 1 ? 's' : ''} avec succès
          {replaceExisting ? ' (questions précédentes remplacées)' : ' (ajoutées au module)'}.
        </div>
      )}

      {/* Error */}
      {status === 'error' && errorMsg && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: 'var(--error, #ef4444)',
          fontSize: '13px',
        }}>
          <strong>Erreur :</strong> {errorMsg}
        </div>
      )}

      {/* Spin keyframe injection */}
      <style>{`
        @keyframes qcm-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
