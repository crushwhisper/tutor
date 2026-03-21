export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'student' | 'admin'
export type SubscriptionPlan = 'starter' | 'pro'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
export type DifficultyLevel = 'facile' | 'moyen' | 'difficile'
export type ProgramType = '90j' | '180j'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  subscription_plan: SubscriptionPlan
  subscription_status: SubscriptionStatus | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_ends_at: string | null
  whatsapp_number: string | null
  whatsapp_notifications: boolean
  email_notifications: boolean
  preferred_study_time: number
  created_at: string
  updated_at: string
}

export interface Module {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Course {
  id: string
  module_id: string
  slug: string
  title: string
  content: string | null
  summary: string | null
  duration_minutes: number
  difficulty: DifficultyLevel
  is_premium: boolean
  is_published: boolean
  order_index: number
  course_metadata: Json
  created_at: string
  updated_at: string
}

export interface QCMQuestion {
  id: string
  course_id: string | null
  module_id: string | null
  question: string
  options: string[]
  correct_answer: number
  explanation: string | null
  difficulty: DifficultyLevel
  tags: string[]
  is_active: boolean
  created_at: string
}

export interface Flashcard {
  id: string
  course_id: string | null
  module_id: string | null
  front: string
  back: string
  difficulty: DifficultyLevel
  tags: string[]
  is_active: boolean
  created_at: string
}

export interface Program {
  id: string
  type: ProgramType
  title: string
  description: string | null
  total_days: number
  is_active: boolean
  created_at: string
}

export interface ProgramDay {
  id: string
  program_id: string
  day_number: number
  title: string
  description: string | null
  objectives: string[]
  course_ids: string[]
  qcm_count: number
  estimated_hours: number
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  completed: boolean
  score: number | null
  time_spent_minutes: number
  last_accessed_at: string
  created_at: string
}

export interface DayCompletion {
  id: string
  user_id: string
  program_id: string
  day_number: number
  completed: boolean
  score: number | null
  notes: string | null
  completed_at: string | null
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  content: string
  ai_feedback: string | null
  mood: number | null
  created_at: string
  updated_at: string
}

export interface MockExamResult {
  id: string
  user_id: string
  module_scores: Json
  total_score: number
  duration_minutes: number
  question_results: Json
  created_at: string
}

export interface FlashcardReview {
  id: string
  user_id: string
  flashcard_id: string
  rating: number
  next_review_at: string
  review_count: number
  created_at: string
}

export interface UserUpload {
  id: string
  user_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  processed: boolean
  extracted_text: string | null
  created_at: string
}

export interface UserGeneratedContent {
  id: string
  user_id: string
  upload_id: string | null
  content_type: 'mindmap' | 'qcm' | 'flashcards' | 'summary'
  content: Json
  created_at: string
}
