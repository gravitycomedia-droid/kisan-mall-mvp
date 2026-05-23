import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { doc, setDoc, collection } from 'firebase/firestore'
import { ArrowLeft, Play, Pause, Lock, CheckCircle } from 'lucide-react'
import { db } from '../firebase.config'
import { useEmployeeStore } from '../store/useEmployeeStore'
import { COLLECTIONS } from '@shared/types'
import { KisanLogo } from '../components/KisanLogo'

export function VideoPlayer() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { employee, currentTraining, unlockQuiz, quizUnlocked } = useEmployeeStore()

  const videoRef = useRef<HTMLVideoElement>(null)
  const lastValidTimeRef = useRef(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [completed, setCompleted] = useState(quizUnlocked)
  const [showToast, setShowToast] = useState(false)

  const videoUrl = currentTraining?.storageVideoUrl || ''
  const progressPercent = duration > 0 ? Math.min((progress / duration) * 100, 100) : 0

  // ─── Anti-skip: prevent seeking forward ───
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const current = video.currentTime

    // If user tries to seek forward past watched position → reset
    if (current > lastValidTimeRef.current + 1.5) {
      video.currentTime = lastValidTimeRef.current
      return
    }

    // Allow backward seeks, update the high-water mark
    if (current > lastValidTimeRef.current) {
      lastValidTimeRef.current = current
    }

    setProgress(current)
  }, [])

  const handleVideoComplete = useCallback(async () => {
    if (completed) return
    setCompleted(true)
    unlockQuiz()
    setShowToast(true)

    // Auto navigate to quiz after 2 seconds
    setTimeout(() => {
      setShowToast(false)
      navigate('/quiz')
    }, 2000)

    try {
      if (employee && currentTraining) {
        const ref = doc(collection(db, COLLECTIONS.COMPLETIONS))
        await setDoc(ref, {
          employeeId: employee.id,
          trainingId: currentTraining.id,
          weekNumber: currentTraining.weekNumber,
          watchedFull: true,
          score: 0,
          totalQuestions: 0,
          completedAt: new Date(),
          passed: false,
          _watchOnly: true,
        })
      }
    } catch { /* non-critical */ }
  }, [completed, employee, currentTraining, unlockQuiz, navigate])

  // Check for near-end completion
  useEffect(() => {
    if (duration > 0 && progress >= duration - 1 && !completed) {
      handleVideoComplete()
    }
  }, [progress, duration, completed, handleVideoComplete])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const trainingTitle =
    currentTraining
      ? (typeof currentTraining.title === 'string'
          ? currentTraining.title
          : currentTraining.title['en'])
      : 'Training Video'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        height: '100dvh',
        width: '100%',
        overflow: 'hidden',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          gap: 12,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
        }}
      >
        <button
          onClick={() => navigate('/home')}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: 10,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
        >
          <ArrowLeft size={18} color="#fff" />
        </button>
        <span
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}
        >
          {trainingTitle}
        </span>
      </div>

      {/* Video Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration)
            }}
            onEnded={handleVideoComplete}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#000',
            }}
          />
        ) : (
          <div className="text-[#6B7280] dark:text-[#9CA3AF]" style={{
            
            textAlign: 'center',
            padding: 32,
          }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📹</span>
            <span style={{ fontSize: 14 }}>No video uploaded for this training yet.</span>
          </div>
        )}
      </div>

      {/* Bottom Section — Progress Fill Quiz Button */}
      <div
        className="bg-white dark:bg-[#1A2E22]" style={{
          
          borderRadius: '20px 20px 0 0',
          padding: '20px 20px 36px',
          position: 'relative',
          zIndex: 15,
        }}
      >
        {/* Section badge + title */}
        {currentTraining && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span
                style={{
                  background: '#F0FBF5',
                  color: '#1F7A4E',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: '1px solid #BBF7D0',
                }}
              >
                {currentTraining.sectionName}
              </span>
              <KisanLogo size="sm" />
            </div>
            <h3 className="text-[#1A1A1A] dark:text-[#F0F4F2]" style={{ fontSize: 16, fontWeight: 700,  margin: '8px 0 4px' }}>
              {trainingTitle}
            </h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]" style={{
              fontSize: 13,
              
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {typeof currentTraining.description === 'string'
                ? currentTraining.description
                : currentTraining.description['en']}
            </p>
          </div>
        )}

        {/* Progress-fill Quiz Button */}
        <motion.button
          whileTap={completed ? { scale: 0.97 } : {}}
          onClick={() => completed && navigate('/quiz')}
          disabled={!completed}
          style={{
            width: '100%',
            height: 56,
            position: 'relative',
            border: 'none',
            borderRadius: 14,
            overflow: 'hidden',
            cursor: completed ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            background: '#E5E7EB',
          }}
        >
          {/* Green progress fill */}
          <motion.div
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              background: completed
                ? '#1F7A4E'
                : 'linear-gradient(90deg, #1F7A4E, #2D9E68)',
              borderRadius: 14,
            }}
          />
          {/* Button text */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: '100%',
              fontSize: 15,
              fontWeight: 700,
              color: progressPercent > 45 ? '#fff' : '#6B7280',
              transition: 'color 0.3s',
            }}
          >
            {completed ? (
              <>
                <CheckCircle size={18} />
                {t('startQuiz')} →
              </>
            ) : (
              <>
                <Lock size={14} />
                {Math.round(progressPercent)}% — {t('videoLocked')}
              </>
            )}
          </div>
        </motion.button>
      </div>

      {/* Completion Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            style={{
              position: 'fixed',
              bottom: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1F7A4E',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(31,122,78,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            <CheckCircle size={16} /> {t('videoCompleted')}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
