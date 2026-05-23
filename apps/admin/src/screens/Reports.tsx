import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase.config'
import { DEPARTMENTS } from '@shared/constants'
import { COLLECTIONS } from '@shared/types'
import type { Employee, Completion, Training } from '@shared/types'
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState
} from '@tanstack/react-table'
import { Loader2, Download, FileText, Search, RotateCcw } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportRow {
  id: string
  name: string
  training: string
  department: string
  status: 'Completed' | 'Pending'
  score: string
  date: string
  rawDate: Date | null
  rawScore: number
}

export function Reports() {
  // Filters
  const [dateFilter, setDateFilter] = useState('week')
  const [trainingFilter, setTrainingFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  // Fetch All Data
  const { data, isLoading } = useQuery({
    queryKey: ['reports-all'],
    queryFn: async () => {
      const [empSnap, compSnap, trainSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.EMPLOYEES)),
        getDocs(collection(db, COLLECTIONS.COMPLETIONS)),
        getDocs(query(collection(db, COLLECTIONS.TRAININGS), orderBy('createdAt', 'desc')))
      ])
      
      const employees = empSnap.docs.map(d => ({ id: d.id, ...d.data() } as Employee)).filter(e => e.status === 'active')
      const completions = compSnap.docs.map(d => ({ id: d.id, ...d.data() } as Completion))
      const trainings = trainSnap.docs.map(d => ({ id: d.id, ...d.data() } as Training))
      
      return { employees, completions, trainings }
    }
  })

  // Date range helper
  const getDateRange = (filter: string) => {
    const now = new Date()
    const start = new Date()
    if (filter === 'week') {
      start.setDate(now.getDate() - 7)
    } else if (filter === 'month') {
      start.setMonth(now.getMonth() - 1)
    } else {
      start.setFullYear(2020) // All time
    }
    return start
  }

  // Process data into report rows
  const { rows, stats } = useMemo(() => {
    if (!data) return { rows: [], stats: { completionRate: 0, avgScore: 0, pending: 0, totalEmployees: 0 } }

    const { employees, completions, trainings } = data
    const dateStart = getDateRange(dateFilter)

    // Build completion lookup: employeeId -> Completion[]
    const compByEmployee = new Map<string, Completion[]>()
    completions.forEach(c => {
      const existing = compByEmployee.get(c.employeeId) || []
      existing.push(c)
      compByEmployee.set(c.employeeId, existing)
    })

    // Get active trainings for cross-join
    const activeTrainings = trainings.filter(t => t.status === 'active')
    if (activeTrainings.length === 0 && trainings.length > 0) {
      // Show all trainings if none are active
      activeTrainings.push(...trainings.slice(0, 5))
    }

    const reportRows: ReportRow[] = []

    employees.forEach(emp => {
      const empCompletions = compByEmployee.get(emp.id) || []
      
      activeTrainings.forEach(tr => {
        const completion = empCompletions.find(c => c.trainingId === tr.id && c.totalQuestions > 0)
        const completedDate = completion 
          ? ((completion.completedAt as any)?.toDate?.() || (completion.completedAt instanceof Date ? completion.completedAt : null))
          : null
        const trainingTitle = typeof tr.title === 'string' ? tr.title : tr.title?.en || 'Untitled'

        reportRows.push({
          id: `${emp.id}-${tr.id}`,
          name: emp.name,
          training: trainingTitle,
          department: emp.department,
          status: completion ? 'Completed' : 'Pending',
          score: completion ? `${completion.score}/${completion.totalQuestions * 20}` : '—',
          date: completedDate ? formatDateShort(completedDate) : '—',
          rawDate: completedDate,
          rawScore: completion?.score || 0,
        })
      })
    })

    // Apply filters
    let filtered = reportRows

    // Date filter
    if (dateFilter !== 'all') {
      filtered = filtered.filter(r => {
        if (r.status === 'Pending') return true
        return r.rawDate && r.rawDate >= dateStart
      })
    }

    // Training filter
    if (trainingFilter !== 'all') {
      filtered = filtered.filter(r => r.training === trainingFilter)
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(r => r.department === departmentFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(q) || r.training.toLowerCase().includes(q)
      )
    }

    // Calculate stats from filtered data
    const totalRows = filtered.length
    const completedRows = filtered.filter(r => r.status === 'Completed')
    const completionRate = totalRows > 0 ? Math.round((completedRows.length / totalRows) * 100) : 0
    const avgScore = completedRows.length > 0 
      ? (completedRows.reduce((sum, r) => sum + r.rawScore, 0) / completedRows.length).toFixed(1)
      : '0'
    const pendingCount = filtered.filter(r => r.status === 'Pending').length

    return {
      rows: filtered,
      stats: {
        completionRate,
        avgScore: parseFloat(avgScore),
        pending: pendingCount,
        totalEmployees: new Set(filtered.map(r => r.name)).size,
      }
    }
  }, [data, dateFilter, trainingFilter, departmentFilter, statusFilter, searchQuery])

  // Table
  const columnHelper = createColumnHelper<ReportRow>()
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'EMPLOYEE',
      cell: info => {
        const name = info.getValue()
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        const colors = ['#1F7A4E', '#D97706', '#7C3AED', '#2563EB', '#DC2626']
        const color = colors[name.charCodeAt(0) % colors.length]
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ background: color }}>
              {initials}
            </div>
            <span className="font-semibold text-[#1A1A1A]">{name}</span>
          </div>
        )
      }
    }),
    columnHelper.accessor('training', {
      header: 'TRAINING',
      cell: info => <span className="text-[#1A1A1A]">{info.getValue()}</span>
    }),
    columnHelper.accessor('department', {
      header: 'DEPARTMENT',
      cell: info => <span className="font-medium text-[#1A1A1A]">{info.getValue()}</span>
    }),
    columnHelper.accessor('status', {
      header: 'STATUS',
      cell: info => {
        const s = info.getValue()
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            s === 'Completed' ? 'text-green-700' : 'text-orange-600'
          }`}>
            <span className={`w-2 h-2 rounded-full ${s === 'Completed' ? 'bg-green-500' : 'bg-orange-500'}`} />
            {s}
          </span>
        )
      }
    }),
    columnHelper.accessor('score', {
      header: 'SCORE',
      cell: info => <span className="text-[#1A1A1A] font-medium">{info.getValue()}</span>
    }),
    columnHelper.accessor('date', {
      header: 'DATE',
      cell: info => <span className="text-[#6B7280]">{info.getValue()}</span>,
      sortingFn: (a, b) => {
        const da = a.original.rawDate?.getTime() || 0
        const db2 = b.original.rawDate?.getTime() || 0
        return da - db2
      }
    }),
  ], [])

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } }
  })

  // Unique training names for filter
  const trainingNames = useMemo(() => {
    if (!data) return []
    return data.trainings.map(t => typeof t.title === 'string' ? t.title : t.title?.en || 'Untitled')
  }, [data])

  // ── Export Functions ──
  const downloadExcel = () => {
    const headers = ['Employee', 'Training', 'Department', 'Status', 'Score', 'Date']
    const csvRows = [headers.join(',')]
    rows.forEach(r => {
      csvRows.push([r.name, `"${r.training}"`, r.department, r.status, r.score, r.date].join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kisan-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const downloadPDF = () => {
    const pdf = new jsPDF()
    
    // Title
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Kisan Fashion Mall — Training Report', 14, 20)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)

    // Stat cards
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    const y = 38
    pdf.text(`Completion Rate: ${stats.completionRate}%`, 14, y)
    pdf.text(`Avg Quiz Score: ${stats.avgScore}`, 80, y)
    pdf.text(`Pending: ${stats.pending}`, 150, y)

    // Table
    autoTable(pdf, {
      startY: y + 10,
      head: [['Employee', 'Training', 'Department', 'Status', 'Score', 'Date']],
      body: rows.map(r => [r.name, r.training, r.department, r.status, r.score, r.date]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [31, 122, 78] },
    })

    pdf.save(`kisan-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const resetFilters = () => {
    setDateFilter('week')
    setTrainingFilter('all')
    setDepartmentFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Reports & Analytics</h1>
          <p className="text-sm text-[#6B7280] mt-1">Track completion across your team</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees, trainings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1F7A4E] w-56"
            />
          </div>
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 rounded-lg text-sm font-semibold text-[#1A1A1A] transition-colors"
          >
            <Download size={16} /> Download Excel
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg text-sm font-semibold text-white transition-colors"
          >
            <FileText size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Date</span>
            <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm bg-white focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Training</span>
            <select value={trainingFilter} onChange={e => setTrainingFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm bg-white focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none">
              <option value="all">All Trainings</option>
              {trainingNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Department</span>
            <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm bg-white focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none">
              <option value="all">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Status</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm bg-white focus:ring-2 focus:ring-[#1F7A4E] focus:outline-none">
              <option value="all">All</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <button onClick={resetFilters} className="text-sm text-[#6B7280] hover:text-[#1A1A1A] ml-auto flex items-center gap-1">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">Completion Rate</p>
          <p className="text-3xl font-bold text-[#1A1A1A]">{stats.completionRate}%</p>
          <p className="text-xs text-[#6B7280] mt-1">{rows.filter(r => r.status === 'Completed').length} of {rows.length} employees</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">Average Quiz Score</p>
          <p className="text-3xl font-bold text-[#1A1A1A]">{stats.avgScore} <span className="text-lg font-normal text-[#6B7280]">/5</span></p>
          <p className="text-xs text-[#6B7280] mt-1">Across all trainings</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">Pending Trainings</p>
          <p className="text-3xl font-bold text-[#1A1A1A]">{stats.pending}</p>
          <p className="text-xs text-[#6B7280] mt-1">Employees yet to complete</p>
        </div>
      </div>

      {/* Completion Report Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="font-bold text-[#1A1A1A]">Completion Report</h2>
          <span className="text-sm text-[#6B7280]">Showing {rows.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[#6B7280] uppercase text-xs font-bold tracking-wide border-b border-[#E5E7EB]">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="px-6 py-4 cursor-pointer select-none hover:text-[#1A1A1A] transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                      </div>
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
                    No records match your filters.
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
    </div>
  )
}

function formatDateShort(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}
