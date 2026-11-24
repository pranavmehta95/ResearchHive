import { motion } from 'framer-motion'
import { cn } from '../utils/cn'
import { mockPapers } from '../data/mockData'
import { BookOpen, FileText, Quote } from 'lucide-react'

export default function Papers() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-slate-100">Papers</h1>
        <p className="text-slate-400">
          {mockPapers.length} papers available for literature review analysis
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPapers.map((paper, idx) => (
          <motion.div
            key={paper.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="glass-strong rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-zinc-200">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-100 leading-snug">
                  {paper.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {paper.authors.join(', ')}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    {paper.venue} {paper.year}
                  </span>
                  <span>{paper.citations?.toLocaleString()} citations</span>
                  <span>{paper.pages} pages</span>
                </div>
                {paper.methodology && (
                  <p className="mt-3 text-xs text-slate-500 line-clamp-2">
                    <span className="font-medium text-slate-400">Methodology:</span>{' '}
                    {paper.methodology}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="glass rounded-2xl p-6 border border-white/5 flex items-start gap-3"
      >
        <BookOpen className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-400">
          Upload your own PDFs from the{' '}
          <a href="/" className="text-zinc-200 underline underline-offset-2 hover:text-white transition-colors">
            Dashboard
          </a>{' '}
          to run a custom multi-agent analysis on your own paper collection.
        </p>
      </motion.div>
    </div>
  )
}
