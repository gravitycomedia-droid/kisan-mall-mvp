import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, doc, setDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase.config'
import { COLLECTIONS } from '@shared/types'
import type { Training, Quiz, QuizQuestion } from '@shared/types'
import { Loader2, Plus, Pencil, Trash2, X, Check, Save, Languages } from 'lucide-react'
import { translateQuizQuestion } from '../services/translateService'

// Helper to get fresh empty question
const getEmptyQuestion = (): QuizQuestion => ({
  id: Math.random().toString(36).substring(2, 9),
  text: { en: '', te: '', hi: '', mr: '' },
  options: {
    en: ['', '', '', ''],
    te: ['', '', '', ''],
    hi: ['', '', '', ''],
    mr: ['', '', '', '']
  },
  correctIndex: 0
})

export function QuizManagement() {
  const queryClient = useQueryClient()
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null)
  
  // Editor State
  const [passingMarks, setPassingMarks] = useState(60)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [currentQ, setCurrentQ] = useState<QuizQuestion>(getEmptyQuestion())
  const [isTranslating, setIsTranslating] = useState(false)
  const [activeLangTab, setActiveLangTab] = useState<'en'|'te'|'hi'|'mr'>('en')

  // Fetch Trainings
  const { data: trainings = [], isLoading: isLoadingTrainings } = useQuery({
    queryKey: ['trainings'],
    queryFn: async () => {
      const q = query(collection(db, COLLECTIONS.TRAININGS), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Training))
    }
  })

  const selectedTraining = trainings.find(t => t.id === selectedTrainingId)

  // Fetch Quiz for selected training
  const { data: currentQuiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', selectedTrainingId],
    queryFn: async () => {
      if (!selectedTrainingId) return null
      const q = query(collection(db, COLLECTIONS.QUIZZES), where('trainingId', '==', selectedTrainingId))
      const snap = await getDocs(q)
      if (snap.empty) return null
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as Quiz
    },
    enabled: !!selectedTrainingId
  })

  // Sync state when quiz loads
  useEffect(() => {
    if (currentQuiz) {
      setPassingMarks(currentQuiz.passingMarks || 60)
      setQuestions(currentQuiz.questions || [])
    } else {
      setPassingMarks(60)
      setQuestions([])
    }
  }, [currentQuiz, selectedTrainingId])

  const saveQuizMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTrainingId) return
      
      const payload = {
        trainingId: selectedTrainingId,
        passingMarks,
        questions
      }

      const docId = currentQuiz?.id || selectedTrainingId
      await setDoc(doc(db, COLLECTIONS.QUIZZES, docId), payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz', selectedTrainingId] })
      alert('Quiz saved successfully!')
    }
  })

  const openQuestionModal = (q?: QuizQuestion) => {
    setActiveLangTab('en') // Reset tab when opening modal
    if (q) {
      setEditingQuestionId(q.id)
      setCurrentQ(JSON.parse(JSON.stringify(q)))
    } else {
      setEditingQuestionId(null)
      setCurrentQ(getEmptyQuestion())
    }
    setIsModalOpen(true)
  }

  // Auto-translate the current question from English to te/hi/mr
  const handleAutoTranslate = async () => {
    if (!currentQ.text.en.trim()) {
      alert('Please enter the English question text first.')
      return
    }
    // Check at least some English options are filled
    const hasOptions = currentQ.options.en.some(o => o.trim())
    if (!hasOptions) {
      alert('Please enter at least some English options first.')
      return
    }

    setIsTranslating(true)
    try {
      const translated = await translateQuizQuestion({
        text: currentQ.text as any,
        options: currentQ.options as any,
      })
      setCurrentQ(prev => ({
        ...prev,
        text: translated.text,
        options: translated.options,
      }))
    } catch (err: any) {
      alert('Translation error: ' + (err.message || 'Unknown error'))
    } finally {
      setIsTranslating(false)
    }
  }

  const saveQuestion = () => {
    if (!currentQ.text.en.trim()) {
      alert('English question text is required.')
      return
    }

    if (editingQuestionId) {
      setQuestions(prev => prev.map(q => q.id === editingQuestionId ? currentQ : q))
    } else {
      setQuestions(prev => [...prev, currentQ])
    }
    setIsModalOpen(false)
  }

  const deleteQuestion = (id: string) => {
    if (window.confirm('Delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== id))
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-112px)] gap-6">
      {/* Left Panel: Trainings List */}
      <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <h2 className="font-bold text-[#1A1A1A]">Select Training</h2>
          <p className="text-xs text-[#6B7280] mt-1">Choose a training to manage its quiz</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingTrainings ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#1F7A4E]" /></div>
          ) : trainings.length === 0 ? (
            <p className="text-sm text-center text-[#6B7280] p-4">No trainings found.</p>
          ) : (
            <ul className="space-y-1">
              {trainings.map(t => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedTrainingId(t.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedTrainingId === t.id
                        ? 'bg-[#F0FBF5] border border-[#1F7A4E]/30 shadow-sm'
                        : 'hover:bg-[#F9FAFB] border border-transparent'
                    }`}
                  >
                    <p className={`text-sm font-semibold truncate ${selectedTrainingId === t.id ? 'text-[#1F7A4E]' : 'text-[#1A1A1A]'}`}>
                      {typeof t.title === 'string' ? t.title : t.title?.en || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#6B7280] bg-gray-100 px-2 py-0.5 rounded-md">
                        {t.sectionName || 'General'}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Panel: Quiz Editor */}
      <div className="w-full md:w-[65%] lg:w-[70%] flex flex-col bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        {!selectedTrainingId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#6B7280]">
            <FileQuestion size={48} className="text-gray-300 mb-4" />
            <p>Select a training from the left to manage its quiz</p>
          </div>
        ) : isLoadingQuiz ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1F7A4E]" /></div>
        ) : (
          <>
            <div className="p-5 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4 bg-white">
              <div>
                <h2 className="font-bold text-[#1A1A1A] text-lg">
                  Quiz: {typeof selectedTraining?.title === 'string' ? selectedTraining.title : selectedTraining?.title?.en}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <label className="text-sm font-medium text-[#6B7280] flex items-center gap-2">
                    Passing Marks (%):
                    <input 
                      type="number" 
                      value={passingMarks}
                      onChange={e => setPassingMarks(Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1F7A4E]"
                    />
                  </label>
                  <span className="text-sm text-[#6B7280] bg-gray-100 px-2 py-1 rounded-md">
                    Total Questions: {questions.length}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openQuestionModal()}
                  className="bg-[#F0FBF5] text-[#1F7A4E] hover:bg-[#E0F2E9] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} /> Add Question
                </button>
                <button
                  onClick={() => saveQuizMutation.mutate()}
                  disabled={saveQuizMutation.isPending}
                  className="bg-[#1F7A4E] text-white hover:bg-[#165C3A] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-70"
                >
                  {saveQuizMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Quiz
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#FAF6EE]">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#6B7280]">No questions yet. Add the first question.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <div key={q.id} className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm relative group">
                      <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <button onClick={() => openQuestionModal(q)} className="p-1.5 text-[#6B7280] hover:text-[#1F7A4E] bg-gray-50 hover:bg-[#F0FBF5] rounded-md transition-colors shadow-sm">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteQuestion(q.id)} className="p-1.5 text-[#6B7280] hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-md transition-colors shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 flex-shrink-0 bg-[#F0FBF5] text-[#1F7A4E] font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-semibold text-[#1A1A1A] mb-1">{q.text.en}</p>
                          {/* Show translation preview */}
                          {q.text.te && (
                            <p className="text-xs text-[#6B7280] mb-2">
                              <span className="font-medium">తె:</span> {q.text.te.substring(0, 60)}{q.text.te.length > 60 ? '...' : ''}
                            </p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {q.options.en.map((opt, optIndex) => (
                              <div 
                                key={optIndex}
                                className={`px-3 py-2 border rounded-lg text-sm flex items-center gap-2 ${
                                  q.correctIndex === optIndex 
                                    ? 'border-green-500 bg-green-50 text-green-800 font-medium' 
                                    : 'border-[#E5E7EB] text-[#6B7280]'
                                }`}
                              >
                                {q.correctIndex === optIndex && <Check size={14} className="text-green-600" />}
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[95vh] my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                {editingQuestionId ? 'Edit Question' : 'Add Question'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B7280] hover:text-[#1A1A1A]">
                <X size={20} />
              </button>
            </div>
            
            {/* Language Tabs */}
            <div className="flex border-b border-[#E5E7EB] px-6 pt-2 bg-gray-50 overflow-x-auto hide-scrollbar">
              {(['en', 'te', 'hi', 'mr'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLangTab(lang)}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeLangTab === lang
                      ? 'border-[#1F7A4E] text-[#1F7A4E]'
                      : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'te' ? 'Telugu' : lang === 'hi' ? 'Hindi' : 'Marathi'}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Question Text ({activeLangTab.toUpperCase()})</label>
                <textarea
                  value={currentQ.text[activeLangTab] || ''}
                  onChange={e => setCurrentQ(prev => ({
                    ...prev,
                    text: { ...prev.text, [activeLangTab]: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none min-h-[80px]"
                  placeholder={`Type the question in ${activeLangTab.toUpperCase()}...`}
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">Options {activeLangTab === 'en' && '& Correct Answer'}</label>
                <div className="space-y-3">
                  {[0, 1, 2, 3].map(optIndex => (
                    <div key={optIndex} className="flex items-center gap-3">
                      {activeLangTab === 'en' ? (
                        <label className="flex items-center justify-center cursor-pointer">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={currentQ.correctIndex === optIndex}
                            onChange={() => setCurrentQ(prev => ({ ...prev, correctIndex: optIndex }))}
                            className="w-5 h-5 text-[#1F7A4E] border-gray-300 focus:ring-[#1F7A4E]"
                          />
                        </label>
                      ) : (
                        <div className="w-5 h-5 flex items-center justify-center">
                          {currentQ.correctIndex === optIndex ? <Check size={16} className="text-green-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                        </div>
                      )}
                      <span className="font-mono font-bold text-gray-400 w-4">{['A', 'B', 'C', 'D'][optIndex]}</span>
                      <input
                        type="text"
                        value={currentQ.options[activeLangTab][optIndex] || ''}
                        onChange={e => {
                          const newOptions = [...currentQ.options[activeLangTab]]
                          newOptions[optIndex] = e.target.value
                          setCurrentQ(prev => ({
                            ...prev,
                            options: { ...prev.options, [activeLangTab]: newOptions }
                          }))
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                          currentQ.correctIndex === optIndex 
                            ? 'border-green-400 focus:ring-green-400 bg-green-50' 
                            : 'border-[#E5E7EB] focus:ring-[#1F7A4E]'
                        }`}
                        placeholder={`Option ${['A', 'B', 'C', 'D'][optIndex]}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-Translate Button */}
              {activeLangTab === 'en' && (
                <div className="p-4 bg-[#F0FBF5] border border-[#1F7A4E]/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                        <Languages size={16} className="text-[#1F7A4E]" />
                        Auto-Translate
                      </h4>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Automatically translate to Telugu, Hindi & Marathi using Google Translate
                      </p>
                    </div>
                    <button
                      onClick={handleAutoTranslate}
                      disabled={isTranslating || !currentQ.text.en.trim()}
                      className="px-4 py-2 bg-[#1F7A4E] hover:bg-[#165C3A] text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                      {isTranslating ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                      {isTranslating ? 'Translating...' : 'Translate'}
                    </button>
                  </div>
                  {currentQ.text.te && (
                    <p className="text-xs text-[#1F7A4E] mt-3 font-medium flex items-center gap-1">
                      <Check size={14} /> Translated! Click the language tabs above to view/edit.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#E5E7EB] bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A]"
              >
                Cancel
              </button>
              <button
                onClick={saveQuestion}
                className="px-6 py-2 text-sm font-semibold bg-[#1F7A4E] hover:bg-[#165C3A] text-white rounded-lg transition-colors"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FileQuestion(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9.09 13.5a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="21" x2="12.01" y2="21" />
    </svg>
  )
}
