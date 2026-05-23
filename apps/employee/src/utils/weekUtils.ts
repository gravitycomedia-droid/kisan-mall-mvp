/** Returns the ISO week number for the current date */
export function getCurrentWeekNumber(): number {
  const date = new Date()
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Formats a date in the user's current locale */
export function formatDate(date: Date, language: string): string {
  const localeMap: Record<string, string> = {
    en: 'en-IN',
    te: 'te-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
  }
  return date.toLocaleDateString(localeMap[language] ?? 'en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
