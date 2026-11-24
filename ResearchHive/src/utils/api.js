const API_BASE_URL = 'http://localhost:8000/api'
const TOKEN_KEY = 'rh_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  // Let the browser set multipart boundary for FormData bodies
  if (options.body instanceof FormData) delete headers['Content-Type']

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (response.status === 401 && token) {
    setToken(null)
    window.location.reload()
    throw new Error('Session expired')
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || 'Request failed')
  }
  return response.json()
}

export const api = {
  // --- Auth ---
  async register(username, email, password) {
    const data = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
    setToken(data.token)
    return data.user
  },

  async login(login, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })
    setToken(data.token)
    return data.user
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' })
    } finally {
      setToken(null)
    }
  },

  async me() {
    const data = await request('/auth/me')
    return data.user
  },

  // --- Papers & analysis ---
  async uploadPapers(files) {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    return request('/upload-papers', { method: 'POST', body: formData })
  },

  async startAnalysis(uploadId, researchQuestion) {
    const formData = new FormData()
    formData.append('upload_id', uploadId)
    formData.append('research_question', researchQuestion)
    return request('/analyze', { method: 'POST', body: formData })
  },

  async getAnalysisStatus(analysisId) {
    return request(`/analysis/${analysisId}`)
  },

  async getAnalysisReport(analysisId) {
    return request(`/report/${analysisId}`)
  },

  async listAnalyses() {
    return request('/analyses')
  },
}
