import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useEmployeeStore } from '../store/useEmployeeStore'
import { KisanLogo } from '../components/KisanLogo'

interface DoneState {
  score: number
  correct: number
  total: number
  passed: boolean
}

export function Done() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { t } = useTranslation()
  const { resetQuizState } = useEmployeeStore()

  const { score = 0, correct = 0, total = 0, passed = false } = (state as DoneState) ?? {}

  const handleGoHome = () => {
    resetQuizState()
    navigate('/home')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#FAF6EE] dark:bg-[#0F1A14]" style={{
        minHeight: '100vh',
        
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Confetti Layer */}
      <ConfettiLayer />

      {/* Green Header */}
      <div
        style={{
          background: 'linear-gradient(145deg, #1F7A4E, #2D9E68)',
          padding: '48px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{ fontSize: 72, lineHeight: 1, marginBottom: 16 }}
        >
          🏆
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#fff',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {t('trainingComplete')}
        </motion.h1>
      </div>

      {/* White Bottom Card */}
      <div
        className="bg-white dark:bg-[#1A2E22]" style={{
          flex: 1,
          
          borderRadius: '32px 32px 0 0',
          marginTop: -28,
          padding: '32px 24px 48px',
          maxWidth: 480,
          margin: '-28px auto 0',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <KisanLogo size="sm" />
        </div>

        {/* Score Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 180, damping: 14 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: `5px solid ${passed ? '#1F7A4E' : '#F59E0B'}`,
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 0 8px ${passed ? 'rgba(31,122,78,0.08)' : 'rgba(245,158,11,0.08)'}`,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 800, color: passed ? '#1F7A4E' : '#F59E0B', lineHeight: 1 }}>
              {score}%
            </span>
          </div>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: 14,  marginTop: 10 }}>{t('yourScore')}</p>

          <p className="text-[#1A1A1A] dark:text-[#F0F4F2]" style={{ fontSize: 15,  fontWeight: 500, marginTop: 4 }}>
            {t('outOf', { correct, total })}
          </p>

          <span
            style={{
              marginTop: 10,
              background: passed ? '#D1FAE5' : '#FEF3C7',
              color: passed ? '#065F46' : '#92400E',
              fontSize: 13,
              fontWeight: 700,
              padding: '4px 14px',
              borderRadius: 999,
              border: `1px solid ${passed ? '#6EE7B7' : '#FCD34D'}`,
            }}
          >
            {passed ? t('passed') : t('tryAgain')}
          </span>
        </motion.div>

        {/* Coming Soon Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}
        >
          {[
            { icon: '📜', title: t('downloadCertificate'), sub: t('certificateComingSoon') },
            { icon: '🏆', title: t('leaderboard'), sub: t('leaderboardComingSoon') },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                background: '#F9FAFB',
                border: '1.5px solid #E5E7EB',
                borderRadius: 16,
                padding: '18px 14px',
                textAlign: 'center',
                opacity: 0.65,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>{card.title}</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 8px', lineHeight: 1.4 }}>{card.sub}</p>
              <span
                style={{
                  background: '#FCD34D',
                  color: '#92400E',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  letterSpacing: '0.05em',
                }}
              >
                {t('comingSoon').toUpperCase()}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Good to Go Button */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoHome}
          style={{
            width: '100%',
            height: 56,
            background: '#1F7A4E',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ✅ {t('goodToGo')}
        </motion.button>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#9CA3AF' }}>
          {t('poweredByLinqTech', 'Powered by Linq Tech')}
        </div>
      </div>
    </motion.div>
  )
}

// ─── CSS Confetti ────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#E91E8C', '#1F7A4E', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444']

function ConfettiLayer() {
  const pieces = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 6,
  }))

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', x: `${(Math.random() - 0.5) * 80}px`, opacity: 0, rotate: 360 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeIn',
          }}
          style={{
            position: 'absolute',
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}
