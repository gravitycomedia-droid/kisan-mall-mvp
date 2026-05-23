import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { ArrowLeft } from 'lucide-react'
import { db } from '../firebase.config'
import { useEmployeeStore } from '../store/useEmployeeStore'
import { OfflineScreen } from '../components/OfflineScreen'
import { COLLECTIONS } from '@shared/types'
import type { Quiz as QuizType, QuizQuestion } from '@shared/types'
import { KisanLogo } from '../components/KisanLogo'

export function Quiz() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { employee, currentTraining, quizUnlocked, language, hasCompletedThisWeek } =
    useEmployeeStore()

  const [quiz, setQuiz] = useState<QuizType | null>(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [direction, setDirection] = useState(1)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Guard: redirect if not unlocked
  useEffect(() => {
    if (!quizUnlocked && !hasCompletedThisWeek) {
      navigate('/home')
    }
  }, [quizUnlocked, hasCompletedThisWeek, navigate])

  const fetchQuiz = async () => {
    if (!currentTraining) { setLoading(false); return }
    setLoading(true)
    setOffline(false)
    try {
      const q = query(
        collection(db, COLLECTIONS.QUIZZES),
        where('trainingId', '==', currentTraining.id)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const d = snap.docs[0].data()
        setQuiz({
          id: snap.docs[0].id,
          trainingId: d.trainingId,
          questions: d.questions ?? [],
          passingMarks: d.passingMarks ?? 60,
        })
      }
    } catch {
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchQuiz() }, [currentTraining?.id])

  useEffect(() => {
    if (quiz && currentTraining) {
      try {
        const saved = localStorage.getItem(`quiz_progress_${currentTraining.id}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          setCurrentIndex(parsed.currentIndex ?? 0)
          setAnswers(parsed.answers ?? [])
          setSelectedAnswer(parsed.selectedAnswer ?? null)
        }
      } catch (e) {
        console.error('Failed to parse quiz progress', e)
      }
    }
  }, [quiz, currentTraining])

  useEffect(() => {
    if (currentTraining && quiz) {
      localStorage.setItem(`quiz_progress_${currentTraining.id}`, JSON.stringify({
        currentIndex,
        answers,
        selectedAnswer
      }))
    }
  }, [currentIndex, answers, selectedAnswer, currentTraining, quiz])

  const questions: QuizQuestion[] = quiz?.questions ?? []
  const current = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  const handleSelect = (idx: number) => {
    setSelectedAnswer(idx)
  }

  const handleNext = async () => {
    if (selectedAnswer === null) return
    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)
    setSelectedAnswer(null)

    if (isLast) {
      // Calculate score and submit
      setSubmitting(true)
      try {
        const correct = newAnswers.filter((a, i) => a === questions[i].correctIndex).length
        const score = Math.round((correct / questions.length) * 100)
        const passed = score >= (quiz?.passingMarks ?? 60)

        if (employee && currentTraining) {
          await addDoc(collection(db, COLLECTIONS.COMPLETIONS), {
            employeeId: employee.id,
            trainingId: currentTraining.id,
            weekNumber: currentTraining.weekNumber,
            score,
            totalQuestions: questions.length,
            completedAt: new Date(),
            watchedFull: true,
            passed,
          })
          localStorage.removeItem(`quiz_progress_${currentTraining.id}`)
        }

        navigate('/done', {
          state: {
            score,
            correct,
            total: questions.length,
            passed,
          },
        })
      } catch { /* navigate anyway */ }
      setSubmitting(false)
    } else {
      setDirection(1)
      setCurrentIndex((i) => i + 1)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#FAF6EE] dark:bg-[#0F1A14] min-h-screen p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="w-3/4 mx-auto h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-10" />
        <div className="space-y-4 mb-10">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-full h-14 bg-white dark:bg-[#1A2E22] rounded-xl animate-pulse border border-gray-100 dark:border-gray-800" />
          ))}
        </div>
        <div className="w-full h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }
  if (offline) return <OfflineScreen onRetry={fetchQuiz} />

  if (!quiz || questions.length === 0) {
    return (
      <div className="bg-[#FAF6EE] dark:bg-[#0F1A14]" style={{ minHeight: '100vh',  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <p className="text-[#6B7280] dark:text-[#9CA3AF]" style={{  fontSize: 15, marginBottom: 24 }}>{t('noQuizFound')}</p>
        <button onClick={() => navigate('/done', { state: { score: 100, correct: 1, total: 1, passed: true } })}
          style={{ padding: '12px 32px', background: '#1F7A4E', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {t('goodToGo')}
        </button>
      </div>
    )
  }

  const options = (current.options[language] || current.options['en'] || []).map((opt, i) => opt || current.options['en'][i] || '')
  const questionText = current.text[language] || current.text['en'] || ''

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEndAction = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchEnd - touchStart
    const isTop = window.scrollY === 0
    if (isTop && distance > 100) {
      fetchQuiz()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.28 }}
      className="bg-[#FAF6EE] dark:bg-[#0F1A14] min-h-screen flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEndAction}
    >
      {/* Top Bar */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <button onClick={() => navigate('/home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: 13,  fontWeight: 500 }}>
              {t('question', { current: currentIndex + 1, total: questions.length })}
            </span>
            <span style={{ fontSize: 13, color: '#1F7A4E', fontWeight: 600 }}>
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: '#1F7A4E', borderRadius: 3 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
        <KisanLogo size="sm" />
      </div>

      {/* Question */}
      <div style={{ flex: 1, maxWidth: 480, margin: '0 auto', width: '100%', padding: '28px 20px 24px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: 60 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 * direction }}
            transition={{ duration: 0.22 }}
          >
            <h2 className="text-[#1A1A1A] dark:text-[#F0F4F2]" style={{ fontSize: 20, fontWeight: 700,  marginBottom: 28, lineHeight: 1.5, textAlign: 'center' }}>
              {questionText}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {options.map((option, idx) => {
                const isSelected = selectedAnswer === idx
                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(idx)}
                    style={{
                      background: isSelected ? '#F0FBF5' : '#fff',
                      border: `${isSelected ? 2 : 1}px solid ${isSelected ? '#1F7A4E' : '#E5E7EB'}`,
                      borderRadius: 14,
                      padding: '16px 20px',
                      fontSize: 15,
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? '#1F7A4E' : '#1A1A1A',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 0 3px rgba(31,122,78,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? '#1F7A4E' : '#D1D5DB'}`,
                        background: isSelected ? '#1F7A4E' : 'transparent',
                        flexShrink: 0,
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && <div className="bg-white dark:bg-[#1A2E22]" style={{ width: 8, height: 8, borderRadius: '50%',  }} />}
                    </div>
                    {option}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next/Submit Button */}
      <div style={{ padding: '0 20px 40px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <motion.button
          whileTap={selectedAnswer !== null ? { scale: 0.97 } : {}}
          onClick={handleNext}
          disabled={selectedAnswer === null || submitting}
          style={{
            width: '100%',
            height: 54,
            background: selectedAnswer !== null ? '#1F7A4E' : '#E5E7EB',
            color: selectedAnswer !== null ? '#fff' : '#9CA3AF',
            border: 'none',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
        >
          {submitting ? '...' : isLast ? t('submit') : t('next') + ' →'}
        </motion.button>
      </div>
    </motion.div>
  )
}
