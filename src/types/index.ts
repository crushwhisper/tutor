export * from './database'

export interface NavItem {
  label: string
  href: string
  icon?: string
  isPro?: boolean
}

export interface QCMSessionState {
  questions: import('./database').QCMQuestion[]
  currentIndex: number
  answers: (number | null)[]
  showResults: boolean
  timeElapsed: number
}

export interface FlashcardSessionState {
  cards: import('./database').Flashcard[]
  currentIndex: number
  revealed: boolean
  ratings: number[]
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  period: string
  features: string[]
  isPopular?: boolean
  stripePriceId?: string
}

export interface AIGenerationOptions {
  type: 'mindmap' | 'qcm' | 'flashcards' | 'summary' | 'journal-feedback' | 'direct-question'
  context?: string
  courseId?: string
  uploadId?: string
}
