import { cn } from '../utils/cn'
import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  GitCompare,
  AlertTriangle,
  Link2,
  Brain,
  Sparkles,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Bookmark,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export default function ResultTabs({ results, activeTab, onTabChange, papers }) {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: Brain },
    { id: 'insights', name: 'Paper Insights', icon: FileText },
    { id: 'comparison', name: 'Comparison', icon: GitCompare },
    { id: 'gaps', name: 'Research Gaps', icon: AlertTriangle },
    { id: 'references', name: 'References', icon: Link2 },
  ]

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5">
        <nav className="flex space-x-2 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-white/10'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <OverviewTab overview={results.overview} papers={papers} />
        )}
        {activeTab === 'insights' && (
          <PaperInsightsTab insights={results.paperInsights} papers={papers} />
        )}
        {activeTab === 'comparison' && (
          <ComparisonTab comparison={results.comparison} papers={papers} />
        )}
        {activeTab === 'gaps' && (
          <ResearchGapsTab gaps={results.researchGaps} papers={papers} />
        )}
        {activeTab === 'references' && (
          <ReferencesTab references={results.references} />
        )}
      </div>
    </div>
  )
}

function OverviewTab({ overview, papers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="glass-strong rounded-2xl p-6 border border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                Literature Review Summary
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">{overview.title}</h1>
            <p className="mt-2 text-slate-400 text-sm">
              <span className="font-medium text-slate-300">Research Question:</span> "{overview.researchQuestion}"
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Papers', value: overview.keyStatistics.totalPapers },
            { label: 'Citations', value: overview.keyStatistics.totalCitations.toLocaleString() },
            { label: 'Year Range', value: overview.keyStatistics.yearRange },
            { label: 'Venues', value: overview.keyStatistics.venues },
            { label: 'Key Concepts', value: overview.keyStatistics.keyConcepts },
            { label: 'Methodologies', value: overview.keyStatistics.methodologies },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gradient">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Executive Summary</h2>
        <div className="prose prose-invert max-w-none text-slate-300 space-y-4 text-sm leading-relaxed">
          {overview.summary.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Key Thematic Clusters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overview.themes.map((theme, idx) => (
            <div key={idx} className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <h3 className="font-semibold text-slate-200 text-sm">{theme.name}</h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">{theme.description}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {theme.papers.map((pId) => {
                  const paper = papers.find((p) => p.id === pId)
                  return (
                    <span key={pId} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-400">
                      {paper?.title.split(':')[0] || pId}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function PaperInsightsTab({ insights, papers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {insights.map((item) => {
        const paper = papers.find((p) => p.id === item.paperId)
        if (!paper) return null

        return (
          <div key={item.paperId} className="glass-strong rounded-2xl p-6 border border-white/5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 mb-2 inline-block">
                  {paper.venue} ({paper.year})
                </span>
                <h3 className="text-xl font-bold text-slate-100">{paper.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{paper.authors.join(', ')} • {paper.citations.toLocaleString()} citations</p>
              </div>
            </div>

            <div className="mb-4 text-xs text-slate-400 glass p-3 rounded-xl border border-white/5">
              <span className="font-medium text-slate-300">Methodology:</span> {paper.methodology}
            </div>

            <h4 className="text-sm font-semibold text-slate-300 mb-3">Key Extracted Insights</h4>
            <div className="space-y-2">
              {item.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 mt-0.5',
                    insight.type === 'innovation' && 'bg-violet-500/20 text-violet-400',
                    insight.type === 'finding' && 'bg-blue-500/20 text-blue-400',
                    insight.type === 'limitation' && 'bg-amber-500/20 text-amber-400'
                  )}>
                    {insight.type}
                  </span>
                  <span className="text-slate-300 flex-1">{insight.text}</span>
                  <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0',
                    insight.impact === 'high' && 'bg-red-500/20 text-red-400',
                    insight.impact === 'medium' && 'bg-amber-500/20 text-amber-400',
                    insight.impact === 'low' && 'bg-slate-500/20 text-slate-400'
                  )}>
                    {insight.impact} impact
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}

function ComparisonTab({ comparison, papers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="glass-strong rounded-2xl p-6 border border-white/5">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Paper Performance Comparison</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparison.radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" />
              <Radar name="Innovation" dataKey="Innovation" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Radar name="Scalability" dataKey="Scalability" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Efficiency" dataKey="Efficiency" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6 border border-white/5 overflow-x-auto">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Methodological Matrix</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400">
              <th className="py-3 px-4 font-medium">Dimension</th>
              {papers.map((p) => (
                <th key={p.id} className="py-3 px-4 font-medium min-w-[140px] max-w-[180px]">
                  {p.title.split(':')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {comparison.dimensions.map((dim, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-200 bg-white/5">{dim.name}</td>
                {papers.map((p) => (
                  <td key={p.id} className="py-3 px-4">
                    {dim.papers[p.id] || 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function ResearchGapsTab({ gaps, papers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {gaps.map((gap, idx) => (
        <div key={gap.id} className="glass-strong rounded-2xl p-6 border border-white/5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold text-sm">
                G{idx + 1}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{gap.title}</h3>
                <span className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                  gap.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                )}>
                  {gap.severity} priority gap
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-4">{gap.description}</p>

          <div className="space-y-3 pt-3 border-t border-white/5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Promising Research Directions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {gap.potentialDirections.map((dir, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 text-xs text-slate-300">
                  <ChevronRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>{dir}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}

function ReferencesTab({ references }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {references.map((ref) => (
        <div key={ref.id} className="glass-strong rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-colors">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-100 text-sm truncate">{ref.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{ref.authors}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">{ref.venue} {ref.year}</span>
              <span>{ref.citations.toLocaleString()} citations</span>
            </div>
          </div>

          <a
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-xs text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-colors shrink-0"
          >
            <span>Read Paper</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ))}
    </motion.div>
  )
}