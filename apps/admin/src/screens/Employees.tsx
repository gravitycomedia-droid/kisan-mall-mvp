import { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/firebase.config'
import { DEPARTMENTS } from '@shared/constants'
import { COLLECTIONS } from '@shared/types'
import type { Employee } from '@shared/types'
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { Loader2, Plus, Pencil, Trash2, X, Search, CheckCircle2, XCircle, Upload, Download, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'

export function Employees() {
  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Filters
  const [globalFilter, setGlobalFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Form State
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [department, setDepartment] = useState<typeof DEPARTMENTS[number]>(DEPARTMENTS[0])
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  
  // Bulk Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{success: number, failed: number, errors: string[]} | null>(null)

  // Fetch Data
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, COLLECTIONS.EMPLOYEES))
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Employee))
    }
  })

  // Stats
  const stats = useMemo(() => {
    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      inactive: employees.filter(e => e.status === 'inactive').length
    }
  }, [employees])

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Validate mobile 10 digits
      if (!/^\d{10}$/.test(mobile)) {
        throw new Error('Mobile number must be exactly 10 digits.')
      }

      const payload = {
        name,
        mobile,
        department,
        status,
        language: editingEmployee?.language || 'en',
      }

      if (editingEmployee?.id) {
        // Edit (using original ID, even if mobile changed it's better to keep same ID or we'd have to migrate. For MVP we use mobile as ID for new docs)
        await updateDoc(doc(db, COLLECTIONS.EMPLOYEES, editingEmployee.id), payload)
      } else {
        // Add new: use mobile as ID for easy login lookups
        await setDoc(doc(db, COLLECTIONS.EMPLOYEES, mobile), {
          ...payload,
          lastCompletedWeek: null,
          createdAt: serverTimestamp()
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setIsAddModalOpen(false)
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to save employee')
    }
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async (emp: Employee) => {
      const newStatus = emp.status === 'active' ? 'inactive' : 'active'
      await updateDoc(doc(db, COLLECTIONS.EMPLOYEES, emp.id), { status: newStatus })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, COLLECTIONS.EMPLOYEES, id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setDeleteConfirmId(null)
    }
  })

  // Table Setup
  const columnHelper = createColumnHelper<Employee>()
  const columns = useMemo(() => [
    columnHelper.display({
      id: 'index',
      header: '#',
      cell: info => <span className="text-sm text-[#6B7280]">{info.row.index + 1}</span>
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => <span className="font-semibold text-[#1A1A1A]">{info.getValue()}</span>
    }),
    columnHelper.accessor('mobile', {
      header: 'Mobile',
      cell: info => <span className="text-[#6B7280]">{info.getValue().replace(/(\d{2})\d{5}(\d{3})/, '$1XXXXX$2')}</span>
    }),
    columnHelper.accessor('department', {
      header: 'Department',
      cell: info => (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue()
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            status === 'active' ? 'bg-[#F0FBF5] text-[#1F7A4E]' : 'bg-red-50 text-red-600'
          }`}>
            {status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )
      }
    }),
    columnHelper.accessor('lastCompletedWeek', {
      header: 'Last Completed',
      cell: info => {
        const val = info.getValue()
        return <span className="text-[#6B7280]">{val ? `Week ${val}` : 'Never'}</span>
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const emp = info.row.original
        return (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => openAddModal(emp)}
              title="Edit"
              className="p-1.5 text-[#6B7280] hover:text-[#1F7A4E] hover:bg-[#F0FBF5] rounded-md transition-colors"
            >
              <Pencil size={18} />
            </button>
            <button 
              onClick={() => {
                if(window.confirm(`Are you sure you want to ${emp.status === 'active' ? 'deactivate' : 'activate'} ${emp.name}?`)) {
                  toggleStatusMutation.mutate(emp)
                }
              }}
              title={emp.status === 'active' ? 'Deactivate' : 'Activate'}
              className={`p-1.5 rounded-md transition-colors ${
                emp.status === 'active' 
                  ? 'text-[#6B7280] hover:text-red-500 hover:bg-red-50' 
                  : 'text-[#6B7280] hover:text-[#10B981] hover:bg-green-50'
              }`}
            >
              {emp.status === 'active' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
            </button>
            <button 
              onClick={() => setDeleteConfirmId(emp.id)}
              title="Delete"
              className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )
      }
    })
  ], [toggleStatusMutation])

  const filteredData = useMemo(() => {
    return employees.filter(e => {
      if (deptFilter !== 'all' && e.department !== deptFilter) return false
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (globalFilter) {
        const search = globalFilter.toLowerCase()
        if (!e.name.toLowerCase().includes(search) && !e.mobile.includes(search)) return false
      }
      return true
    })
  }, [employees, deptFilter, statusFilter, globalFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 }
    }
  })

  // Modals
  const openAddModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp)
      setName(emp.name)
      setMobile(emp.mobile)
      setDepartment(emp.department as typeof DEPARTMENTS[number])
      setStatus(emp.status)
    } else {
      setEditingEmployee(null)
      setName('')
      setMobile('')
      setDepartment(DEPARTMENTS[0])
      setStatus('active')
    }
    setIsAddModalOpen(true)
  }

  // Bulk Upload Logic
  const downloadTemplate = () => {
    const template = 'Name,Mobile,Department\nTest Employee,9000000001,Customer Service\n'
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'employee_import_template.csv'
    link.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadFile(file)
    setUploadResult(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const data = XLSX.utils.sheet_to_json(ws)
      setParsedData(data.slice(0, 500)) // limit to 500 max preview
    }
    reader.readAsBinaryString(file)
  }

  const handleClearFile = () => {
    setUploadFile(null)
    setParsedData([])
    setUploadResult(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const runBulkImport = async () => {
    if (parsedData.length === 0) return
    setIsUploading(true)
    setUploadProgress(0)

    let success = 0
    let failed = 0
    let errors: string[] = []

    // Firestore batched writes (up to 500 ops per batch)
    // We will chunk our data
    const chunks = []
    for (let i = 0; i < parsedData.length; i += 400) {
      chunks.push(parsedData.slice(i, i + 400))
    }

    try {
      for (let i = 0; i < chunks.length; i++) {
        const batch = writeBatch(db)
        const chunk = chunks[i]

        for (const row of chunk) {
          const nameStr = row.Name || row.name
          const mobileStr = String(row.Mobile || row.mobile || '')
          const deptStr = row.Department || row.department

          if (!nameStr || !mobileStr || !/^\d{10}$/.test(mobileStr.trim())) {
            failed++
            errors.push(`Row ${success + failed + 1}: Invalid name or mobile (${mobileStr})`)
            continue
          }

          const docRef = doc(db, COLLECTIONS.EMPLOYEES, mobileStr.trim())
          batch.set(docRef, {
            name: nameStr,
            mobile: mobileStr.trim(),
            department: deptStr || DEPARTMENTS[0],
            status: 'active',
            language: 'en',
            lastCompletedWeek: null,
            createdAt: serverTimestamp()
          }, { merge: true }) // Merge so we don't accidentally wipe historical data if they exist
          success++
        }

        await batch.commit()
        setUploadProgress(Math.round(((i + 1) / chunks.length) * 100))
      }
      
      setUploadResult({ success, failed, errors })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    } catch (err: any) {
      errors.push(`Fatal Error: ${err.message}`)
      setUploadResult({ success, failed, errors })
    } finally {
      setIsUploading(false)
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
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
          <p className="text-sm font-medium text-[#6B7280]">Total Employees</p>
          <p className="text-xl font-bold text-[#1A1A1A]">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
          <p className="text-sm font-medium text-[#6B7280]">Active</p>
          <p className="text-xl font-bold text-[#10B981]">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-between">
          <p className="text-sm font-medium text-[#6B7280]">Inactive</p>
          <p className="text-xl font-bold text-[#EF4444]">{stats.inactive}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-[#1A1A1A]">Employees</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#1A1A1A] px-4 py-2 rounded-xl transition-colors font-semibold text-sm shadow-sm"
          >
            <Upload size={18} />
            Bulk Upload
          </button>
          <button
            onClick={() => openAddModal()}
            className="flex items-center justify-center gap-2 bg-[#1F7A4E] hover:bg-[#165C3A] text-white px-4 py-2 rounded-xl transition-colors font-semibold text-sm shadow-sm"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-[#E5E7EB] flex flex-wrap gap-4 items-center bg-[#F9FAFB]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1F7A4E]"
            />
          </div>
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F7A4E] max-w-[200px]"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F7A4E]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
                    No employees found matching your criteria.
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

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#6B7280] hover:text-[#1A1A1A]">
                <X size={20} />
              </button>
            </div>
            <form 
              onSubmit={e => {
                e.preventDefault()
                saveMutation.mutate()
              }} 
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Mobile Number (10 digits) *</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  maxLength={10}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  required
                  disabled={!!editingEmployee} // disable changing ID if editing (simplifies MVP)
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Department *</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value as typeof DEPARTMENTS[number])}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="radio" 
                      checked={status === 'active'} 
                      onChange={() => setStatus('active')}
                      className="text-[#1F7A4E] focus:ring-[#1F7A4E]" 
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="radio" 
                      checked={status === 'inactive'} 
                      onChange={() => setStatus('inactive')}
                      className="text-[#1F7A4E] focus:ring-[#1F7A4E]" 
                    />
                    Inactive
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending || !name || !mobile}
                  className="px-4 py-2 text-sm font-semibold bg-[#1F7A4E] hover:bg-[#165C3A] text-white rounded-lg flex items-center gap-2 disabled:opacity-70 transition-colors"
                >
                  {saveMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
            <Trash2 size={40} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Delete Employee?</h3>
            <p className="text-sm text-[#6B7280] mb-6">Their completion history will be preserved but they can no longer login.</p>
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

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col my-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Bulk Upload Employees</h2>
              <button onClick={() => { setIsBulkModalOpen(false); handleClearFile(); }} className="text-[#6B7280] hover:text-[#1A1A1A]">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {!uploadFile ? (
                <>
                  <div className="flex items-center justify-between mb-6 bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
                    <div>
                      <h3 className="font-semibold text-[#1A1A1A]">Step 1: Download Template</h3>
                      <p className="text-sm text-[#6B7280] mt-1">Use our standard format for seamless importing.</p>
                    </div>
                    <button 
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-semibold text-[#1A1A1A] hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Download size={16} />
                      Download CSV
                    </button>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-3">Step 2: Upload File</h3>
                    <label className="border-2 border-dashed border-[#E5E7EB] hover:border-[#1F7A4E] bg-gray-50 hover:bg-[#F0FBF5] rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#6B7280] group-hover:text-[#1F7A4E] mb-4">
                        <Upload size={24} />
                      </div>
                      <span className="font-medium text-[#1A1A1A]">Click to upload or drag and drop</span>
                      <span className="text-sm text-[#6B7280] mt-1">.csv or .xlsx (Max 5MB)</span>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept=".csv, .xlsx" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#F0FBF5] border border-[#1F7A4E]/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="text-[#1F7A4E]" />
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">{uploadFile.name}</p>
                        <p className="text-xs text-[#1F7A4E]">{parsedData.length} rows detected</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleClearFile}
                      className="text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Change/Clear File
                    </button>
                  </div>

                  {uploadResult ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 border border-[#E5E7EB] rounded-xl">
                        <h3 className="font-bold text-[#1A1A1A] mb-2">Import Results</h3>
                        <p className="text-green-600 font-medium">✅ {uploadResult.success} imported successfully</p>
                        {uploadResult.failed > 0 && (
                          <p className="text-red-600 font-medium">❌ {uploadResult.failed} failed</p>
                        )}
                      </div>
                      {uploadResult.errors.length > 0 && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm max-h-40 overflow-y-auto">
                          <ul className="list-disc pl-5 space-y-1">
                            {uploadResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-[#1A1A1A] mb-3">Preview Data (First 5 rows)</h3>
                      <div className="overflow-x-auto border border-[#E5E7EB] rounded-lg">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-[#F9FAFB] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                            <tr>
                              <th className="px-4 py-2">Name</th>
                              <th className="px-4 py-2">Mobile</th>
                              <th className="px-4 py-2">Department</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5E7EB]">
                            {parsedData.slice(0, 5).map((row, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2">{row.Name || row.name || '-'}</td>
                                <td className="px-4 py-2">{row.Mobile || row.mobile || '-'}</td>
                                <td className="px-4 py-2">{row.Department || row.department || '-'}</td>
                              </tr>
                            ))}
                            {parsedData.length === 0 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-4 text-center text-red-500">
                                  No valid data found or parsing failed.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {isUploading && (
                        <div className="mt-6">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-[#1A1A1A]">Importing...</span>
                            <span className="text-[#1F7A4E]">{uploadProgress}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1F7A4E] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#E5E7EB] bg-gray-50 flex justify-end gap-3 rounded-b-2xl mt-auto">
              {uploadResult ? (
                <button
                  onClick={() => { setIsBulkModalOpen(false); handleClearFile(); }}
                  className="px-6 py-2 text-sm font-semibold bg-[#1F7A4E] hover:bg-[#165C3A] text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setIsBulkModalOpen(false); handleClearFile(); }}
                    className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={runBulkImport}
                    disabled={!uploadFile || parsedData.length === 0 || isUploading}
                    className="px-6 py-2 text-sm font-semibold bg-[#1F7A4E] hover:bg-[#165C3A] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {isUploading && <Loader2 size={16} className="animate-spin" />}
                    Import {parsedData.length} Employees
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
