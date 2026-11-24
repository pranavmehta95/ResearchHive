import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../utils/cn'
import {
  Brain,
  FileText,
  Search,
  BarChart3,
  FolderKanban,
  Settings,
  ChevronLeft,
  Menu,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', icon: BarChart3, path: '/' },
  { name: 'Papers', icon: FileText, path: '/papers' },
  { name: 'Analysis', icon: Search, path: '/analysis' },
  { name: 'Reports', icon: FolderKanban, path: '/reports' },
  { name: 'Settings', icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="glass-strong flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
            <Brain className="h-5 w-5 text-zinc-900" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-gradient">ResearchHive</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'
                )}
              />
              {!collapsed && <span>{item.name}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-zinc-100" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <Sparkles className="h-4 w-4 text-zinc-300" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-200">Pro Plan</p>
                <p className="text-[10px] text-slate-500">5 agents active</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}