'use client'

import { useAppStore } from '@/store/app'
import type { ToastMessage } from '@/types'

const TOAST_STYLES: Record<ToastMessage['type'], string> = {
  success: 'border-green-500/30 bg-green-500/10 text-green-700',
  error: 'border-red-500/30 bg-red-500/10 text-red-700',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700',
}

const TOAST_ICONS: Record<ToastMessage['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm animate-fade-in-up max-w-sm shadow-md ${TOAST_STYLES[toast.type]}`}
        >
          <span className="text-sm font-bold shrink-0 mt-0.5">{TOAST_ICONS[toast.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.message && (
              <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-xs opacity-60 hover:opacity-100 transition-opacity shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
