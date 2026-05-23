import { motion } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface OfflineScreenProps {
  onRetry: () => void
}

export function OfflineScreen({ onRetry }: OfflineScreenProps) {
  const { t } = useTranslation()

  return (
    <div
      className="bg-[#FAF6EE] dark:bg-[#0F1A14]" style={{
        minHeight: '100vh',
        
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WifiOff size={40} color="#D97706" />
        </div>

        <div>
          <h2
            className="text-[#1A1A1A] dark:text-[#F0F4F2]" style={{
              fontSize: 22,
              fontWeight: 700,
              
              margin: 0,
              marginBottom: 8,
            }}
          >
            {t('offlineTitle')}
          </h2>
          <p className="text-[#6B7280] dark:text-[#9CA3AF]" style={{ fontSize: 15,  margin: 0, lineHeight: 1.6 }}>
            {t('offlineMessage')}
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 32px',
            background: '#1F7A4E',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={16} />
          {t('retry')}
        </motion.button>
      </motion.div>
    </div>
  )
}
