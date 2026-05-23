import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase.config'
import { COLLECTIONS } from '@shared/types'
import type { Employee, Training, Completion } from '@shared/types'
import { Users, UserCheck, PlayCircle, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function Dashboard() {
  const currentWeekNumber: number = 1 // MVP fallback

  // Fetch all dashboard data in parallel
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardData', currentWeekNumber],
    queryFn: async () => {
      // 1. Employees
      const empSnap = await getDocs(collection(db, COLLECTIONS.EMPLOYEES))
      const employees = empSnap.docs.map(d => ({ id: d.id, ...d.data() } as Employee))
      const totalEmployees = employees.length
      const activeEmployees = employees.filter(e => e.status === 'active')

      // 2. Trainings
      const trainingQuery = query(collection(db, COLLECTIONS.TRAININGS), orderBy('createdAt', 'desc'))
      const trainingSnap = await getDocs(trainingQuery)
      const trainings = trainingSnap.docs.map(d => ({ id: d.id, ...d.data() } as Training))
      const totalTrainings = trainings.length
      const recentTrainings = trainings.slice(0, 5)

      // 3. Completions for current week
      const compQuery = query(
        collection(db, COLLECTIONS.COMPLETIONS),
        where('weekNumber', '==', currentWeekNumber)
      )
      const compSnap = await getDocs(compQuery)
      const completions = compSnap.docs.map(d => ({ id: d.id, ...d.data() } as Completion))
      
      // Calculate completion rate
      const completedEmployeeIds = new Set(completions.map(c => c.employeeId))
      const activeEmployeeCount = activeEmployees.length
      const completionRate = activeEmployeeCount > 0 
        ? Math.round((completedEmployeeIds.size / activeEmployeeCount) * 100) 
        : 0

      // 4. Employees not completed
      const notCompleted = activeEmployees
        .filter(e => !completedEmployeeIds.has(e.id))
        .slice(0, 10)

      // 5. Chart Data (mock historical data for previous weeks, real for current week)
      // Since MVP might only have week 1 data, we will fill previous weeks with 0 or mock data
      const chartData = [
        { name: 'Week 1', rate: currentWeekNumber === 1 ? completionRate : 85 },
        { name: 'Week 2', rate: currentWeekNumber === 2 ? completionRate : 0 },
        { name: 'Week 3', rate: currentWeekNumber === 3 ? completionRate : 0 },
        { name: 'Week 4', rate: currentWeekNumber === 4 ? completionRate : 0 },
        { name: 'Week 5', rate: currentWeekNumber === 5 ? completionRate : 0 },
      ]

      return {
        totalEmployees,
        activeEmployeeCount,
        totalTrainings,
        completionRate,
        notCompleted,
        recentTrainings,
        chartData
      }
    }
  })

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#1F7A4E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="screen active">
      <div className="section-head">
        <div>
          <h2 className="section-head__title">Overview</h2>
          <p className="section-head__sub">Monitor training performance</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat__icon" style={{ color: 'var(--primary)', background: 'var(--primary-soft)' }}>
            <Users size={24} />
          </div>
          <div className="stat__content">
            <div className="stat__label">Total Employees</div>
            <div className="stat__val">{data.totalEmployees}</div>
          </div>
        </div>
        
        <div className="stat">
          <div className="stat__icon" style={{ color: '#10B981', background: '#ECFDF5' }}>
            <UserCheck size={24} />
          </div>
          <div className="stat__content">
            <div className="stat__label">Active Employees</div>
            <div className="stat__val">{data.activeEmployeeCount}</div>
          </div>
        </div>

        <div className="stat">
          <div className="stat__icon" style={{ color: '#3B82F6', background: '#EFF6FF' }}>
            <PlayCircle size={24} />
          </div>
          <div className="stat__content">
            <div className="stat__label">Total Trainings</div>
            <div className="stat__val">{data.totalTrainings}</div>
          </div>
        </div>

        <div className="stat">
          <div className="stat__icon" style={{ color: '#F59E0B', background: '#FEF3C7' }}>
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ color: '#FDE68A' }}
                />
                <path
                  className="text-[#F59E0B]"
                  strokeWidth="3"
                  strokeDasharray={`${data.completionRate}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
          <div className="stat__content">
            <div className="stat__label">Week {currentWeekNumber} Rate</div>
            <div className="stat__val">{data.completionRate}%</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 60%', minWidth: '400px' }}>
          <div className="card">
            <div className="card__head">
              <h3 className="card__title">Pending This Week</h3>
              <Link to="/employees" className="card__action">View all</Link>
            </div>
            <div className="card__body" style={{ padding: 0 }}>
              {data.notCompleted.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)' }}>
                  <p style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</p>
                  <p>All active employees completed this week's training!</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.notCompleted.map(emp => (
                      <tr key={emp.id}>
                        <td><strong>{emp.name}</strong></td>
                        <td><span className="badge">{emp.department}</span></td>
                        <td style={{ color: 'var(--ink-3)' }}>
                          {emp.mobile.replace(/(\d{2})\d{5}(\d{3})/, '$1XXXXX$2')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
          <div className="card">
            <div className="card__head">
              <h3 className="card__title">Recent Trainings</h3>
              <Link 
                to="/trainings" 
                className="btn btn--primary" 
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
              >
                + Add New
              </Link>
            </div>
            <div className="card__body">
              {data.recentTrainings.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--ink-3)', marginTop: '16px' }}>No trainings found.</p>
              ) : (
                <div className="list">
                  {data.recentTrainings.map(t => (
                    <div key={t.id} className="list-item">
                      <img 
                        src={t.thumbnailUrl || 'https://via.placeholder.com/48'} 
                        alt={t.title?.en || 'Training'} 
                        className="list-item__img"
                      />
                      <div className="list-item__content">
                        <div className="list-item__title">{t.title?.en || 'Untitled'}</div>
                        <div className="list-item__sub">{t.sectionName || 'General'}</div>
                      </div>
                      <div className="list-item__action">
                        <span className="badge" style={t.status === 'active' ? { background: '#E5F1EA', color: '#155F3C' } : { background: '#FEF3C7', color: '#B45309' }}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '28px' }}>
        <div className="card__head">
          <h3 className="card__title">Completion Rates (Last 5 Weeks)</h3>
        </div>
        <div className="card__body">
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE2D0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8F86', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8F86', fontWeight: 600 }} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#FAF7EE' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #EAE2D0', boxShadow: '0 4px 16px rgba(27, 31, 26, 0.06)' }}
                />
                <Bar dataKey="rate" fill="#1F7A4E" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
