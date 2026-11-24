import { cn } from '../utils/cn'
import {
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
  Search as SearchIcon,
  Command,
  FileText,
  BookOpen,
  BarChart3,
  Settings,
  CheckCheck,
} from 'lucide-react'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../utils/api'
import { mockPapers } from '../data/mockData'
import {
  ANALYSIS_FAILED_EVENT,
  NOTIFICATION_PREFERENCES_EVENT,
  REPORT_GENERATED_EVENT,
  getNotificationPreferences,
} from '../utils/notificationPreferences'

const REPORT_NOTIFICATIONS_STORAGE_KEY = 'rh_report_notifications'

const starterNotifications = [
  {
    id: 'starter-welcome',
    category: 'starter',
    title: 'Welcome to ResearchHive',
    body: 'Your research workspace is ready. Set a default question in Settings.',
    time: 'Getting started',
    path: '/settings',
  },
  {
    id: 'starter-demo',
    category: 'starter',
    title: 'Explore a sample report',
    body: 'Open the demo report to see a completed literature review.',
    time: 'Starter tip',
    path: '/demo-report',
  },
  {
    id: 'starter-export',
    category: 'starter',
    title: 'Export your findings',
    body: 'Completed reports can be downloaded as a branded PDF.',
    time: 'Starter tip',
    path: '/demo-report',
  },
]

function getStoredReportNotifications() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(REPORT_NOTIFICATIONS_STORAGE_KEY) || '[]'
    )
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

const quickLinks = [
  { label: 'Dashboard', path: '/', icon: BarChart3 },
  { label: 'Papers', path: '/papers', icon: BookOpen },
  { label: 'New Analysis', path: '/analysis', icon: SearchIcon },
  { label: 'Settings', path: '/settings', icon: Settings },
]

const typeBadge = {
  Analysis: 'bg-white/10 text-zinc-300',
  Paper: 'bg-emerald-500/15 text-emerald-400',
  Page: 'bg-amber-500/15 text-amber-400',
}

function analysisToItem(a) {
  return {
    id: `analysis-${a.analysis_id}`,
    type: 'Analysis',
    title: a.research_question || 'Untitled analysis',
    subtitle: [
      a.status,
      a.started_at ? new Date(a.started_at).toLocaleDateString() : '',
    ]
      .filter(Boolean)
      .join(' • '),
    path: `/reports/${a.analysis_id}`,
    icon: FileText,
  }
}

export default function Header({ sidebarCollapsed = false }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [analyses, setAnalyses] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [reportNotifications, setReportNotifications] = useState(
    getStoredReportNotifications
  )
  const [notificationPreferences, setNotificationPreferences] = useState(
    getNotificationPreferences
  )
  const [notificationToast, setNotificationToast] = useState(null)
  const [readIds, setReadIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('rh_read_notifs') || '[]'))
    } catch {
      return new Set()
    }
  })

  const userMenuRef = useRef(null)
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const searchInputRef = useRef(null)

  const loadAnalyses = useCallback(() => {
    api
      .listAnalyses()
      .then((data) => setAnalyses(data.analyses || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadAnalyses()
  }, [loadAnalyses])

  useEffect(() => {
    try {
      localStorage.setItem('rh_read_notifs', JSON.stringify([...readIds]))
    } catch {}
  }, [readIds])

  useEffect(() => {
    try {
      localStorage.setItem(
        REPORT_NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(reportNotifications)
      )
    } catch {}
  }, [reportNotifications])

  useEffect(() => {
    const handleReportGenerated = (event) => {
      const detail = event.detail || {}
      const createdAt = new Date().toISOString()
      const id = detail.isDemo
        ? `generated-demo-${Date.now()}`
        : `generated-${detail.analysisId || Date.now()}`
      const notification = {
        id,
        analysisId: detail.analysisId || null,
        category: 'completed',
        title: 'Report generated',
        body: detail.researchQuestion || 'Your literature review is ready.',
        time: new Date(createdAt).toLocaleString(),
        createdAt,
        path: detail.isDemo
          ? '/demo-report'
          : detail.analysisId
            ? `/reports/${detail.analysisId}`
            : null,
      }

      setReportNotifications((previous) =>
        [notification, ...previous.filter((item) => item.id !== id)].slice(0, 20)
      )
      setReadIds((previous) => {
        const next = new Set(previous)
        next.delete(id)
        return next
      })
      if (notificationPreferences.reportCompleted) {
        setNotificationToast(notification)
      }
    }

    const handleAnalysisFailed = (event) => {
      const detail = event.detail || {}
      const createdAt = new Date().toISOString()
      const id = `failed-${detail.analysisId || Date.now()}`
      const notification = {
        id,
        analysisId: detail.analysisId || null,
        category: 'failed',
        title: 'Analysis failed',
        body: detail.error || detail.researchQuestion || 'An analysis could not be completed.',
        time: new Date(createdAt).toLocaleString(),
        createdAt,
        path: null,
      }

      setReportNotifications((previous) =>
        [notification, ...previous.filter((item) => item.id !== id)].slice(0, 20)
      )
      if (notificationPreferences.reportFailed) {
        setNotificationToast(notification)
      }
    }

    const handlePreferencesChanged = () => {
      setNotificationPreferences(getNotificationPreferences())
    }

    window.addEventListener(REPORT_GENERATED_EVENT, handleReportGenerated)
    window.addEventListener(ANALYSIS_FAILED_EVENT, handleAnalysisFailed)
    window.addEventListener(
      NOTIFICATION_PREFERENCES_EVENT,
      handlePreferencesChanged
    )
    return () => {
      window.removeEventListener(REPORT_GENERATED_EVENT, handleReportGenerated)
      window.removeEventListener(ANALYSIS_FAILED_EVENT, handleAnalysisFailed)
      window.removeEventListener(
        NOTIFICATION_PREFERENCES_EVENT,
        handlePreferencesChanged
      )
    }
  }, [notificationPreferences])

  useEffect(() => {
    if (!notificationToast) return undefined
    const timeout = window.setTimeout(() => setNotificationToast(null), 7000)
    return () => window.clearTimeout(timeout)
  }, [notificationToast])

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ⌘K / Ctrl+K focuses the search input
  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const searchItems = useMemo(() => {
    const items = []
    analyses.forEach((a) => items.push(analysisToItem(a)))
    mockPapers.forEach((p) =>
      items.push({
        id: `paper-${p.id}`,
        type: 'Paper',
        title: p.title || p.name,
        subtitle: [p.venue, p.year].filter(Boolean).join(' • '),
        path: '/papers',
        icon: BookOpen,
      })
    )
    quickLinks.forEach((l) =>
      items.push({
        id: `page-${l.path}-${l.label}`,
        type: 'Page',
        title: l.label,
        subtitle: 'Go to page',
        path: l.path,
        icon: l.icon,
      })
    )
    return items
  }, [analyses])

  const query = searchQuery.trim().toLowerCase()
  const results = useMemo(() => {
    if (!query) return []
    return searchItems
      .filter((i) =>
        `${i.title} ${i.subtitle} ${i.type}`.toLowerCase().includes(query)
      )
      .slice(0, 8)
  }, [searchItems, query])

  const recent = useMemo(
    () => searchItems.filter((i) => i.type === 'Analysis').slice(0, 5),
    [searchItems]
  )

  const visibleItems = query ? results : recent

  const selectItem = useCallback(
    (item) => {
      if (!item) return
      setSearchOpen(false)
      setSearchQuery('')
      navigate(item.path)
      searchInputRef.current?.blur()
    },
    [navigate]
  )

  const handleSearchKeyDown = (e) => {
    if (!searchOpen || visibleItems.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % visibleItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + visibleItems.length) % visibleItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectItem(visibleItems[activeIndex] || visibleItems[0])
    } else if (e.key === 'Escape') {
      setSearchOpen(false)
      searchInputRef.current?.blur()
    }
  }

  const notifications = useMemo(() => {
    const generatedAnalysisIds = new Set(
      reportNotifications
        .map((notification) => notification.analysisId)
        .filter(Boolean)
    )
    const analysisItems = analyses
      .filter((analysis) => !generatedAnalysisIds.has(analysis.analysis_id))
      .map((a) => {
        const id = `n-${a.analysis_id}`
        const status = a.status || 'unknown'
        return {
          id,
          category:
            status === 'completed'
              ? 'completed'
              : status === 'error'
                ? 'failed'
                : 'progress',
          title:
            status === 'completed'
              ? 'Analysis completed'
              : status === 'error'
                ? 'Analysis failed'
                : 'Analysis in progress',
          body: a.research_question || 'Untitled analysis',
          time: a.started_at ? new Date(a.started_at).toLocaleString() : '',
          createdAt: a.started_at || '',
          path: status === 'completed' ? `/reports/${a.analysis_id}` : null,
        }
      })
    return [...reportNotifications, ...analysisItems, ...starterNotifications]
      .filter((notification) => {
        if (notification.category === 'completed') {
          return notificationPreferences.reportCompleted
        }
        if (notification.category === 'failed') {
          return notificationPreferences.reportFailed
        }
        if (notification.category === 'starter') {
          return notificationPreferences.starterNotifications
        }
        return true
      })
      .sort(
        (x, y) =>
          (Date.parse(y.createdAt || '') || 0) -
          (Date.parse(x.createdAt || '') || 0)
      )
  }, [analyses, notificationPreferences, reportNotifications])

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  const handleNotifClick = (n) => {
    setReadIds((prev) => new Set(prev).add(n.id))
    setNotifOpen(false)
    if (n.path) navigate(n.path)
  }

  return (
    <header className={`fixed top-0 ${sidebarCollapsed ? 'left-20' : 'left-64'} right-0 z-50 h-16 glass-strong border-b border-white/5 transition-all duration-300`}>
      <div className="flex h-full items-center justify-between px-6">
        <div className="relative w-full max-w-xl">
          <div className="relative" ref={searchRef}>
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search papers, analyses, pages... (⌘K)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setActiveIndex(0)
                setSearchOpen(true)
              }}
              onFocus={() => {
                setSearchOpen(true)
                loadAnalyses()
              }}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              onKeyDown={handleSearchKeyDown}
              className={cn(
                'w-full h-10 pl-10 pr-10 rounded-xl glass-strong border border-white/5',
                'text-sm text-slate-100 placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent',
                searchOpen && 'ring-2 ring-white/20'
              )}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-slate-500 bg-white/5 border border-white/5">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </div>

          {searchOpen && (query ? true : recent.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl p-2 border border-white/5 shadow-2xl animate-slide-down z-50">
              {!query && (
                <div className="text-xs text-slate-500 px-3 py-2">Recent analyses</div>
              )}
              {query && results.length === 0 && (
                <div className="px-3 py-4 text-sm text-slate-500 text-center">
                  No results for "{searchQuery}"
                </div>
              )}
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {visibleItems.map((item, idx) => {
                  const Icon = item.icon
                  const active = idx === activeIndex
                  return (
                    <button
                      key={item.id}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        selectItem(item)
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <Icon className="h-4 w-4 text-slate-400" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block truncate font-medium">{item.title}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {item.subtitle}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium',
                          typeBadge[item.type]
                        )}
                      >
                        {item.type}
                      </span>
                    </button>
                  )
                })}
              </div>
              {query && (
                <div className="mt-1 border-t border-white/5 px-3 py-1.5 text-[10px] text-slate-500">
                  ↑↓ navigate • Enter select • Esc close
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-96 glass-strong rounded-xl border border-white/5 shadow-2xl animate-slide-down z-[60]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                  {notifications.length === 0 && (
                    <p className="px-3 py-6 text-sm text-slate-500 text-center">
                      No notifications to show. Review your notification settings.
                    </p>
                  )}
                  {notifications.map((n) => {
                    const unread = !readIds.has(n.id)
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={cn(
                          'w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors',
                          unread ? 'bg-white/5' : 'hover:bg-white/5'
                        )}
                      >
                        <span
                          className={cn(
                            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                            n.path ? 'bg-emerald-400' : 'bg-zinc-500'
                          )}
                        />
                        <span className="flex-1 min-w-0">
                          <span
                            className={cn(
                              'block text-sm truncate',
                              unread ? 'font-medium text-slate-100' : 'text-slate-400'
                            )}
                          >
                            {n.title}
                          </span>
                          <span className="block text-xs text-slate-500 truncate">
                            {n.body}
                          </span>
                          {n.time && (
                            <span className="block text-[10px] text-slate-600 mt-0.5">
                              {n.time}
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-white/5 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                <User className="h-4 w-4 text-zinc-900" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-200">{user?.username || 'Researcher'}</span>
              <ChevronDown className="h-4 w-4 text-slate-500 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-strong rounded-xl py-1 border border-white/5 shadow-2xl animate-slide-down">
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="text-sm font-medium text-slate-200">{user?.username}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {notificationToast && (
        <div
          role="status"
          aria-live="polite"
          className="absolute right-4 top-full z-50 mt-2 w-80 rounded-xl border border-white/10 glass-strong p-4 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100">
                {notificationToast.title}
              </p>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                {notificationToast.body}
              </p>
              {notificationToast.path && (
                <button
                  type="button"
                  onClick={() => {
                    handleNotifClick(notificationToast)
                    setNotificationToast(null)
                  }}
                  className="mt-3 text-xs font-medium text-violet-300 hover:text-violet-200"
                >
                  View
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setNotificationToast(null)}
              className="shrink-0 text-xs text-slate-500 hover:text-slate-200"
              aria-label="Dismiss notification"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
