import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore'
import { db } from '@/firebase.config'
import { COLLECTIONS } from '@shared/types'
import type { TrainingSection } from '@shared/types'
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react'

export function Sections() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<TrainingSection | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const q = query(collection(db, COLLECTIONS.SECTIONS), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingSection))
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (data: { id?: string; name: string; description: string }) => {
      if (data.id) {
        // Edit
        await updateDoc(doc(db, COLLECTIONS.SECTIONS, data.id), {
          name: data.name,
          description: data.description
        })
      } else {
        // Add
        await addDoc(collection(db, COLLECTIONS.SECTIONS), {
          name: data.name,
          description: data.description,
          videoCount: 0,
          createdAt: serverTimestamp()
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
      closeModal()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, COLLECTIONS.SECTIONS, id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
      setDeleteConfirmId(null)
    }
  })

  const openModal = (section?: TrainingSection) => {
    if (section) {
      setEditingSection(section)
      setName(section.name)
      setDescription(section.description)
    } else {
      setEditingSection(null)
      setName('')
      setDescription('')
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSection(null)
    setName('')
    setDescription('')
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    saveMutation.mutate({ id: editingSection?.id, name, description })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#1F7A4E] animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Training Sections</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#1F7A4E] hover:bg-[#165C3A] text-white px-4 py-2 rounded-xl transition-colors font-semibold text-sm shadow-sm"
        >
          <Plus size={18} />
          Add Section
        </button>
      </div>

      {/* Grid */}
      {sections.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 mb-4">
            <Layers size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No sections yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">Create your first training section to get started.</p>
          <button
            onClick={() => openModal()}
            className="bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Section
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sections.map(section => (
            <div key={section.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{section.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0FBF5] text-[#1F7A4E]">
                  {section.videoCount} videos
                </span>
              </div>
              <p className="text-sm text-[#6B7280] mb-5 line-clamp-2 min-h-[40px]">
                {section.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4 mt-auto">
                <p className="text-xs text-[#9CA3AF]">
                  Created {(section.createdAt as any)?.toDate ? (section.createdAt as any).toDate().toLocaleDateString() : section.createdAt instanceof Date ? section.createdAt.toLocaleDateString() : 'recently'}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openModal(section)}
                    className="p-1.5 text-[#6B7280] hover:text-[#1F7A4E] hover:bg-[#F0FBF5] rounded-md transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmId(section.id)}
                    className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                {editingSection ? 'Edit Section' : 'Add Section'}
              </h2>
              <button onClick={closeModal} className="text-[#6B7280] hover:text-[#1A1A1A]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Section Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none"
                    placeholder="e.g. Customer Service"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none min-h-[100px] resize-y"
                    placeholder="Brief description of this training section..."
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending || !name.trim()}
                  className="px-4 py-2 text-sm font-semibold bg-[#1F7A4E] hover:bg-[#165C3A] text-white rounded-lg flex items-center gap-2 disabled:opacity-70 transition-colors"
                >
                  {saveMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Delete Section?</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              This action cannot be undone. Videos belonging to this section will NOT be deleted, but they may lose their categorization.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-colors"
              >
                {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Layers(props: any) {
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
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 17 12 22 22 17" />
    </svg>
  )
}
