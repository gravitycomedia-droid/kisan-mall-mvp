import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase.config'
import { Loader2, Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'te', name: 'Telugu' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
]

export function Languages() {
  const queryClient = useQueryClient()
  const [activeLangs, setActiveLangs] = useState<Record<string, boolean>>({
    en: true,
    te: true,
    hi: true,
    mr: true,
  })

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
    if (settings?.languages) {
      setActiveLangs(settings.languages)
    }
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: async (newLangs: Record<string, boolean>) => {
      await setDoc(doc(db, 'settings', 'global'), { languages: newLangs }, { merge: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'global'] })
    }
  })

  const toggleLanguage = (code: string) => {
    // Prevent disabling English
    if (code === 'en') return

    const newLangs = { ...activeLangs, [code]: !activeLangs[code] }
    setActiveLangs(newLangs)
    saveMutation.mutate(newLangs)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#1F7A4E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A1A]">Languages Configuration</h1>
        <p className="text-sm text-[#6B7280] mt-1">Manage which languages are available for employees in the mobile app.</p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LANGUAGES.map(lang => {
              const isActive = activeLangs[lang.code] ?? true
              const isEnglish = lang.code === 'en'

              return (
                <div 
                  key={lang.code}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    isActive 
                      ? 'border-[#1F7A4E] bg-[#F0FBF5]' 
                      : 'border-[#E5E7EB] bg-gray-50 opacity-60 grayscale'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-[#1F7A4E] text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${isActive ? 'text-[#1F7A4E]' : 'text-gray-500'}`}>{lang.name}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{lang.code}</p>
                    </div>
                  </div>

                  {isEnglish ? (
                    <div className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                      Default
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleLanguage(lang.code)}
                      disabled={saveMutation.isPending}
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F7A4E] focus:ring-offset-2 ${
                        isActive ? 'bg-[#1F7A4E]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          isActive ? 'translate-x-8' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
