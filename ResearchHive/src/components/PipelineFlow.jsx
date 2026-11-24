import { cn } from '../utils/cn'
import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  GitCompare,
  AlertTriangle,
  Link2,
  Brain,
  Check,
  FileOutput,
} from 'lucide-react'

const agentIcons = [Search, GitCompare, AlertTriangle, Link2, Brain]

function Node({ icon: Icon, label, status, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="flex flex-col items-center gap-2 shrink-0"
    >
      <div
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500',
          status === 'completed' && 'border-zinc-300 bg-zinc-100 text-zinc-900',
          status === 'running' && 'border-zinc-100 bg-zinc-800 text-zinc-100',
          status === 'pending' && 'border-white/10 bg-white/[0.03] text-zinc-600'
        )}
      >
        {status === 'running' && (
          <motion.span
            className="absolute inset-0 rounded-full border border-zinc-100"
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        {status === 'completed' ? (
          <Check className="h-5 w-5" strokeWidth={2.5} />
        ) : (
          <Icon className="h-4.5 w-4.5" />
        )}
      </div>
      <span
        className={cn(
          'text-[11px] font-medium whitespace-nowrap transition-colors duration-500',
          status === 'pending' ? 'text-zinc-600' : 'text-zinc-300'
        )}
      >
        {label}
      </span>
    </motion.div>
  )
}

function Connector({ active, delay }) {
  return (
    <div className="relative flex-1 h-px min-w-8 mt-[21px]">
      <div className="absolute inset-0 bg-white/10 rounded-full" />
      {active && (
        <>
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-zinc-100"
            style={{ boxShadow: '0 0 8px 2px rgba(255,255,255,0.35)' }}
            animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay, times: [0, 0.15, 0.85, 1] }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-zinc-400"
            animate={{ left: ['0%', '100%'], opacity: [0, 0.7, 0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: delay + 0.6, times: [0, 0.15, 0.85, 1] }}
          />
        </>
      )}
    </div>
  )
}

export default function PipelineFlow({ agents = [], isActive = false }) {
  const anyStarted = agents.some((a) => a.status !== 'pending')
  const allDone = agents.length > 0 && agents.every((a) => a.status === 'completed')
  const lastRunning = agents[agents.length - 1]?.status === 'running'

  const inputStatus = anyStarted ? 'completed' : 'pending'
  const outputStatus = allDone ? 'completed' : lastRunning ? 'running' : anyStarted ? 'running' : 'pending'

  const nodes = [
    { key: 'input', label: 'Papers', icon: FileText, status: inputStatus },
    ...agents.map((a, i) => ({
      key: a.agent_name || a.name || i,
      label: a.agent_name || a.name,
      icon: agentIcons[i % agentIcons.length],
      status: (a.status || 'pending').toLowerCase(),
    })),
    { key: 'output', label: 'Report', icon: FileOutput, status: outputStatus },
  ]

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-zinc-100">Pipeline</h3>
        {isActive && (
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-zinc-100"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            Streaming data
          </span>
        )}
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex items-start min-w-max px-2">
          {nodes.map((node, i) => (
            <div key={node.key} className="flex items-start flex-1 last:flex-none">
              <Node icon={node.icon} label={node.label} status={node.status} index={i} />
              {i < nodes.length - 1 && (
                <Connector
                  active={isActive && node.status !== 'pending' && nodes[i + 1].status !== 'pending'}
                  delay={(i % 3) * 0.4}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
