import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Delete } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useEmployeeStore } from '../store/useEmployeeStore'
import { KisanLogo } from '../components/KisanLogo'
import type { Employee } from '@shared/types'
import { COLLECTIONS } from '@shared/types'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'] as const

export function Login() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const setEmployee = useEmployeeStore((s) => s.setEmployee)

  const [digits, setDigits] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  const handleKey = (key: string) => {
    setError(null)
    if (key === 'clear') {
      setDigits('')
    } else if (key === 'back') {
      setDigits((d) => d.slice(0, -1))
    } else if (digits.length < 10) {
      setDigits((d) => d + key)
    }
  }

  const handleLogin = async () => {
    if (digits.length !== 10 || loading) return
    setLoading(true)
    setError(null)
    try {
      const q = query(
        collection(db, COLLECTIONS.EMPLOYEES),
        where('mobile', '==', digits)
      )
      const snap = await getDocs(q)

      if (snap.empty) {
        triggerError(t('mobileError'))
        return
      }

      const doc = snap.docs[0]
      const data = doc.data()

      if (data.status === 'inactive') {
        triggerError(t('inactiveError'))
        return
      }

      const employee: Employee = {
        id: doc.id,
        name: data.name,
        mobile: data.mobile,
        department: data.department,
        storeId: data.storeId ?? null,
        status: data.status,
        lastCompletedWeek: data.lastCompletedWeek ?? null,
        language: data.language ?? 'en',
        managerName: data.managerName,
        managerPhone: data.managerPhone,
        createdAt: data.createdAt?.toDate() ?? new Date(),
      }
      setEmployee(employee)
      navigate('/home')
    } catch {
      triggerError(t('offlineMessage'))
    } finally {
      setLoading(false)
    }
  }

  const triggerError = (msg: string) => {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const displayDigits = digits.padEnd(10, '·')

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="bg-[#FAF6EE] dark:bg-[#0F1A14]" style={{
        minHeight: '100vh',
        
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 32px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 20px 0' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 10,
              color: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        {/* Logo + Heading */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 24px 24px' }}>
          <KisanLogo size="md" />
          <h1 className="text-[#1A1A1A] dark:text-[#F0F4F2]" style={{ fontSize: 22, fontWeight: 700,  marginTop: 24, marginBottom: 6, textAlign: 'center' }}>
            {t('enterMobile')}
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: 14,  textAlign: 'center' }}>{t('mobileHint')}</p>
        </div>

        {/* Number Display */}
        <div style={{ padding: '0 20px', marginBottom: 8 }}>
          <motion.div
            animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            style={{
              background: '#fff',
              border: `1.5px solid ${error ? '#EF4444' : '#E5E7EB'}`,
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 72,
              transition: 'border-color 0.2s',
            }}
          >
            <span style={{ fontSize: 18, color: '#9CA3AF', fontWeight: 600 }}>+91</span>
            <div
              style={{
                flex: 1,
                display: 'flex',
                gap: 4,
                justifyContent: 'center',
                letterSpacing: '0.1em',
              }}
            >
              {displayDigits.split('').map((ch, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: i < digits.length ? '#1A1A1A' : '#D1D5DB',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                    minWidth: '1ch',
                    textAlign: 'center',
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ color: '#EF4444', fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Keypad */}
        <div style={{ padding: '8px 20px 0', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {KEYS.map((key) => (
              <KeyButton key={key} label={key} onPress={handleKey} />
            ))}
          </div>
        </div>

        {/* Login Button */}
        <div style={{ padding: '20px 20px 0' }}>
          <motion.button
            whileTap={digits.length === 10 ? { scale: 0.97 } : {}}
            onClick={handleLogin}
            disabled={digits.length !== 10 || loading}
            style={{
              width: '100%',
              height: 56,
              background: digits.length === 10 ? '#1F7A4E' : '#E5E7EB',
              color: digits.length === 10 ? '#fff' : '#9CA3AF',
              border: 'none',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              cursor: digits.length === 10 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? <Spinner /> : t('login')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Key Button ────────────────────────────────────────────────────
function KeyButton({ label, onPress }: { label: string; onPress: (k: string) => void }) {
  const isSpecial = label === 'clear' || label === 'back'

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onPress(label)}
      style={{
        height: 68,
        background: isSpecial ? '#F3F4F6' : '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        fontSize: isSpecial ? 13 : 24,
        fontWeight: isSpecial ? 500 : 600,
        color: isSpecial ? '#6B7280' : '#1A1A1A',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'background 0.1s',
      }}
    >
      {label === 'back' ? (
        <Delete size={20} color="#6B7280" />
      ) : label === 'clear' ? (
        '⌫ CLR'
      ) : (
        label
      )}
    </motion.button>
  )
}

function Spinner() {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )
}
