import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import './i18n'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { ProtectedRoute } from './router/ProtectedRoute'
import { LanguagePicker } from './screens/LanguagePicker'
import { Login } from './screens/Login'
import { TrainingHome } from './screens/TrainingHome'
import { VideoPlayer } from './screens/VideoPlayer'
import { Quiz } from './screens/Quiz'
import { Done } from './screens/Done'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useEmployeeStore } from './store/useEmployeeStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LanguagePicker />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <TrainingHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video"
          element={
            <ProtectedRoute>
              <VideoPlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/done"
          element={
            <ProtectedRoute>
              <Done />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const isDarkMode = useEmployeeStore((s) => s.isDarkMode)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AnimatedRoutes />
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: isDarkMode ? '#1A2E22' : '#fff',
                color: isDarkMode ? '#F0F4F2' : '#1A1A1A',
                borderRadius: '12px',
              }
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
