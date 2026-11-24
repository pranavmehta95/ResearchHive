import { useState } from 'react'
import { Bell, Check, Moon, RotateCcw, Save, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_RESEARCH_QUESTION,
  RESEARCH_QUESTION_STORAGE_KEY,
  getDefaultResearchQuestion,
  getNotificationPreferences,
  saveNotificationPreferences,
} from '../utils/notificationPreferences'

function NotificationPreference({ title, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-4 border-b border-white/5 last:border-0 cursor-pointer">
      <span>
        <span className="block text-sm font-medium text-slate-200">{title}</span>
        <span className="block mt-1 text-xs text-slate-500">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-violet-500"
      />
    </label>
  )
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const [notificationPreferences, setNotificationPreferences] = useState(
    getNotificationPreferences
  )
  const [researchQuestion, setResearchQuestion] = useState(
    getDefaultResearchQuestion
  )
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const updateNotificationPreference = (key, value) => {
    const next = { ...notificationPreferences, [key]: value }
    try {
      saveNotificationPreferences(next)
      setNotificationPreferences(next)
      setError('')
    } catch {
      setError('Could not save notification preferences in this browser.')
    }
  }

  const saveResearchQuestion = () => {
    const value = researchQuestion.trim()
    if (!value) {
      setError('The default research question cannot be empty.')
      return
    }

    try {
      localStorage.setItem(RESEARCH_QUESTION_STORAGE_KEY, value)
      setResearchQuestion(value)
      setSaved(true)
      setError('')
      window.setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Could not save the default question in this browser.')
    }
  }

  const restoreDefaults = () => {
    try {
      saveNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES)
      localStorage.removeItem(RESEARCH_QUESTION_STORAGE_KEY)
      setNotificationPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES })
      setResearchQuestion(DEFAULT_RESEARCH_QUESTION)
      if (theme !== 'dark') toggleTheme()
      setSaved(false)
      setError('')
    } catch {
      setError('Could not restore defaults in this browser.')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Settings</h1>
        <p className="mt-2 text-slate-400">
          Customize your ResearchHive workspace and report notifications.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <section className="glass-strong rounded-2xl border border-white/5 p-6">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </h2>
          <p className="mt-1 text-sm text-slate-500">Choose the theme for your workspace.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {['dark', 'light'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (theme !== option) toggleTheme()
              }}
              aria-pressed={theme === option}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm capitalize transition-colors ${
                theme === option
                  ? 'border-violet-400/50 bg-violet-500/10 text-slate-100'
                  : 'border-white/10 text-slate-400 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                {option === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {option} theme
              </span>
              {theme === option && <Check className="h-4 w-4 text-violet-300" />}
            </button>
          ))}
        </div>
      </section>

      <section className="glass-strong rounded-2xl border border-white/5 p-6">
        <div className="mb-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Control which items appear in the notification menu.
          </p>
        </div>
        <NotificationPreference
          title="Report completed"
          description="Notify me when a literature review is ready."
          checked={notificationPreferences.reportCompleted}
          onChange={(value) => updateNotificationPreference('reportCompleted', value)}
        />
        <NotificationPreference
          title="Analysis failed"
          description="Notify me if an analysis cannot be completed."
          checked={notificationPreferences.reportFailed}
          onChange={(value) => updateNotificationPreference('reportFailed', value)}
        />
        <NotificationPreference
          title="Starter tips"
          description="Show sample notifications while getting started."
          checked={notificationPreferences.starterNotifications}
          onChange={(value) => updateNotificationPreference('starterNotifications', value)}
        />
      </section>

      <section className="glass-strong rounded-2xl border border-white/5 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-100">Default research question</h2>
          <p className="mt-1 text-sm text-slate-500">
            This question will prefill the dashboard for your next analysis.
          </p>
        </div>
        <textarea
          value={researchQuestion}
          onChange={(event) => {
            setResearchQuestion(event.target.value)
            setSaved(false)
          }}
          rows={3}
          maxLength={500}
          className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
          aria-label="Default research question"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">{researchQuestion.length}/500 characters</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={restoreDefaults}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5"
            >
              <RotateCcw className="h-4 w-4" />
              Restore defaults
            </button>
            <button
              type="button"
              onClick={saveResearchQuestion}
              className="flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white"
            >
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? 'Saved' : 'Save question'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
