import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Play, Lock, Phone, CheckCircle, Trophy, LogOut, ChevronDown } from 'lucide-react'
import { db } from '../firebase.config'
import { useEmployeeStore } from '../store/useEmployeeStore'
import { KisanLogo } from '../components/KisanLogo'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { OfflineScreen } from '../components/OfflineScreen'
import { getCurrentWeekNumber, formatDate } from '../utils/weekUtils'
import { COLLECTIONS } from '@shared/types'
import type { Training } from '@shared/types'
import type { SupportedLanguage } from '@shared/types'

const LANG_LABELS: Record<SupportedLanguage, string> = {
  en: 'EN',
  te: 'తె',
  hi: 'हि',
  mr: 'म',
}

export function TrainingHome() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { employee, language, setLanguage, quizUnlocked, setTraining, setHasCompletedThisWeek, hasCompletedThisWeek, logout } =
    useEmployeeStore()

  const [training, setTrainingLocal] = useState<Training | null>(null)
  const [allDone, setAllDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const weekNumber = getCurrentWeekNumber()

  const fetchTraining = async () => {
    setLoading(true)
    setOffline(false)
    setAllDone(false)
    try {
      // 1. Fetch ALL active trainings
      const q = query(
        collection(db, COLLECTIONS.TRAININGS),
        where('status', '==', 'active')
      )
      const snap = await getDocs(q)

      if (snap.empty) {
        setTrainingLocal(null)
        setLoading(false)
        return
      }

      // 2. Map to Training objects
      let allTrainings: Training[] = snap.docs.map(doc => {
        const d = doc.data()
        return {
          id: doc.id,
          title: d.title,
          section: d.section,
          sectionName: d.sectionName ?? '',
          storeId: d.storeId ?? 'all',
          muxVideoId: d.muxVideoId ?? '',
          thumbnailUrl: d.thumbnailUrl ?? '',
          description: d.description,
          weekNumber: d.weekNumber,
          status: d.status,
          durationSeconds: d.durationSeconds ?? 0,
          createdAt: d.createdAt?.toDate() ?? new Date(),
          storageVideoUrl: d.storageVideoUrl ?? null,
        }
      })

      // 3. Filter by employee's store (if training has storeId)
      if (employee?.storeId) {
        allTrainings = allTrainings.filter(
          t => t.storeId === 'all' || t.storeId === employee.storeId
        )
      }

      // 4. Filter by employee's department/section (if training has section)
      // Keep all for now — section filtering can be added when sections are assigned to employees

      // 5. Get employee's completed training IDs
      let completedIds = new Set<string>()
      if (employee) {
        const cq = query(
          collection(db, COLLECTIONS.COMPLETIONS),
          where('employeeId', '==', employee.id)
        )
        const cSnap = await getDocs(cq)
        cSnap.docs.forEach(d => {
          const data = d.data()
          // Only count as completed if quiz was taken (not just video watched)
          if (data.totalQuestions > 0) {
            completedIds.add(data.trainingId)
          }
        })
      }

      // 6. Remove completed trainings
      const uncompleted = allTrainings.filter(t => !completedIds.has(t.id))

      if (uncompleted.length === 0) {
        // All done!
        setAllDone(true)
        setTrainingLocal(null)
        setHasCompletedThisWeek(true)
      } else {
        // Sort by weekNumber, show the earliest uncompleted
        uncompleted.sort((a, b) => a.weekNumber - b.weekNumber)
        const next = uncompleted[0]
        setTrainingLocal(next)
        setTraining(next)
        setHasCompletedThisWeek(false)
      }
    } catch {
      setOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTraining()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekNumber])

  const handleLangChange = (lang: SupportedLanguage) => {
    setLanguage(lang)
    setLangOpen(false)
  }

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
      fetchTraining()
    }
  }

  if (loading) return <LoadingSkeleton />
  if (offline) return <OfflineScreen onRetry={fetchTraining} />

  const titleText = training
    ? (typeof training.title === 'string' ? training.title : training.title[language] ?? training.title['en'])
    : ''
  const descText = training
    ? (typeof training.description === 'string' ? training.description : training.description[language] ?? training.description['en'])
    : ''

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-[#FAF6EE] dark:bg-[#0F1A14] min-h-screen" 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEndAction}
    >
      {/* Top Bar */}
      <div
        className="bg-white dark:bg-[#1A2E22]" style={{
          
          borderBottom: '1px solid #E5E7EB',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <KisanLogo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangOpen((o) => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: '#F0FBF5',
                border: '1px solid #1F7A4E',
                borderRadius: 8,
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: '#1F7A4E',
                fontFamily: 'inherit',
              }}
            >
              {LANG_LABELS[language]}
              <ChevronDown size={12} />
            </button>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1A2E22]" style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  
                  border: '1px solid #E5E7EB',
                  borderRadius: 10,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  zIndex: 100,
                  overflow: 'hidden',
                  minWidth: 110,
                }}
              >
                {(['en', 'te', 'hi', 'mr'] as SupportedLanguage[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLangChange(l)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: l === language ? '#F0FBF5' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: 13,
                      fontWeight: l === language ? 600 : 400,
                      color: l === language ? '#1F7A4E' : '#1A1A1A',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {LANG_LABELS[l]} · {l === 'en' ? 'English' : l === 'te' ? 'తెలుగు' : l === 'hi' ? 'हिन्दी' : 'मराठी'}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 20px 40px' }}>
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ marginBottom: 20 }}
        >
          <h2 className="text-[#1A1A1A] dark:text-[#F0F4F2]" style={{ fontSize: 22, fontWeight: 700,  margin: 0, marginBottom: 4 }}>
            👋 {t('greeting', { name: employee?.name?.split(' ')[0] })}
          </h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
            {formatDate(new Date(), language)}
          </p>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>
            {t('week', { number: weekNumber })}
          </p>
        </motion.div>

        {/* Training Card */}
        {training ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1A2E22]" style={{
              
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
              marginBottom: 20,
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, #1F7A4E, #2D9E68)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {training.thumbnailUrl ? (
                <img
                  src={training.thumbnailUrl}
                  alt={titleText}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Play size={28} color="#fff" fill="#fff" />
                </div>
              )}
            </div>

            {/* Card Body */}
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    background: '#F0FBF5',
                    color: '#1F7A4E',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 999,
                    border: '1px solid #BBF7D0',
                  }}
                >
                  {training.sectionName}
                </span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{t('week', { number: training.weekNumber })}</span>
              </div>
              <h3 className="text-[#1A1A1A] dark:text-[#F0F4F2]" style={{ fontSize: 17, fontWeight: 700,  margin: '0 0 6px' }}>
                {titleText}
              </h3>
              <p className="text-[#6B7280] dark:text-[#9CA3AF]" style={{
                fontSize: 14,
                
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {descText}
              </p>

              {/* Watch prompt */}
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 15 }}>🎬</span>
                <span style={{ fontSize: 13, color: '#D97706', fontWeight: 500 }}>
                  {t('watchVideo')}
                </span>
              </div>
            </div>
          </motion.div>
        ) : allDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
              borderRadius: 18,
              padding: '40px 24px',
              textAlign: 'center',
              marginBottom: 20,
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#065F46', margin: '0 0 8px' }}>
              {t('allCaughtUp') || 'All caught up!'}
            </h3>
            <p style={{ fontSize: 14, color: '#059669', margin: 0 }}>
              {t('checkBackNextWeek') || "You've completed all trainings. Check back next week for new content!"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-[#1A2E22]" style={{
              
              borderRadius: 16,
              padding: 32,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            <p className="text-[#6B7280] dark:text-[#9CA3AF]" style={{  fontSize: 15 }}>{t('noTrainingThisWeek')}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        {training && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/video')}
              style={{
                height: 54,
                background: '#1F7A4E',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'inherit',
              }}
            >
              <Play size={18} fill="#fff" /> {t('watchTraining')}
            </motion.button>

            <motion.button
              whileTap={quizUnlocked || hasCompletedThisWeek ? { scale: 0.97 } : {}}
              onClick={() => (quizUnlocked || hasCompletedThisWeek) && navigate('/quiz')}
              disabled={!quizUnlocked && !hasCompletedThisWeek}
              style={{
                height: 54,
                background: 'transparent',
                color: quizUnlocked || hasCompletedThisWeek ? '#1F7A4E' : '#9CA3AF',
                border: `2px solid ${quizUnlocked || hasCompletedThisWeek ? '#1F7A4E' : '#E5E7EB'}`,
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                cursor: quizUnlocked || hasCompletedThisWeek ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {quizUnlocked || hasCompletedThisWeek ? null : <Lock size={16} />}
              {quizUnlocked || hasCompletedThisWeek ? t('startQuiz') : t('videoLocked')}
            </motion.button>
          </motion.div>
        )}

        {/* Call Manager */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
        >
          <motion.a
            whileTap={{ scale: 0.96 }}
            href={employee?.managerPhone ? `tel:${employee.managerPhone}` : '#'}
            style={{
              height: 52,
              background: 'transparent',
              color: '#1F7A4E',
              border: '2px solid #1F7A4E',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              textDecoration: 'none',
              fontFamily: 'inherit',
            }}
          >
            <Phone size={15} /> {t('callManager')}
          </motion.a>
        </motion.div>

        {/* Leaderboard Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, #1F7A4E, #2D9E68)',
            borderRadius: 18,
            padding: '20px 22px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Trophy size={22} color="#fff" />
            <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{t('leaderboard')}</span>
            <span
              className="bg-white dark:bg-[#1A2E22]" style={{
                
                color: '#1F7A4E',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                letterSpacing: '0.05em',
              }}
            >
              {t('comingSoon')}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            {t('leaderboardComingSoon')}
          </p>
          <div
            style={{
              position: 'absolute',
              right: -10,
              top: -10,
              fontSize: 64,
              opacity: 0.15,
            }}
          >
            🏆
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
