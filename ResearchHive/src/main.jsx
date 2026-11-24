import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Papers from './pages/Papers'
import Report from './pages/Report'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="reports/:analysisId" element={<Report />} />
          <Route path="demo-report" element={<Report isDemo={true} />} />
          <Route path="papers" element={<Papers />} />
          <Route path="analysis" element={<div className="p-8 text-slate-400">Analysis Page (Placeholder)</div>} />
          <Route path="settings" element={<div className="p-8 text-slate-400">Settings Page (Placeholder)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)