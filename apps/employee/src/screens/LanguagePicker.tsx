import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEmployeeStore } from '../store/useEmployeeStore'
import { KisanLogo } from '../components/KisanLogo'
import type { SupportedLanguage } from '@shared/types'

const languages: Array<{
  code: SupportedLanguage
  native: string
  english: string
}> = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'mr', native: 'मराठी', english: 'Marathi' },
]

export function LanguagePicker() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setLanguage, language: storedLang } = useEmployeeStore()
  const [selected, setSelected] = useState<SupportedLanguage | null>(storedLang ?? null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstall(false)
      }
    }
  }

  const handleSelect = (code: SupportedLanguage) => {
    setSelected(code)
    setLanguage(code)
  }

  const handleContinue = () => {
    if (selected) navigate('/login')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-[#FAF6EE] dark:bg-[#0F1A14]" style={{
        minHeight: '100vh',
        
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <KisanLogo size="lg" />
        </div>

        {/* Heading */}
        <motion.h1
          key={selected}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#1A1A1A] dark:text-[#F0F4F2]" style={{
            fontSize: 22,
            fontWeight: 700,
            
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          {t('selectLanguage')}
        </motion.h1>

        {/* Language Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            marginBottom: 32,
          }}
        >
          {languages.map((lang, i) => {
            const isSelected = selected === lang.code
            return (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelect(lang.code)}
                style={{
                  background: isSelected ? '#F0FBF5' : '#FFFFFF',
                  border: isSelected ? '2px solid #1F7A4E' : '1.5px solid #E5E7EB',
                  borderRadius: 16,
                  padding: '24px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  position: 'relative',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 0 0 0 transparent' : '0 1px 4px rgba(0,0,0,0.05)',
                  fontFamily: 'inherit',
                }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#1F7A4E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={13} color="#fff" strokeWidth={3} />
                  </motion.div>
                )}
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: isSelected ? '#1F7A4E' : '#1A1A1A',
                    fontFamily:
                      lang.code === 'te'
                        ? '"Noto Sans Telugu", sans-serif'
                        : lang.code === 'hi' || lang.code === 'mr'
                        ? '"Noto Sans Devanagari", sans-serif'
                        : '"Plus Jakarta Sans", sans-serif',
                  }}
                >
                  {lang.native}
                </span>
                <span className="text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: 13,  fontWeight: 500 }}>
                  {lang.english}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Continue Button */}
        <motion.button
          whileTap={{ scale: selected ? 0.97 : 1 }}
          onClick={handleContinue}
          disabled={!selected}
          style={{
            width: '100%',
            height: 56,
            background: selected ? '#1F7A4E' : '#E5E7EB',
            color: selected ? '#fff' : '#9CA3AF',
            border: 'none',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            cursor: selected ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            letterSpacing: '0.01em',
          }}
        >
          {t('continue')} →
        </motion.button>
      </div>

      {/* Install App Banner */}
      {showInstall && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A2E22]" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            
            padding: '16px 20px',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 50,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <div>
            <h4 className="text-[#1A1A1A] dark:text-[#F0F4F2]" style={{ margin: 0, fontSize: 15, fontWeight: 700,  }}>
              {t('Install App')}
            </h4>
            <p className="text-[#6B7280] dark:text-[#9CA3AF]" style={{ margin: '2px 0 0', fontSize: 13,  }}>
              {t('Add to home screen for quick access')}
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            style={{
              background: '#1F7A4E',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('Install')}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
