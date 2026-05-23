import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from './router/ProtectedRoute'
import { AdminLayout } from './components/AdminLayout'

// Screens
import { Login } from './screens/Login'
import { Dashboard } from './screens/Dashboard'
import { Sections } from './screens/Sections'
import { Trainings } from './screens/Trainings'
import { QuizManagement } from './screens/QuizManagement'
import { Employees } from './screens/Employees'
import { Reports } from './screens/Reports'
import { Languages } from './screens/Languages'
import { Settings } from './screens/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

NProgress.configure({ showSpinner: false })

function RouteProgress() {
  const location = useLocation()
  
  useEffect(() => {
    NProgress.start()
    const timer = setTimeout(() => NProgress.done(), 300)
    return () => clearTimeout(timer)
  }, [location.pathname])
  
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouteProgress />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sections" element={<Sections />} />
            <Route path="/trainings" element={<Trainings />} />
            <Route path="/quiz" element={<QuizManagement />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/languages" element={<Languages />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
