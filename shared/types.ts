// ─── Supported Languages ───────────────────────────────────────────
export type SupportedLanguage = 'en' | 'te' | 'hi' | 'mr'

export interface LocalizedString {
  en: string
  te?: string
  hi?: string
  mr?: string
}

// ─── Employee ──────────────────────────────────────────────────────
export interface Employee {
  id: string
  name: string
  mobile: string
  department: string
  storeId: number | null
  status: 'active' | 'inactive'
  lastCompletedWeek: number | null
  language: SupportedLanguage
  managerName?: string
  managerPhone?: string
  createdAt: Date
  updatedAt?: Date
}

// ─── Training Section ──────────────────────────────────────────────
export interface TrainingSection {
  id: string
  name: string
  description: string
  videoCount: number
  createdAt: Date
  updatedAt?: Date
}

// ─── Training (Video) ──────────────────────────────────────────────
export interface Training {
  id: string
  title: LocalizedString
  section: string         // section ID
  sectionName: string
  storeId: number | 'all'
  muxVideoId: string      // Mux playback ID
  thumbnailUrl: string
  description: LocalizedString
  weekNumber: number
  status: 'draft' | 'active'
  durationSeconds: number
  createdAt: Date
  updatedAt?: Date
  storageVideoUrl?: string | null
  language?: string
}

// ─── Quiz ──────────────────────────────────────────────────────────
export interface QuizQuestion {
  id: string
  text: LocalizedString
  options: {
    en: string[]
    te: string[]
    hi: string[]
    mr: string[]
  }
  correctIndex: number
}

export interface Quiz {
  id: string
  trainingId: string
  questions: QuizQuestion[]
  passingMarks: number
}

// ─── Completion ────────────────────────────────────────────────────
export interface Completion {
  id: string
  employeeId: string
  trainingId: string
  weekNumber: number
  score: number
  totalQuestions: number
  completedAt: Date
  watchedFull: boolean
  passed: boolean
}

// ─── Admin User ────────────────────────────────────────────────────
export interface AdminUser {
  uid: string
  email: string
  displayName: string
  createdAt: Date
}

// ─── Firestore Collection Names ────────────────────────────────────
export const COLLECTIONS = {
  EMPLOYEES: 'employees',
  TRAININGS: 'trainings',
  SECTIONS: 'sections',
  QUIZZES: 'quizzes',
  COMPLETIONS: 'completions',
  ADMINS: 'admins',
  SETTINGS: 'settings',
} as const
