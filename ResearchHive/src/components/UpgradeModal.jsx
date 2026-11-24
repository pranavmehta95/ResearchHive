import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import {
  activateDemoProPlan,
  resetDemoProPlan,
} from '../utils/subscription'
import { useTheme } from '../context/ThemeContext'

function getDefaultExpiry() {
  const now = new Date()
  const year = String((now.getFullYear() + 3) % 100).padStart(2, '0')
  return `${String(now.getMonth() + 1).padStart(2, '0')}/${year}`
}

export default function UpgradeModal({ isPro, onClose, onPlanActivated, onPlanReset }) {
  const { theme } = useTheme()
  const [name, setName] = useState('Demo User')
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState(getDefaultExpiry)
  const [cvc, setCvc] = useState('123')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const processingTimer = useRef(null)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !processing) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, processing])

  useEffect(
    () => () => {
      if (processingTimer.current) window.clearTimeout(processingTimer.current)
    },
    []
  )

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Enter a name to continue.')
      return
    }
    if (cardNumber.replace(/\D/g, '') !== '4242424242424242') {
      setError('Use the demo card number shown below.')
      return
    }

    const expiryDigits = expiry.replace(/\D/g, '')
    const expiryMonth = Number(expiryDigits.slice(0, 2))
    const expiryYear = Number(expiryDigits.slice(2))
    const expiryDate =
      expiryDigits.length === 4 && expiryMonth >= 1 && expiryMonth <= 12
        ? new Date(2000 + expiryYear, expiryMonth, 0, 23, 59, 59)
        : null
    if (!expiryDate || expiryDate < new Date()) {
      setError('Enter a valid future expiry date in MM/YY format.')
      return
    }
    if (!/^\d{3}$/.test(cvc)) {
      setError('Enter the 3-digit demo security code.')
      return
    }

    setProcessing(true)
    processingTimer.current = window.setTimeout(() => {
      try {
        const subscription = activateDemoProPlan()
        onPlanActivated(subscription)
        setSuccess(true)
      } catch {
        setError('Could not save the demo plan in this browser.')
      } finally {
        setProcessing(false)
        processingTimer.current = null
      }
    }, 700)
  }

  const handleReset = () => {
    try {
      resetDemoProPlan()
      onPlanReset()
      onClose()
    } catch {
      setError('Could not reset the demo plan in this browser.')
    }
  }

  const showSuccess = isPro || success

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !processing) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        className={`w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 shadow-2xl ${
          theme === 'dark' ? 'bg-[#18181b]' : 'bg-white'
        }`}
      >
        <header className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              {showSuccess ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </span>
            <div>
              <h2 id="upgrade-title" className="text-lg font-semibold text-slate-100">
                {showSuccess ? 'Pro plan active' : 'Upgrade to ResearchHive Pro'}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {showSuccess ? 'Demo upgrade saved on this browser' : 'Demo checkout'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            aria-label="Close upgrade dialog"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-6">
          {showSuccess ? (
            <>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="font-medium text-emerald-300">
                  {success ? 'Demo payment approved.' : 'Your Pro demo plan is active.'}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Your Pro status is saved locally. No payment was processed.
                </p>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                {isPro && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5"
                  >
                    Reset demo plan
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white sm:ml-auto"
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-end justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">Pro monthly</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Multi-agent reviews, saved reports, and branded PDF exports
                  </p>
                </div>
                <p className="shrink-0 text-lg font-bold text-slate-100">
                  $0 <span className="text-xs font-normal text-slate-400">demo</span>
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Test mode only. No real payment is sent or processed, and the Pro
                  status is stored only in this browser.
                </p>
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-slate-300">Name on card</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="off"
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400/60"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-slate-300">Demo card number</span>
                  <span className="relative block">
                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={cardNumber}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, '').slice(0, 16)
                        setCardNumber(digits.replace(/(\d{4})(?=\d)/g, '$1 '))
                      }}
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label="Demo card number"
                      className="w-full rounded-lg border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-violet-400/60"
                    />
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Use the prefilled test card: 4242 4242 4242 4242
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-300">Expiry</span>
                    <input
                      value={expiry}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, '').slice(0, 4)
                        setExpiry(
                          digits.length > 2
                            ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                            : digits
                        )
                      }}
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label="Expiry date"
                      placeholder="MM/YY"
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400/60"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-300">Security code</span>
                    <input
                      value={cvc}
                      onChange={(event) =>
                        setCvc(event.target.value.replace(/\D/g, '').slice(0, 3))
                      }
                      inputMode="numeric"
                      autoComplete="off"
                      aria-label="Demo security code"
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-400/60"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing demo payment...
                    </>
                  ) : (
                    'Complete demo checkout'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>,
    document.body
  )
}
