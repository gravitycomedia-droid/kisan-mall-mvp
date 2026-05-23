import { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/firebase.config'
import { COLLECTIONS } from '@shared/types'
import { STORES } from '@shared/stores'
import type { Training, TrainingSection } from '@shared/types'
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { Loader2, Plus, Pencil, Trash2, X, Search, CheckCircle2, PlayCircle, Upload, FileVideo } from 'lucide-react'

function getCurrentWeekNumberAdmin(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
}

export function Trainings() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTraining, setEditingTraining] = useState<Training | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null)

  // Filters
  const [globalFilter, setGlobalFilter] = useState('')
  const [sectionFilter, setSectionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Form State
  const [title, setTitle] = useState('')
  const [section, setSection] = useState('')
  const [description, setDescription] = useState('')
  const [weekNumber, setWeekNumber] = useState(getCurrentWeekNumberAdmin().toString())
  const [storeId, setStoreId] = useState<string>('all')
  const [status, setStatus] = useState<'active' | 'draft'>('draft')
  
  // File Upload State
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch Data
  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, COLLECTIONS.SECTIONS)))
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingSection))
    }
  })

  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ['trainings'],
    queryFn: async () => {
      const q = query(collection(db, COLLECTIONS.TRAININGS), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Training))
    }
  })

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (saveStatus: 'active' | 'draft') => {
      let videoUrl = editingTraining?.storageVideoUrl || ''

      // Upload Video if selected
      if (videoFile) {
        const videoRef = ref(storage, `videos/${Date.now()}_${videoFile.name}`)
        const videoTask = uploadBytesResumable(videoRef, videoFile)
        await new Promise((resolve, reject) => {
          videoTask.on('state_changed', 
            (snapshot) => {
              const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
              setUploadProgress(prog)
            },
            (error) => reject(error),
            async () => {
              videoUrl = await getDownloadURL(videoTask.snapshot.ref)
              resolve(videoUrl)
            }
          )
        })
      }

      const sectionObj = sections.find(s => s.id === section)

      const payload = {
        title,
        description,
        section,
        sectionName: sectionObj?.name || '',
        weekNumber: parseInt(weekNumber, 10),
        storeId: storeId === 'all' ? 'all' : parseInt(storeId, 10),
        status: saveStatus,
        thumbnailUrl: editingTraining?.thumbnailUrl || '',
        muxVideoId: '',
        storageVideoUrl: videoUrl || null,
      }

      if (editingTraining?.id) {
        await updateDoc(doc(db, COLLECTIONS.TRAININGS, editingTraining.id), payload)
      } else {
        await addDoc(collection(db, COLLECTIONS.TRAININGS), {
          ...payload,
          createdAt: serverTimestamp()
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      closeModal()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, COLLECTIONS.TRAININGS, id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      setDeleteConfirmId(null)
    }
  })

  // Table Setup
  const columnHelper = createColumnHelper<Training>()
  const columns = useMemo(() => [
    columnHelper.accessor(row => (typeof row.title === 'string' ? row.title : row.title?.en || ''), {
      id: 'title',
      header: 'Title',
      cell: info => <span className="font-medium text-[#1A1A1A]">{info.getValue()}</span>
    }),
    columnHelper.accessor('sectionName', {
      header: 'Section',
      cell: info => <span className="text-sm text-[#6B7280]">{info.getValue() || 'General'}</span>
    }),
    columnHelper.accessor('weekNumber', {
      header: 'Week',
      cell: info => <span className="text-sm font-medium">Week {info.getValue()}</span>
    }),
    columnHelper.accessor(row => {
      const sid = (row as any).storeId
      if (!sid || sid === 'all') return 'All Stores'
      const store = STORES.find(s => s.id === sid)
      return store ? store.name : 'Unknown'
    }, {
      id: 'store',
      header: 'Store',
      cell: info => <span className="text-sm text-[#6B7280]">{info.getValue()}</span>
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue()
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
            status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {status}
          </span>
        )
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const t = info.row.original
        return (
          <div className="flex items-center gap-2">
            {t.storageVideoUrl && (
              <button 
                onClick={() => setPreviewVideoUrl(t.storageVideoUrl || null)}
                title="Preview"
                className="p-1.5 text-[#6B7280] hover:text-[#3B82F6] hover:bg-blue-50 rounded-md transition-colors"
              >
                <PlayCircle size={18} />
              </button>
            )}
            <button 
              onClick={() => openModal(t)}
              title="Edit"
              className="p-1.5 text-[#6B7280] hover:text-[#1F7A4E] hover:bg-[#F0FBF5] rounded-md transition-colors"
            >
              <Pencil size={18} />
            </button>
            {t.status === 'draft' && (
              <button 
                onClick={() => saveMutation.mutate('active')}
                title="Publish"
                className="p-1.5 text-[#6B7280] hover:text-[#10B981] hover:bg-green-50 rounded-md transition-colors"
              >
                <CheckCircle2 size={18} />
              </button>
            )}
            <button 
              onClick={() => setDeleteConfirmId(t.id)}
              title="Delete"
              className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )
      }
    })
  ], [])

  const filteredData = useMemo(() => {
    return trainings.filter(t => {
      if (sectionFilter !== 'all' && t.section !== sectionFilter) return false
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (globalFilter) {
        const titleStr = typeof t.title === 'string' ? t.title : t.title?.en || ''
        if (!titleStr.toLowerCase().includes(globalFilter.toLowerCase())) return false
      }
      return true
    })
  }, [trainings, sectionFilter, statusFilter, globalFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  })

  const openModal = (t?: Training) => {
    if (t) {
      setEditingTraining(t)
      setTitle(typeof t.title === 'string' ? t.title : t.title?.en || '')
      setDescription(typeof t.description === 'string' ? t.description : t.description?.en || '')
      setSection(t.section)
      setWeekNumber(t.weekNumber.toString())
      setStoreId(((t as any).storeId ?? 'all').toString())
      setStatus(t.status)
    } else {
      setEditingTraining(null)
      setTitle('')
      setDescription('')
      setSection(sections[0]?.id || '')
      setWeekNumber(getCurrentWeekNumberAdmin().toString())
      setStoreId('all')
      setStatus('draft')
    }
    setVideoFile(null)
    setUploadProgress(0)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith('video/') || file.name.endsWith('.mov'))) {
      setVideoFile(file)
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Trainings</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-[#1F7A4E] hover:bg-[#165C3A] text-white px-4 py-2 rounded-xl transition-colors font-semibold text-sm shadow-sm"
        >
          <Plus size={18} />
          Add Training
        </button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-[#E5E7EB] flex flex-wrap gap-4 items-center bg-[#F9FAFB]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] w-4 h-4" />
            <input
              type="text"
              placeholder="Search trainings..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1F7A4E]"
            />
          </div>
          <select
            value={sectionFilter}
            onChange={e => setSectionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F7A4E]"
          >
            <option value="all">All Sections</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F7A4E]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-[#6B7280] font-medium border-b border-[#E5E7EB]">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 font-semibold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-[#F9FAFB] transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-[#6B7280]">
                    No trainings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
          <span className="text-sm text-[#6B7280]">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border border-[#E5E7EB] rounded-md text-sm font-medium bg-white disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border border-[#E5E7EB] rounded-md text-sm font-medium bg-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Create/Edit Training Modal ═══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FAF6EE] rounded-2xl w-full max-w-2xl shadow-xl flex flex-col my-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB] bg-white rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">
                  {editingTraining ? 'Edit Training' : 'Create New Training'}
                </h2>
                <p className="text-sm text-[#6B7280] mt-0.5">
                  {editingTraining ? 'Update training details' : 'Add a new training video for your employees'}
                </p>
              </div>
              <button onClick={closeModal} className="text-[#6B7280] hover:text-[#1A1A1A] p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Training Title */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Training Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none text-[#1A1A1A]"
                  placeholder="e.g. How to greet customers"
                  required
                />
              </div>

              {/* Section + Week Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Section</label>
                  <select
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none"
                    required
                  >
                    <option value="" disabled>Select Section</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Training Week</label>
                  <input
                    type="text"
                    value={`Week ${weekNumber}`}
                    onChange={e => {
                      const num = e.target.value.replace(/\D/g, '')
                      setWeekNumber(num || '1')
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Store Location */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Store Location</label>
                <select
                  value={storeId}
                  onChange={e => setStoreId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none"
                >
                  <option value="all">All Stores</option>
                  {STORES.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.city}, {s.state}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none min-h-[80px] resize-y"
                  placeholder="Short description"
                />
              </div>

              {/* Video Upload — Drag & Drop */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-1">Upload Video</label>
                <p className="text-xs text-[#6B7280] mb-3">Upload one video per language</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragging 
                      ? 'border-[#1F7A4E] bg-[#F0FBF5]' 
                      : videoFile 
                        ? 'border-[#1F7A4E] bg-[#F0FBF5]'
                        : 'border-[#D4C9A8] bg-[#FAF6EE] hover:border-[#1F7A4E] hover:bg-[#F0FBF5]'
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={e => setVideoFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {videoFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileVideo size={32} className="text-[#1F7A4E]" />
                      <p className="text-sm font-semibold text-[#1A1A1A]">{videoFile.name}</p>
                      <p className="text-xs text-[#6B7280]">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setVideoFile(null) }}
                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : editingTraining?.storageVideoUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileVideo size={32} className="text-[#1F7A4E]" />
                      <p className="text-sm font-medium text-[#1A1A1A]">Video already uploaded</p>
                      <p className="text-xs text-[#6B7280]">Drop a new video to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#F0FBF5] flex items-center justify-center mb-1">
                        <Upload size={20} className="text-[#1F7A4E]" />
                      </div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">Drop video here or click to browse</p>
                      <p className="text-xs text-[#6B7280]">MP4, MOV up to 100 MB · vertical 9:16 recommended</p>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1F7A4E] transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1 text-center">{uploadProgress}% uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer — Cancel / Save as Draft / Publish */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] bg-white rounded-b-2xl flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] border border-[#E5E7EB] rounded-xl bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { if (title && section) saveMutation.mutate('draft') }}
                disabled={saveMutation.isPending || !title || !section}
                className="px-5 py-2.5 text-sm font-semibold bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl flex items-center gap-2 disabled:opacity-60 transition-colors"
              >
                {saveMutation.isPending && status === 'draft' && <Loader2 size={14} className="animate-spin" />}
                Save as Draft
              </button>
              <button
                onClick={() => { if (title && section) saveMutation.mutate('active') }}
                disabled={saveMutation.isPending || !title || !section}
                className="px-5 py-2.5 text-sm font-semibold bg-[#1F7A4E] hover:bg-[#165C3A] text-white rounded-xl flex items-center gap-2 disabled:opacity-60 transition-colors"
              >
                {saveMutation.isPending && status === 'active' && <Loader2 size={14} className="animate-spin" />}
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <Trash2 size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Delete Training?</h3>
            <p className="text-sm text-[#6B7280] mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg"
              >
                {deleteMutation.isPending ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-black rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setPreviewVideoUrl(null)} 
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full"
            >
              <X size={24} />
            </button>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <video 
                src={previewVideoUrl}
                className="w-full h-full"
                controls
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
