import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Employee, Training, SupportedLanguage } from '@shared/types'
import i18n from '../i18n'

interface EmployeeStore {
  employee: Employee | null
  language: SupportedLanguage
  currentTraining: Training | null
  quizUnlocked: boolean
  watchedSeconds: number
  hasCompletedThisWeek: boolean
  isDarkMode: boolean

  // Actions
  setEmployee: (employee: Employee) => void
  setLanguage: (language: SupportedLanguage) => void
  setTraining: (training: Training) => void
  unlockQuiz: () => void
  updateWatchedSeconds: (seconds: number) => void
  setHasCompletedThisWeek: (val: boolean) => void
  setIsDarkMode: (val: boolean) => void
  logout: () => void
  resetQuizState: () => void
}

export const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set) => ({
      employee: null,
      language: 'en',
      currentTraining: null,
      quizUnlocked: false,
      watchedSeconds: 0,
      hasCompletedThisWeek: false,
      isDarkMode: false,

      setEmployee: (employee) => set({ employee }),

      setLanguage: (language) => {
        i18n.changeLanguage(language)
        set({ language })
      },

      setTraining: (training) =>
        set({ currentTraining: training, quizUnlocked: false, watchedSeconds: 0 }),

      unlockQuiz: () => set({ quizUnlocked: true }),

      updateWatchedSeconds: (seconds) => set({ watchedSeconds: seconds }),

      setHasCompletedThisWeek: (val) => set({ hasCompletedThisWeek: val }),

      setIsDarkMode: (val) => set({ isDarkMode: val }),

      logout: () =>
        set({
          employee: null,
          currentTraining: null,
          quizUnlocked: false,
          watchedSeconds: 0,
          hasCompletedThisWeek: false,
        }),

      resetQuizState: () =>
        set({ quizUnlocked: false, watchedSeconds: 0, hasCompletedThisWeek: false }),
    }),
    {
      name: 'kisan-employee-store',
      // Persist language, employee, and transient quiz state to survive reloads
      partialize: (state) => ({
        language: state.language,
        employee: state.employee,
        currentTraining: state.currentTraining,
        quizUnlocked: state.quizUnlocked,
        hasCompletedThisWeek: state.hasCompletedThisWeek,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
)
