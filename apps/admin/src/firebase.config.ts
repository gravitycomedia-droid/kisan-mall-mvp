import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDLAALgd4wCKAcYtZ88lU3GQCbsMiVmUSI",
  authDomain: "kisan-mvp.firebaseapp.com",
  projectId: "kisan-mvp",
  storageBucket: "kisan-mvp.firebasestorage.app",
  messagingSenderId: "419227645965",
  appId: "1:419227645965:web:04f90fc33fb7122213bd44",
  measurementId: "G-6D04KBBP35"
};

// Prevent duplicate app initialization (dev hot-reload safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
export { app }

/** Helper: returns the Firestore instance */
export const getDb = () => db
