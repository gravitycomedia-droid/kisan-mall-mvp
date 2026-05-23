import { Navigate } from 'react-router-dom'
import { useEmployeeStore } from '../store/useEmployeeStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const employee = useEmployeeStore((s) => s.employee)
  if (!employee) return <Navigate to="/" replace />
  return <>{children}</>
}
