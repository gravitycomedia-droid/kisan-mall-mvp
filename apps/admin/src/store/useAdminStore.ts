import { create } from 'zustand'
import { auth } from '@/firebase.config'
import { signOut } from 'firebase/auth'

interface AdminState {
  admin: { uid: string; email: string } | null
  loading: boolean
  setAdmin: (admin: { uid: string; email: string } | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
}

export const useAdminStore = create<AdminState>((set) => ({
  admin: null,
  loading: true,
  setAdmin: (admin) => set({ admin }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    try {
      await signOut(auth)
      set({ admin: null })
    } catch (error) {
      console.error('Error logging out:', error)
    }
  },
}))
