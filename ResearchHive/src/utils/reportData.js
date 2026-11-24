// Normalizes a backend analysis report (snake_case or camelCase, field
// names/types vary between runs) into the shape the Dashboard tabs and the
// Report page consume.

const toArray = (v) => (Array.isArray(v) ? v : v == null ? [] : [v])
const toText = (v) => (Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v))
const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
const toAuthors = (v) => {
  if (Array.isArray(v)) return v
  if (v == null || v === '') return []
  return [v]
}

export function normalizeReportData(report = {}, papers = [], researchQuestion = '') {
  const safePapers = (papers.length > 0 ? papers : []).map((p) => ({
    ...p,
    authors: toAuthors(p.authors ?? p.author),
  }))

  const tabPapers = safePapers.map((p) => ({
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

  const ov = report.overview || {}
  const ks = report.key_statistics || ov.keyStatistics || {}
  const gapItems = toArray(report.research_gaps ?? report.researchGaps)
  const refItems = toArray(report.citations ?? report.references)
  const insightItems = toArray(report.paper_analyses ?? report.paperInsights)
  const compDims = toArray(
    report.methodology_comparison ?? ov.methodologyComparison ?? report.comparison?.dimensions
  )

  const results = {
    overview: {
      title: report.title || ov.title || 'Literature Review',
      researchQuestion:
        report.research_question ||
        ov.researchQuestion ||
        ov.research_question ||
        researchQuestion,
      summary: (() => {
        const s = report.executive_summary ?? ov.summary ?? ''
        return typeof s === 'string' ? s : JSON.stringify(s || '')
      })(),
      consensusScore:
        toNum(ov.consensusScore ?? ov.consensus_score ?? report.consensus_score) || null,
      keyStatistics: {
        totalPapers: toNum(ks.total_papers ?? ks.totalPapers) || tabPapers.length,
        totalCitations: toNum(ks.total_citations ?? ks.totalCitations),
        yearRange: String(ks.year_range ?? ks.yearRange ?? 'N/A'),
        venues: toNum(ks.venues),
        keyConcepts: toNum(ks.key_concepts ?? ks.keyConcepts),
        methodologies: toNum(ks.methodologies),
      },
      themes: toArray(report.thematic_clusters ?? ov.themes).map((t) => ({
        name: t?.name || t?.theme || 'Theme',
        description: t?.description || '',
        papers: toArray(t?.papers ?? t?.relatedPapers),
      })),
    },
    paperInsights: insightItems.map((p) => ({
      paperId: p?.paper_id ?? p?.paperId,
      insights:
        Array.isArray(p?.insights) && p.insights.length > 0
          ? p.insights.map((i) => ({
              type: i?.type || 'finding',
              text: toText(i?.text ?? i?.description),
              impact: i?.impact || 'medium',
              source: i?.source || p?.source || null,
            }))
          : [
              {
                type: 'innovation',
                text: toText(p?.objective) || 'No objective extracted',
                impact: 'high',
              },
              {
                type: 'finding',
                text:
                  toText(p?.findings) ||
                  toText(p?.methodology) ||
                  'No findings extracted',
                impact: 'high',
              },
              {
                type: 'limitation',
                text: toText(p?.conclusion) || toText(p?.methodology) || '',
                impact: 'medium',
              },
            ],
    })),
    comparison: {
      dimensions: compDims.map((d) => ({
        name: d?.dimension || d?.name || 'Dimension',
        papers: d?.papers && typeof d.papers === 'object' ? d.papers : {},
      })),
      radarData: report.comparison?.radarData || [],
    },
    researchGaps: gapItems.map((g, i) => ({
      id: g?.id || g?.title || `gap-${i}`,
      title: g?.title || 'Research gap',
      description: g?.description || '',
      severity: g?.severity || 'medium',
      relatedPapers: toArray(g?.related_papers ?? g?.relatedPapers),
      potentialDirections: toArray(g?.potential_directions ?? g?.potentialDirections),
    })),
    references: refItems.map((c, i) => {
      if (typeof c === 'string') {
        return {
          id: `ref-${i}`,
          title: c,
          authors: '',
          venue: '',
          year: '',
          citations: 0,
          url: '#',
        }
      }
      return {
        id: c?.paper_id || c?.id || `ref-${i}`,
        title: c?.title || c?.ieee_citation || 'Untitled',
        authors: toText(c?.authors),
        venue: c?.venue || '',
        year: c?.year || '',
        citations: toNum(c?.citations),
        url: c?.url || '#',
      }
    }),
  }

  return { papers: tabPapers, results }
}
