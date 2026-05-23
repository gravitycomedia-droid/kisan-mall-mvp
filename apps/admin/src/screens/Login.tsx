import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase.config'
import { useAdminStore } from '../store/useAdminStore'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const setAdmin = useAdminStore((s) => s.setAdmin)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Check if user exists in the admins collection
      const adminDoc = await getDoc(doc(db, 'admins', user.uid))
      
      if (!adminDoc.exists()) {
        await signOut(auth)
        setError('Unauthorized access. This account is not an admin.')
        setLoading(false)
        return
      }

      // Success
      setAdmin({ uid: user.uid, email: user.email || '' })
      
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.')
      } else {
        setError(err.message || 'Failed to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#E5E7EB]">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-3xl font-extrabold text-[#E91E8C] tracking-tighter leading-none mb-1">
            KISAN
          </span>
          <span className="text-[10px] font-medium text-[#6B7280] tracking-[0.2em] uppercase">
            Fashion Mall
          </span>
          <h1 className="text-xl font-bold text-[#1A1A1A] mt-6">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F7A4E] focus:bg-white transition-all"
              placeholder="admin@kisanmall.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F7A4E] focus:bg-white transition-all pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1F7A4E] hover:bg-[#165C3A] text-white font-semibold py-3.5 rounded-xl transition-colors mt-2 flex items-center justify-center disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
          </button>
        </form>

      </div>
    </div>
  )
}
