// Google Cloud Translation API service
const API_KEY = (import.meta as any).env.VITE_GOOGLE_TRANSLATE_API_KEY || 'AIzaSyD9yPMyTRPMxvjTzPbluUPZ4Gary7VZoqE'

const LANG_CODES: Record<string, string> = {
  te: 'te',  // Telugu
  hi: 'hi',  // Hindi
  mr: 'mr',  // Marathi
}

/**
 * Translate a single text string to a target language using Google Cloud Translation API.
 */
export async function translateText(text: string, targetLang: 'te' | 'hi' | 'mr'): Promise<string> {
  if (!text.trim()) return ''
  if (!API_KEY) throw new Error('Google Translate API key not configured. Add VITE_GOOGLE_TRANSLATE_API_KEY to .env')

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: LANG_CODES[targetLang],
        format: 'text',
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Translation failed: ${err?.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.data.translations[0].translatedText
}

/**
 * Translate an array of texts in a single API call (batch).
 */
export async function translateBatch(texts: string[], targetLang: 'te' | 'hi' | 'mr'): Promise<string[]> {
  if (!API_KEY) throw new Error('Google Translate API key not configured.')
  if (texts.length === 0) return []

  // Filter empty strings but track their positions
  const nonEmpty = texts.map((t, i) => ({ text: t, index: i })).filter(t => t.text.trim())
  if (nonEmpty.length === 0) return texts.map(() => '')

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: nonEmpty.map(t => t.text),
        source: 'en',
        target: LANG_CODES[targetLang],
        format: 'text',
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Translation failed: ${err?.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const translations = data.data.translations as { translatedText: string }[]

  // Map back to original positions
  const result = texts.map(() => '')
  nonEmpty.forEach((item, idx) => {
    result[item.index] = translations[idx].translatedText
  })
  return result
}

/**
 * Translate a full quiz question (text + 4 options) into all 3 target languages.
 * Returns the updated question with te, hi, mr fields populated.
 */
export async function translateQuizQuestion(question: {
  text: { en: string; te: string; hi: string; mr: string }
  options: { en: string[]; te: string[]; hi: string[]; mr: string[] }
}): Promise<typeof question> {
  const langs: ('te' | 'hi' | 'mr')[] = ['te', 'hi', 'mr']
  const result = JSON.parse(JSON.stringify(question))

  for (const lang of langs) {
    // Batch all texts: question + 4 options = 5 strings per language
    const allTexts = [question.text.en, ...question.options.en]
    const translated = await translateBatch(allTexts, lang)
    result.text[lang] = translated[0]
    result.options[lang] = translated.slice(1)
  }

  return result
}
