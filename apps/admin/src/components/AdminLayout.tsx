import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Layers,
  PlaySquare,
  FileQuestion,
  Users,
  BarChart3,
  Languages,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { useAdminStore } from '../store/useAdminStore'

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Sections', path: '/sections', icon: Layers },
  { name: 'Trainings', path: '/trainings', icon: PlaySquare },
  { name: 'Quiz', path: '/quiz', icon: FileQuestion },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Languages', path: '/languages', icon: Languages },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const admin = useAdminStore((s) => s.admin)
  const logout = useAdminStore((s) => s.logout)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Find current page title
  const currentItem = navItems.find((item) => location.pathname.startsWith(item.path))
  const pageTitle = currentItem ? currentItem.name : 'Admin Panel'

  // Get initials for avatar
  const emailPrefix = admin?.email?.split('@')[0] || 'A'
  const initials = emailPrefix.substring(0, 2).toUpperCase()

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand">
          <div className="brand__mark">K</div>
          <div className="brand__text">
            <span className="brand__name">Kisan Mall</span>
            <span className="brand__sub">Admin Space</span>
          </div>
        </div>

        <div className="nav-label">Menu</div>
        <ul className="nav">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`nav__item ${isActive ? 'active' : ''}`}
                >
                  <Icon />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Footer / User Profile */}
        <div className="sidebar__footer">
          <div style={{ padding: '0 8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #9CA3AF)', letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.8 }}>
            🛡️ MVP Demo Version
          </div>
          <div className="user-chip" onClick={handleLogout} title="Click to logout">
            <div className="user-chip__avatar">{initials}</div>
            <div className="user-chip__main">
              <div className="user-chip__name">Admin</div>
              <div className="user-chip__role truncate max-w-[140px]">{admin?.email}</div>
            </div>
            <div className="user-chip__more">
              <LogOut size={16} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main">
        {/* Header */}
        <header className="topbar">
          <h1 className="topbar__title">{pageTitle}</h1>
          <div className="topbar__main">
            <div className="topbar__breadcrumb">Kisan Mall / {pageTitle}</div>
          </div>
          <div className="topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="user-chip__avatar" style={{ cursor: 'default' }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
