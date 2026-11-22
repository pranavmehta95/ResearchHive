import { cn } from '../utils/cn'
import { motion, useAnimation } from 'framer-motion'
import {
  CheckCircle2,
  Loader2,
  Clock,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const statusIcons = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle2,
  error: XCircle,
}

const statusColors = {
  pending: 'text-slate-500 bg-slate-500/10',
  running: 'text-blue-400 bg-blue-500/10',
  completed: 'text-green-400 bg-green-500/10',
  error: 'text-red-400 bg-red-500/10',
}

export default function ProgressTimeline({ timeline }) {
  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/5">
      <h2 className="text-lg font-semibold text-slate-100 mb-6">Analysis Progress</h2>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent" />
        {timeline.map((item, index) => {
          const Icon = statusIcons[item.status] || Clock
          const statusClass = statusColors[item.status] || statusColors.pending

          return (
            <motion.div
              key={item.agentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              <div className={cn(
                'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full z-10 transition-all duration-300',
                item.status === 'completed' && 'bg-green-500/20 text-green-400',
                item.status === 'running' && 'bg-blue-500/20 text-blue-400',
                item.status === 'pending' && 'bg-white/5 text-slate-500',
                item.status === 'error' && 'bg-red-500/20 text-red-400'
              )}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div className="glass rounded-xl p-4 transition-all duration-300 border border-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-100">{item.stage}</h3>
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', statusClass)}>
                          <Icon className="h-2.5 w-2.5 inline" />
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{item.details}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                      <span>{item.startTime}</span>
                      <span className="text-slate-600">→</span>
                      <span>{item.endTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}