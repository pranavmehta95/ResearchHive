import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../utils/cn'
import UploadArea from '../components/UploadArea'
import AgentCard from '../components/AgentCard'
import ProgressTimeline from '../components/ProgressTimeline'
import ResultTabs from '../components/ResultTabs'
import { api } from '../utils/api'
import { mockPapers, mockAgents, mockTimeline, mockResults } from '../data/mockData'
import { Sparkles, BookOpen, FileDown, Share2, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadId, setUploadId] = useState(null)
  const [analysisId, setAnalysisId] = useState(null)
  const [analysisStatus, setAnalysisStatus] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [researchQuestion, setResearchQuestion] = useState('How have transformer architectures evolved to handle longer sequences and improve efficiency?')
  const [error, setError] = useState(null)

  const pollingInterval = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (analysisId && isAnalyzing) {
      pollingInterval.current = setInterval(async () => {
        try {
          const status = await api.getAnalysisStatus(analysisId)
          setAnalysisStatus(status)

          if (status.status === 'completed') {
            setIsAnalyzing(false)
            clearInterval(pollingInterval.current)
            const report = await api.getAnalysisReport(analysisId)
            setAnalysisStatus(prev => ({ ...prev, report: report.report }))
          } else if (status.status === 'error') {
            setIsAnalyzing(false)
            setError(status.error)
            clearInterval(pollingInterval.current)
          }
        } catch (err) {
          console.error('Polling error:', err)
        }
      }, 3000)
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current)
    }
  }, [analysisId, isAnalyzing])

  const handleAddFiles = async (files) => {
    try {
      setError(null)
      const response = await api.uploadPapers(files)
      setUploadId(response.upload_id)

      const newFiles = response.papers.map((p, idx) => ({
        id: p.paper_id,
        name: p.filename,
        status: p.status === 'completed' ? 'completed' : 'error',
        message: p.message,
        pages: 0, // Backend will provide this in future updates
        size: '0 MB',
      }))

      setUploadedFiles(prev => [...prev, ...newFiles])
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemoveFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleUseDemo = () => {
    setUploadedFiles(mockPapers)
    // For demo purposes, we'll just show the mock results
    setAnalysisStatus({
      status: 'completed',
      progress: 100,
      current_stage: 'Analysis complete!',
      agents: mockAgents,
      report: mockResults
    })
  }

  const handleStartAnalysis = async () => {
    if (!uploadId) {
      // If we don't have an uploadId (e.g. demo mode), just use mock data
      setIsAnalyzing(true)
      setTimeout(() => {
        setIsAnalyzing(false)
        setAnalysisStatus({
          status: 'completed',
          progress: 100,
          current_stage: 'Analysis complete!',
          agents: mockAgents,
          report: mockResults
        })
      }, 3000)
      return
    }

    try {
      setError(null)
      setIsAnalyzing(true)
      const response = await api.startAnalysis(uploadId, researchQuestion)
      setAnalysisId(response.analysis_id)
    } catch (err) {
      setIsAnalyzing(false)
      setError(err.message)
    }
  }

  const handleAgentHover = (agentId) => {
    setActiveAgentId(agentId)
  }

  const formatTime = (date) => {
    if (!date) return '--:--:--'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const displayStatus = analysisStatus || {
    status: 'idle',
    progress: 0,
    current_stage: 'Waiting for papers...',
    agents: mockAgents.map(a => ({ ...a, status: 'pending', progress: 0 })),
    report: null
  }

  const hasResults = displayStatus.status === 'completed' && displayStatus.report

  // Normalize the LLM-generated report into the shape ResultTabs expects.
  // Field names/types vary between runs, so guard everything.
  const report = displayStatus.report || {}
  const toArray = (v) => Array.isArray(v) ? v : (v == null ? [] : [v])
  const toText = (v) => Array.isArray(v) ? v.join(', ') : (v == null ? '' : String(v))
  const toNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

  const tabPapers = (uploadedFiles.length > 0 ? uploadedFiles : mockPapers).map(p => ({
    id: p.id || p.paper_id,
    title: p.title || p.name || 'Untitled',
    authors: p.authors || [],
    venue: p.venue || 'N/A',
    year: p.year || '',
    pages: p.pages || 0,
    size: p.size || '',
    citations: p.citations || 0,
    methodology: p.methodology || '',
    status: p.status,
  }))

  const tabResults = {
    overview: {
      title: report.title || 'Literature Review',
      researchQuestion: report.research_question || researchQuestion,
      summary: typeof report.executive_summary === 'string'
        ? report.executive_summary
        : JSON.stringify(report.executive_summary || ''),
      keyStatistics: {
        totalPapers: toNum(report.key_statistics?.total_papers) || tabPapers.length,
        totalCitations: toNum(report.key_statistics?.total_citations),
        yearRange: String(report.key_statistics?.year_range || 'N/A'),
        venues: toNum(report.key_statistics?.venues),
        keyConcepts: toNum(report.key_statistics?.key_concepts),
        methodologies: toNum(report.key_statistics?.methodologies),
      },
      themes: toArray(report.thematic_clusters).map(t => ({
        name: t?.name || t?.theme || 'Theme',
        description: t?.description || '',
        papers: toArray(t?.papers),
      }))
    },
    paperInsights: toArray(report.paper_analyses).map(p => ({
      paperId: p?.paper_id,
      insights: [
        { type: 'innovation', text: toText(p?.objective) || 'No objective extracted', impact: 'high' },
        { type: 'finding', text: toText(p?.findings) || toText(p?.methodology) || 'No findings extracted', impact: 'high' },
        { type: 'limitation', text: toText(p?.conclusion) || toText(p?.methodology) || '', impact: 'medium' }
      ]
    })),
    comparison: {
      dimensions: toArray(report.methodology_comparison).map(d => ({
        name: d?.dimension || d?.name || 'Dimension',
        papers: d?.papers && typeof d.papers === 'object' ? d.papers : {}
      })),
      radarData: mockResults.comparison.radarData
    },
    gaps: toArray(report.research_gaps).map((g, i) => ({
      id: g?.id || g?.title || `gap-${i}`,
      title: g?.title || 'Research gap',
      description: g?.description || '',
      severity: g?.severity || 'medium',
      potentialDirections: toArray(g?.potential_directions)
    })),
    references: toArray(report.citations).map((c, i) => {
      if (typeof c === 'string') {
        return { id: `ref-${i}`, title: c, authors: '', venue: '', year: '', citations: 0, url: '#' }
      }
      return {
        id: c?.paper_id || c?.id || `ref-${i}`,
        title: c?.title || c?.ieee_citation || 'Untitled',
        authors: toText(c?.authors),
        venue: c?.venue || '',
        year: c?.year || '',
        citations: 0,
        url: '#'
      }
    })
  }

  return (
    <div className="space-y-8">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400"
        >
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-slate-100">
            Welcome back, Researcher
          </h1>
          <p className="text-slate-400">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <button className="rounded-xl px-4 py-2.5 glass text-slate-300 hover:text-white transition-all text-sm">
            <FileDown className="h-4 w-4 mr-1.5 inline" />
            Export
          </button>
          <button className="rounded-xl px-4 py-2.5 glass text-slate-300 hover:text-white transition-all text-sm">
            <Share2 className="h-4 w-4 mr-1.5 inline" />
            Share
          </button>
          <button className="rounded-xl p-2.5 glass text-slate-300 hover:text-white transition-all">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="glass-strong rounded-2xl p-6 border border-white/5"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <h2 className="text-xl font-semibold text-slate-100">Research Question</h2>
            <input
              type="text"
              value={researchQuestion}
              onChange={(e) => setResearchQuestion(e.target.value)}
              className="w-full bg-transparent border-none text-slate-400 text-sm focus:ring-0 p-0"
              placeholder="Enter your research question..."
            />
          </div>
          {hasResults && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Sparkles className="h-4 w-4" />
              <span>Analysis Complete</span>
            </div>
          )}
        </div>
      </motion.div>

      {isAnalyzing || hasResults ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="glass-strong rounded-2xl p-6 border border-white/5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-100">Overall Progress</h3>
                  <span className="text-sm font-medium text-blue-400">{displayStatus.progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${displayStatus.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                  {isAnalyzing && <Loader2 className="h-3 w-3 animate-spin" />}
                  {displayStatus.current_stage}
                </p>
              </div>

              <ProgressTimeline
                timeline={displayStatus.agents.map(a => ({
                  agentId: a.agent_name,
                  stage: a.agent_name,
                  status: a.status.toLowerCase(),
                  startTime: a.started_at ? formatTime(a.started_at) : '--:--',
                  endTime: a.completed_at ? formatTime(a.completed_at) : '--:--',
                  details: a.message
                }))}
              />
            </div>

            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="glass-strong rounded-2xl p-6 border border-white/5"
              >
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Multi-Agent Workflow</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayStatus.agents.map((agent, index) => (
                    <motion.div
                      key={agent.agent_name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onHoverStart={() => handleAgentHover(agent.agent_name)}
                      onHoverEnd={() => setActiveAgentId(null)}
                    >
                      <AgentCard
                        agent={{
                          id: agent.agent_name,
                          name: agent.agent_name,
                          description: agent.message,
                          status: agent.status.toLowerCase(),
                          progress: agent.progress,
                          color: index % 3 === 0 ? 'electric-blue' : index % 3 === 1 ? 'violet' : 'cyan',
                          icon: index === 0 ? 'Search' : index === 1 ? 'GitCompare' : index === 2 ? 'AlertTriangle' : index === 3 ? 'Link2' : 'Brain'
                        }}
                        index={index}
                        isActive={activeAgentId === agent.agent_name}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {hasResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-100">Analysis Results</h3>
              </div>
              <ResultTabs
                results={tabResults}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                papers={tabPapers}
              />
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-strong rounded-2xl p-6 border border-white/5"
        >
          <UploadArea
            uploadedFiles={uploadedFiles}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            onUseDemo={handleUseDemo}
            isAnalyzing={isAnalyzing}
            onStartAnalysis={handleStartAnalysis}
          />
        </motion.div>
      )}
    </div>
  )
}