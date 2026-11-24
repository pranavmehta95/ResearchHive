export const DEFAULT_RESEARCH_QUESTION =
  'How have transformer architectures evolved to handle longer sequences and improve efficiency?'
export const RESEARCH_QUESTION_STORAGE_KEY = 'rh_default_research_question'
export const NOTIFICATION_PREFERENCES_STORAGE_KEY = 'rh_notification_preferences'
export const REPORT_GENERATED_EVENT = 'researchhive:report-generated'
export const ANALYSIS_FAILED_EVENT = 'researchhive:analysis-failed'
export const NOTIFICATION_PREFERENCES_EVENT = 'researchhive:notification-preferences-changed'

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  reportCompleted: true,
  reportFailed: true,
  starterNotifications: true,
}

export function getNotificationPreferences() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY) || '{}'
    )
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...stored }
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES }
  }
}

export function saveNotificationPreferences(preferences) {
  localStorage.setItem(
    NOTIFICATION_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences)
  )
  window.dispatchEvent(new Event(NOTIFICATION_PREFERENCES_EVENT))
}

export function getDefaultResearchQuestion() {
  try {
    return (
      localStorage.getItem(RESEARCH_QUESTION_STORAGE_KEY) ||
      DEFAULT_RESEARCH_QUESTION
    )
  } catch {
    return DEFAULT_RESEARCH_QUESTION
  }
}

export function notifyReportGenerated(detail) {
  window.dispatchEvent(new CustomEvent(REPORT_GENERATED_EVENT, { detail }))
}

export function notifyAnalysisFailed(detail) {
  window.dispatchEvent(new CustomEvent(ANALYSIS_FAILED_EVENT, { detail }))
}
