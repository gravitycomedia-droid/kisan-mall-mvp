import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase.config'
import { useAdminStore } from './store/useAdminStore'

// Set up auth state listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid))
      if (adminDoc.exists()) {
        useAdminStore.getState().setAdmin({ uid: user.uid, email: user.email || '' })
      } else {
        useAdminStore.getState().setAdmin(null)
      }
    } catch (e) {
      console.error("Error fetching admin doc:", e)
      useAdminStore.getState().setAdmin(null)
    }
  } else {
    useAdminStore.getState().setAdmin(null)
  }
  useAdminStore.getState().setLoading(false)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
