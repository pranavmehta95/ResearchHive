import { useState, useCallback, useRef } from 'react'
import { cn } from '../utils/cn'
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_FILES = 5
const MIN_FILES = 3
const ACCEPTED_TYPES = ['application/pdf']

export default function UploadArea({ uploadedFiles, onAddFiles, onRemoveFile, onUseDemo, onStartAnalysis, isAnalyzing }) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [dragCount, setDragCount] = useState(0)
  const fileInputRef = useRef(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragCount((c) => c + 1)
      setIsDragActive(true)
    } else if (e.type === 'dragleave' || e.type === 'drop') {
      setDragCount((c) => c - 1)
      if (dragCount <= 1) setIsDragActive(false)
    }
  }, [dragCount])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCount(0)
    setIsDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter((f) => ACCEPTED_TYPES.includes(f.type))
    if (files.length > 0) {
      const availableSlots = MAX_FILES - uploadedFiles.length
      const filesToAdd = files.slice(0, availableSlots)
      onAddFiles(filesToAdd)
    }
  }, [uploadedFiles.length, onAddFiles])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter((f) => ACCEPTED_TYPES.includes(f.type))
    if (files.length > 0) {
      const availableSlots = MAX_FILES - uploadedFiles.length
      const filesToAdd = files.slice(0, availableSlots)
      onAddFiles(filesToAdd)
    }
    e.target.value = ''
  }

  const handleClickUpload = () => fileInputRef.current?.click()

  const canStartAnalysis = uploadedFiles.length >= MIN_FILES && !isAnalyzing

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/5">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Upload Research Papers</h2>
          <p className="text-sm text-slate-400 mt-1">
            Add {MIN_FILES}–{MAX_FILES} PDF papers for multi-agent literature review analysis
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            uploadedFiles.length >= MIN_FILES
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/20 text-amber-400'
          )}>
            {uploadedFiles.length}/{MAX_FILES} papers
          </span>
        </div>
      </div>

      <div
        {...{
          onDragEnter: handleDrag,
          onDragLeave: handleDrag,
          onDragOver: handleDrag,
          onDrop: handleDrop,
        }}
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all duration-300',
          'cursor-pointer',
          isDragActive
            ? 'border-zinc-100/50 bg-white/5'
            : uploadedFiles.length >= MAX_FILES
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-white/10 hover:border-zinc-100/30 hover:bg-white/5'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
          id="file-upload"
          disabled={uploadedFiles.length >= MAX_FILES || isAnalyzing}
        />

        {uploadedFiles.length === 0 ? (
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center py-12 px-6">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4"
            >
              <div className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl',
                isDragActive
                  ? 'bg-white/10 text-zinc-100'
                  : 'bg-white/5 text-zinc-500'
              )}>
                <Upload className="h-8 w-8" />
              </div>
            </motion.div>
            <p className="text-lg font-medium text-slate-200 mb-1">
              Drag & drop PDF files here, or click to browse
            </p>
            <p className="text-sm text-slate-500">
              Maximum {MAX_FILES} files • PDF only • Up to 50MB each
            </p>
          </label>
        ) : (
          <div className="p-4">
            <AnimatePresence mode="popLayout">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                    file.status === 'completed' && 'bg-emerald-500/20 text-emerald-400',
                    file.status === 'processing' && 'bg-white/10 text-zinc-200',
                    file.status === 'error' && 'bg-red-500/20 text-red-400',
                    file.status === 'pending' && 'bg-amber-500/20 text-amber-400'
                  )}>
                    {file.status === 'processing' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : file.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : file.status === 'error' ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-100 truncate">{file.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span>{file.pages} pages</span>
                      <span>{file.size}</span>
                      {file.status === 'processing' && (
                        <span className="text-zinc-300 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Processing...
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveFile(file.id)
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-red-400 transition-colors"
                    disabled={isAnalyzing}
                    aria-label="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {uploadedFiles.length < MAX_FILES && !isAnalyzing && (
              <label htmlFor="file-upload" className="mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 p-4 text-zinc-400 hover:border-zinc-100/30 hover:text-zinc-200 hover:bg-white/5 transition-all cursor-pointer">
                <Plus className="h-5 w-5" />
                <span className="text-sm font-medium">Add more papers</span>
              </label>
            )}

            {uploadedFiles.length >= MAX_FILES && (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Maximum number of papers reached</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleClickUpload}
          disabled={uploadedFiles.length >= MAX_FILES || isAnalyzing}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl px-6 py-3 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-4 w-4" />
          <span className="font-medium">Add More Papers</span>
        </button>

        <button
          onClick={onUseDemo}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl px-6 py-3 glass border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all"
        >
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">Use Demo Papers</span>
        </button>

        <button
          onClick={onStartAnalysis}
          disabled={!canStartAnalysis}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium text-sm transition-all
            bg-zinc-100 text-zinc-900 shadow-lg
            hover:bg-white hover:shadow-xl
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-100"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Start Analysis</span>
            </>
          )}
        </button>
      </div>

      {uploadedFiles.length > 0 && uploadedFiles.length < MIN_FILES && !isAnalyzing && (
        <p className="mt-4 text-center text-sm text-slate-500">
          Add {MIN_FILES - uploadedFiles.length} more paper{MIN_FILES - uploadedFiles.length > 1 ? 's' : ''} to enable analysis
        </p>
      )}
    </div>
  )
}