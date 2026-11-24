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
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const userMenuRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-64 right-0 z-30 h-16 glass-strong border-b border-white/5 transition-all duration-300">
      <div className="flex h-full items-center justify-between px-6">
        <div className="relative w-full max-w-xl">
          <div
            className="relative"
            ref={searchRef}
          >
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search papers, agents, reports... (⌘K)"
              className={cn(
                'w-full h-10 pl-10 pr-10 rounded-xl glass-strong border border-white/5',
                'text-sm text-slate-100 placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent',
                searchOpen && 'ring-2 ring-white/20'
              )}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 100)}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-slate-500 bg-white/5 border border-white/5">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </div>
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl p-2 border border-white/5 shadow-2xl animate-slide-down">
              <div className="text-xs text-slate-500 px-3 py-2">Recent</div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {['Attention Is All You Need', 'BERT', 'RoBERTa', 'Longformer', 'BigBird'].map((item) => (
                  <button key={item} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <Moon className="h-5 w-5" />
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
                  onClick={() => { setUserMenuOpen(false); logout() }}
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
    </header>
  )
}