const API_BASE_URL = 'http://localhost:8000/api'

export const api = {
  async uploadPapers(files) {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await fetch(`${API_BASE_URL}/upload-papers`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Upload failed')
    }

    return response.json()
  },

  async startAnalysis(uploadId, researchQuestion) {
    const formData = new FormData()
    formData.append('upload_id', uploadId)
    formData.append('research_question', researchQuestion)

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Analysis failed to start')
    }

    return response.json()
  },

  async getAnalysisStatus(analysisId) {
    const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`)
    if (!response.ok) {
      throw new Error('Failed to get analysis status')
    }
    return response.json()
  },

  async getAnalysisReport(analysisId) {
    const response = await fetch(`${API_BASE_URL}/report/${analysisId}`)
    if (!response.ok) {
      throw new Error('Failed to get analysis report')
    }
    return response.json()
  },
}