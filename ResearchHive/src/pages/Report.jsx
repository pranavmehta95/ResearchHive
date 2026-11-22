import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../utils/cn'
import {
  FileText,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Brain,
  BookOpen,
  Scale,
  Lightbulb,
  Link2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Star,
  Target,
  BarChart2,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'
import { jsPDF } from 'jspdf'
import { mockPapers, mockResults } from '../data/mockData'

// Demo mode data
const demoPapers = [
  { id: 'fn-1', name: 'Fake_News_Detection_Linguistics.pdf', title: 'Linguistic Analysis for Fake News Detection', authors: ['Perez-Rosas et al.'], year: 2018, pages: 12, size: '1.2 MB', status: 'completed', citations: 450, venue: 'COLING 2018' },
  { id: 'fn-2', name: 'Deep_Learning_Propagation.pdf', title: 'Propagation-based Fake News Detection with Graph Neural Networks', authors: ['Monti et al.'], year: 2019, pages: 14, size: '2.5 MB', status: 'completed', citations: 820, venue: 'KDD 2019' },
  { id: 'fn-3', name: 'Multimodal_Fake_News.pdf', title: 'Multimodal Fake News Detection: Joining Text and Image Analysis', authors: ['Khattar et al.'], year: 2019, pages: 10, size: '3.2 MB', status: 'completed', citations: 610, venue: 'WWW 2019' }
]

const demoResults = {
  overview: {
    title: 'Research Synthesis: Fake News Detection Using Machine Learning',
    researchQuestion: 'How do linguistic, structural, and multimodal features contribute to fake news detection?',
    summary: `This synthesis examines three distinct paradigms in fake news detection: linguistic analysis, propagation patterns, and multimodal fusion.

Key Conclusions:
1. **Linguistic Cues**: Fake news often exhibits higher emotionality and lower readability scores.
2. **Social Context**: How news spreads is often more indicative than the content itself.
3. **Multimodal Synergy**: Combining text with image analysis provides the most robust detection framework in modern social media environments.

The consensus across these works is that hybrid models combining multiple feature sets offer the highest resilience against evolving misinformation strategies.`,
    keyStatistics: {
      totalPapers: 3,
      totalCitations: 1880,
      yearRange: '2018-2019',
      venues: 3,
      keyConcepts: 112,
      methodologies: 3
    },
    consensusScore: 84,
    themes: [
      { name: 'Feature Engineering', papers: ['fn-1'], description: 'Traditional NLP features and linguistic style' },
      { name: 'Graph Methods', papers: ['fn-2'], description: 'Social network structure and propagation' },
      { name: 'Deep Learning', papers: ['fn-3'], description: 'Multimodal fusion and automatic feature learning' }
    ]
  },
  paperInsights: [
    {
      paperId: 'fn-1',
      insights: [
        { type: 'innovation', text: 'Creation of a cross-domain dataset for linguistic fake news analysis', impact: 'medium', source: '[fn-1, p.3]' },
        { type: 'finding', text: 'Fake news tends to use more first-person pronouns and superlative adjectives', impact: 'high', source: '[fn-1, p.5]' }
      ]
    },
    {
      paperId: 'fn-2',
      insights: [
        { type: 'innovation', text: 'First application of GCNs to social media news propagation', impact: 'high', source: '[fn-2, p.2]' },
        { type: 'finding', text: 'Fake news propagation graphs are often deeper and more sparse', impact: 'high', source: '[fn-2, p.7]' }
      ]
    },
    {
      paperId: 'fn-3',
      insights: [
        { type: 'innovation', text: 'SpotFake framework for cross-modal consistency checking', impact: 'medium', source: '[fn-3, p.4]' },
        { type: 'finding', text: 'Text-image inconsistency is a strong signal for automated misinformation', impact: 'high', source: '[fn-3, p.8]' }
      ]
    }
  ],
  comparison: {
    dimensions: [
      { name: 'Primary Feature', papers: { 'fn-1': 'Linguistic/Text', 'fn-2': 'Social/Graph', 'fn-3': 'Text+Image' } },
      { name: 'Model Type', papers: { 'fn-1': 'SVM/Random Forest', 'fn-2': 'GCN', 'fn-3': 'VAE/CNN' } },
      { name: 'Data Source', papers: { 'fn-1': 'PolitiFact/BuzzFeed', 'fn-2': 'Twitter/Weibo', 'fn-3': 'PHEME/GossipCop' } }
    ],
    radarData: [
      { subject: 'Linguistic Analysis', Novelty: 60, Methodology: 75, Datasets: 80, Evaluation: 85, Impact: 70 },
      { subject: 'Graph Propagation', Novelty: 95, Methodology: 90, Datasets: 70, Evaluation: 80, Impact: 85 },
      { subject: 'Multimodal Fusion', Novelty: 85, Methodology: 85, Datasets: 90, Evaluation: 75, Impact: 90 }
    ]
  },
  researchGaps: [
    {
      id: 'fn-gap-1',
      title: 'Real-time Detection at Scale',
      description: 'Current models (especially graph-based) are computationally heavy. Detecting fake news in the first minutes of propagation remains a major challenge.',
      severity: 'high',
      relatedPapers: ['fn-2'],
      potentialDirections: ['Streaming graph algorithms', 'Edge-computing for detection']
    },
    {
      id: 'fn-gap-2',
      title: 'Explainability in Detection',
      description: 'While deep learning models achieve high accuracy, they lack transparency. Users need to know *why* a piece of news was flagged.',
      severity: 'medium',
      relatedPapers: ['fn-3'],
      potentialDirections: ['Attention map visualization', 'Rule-extraction from VAEs']
    }
  ],
  references: [
    { id: 'fn-ref-1', title: 'Linguistic Analysis for Fake News Detection', authors: 'Perez-Rosas, V., Kleinberg, B., Lefevre, A., Mihalcea, R.', venue: 'COLING', year: 2018, citations: 450, url: '#' },
    { id: 'fn-ref-2', title: 'Propagation-based Fake News Detection with Graph Neural Networks', authors: 'Monti, F., Frasca, F., Eynard, D., et al.', venue: 'KDD', year: 2019, citations: 820, url: '#' },
    { id: 'fn-ref-3', title: 'Multimodal Fake News Detection', authors: 'Khattar, D., Goud, J.S., Gupta, M., Varma, V.', venue: 'WWW', year: 2019, citations: 610, url: '#' }
  ]
}

export default function Report({ papers: initialPapers, results: initialResults, isDemo = false }) {
  const [activeSection, setActiveSection] = useState('overview')
  const [copiedItem, setCopiedItem] = useState(null)

  // Use demo data if in demo mode, otherwise use passed data
  const papers = isDemo ? demoPapers : (initialPapers || mockPapers)
  const results = isDemo ? demoResults : (initialResults || mockResults)

  const downloadPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 20

    // Title
    doc.setFontSize(24)
    doc.setTextColor(59, 130, 246)
    doc.text(results.overview.title, 20, y)
    y += 12

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Research Question: ${results.overview.researchQuestion}`, 20, y)
    y += 10

    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text('Executive Summary', 20, y)
    y += 8

    doc.setFontSize(10)
    const summaryLines = doc.splitTextToSize(results.overview.summary, pageWidth - 40)
    doc.text(summaryLines, 20, y)
    y += summaryLines.length * 5 + 10

    // Papers Reviewed
    doc.setFontSize(12)
    doc.setTextColor(59, 130, 246)
    doc.text('Papers Reviewed', 20, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(0)
    papers.forEach((p, i) => {
      const line = `${i + 1}. ${p.title} (${p.year}) - ${p.authors.join(', ')}`
      doc.text(line, 20, y)
      y += 7
    })
    y += 5

    // Research Gaps
    doc.setFontSize(12)
    doc.setTextColor(59, 130, 246)
    doc.text('Research Gaps', 20, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(0)
    results.researchGaps.forEach((gap, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${gap.title}: ${gap.description}`, pageWidth - 40)
      doc.text(lines, 20, y)
      y += lines.length * 5 + 5
    })

    doc.save('ResearchHive_Report.pdf')
  }

  const downloadMarkdown = () => {
    let md = `# ${results.overview.title}\n\n`
    md += `**Research Question:** ${results.overview.researchQuestion}\n\n`
    md += `## Executive Summary\n\n${results.overview.summary}\n\n`
    md += `## Papers Reviewed\n\n`
    papers.forEach((p, i) => {
      md += `${i + 1}. **${p.title}** (${p.year}) - ${p.authors.join(', ')}\n`
    })
    md += `\n## Research Gaps\n\n`
    results.researchGaps.forEach((gap, i) => {
      md += `### ${i + 1}. ${gap.title}\n${gap.description}\n\n`
      md += `**Severity:** ${gap.severity}\n\n`
      md += `**Future Directions:** ${gap.potentialDirections.join(', ')}\n\n`
    })
    md += `## References\n\n`
    results.references.forEach((ref, i) => {
      md += `[${i + 1}] ${ref.authors}. "${ref.title}." ${ref.venue} ${ref.year}.\n`
    })

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ResearchHive_Report.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(label)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  const sections = [
    { id: 'overview', name: 'Overview', icon: Brain },
    { id: 'papers', name: 'Papers Reviewed', icon: BookOpen },
    { id: 'summaries', name: 'Paper Summaries', icon: FileText },
    { id: 'comparison', name: 'Methodology Comparison', icon: Scale },
    { id: 'findings', name: 'Common Findings', icon: Lightbulb },
    { id: 'gaps', name: 'Research Gaps', icon: Target },
    { id: 'references', name: 'References', icon: Link2 },
  ]

  return (
    <div className="min-h-screen bg-gradient-premium py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Header with Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">{results.overview.title}</h1>
            <p className="text-slate-400 text-lg">{results.overview.researchQuestion}</p>
            {isDemo && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400">
                <Sparkles className="h-3 w-3" />
                Demo Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadMarkdown}
              className="flex items-center gap-2 px-4 py-2.5 glass border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Markdown</span>
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-violet-700 transition-all text-sm"
            >
              <Download className="h-4 w-4" />
              <span>PDF</span>
            </button>
          </div>
        </motion.div>

        {/* Consensus Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-6 border border-white/5 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient mb-1">{results.overview.consensusScore || 84}%</div>
              <div className="text-sm text-slate-400">Research Consensus</div>
            </div>
            <div className="text-center border-l border-white/10 pl-6 md:border-l-0 md:border-t md:pt-6 md:pl-0">
              <div className="text-4xl font-bold text-blue-400 mb-1">{papers.length}</div>
              <div className="text-sm text-slate-400">Papers Analyzed</div>
            </div>
            <div className="text-center border-l border-white/10 pl-6 md:border-l-0 md:border-t md:pt-6 md:pl-0">
              <div className="text-4xl font-bold text-violet-400 mb-1">{results.overview.keyStatistics?.totalCitations?.toLocaleString() || '1,880'}</div>
              <div className="text-sm text-slate-400">Total Citations</div>
            </div>
            <div className="text-center border-l border-white/10 pl-6 md:border-l-0 md:border-t md:pt-6 md:pl-0">
              <div className="text-4xl font-bold text-cyan-400 mb-1">{results.overview.keyStatistics?.yearRange || '2018-2019'}</div>
              <div className="text-sm text-slate-400">Year Range</div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-strong rounded-2xl p-2 border border-white/5 mb-8"
        >
          <div className="flex flex-wrap gap-1 overflow-x-auto pb-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all whitespace-nowrap',
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-white shadow-lg shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.name}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {activeSection === 'overview' && <OverviewSection results={results} papers={papers} />}
          {activeSection === 'papers' && <PapersSection papers={papers} />}
          {activeSection === 'summaries' && <SummariesSection results={results} papers={papers} copyToClipboard={copyToClipboard} copiedItem={copiedItem} />}
          {activeSection === 'comparison' && <ComparisonSection results={results} papers={papers} />}
          {activeSection === 'findings' && <FindingsSection results={results} papers={papers} copyToClipboard={copyToClipboard} copiedItem={copiedItem} />}
          {activeSection === 'gaps' && <GapsSection results={results} papers={papers} />}
          {activeSection === 'references' && <ReferencesSection results={results} copyToClipboard={copyToClipboard} copiedItem={copiedItem} />}
        </div>
      </div>
    </div>
  )
}

// Section Components
function OverviewSection({ results, papers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-strong rounded-2xl p-6 border border-white/5">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-400" />
          Executive Summary
        </h2>
        <div className="prose prose-invert max-w-none text-slate-300 space-y-4 text-base leading-relaxed">
          {results.overview.summary.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6 border border-white/5">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-violet-400" />
          Papers Reviewed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper, idx) => (
            <div key={paper.id} className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-100 truncate">{paper.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{paper.authors.join(', ')} · {paper.venue} · {paper.year}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>{paper.pages} pages</span>
                    <span>{paper.size}</span>
                    <span>{paper.citations?.toLocaleString()} citations</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6 border border-white/5">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-cyan-400" />
          Research Consensus Radar
        </h2>
        <p className="text-slate-400 mb-6">
          Agreement among papers on key research dimensions (higher = more consensus)
        </p>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={results.comparison?.radarData || []}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.08)" domain={[0, 100]} tickCount={5} />
              <Radar name="Novelty" dataKey="Novelty" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
              <Radar name="Methodology" dataKey="Methodology" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              <Radar name="Datasets" dataKey="Datasets" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
              <Radar name="Evaluation" dataKey="Evaluation" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
              <Radar name="Impact" dataKey="Impact" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
                labelFormatter={(label) => label}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

function PapersSection({ papers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {papers.map((paper, idx) => (
        <div key={paper.id} className="glass-strong rounded-2xl p-6 border border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                {idx + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">{paper.title}</h3>
                <p className="text-slate-400 mt-1">{paper.authors.join(', ')} · {paper.venue} ({paper.year})</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 shrink-0">
              <span>{paper.pages} pages</span>
              <span>{paper.size}</span>
              <span>{paper.citations?.toLocaleString()} citations</span>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}

function SummariesSection({ results, papers, copyToClipboard, copiedItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {results.paperInsights?.map((item) => {
        const paper = papers.find(p => p.id === item.paperId)
        if (!paper) return null

        return (
          <div key={item.paperId} className="glass-strong rounded-2xl p-6 border border-white/5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 mb-2 inline-block">
                  {paper.venue} ({paper.year})
                </span>
                <h3 className="text-xl font-bold text-slate-100">{paper.title}</h3>
              </div>
            </div>

            <div className="space-y-3">
              {item.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className={cn(
                    'px-3 py-1 rounded text-[11px] font-semibold uppercase tracking-wider shrink-0 mt-0.5',
                    insight.type === 'innovation' && 'bg-violet-500/20 text-violet-400',
                    insight.type === 'finding' && 'bg-blue-500/20 text-blue-400',
                    insight.type === 'limitation' && 'bg-amber-500/20 text-amber-400'
                  )}>
                    {insight.type}
                  </span>
                  <div className="flex-1 flex items-center justify-between gap-4">
                    <span className="text-slate-300">{insight.text}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {insight.source && (
                        <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">{insight.source}</span>
                      )}
                      <span className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0',
                        insight.impact === 'high' && 'bg-red-500/20 text-red-400',
                        insight.impact === 'medium' && 'bg-amber-500/20 text-amber-400'
                      )}>
                        {insight.impact} impact
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}

function ComparisonSection({ results, papers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-strong rounded-2xl p-6 border border-white/5">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-blue-400" />
          Interactive Methodology Comparison
        </h2>

        {/* Radar Chart */}
        <div className="h-80 w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={results.comparison?.radarData || []}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.08)" domain={[0, 100]} />
              <Radar name="Novelty" dataKey="Novelty" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
              <Radar name="Methodology" dataKey="Methodology" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              <Radar name="Datasets" dataKey="Datasets" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
              <Radar name="Evaluation" dataKey="Evaluation" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
              <Radar name="Impact" dataKey="Impact" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-3 px-4 font-medium">Dimension</th>
                {papers.map((p) => (
                  <th key={p.id} className="py-3 px-4 font-medium min-w-[150px] max-w-[200px]">
                    {p.title.split(':')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {results.comparison?.dimensions?.map((dim, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-200 bg-white/5">{dim.name}</td>
                  {papers.map((p) => (
                    <td key={p.id} className="py-3 px-4 text-sm">
                      {dim.papers[p.id] || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

function FindingsSection({ results, papers, copyToClipboard, copiedItem }) {
  const commonFindings = [
    { text: 'Hybrid approaches combining multiple feature sets outperform single-modality models', impact: 'high', papers: ['fn-1', 'fn-2', 'fn-3'], source: 'Consensus across all three papers' },
    { text: 'Social context (propagation patterns) is a stronger signal than content alone', impact: 'high', papers: ['fn-2'], source: '[fn-2, p.7]' },
    { text: 'Linguistic style markers (pronouns, superlatives) differentiate fake from real news', impact: 'medium', papers: ['fn-1'], source: '[fn-1, p.5]' },
    { text: 'Cross-modal inconsistency between text and images indicates manipulation', impact: 'high', papers: ['fn-3'], source: '[fn-3, p.8]' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {commonFindings.map((finding, idx) => (
        <div key={idx} className="glass-strong rounded-2xl p-6 border border-white/5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-slate-300 text-lg leading-relaxed">{finding.text}</p>
              <div className="flex items-center gap-3 mt-3 text-sm">
                <span className={cn(
                  'px-2 py-0.5 rounded-full font-medium',
                  finding.impact === 'high' && 'bg-red-500/20 text-red-400',
                  finding.impact === 'medium' && 'bg-amber-500/20 text-amber-400'
                )}>
                  {finding.impact} impact
                </span>
                <span className="text-slate-500 bg-white/5 px-2 py-1 rounded">{finding.source}</span>
                <div className="flex items-center gap-1 text-slate-500">
                  <span>Papers:</span>
                  {finding.papers.map(pid => (
                    <span key={pid} className="text-xs bg-white/5 px-1.5 py-0.5 rounded">{papers.find(p => p.id === pid)?.title.split(':')[0] || pid}</span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(finding.text, `finding-${idx}`)}
              className="p-2 rounded-lg text-slate-500 hover:bg-white/10 hover:text-white transition-colors shrink-0"
              aria-label="Copy finding"
            >
              {copiedItem === `finding-${idx}` ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  )
}

function GapsSection({ results, papers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-strong rounded-2xl p-6 border border-white/5">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-400" />
          Research Gap Heatmap
        </h2>
        <p className="text-slate-400 mb-6">
          Priority and severity of identified research gaps across analyzed papers
        </p>

        {/* Heatmap using BarChart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.researchGaps?.map((g, i) => ({
              name: g.title.length > 25 ? g.title.substring(0, 25) + '...' : g.title,
              severity: g.severity === 'high' ? 100 : g.severity === 'medium' ? 65 : 30,
              fullTitle: g.title,
              related: g.relatedPapers.length
            })) || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v > 0 ? `${v}%` : ''} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={280} />
              <RechartsTooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
                formatter={(value, name) => [`${value}% Priority`, '']}
              />
              <Bar dataKey="severity" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              <Cell fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm text-slate-400">High Priority {`> 80%`}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-sm text-slate-400">Medium Priority 50-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500/50" />
            <span className="text-sm text-slate-400">Low Priority {`< 50%`}</span>
          </div>
        </div>
      </div>

      {/* Detailed Gaps */}
      <div className="space-y-4">
        {results.researchGaps?.map((gap, idx) => (
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
                    {gap.severity} priority
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-4">{gap.description}</p>

            <div className="space-y-3 pt-3 border-t border-white/5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Future Research Directions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {gap.potentialDirections.map((dir, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 text-xs text-slate-300">
                    <Target className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>{dir}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function ReferencesSection({ results, copyToClipboard, copiedItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {results.references?.map((ref, idx) => (
        <div key={ref.id} className="glass-strong rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-white/10 transition-colors">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-100 text-sm truncate">{ref.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{ref.authors}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">{ref.venue} {ref.year}</span>
              <span>{ref.citations?.toLocaleString()} citations</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => copyToClipboard(
                `[${idx + 1}] ${ref.authors}. "${ref.title}." ${ref.venue} ${ref.year}.`,
                `ref-${idx}`
              )}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-xs text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              {copiedItem === `ref-${idx}` ? 'Copied!' : 'Copy'}
            </button>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-xs text-slate-400 hover:text-slate-300 hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ))}
    </motion.div>
  )
}