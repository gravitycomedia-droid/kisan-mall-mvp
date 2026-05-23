import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { updatePassword } from 'firebase/auth'
import { db, auth } from '@/firebase.config'
import { Loader2, Settings as SettingsIcon, Shield, AlertTriangle, Database } from 'lucide-react'
import { seedDemoData } from '../scripts/seedData'

export function Settings() {
  const queryClient = useQueryClient()
  
  // App Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [activeWeek, setActiveWeek] = useState(1)
  
  // Password Update State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Seed Data State
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedProgress, setSeedProgress] = useState('')

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'global'],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'settings', 'global'))
      if (snap.exists()) {
        return snap.data()
      }
      return null
    }
  })

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenanceMode ?? false)
      setActiveWeek(settings.activeWeek ?? 1)
    }
  }, [settings])

  const saveSettingsMutation = useMutation({
    mutationFn: async (payload: { maintenanceMode?: boolean, activeWeek?: number }) => {
      await setDoc(doc(db, 'settings', 'global'), payload, { merge: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'global'] })
      alert('Settings saved successfully!')
    }
  })

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    if (!auth.currentUser) {
      setPasswordError('You must be logged in to update your password')
      return
    }

    setIsUpdatingPassword(true)
    try {
      await updatePassword(auth.currentUser, newPassword)
      setPasswordSuccess('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/requires-recent-login') {
        setPasswordError('Please log out and log back in to update your password for security reasons.')
      } else {
        setPasswordError(err.message || 'Failed to update password')
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleSeedData = async () => {
    if (!window.confirm("Are you sure you want to seed demo data? This will clear and rewrite the database!")) return
    setIsSeeding(true)
    setSeedProgress("Starting seed...")
    try {
      await seedDemoData(setSeedProgress)
      alert("Seeding complete!")
      window.location.reload()
    } catch (e: any) {
      alert("Error seeding data: " + e.message)
    } finally {
      setIsSeeding(false)
      setSeedProgress("")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#1F7A4E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A1A]">Platform Settings</h1>
        <p className="text-sm text-[#6B7280] mt-1">Configure global application behavior and security.</p>
      </div>

      {/* Global Config Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3 bg-[#F9FAFB]">
          <SettingsIcon className="text-[#1F7A4E]" size={20} />
          <h2 className="font-bold text-[#1A1A1A]">Global Configuration</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-[#E5E7EB]">
            <div>
              <h3 className="font-semibold text-[#1A1A1A]">Maintenance Mode</h3>
              <p className="text-sm text-[#6B7280] mt-1">If enabled, the employee app will show a maintenance screen and prevent logins.</p>
            </div>
            <button
              onClick={() => {
                const newVal = !maintenanceMode
                setMaintenanceMode(newVal)
                saveSettingsMutation.mutate({ maintenanceMode: newVal })
              }}
              disabled={saveSettingsMutation.isPending}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F7A4E] focus:ring-offset-2 ${
                maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                maintenanceMode ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F0FBF5] rounded-xl border border-[#1F7A4E]/30">
            <div>
              <h3 className="font-semibold text-[#1A1A1A]">Current Active Week</h3>
              <p className="text-sm text-[#6B7280] mt-1">Determines which trainings are prominently shown or required.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-[#1F7A4E]">Week:</label>
              <input 
                type="number" 
                min="1" 
                max="52"
                value={activeWeek}
                onChange={e => setActiveWeek(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F7A4E]"
              />
              <button 
                onClick={() => saveSettingsMutation.mutate({ activeWeek })}
                disabled={saveSettingsMutation.isPending || activeWeek === settings?.activeWeek}
                className="px-4 py-2 bg-[#1F7A4E] hover:bg-[#165C3A] text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3 bg-[#F9FAFB]">
          <Shield className="text-[#1F7A4E]" size={20} />
          <h2 className="font-bold text-[#1A1A1A]">Security (Admin Account)</h2>
        </div>
        
        <form onSubmit={handlePasswordUpdate} className="p-6">
          {passwordError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium">{passwordError}</p>
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
              {passwordSuccess}
            </div>
          )}

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F7A4E] focus:bg-white transition-all"
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1F7A4E] focus:bg-white transition-all"
                placeholder="Confirm new password"
                required
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                className="w-full bg-[#1A1A1A] hover:bg-black text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isUpdatingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Developer Section - Only in DEV */}
      {((import.meta as any).env.DEV || (import.meta as any).env.MODE === 'development') && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3 bg-[#F9FAFB]">
            <Database className="text-[#1F7A4E]" size={20} />
            <h2 className="font-bold text-[#1A1A1A]">Developer Options</h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div>
                <h3 className="font-semibold text-orange-900">Seed Demo Data</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Populate Firestore with 150 employees, sections, multilingual quizzes, and trainings.
                  Use this to test the dashboard with realistic dummy data.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSeedData}
                  disabled={isSeeding}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                  {isSeeding ? 'Seeding...' : 'Seed Demo Data'}
                </button>
                {seedProgress && (
                  <span className="text-sm font-medium text-orange-800 flex-1 truncate">
                    {seedProgress}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
