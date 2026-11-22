import { cn } from '../utils/cn'
import { motion } from 'framer-motion'
import {
  Search,
  GitCompare,
  AlertTriangle,
  Link2,
  Brain,
  CheckCircle2,
  Loader2,
  Clock,
  XCircle,
} from 'lucide-react'

const agentIcons = {
  Search,
  GitCompare,
  AlertTriangle,
  Link2,
  Brain,
}

const statusStyles = {
  pending: 'text-slate-500 bg-slate-500/10',
  running: 'text-blue-400 bg-blue-500/10',
  completed: 'text-green-400 bg-green-500/10',
  error: 'text-red-400 bg-red-500/10',
}

const statusIcons = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle2,
  error: XCircle,
}

export default function AgentCard({ agent, index, isActive }) {
  const Icon = agentIcons[agent.icon] || Search
  const StatusIcon = statusIcons[agent.status] || Clock
  const statusClass = statusStyles[agent.status] || statusStyles.pending

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={cn(
        'relative glass-strong rounded-2xl p-5 border border-white/5',
        'transition-all duration-300',
        'overflow-hidden',
        isActive && 'ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10',
        agent.status === 'completed' && 'hover:shadow-lg hover:shadow-green-500/10',
        agent.status === 'running' && 'hover:shadow-lg hover:shadow-blue-500/10'
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-start gap-4">
        <div className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
          agent.color === 'electric-blue' && 'bg-blue-500/20 text-blue-400',
          agent.color === 'violet' && 'bg-violet-500/20 text-violet-400',
          agent.color === 'cyan' && 'bg-cyan-500/20 text-cyan-400',
          isActive && 'ring-2 ring-current'
        )}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-100 truncate">{agent.name}</h3>
            <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', statusClass)}>
              <StatusIcon className="h-3 w-3" />
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400 line-clamp-2">{agent.description}</p>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500">Progress</span>
              <span className="font-medium text-slate-200">{agent.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${agent.progress}%` }}
                transition={{ duration: 0.5, delay: index * 0.08 + 0.2, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  agent.color === 'electric-blue' && 'bg-gradient-to-r from-blue-500 to-blue-400',
                  agent.color === 'violet' && 'bg-gradient-to-r from-violet-500 to-violet-400',
                  agent.color === 'cyan' && 'bg-gradient-to-r from-cyan-500 to-cyan-400'
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {agent.status === 'running' && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 transform-origin-left"
        />
      )}

      {agent.status === 'completed' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500" />
      )}
    </motion.div>
  )
}