import type { SupportedLanguage } from './types'

// ─── App Info ──────────────────────────────────────────────────────
export const APP_NAME = 'Kisan Fashion Mall'
export const APP_SUBTITLE = 'Training Platform'

// ─── Language Config ───────────────────────────────────────────────
export const SUPPORTED_LANGUAGES: Array<{
  code: SupportedLanguage
  label: string
  nativeLabel: string
}> = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
]

// ─── Departments ───────────────────────────────────────────────────
export const DEPARTMENTS = [
  'Customer Service',
  'Sales',
  'Store Operations',
  'Product Knowledge',
  'Safety Training',
  'Visual Merchandising',
  'Cashier',
  'Security',
  'Housekeeping',
] as const

// ─── Public Mux Video IDs (placeholder for MVP demo) ──────────────
// Using Mux's public test stream for all dummy training videos
export const MUX_TEST_VIDEO_ID = 'VS3b5iDC1GoLolsq5Qz601vGSQvNbX00BgUXEAVvkwzI'
export const MUX_PLAYBACK_BASE = 'https://stream.mux.com'

// ─── Quiz Config ───────────────────────────────────────────────────
export const MIN_PASS_SCORE = 60 // 60% to pass
export const QUESTIONS_PER_QUIZ = 5

// ─── Pagination ────────────────────────────────────────────────────
export const PAGE_SIZE = 20

// ─── Admin Credentials (seeded via Firebase Console) ───────────────
export const ADMIN_EMAIL = 'admin@kisanmall.com'

// ─── Leaderboard ───────────────────────────────────────────────────
export const LEADERBOARD_TOP_N = 10
