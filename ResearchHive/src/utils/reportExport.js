import { jsPDF } from 'jspdf'

export function downloadReportPdf(papers, results) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = pageWidth - margin * 2
  const palette = {
    ink: [24, 24, 27],
    muted: [100, 100, 110],
    accent: [124, 58, 237],
    rule: [226, 226, 232],
    white: [255, 255, 255],
  }
  let y = 40

  const drawPageHeader = () => {
    doc.setFillColor(...palette.ink)
    doc.rect(0, 0, pageWidth, 28, 'F')
    doc.setFillColor(...palette.accent)
    doc.roundedRect(margin, 7, 14, 14, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...palette.white)
    doc.text('RH', margin + 7, 16, { align: 'center' })
    doc.setFontSize(11)
    doc.text('RESEARCHHIVE', margin + 19, 13)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(205, 205, 215)
    doc.text('LITERATURE REVIEW', margin + 19, 19)
  }

  const newPage = () => {
    doc.addPage()
    drawPageHeader()
    y = 40
  }

  const ensureSpace = (height) => {
    if (y + height > pageHeight - 22) newPage()
  }

  const addText = (value, { size = 10, color = palette.ink, bold = false, indent = 0 } = {}) => {
    const text = String(value || '').trim()
    if (!text) return
    const lineHeight = size >= 18 ? 9 : size >= 13 ? 7 : 5
    const lines = doc.splitTextToSize(text, contentWidth - indent)
    lines.forEach((line) => {
      ensureSpace(lineHeight)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setFontSize(size)
      doc.setTextColor(...color)
      doc.text(line, margin + indent, y)
      y += lineHeight
    })
    y += 2
  }

  const addSection = (title) => {
    ensureSpace(14)
    y += 3
    doc.setFillColor(...palette.accent)
    doc.roundedRect(margin, y - 4, 2, 8, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...palette.ink)
    doc.text(title, margin + 6, y + 1)
    y += 10
  }

  const addBullet = (text) => {
    ensureSpace(5)
    doc.setFillColor(...palette.accent)
    doc.circle(margin + 1, y - 1, 0.8, 'F')
    addText(text, { indent: 5 })
  }

  drawPageHeader()
  addText(results.overview.title || 'Literature Review', { size: 22, bold: true })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...palette.accent)
  doc.text('RESEARCHHIVE REPORT', margin, y)
  y += 8

  addText('RESEARCH QUESTION', { size: 8, color: palette.muted, bold: true })
  addText(results.overview.researchQuestion || 'Not specified', { size: 12 })

  ensureSpace(25)
  const metrics = [
    ['PAPERS ANALYZED', String(papers.length)],
    ['RESEARCH CONSENSUS', results.overview.consensusScore == null ? 'N/A' : `${results.overview.consensusScore}%`],
    ['YEAR RANGE', results.overview.keyStatistics?.yearRange || 'N/A'],
  ]
  const gap = 4
  const cardWidth = (contentWidth - gap * (metrics.length - 1)) / metrics.length
  const cardY = y
  metrics.forEach(([label, value], index) => {
    const x = margin + index * (cardWidth + gap)
    doc.setFillColor(246, 245, 250)
    doc.setDrawColor(...palette.rule)
    doc.roundedRect(x, cardY, cardWidth, 19, 2, 2, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...palette.muted)
    doc.text(label, x + 4, cardY + 7)
    doc.setFontSize(12)
    doc.setTextColor(...palette.ink)
    doc.text(value, x + 4, cardY + 14)
  })
  y += 25

  addSection('Executive Summary')
  addText(results.overview.summary || 'No executive summary was provided.')

  addSection('Papers Reviewed')
  papers.forEach((paper, index) => {
    const authors = Array.isArray(paper.authors)
      ? paper.authors.join(', ')
      : paper.authors || 'Authors not listed'
    addText(`${index + 1}. ${paper.title || 'Untitled paper'}`, { bold: true })
    addText(`${authors} | ${paper.venue || 'Venue not listed'} | ${paper.year || 'Year not listed'}`, {
      size: 9,
      color: palette.muted,
      indent: 4,
    })
  })

  const themes = results.overview.themes || []
  if (themes.length) {
    addSection('Key Themes')
    themes.forEach((theme) => {
      addText(theme.name, { bold: true })
      if (theme.description) addText(theme.description, { indent: 4 })
    })
  }

  const insightGroups = results.paperInsights || []
  if (insightGroups.length) {
    addSection('Paper-by-Paper Findings')
    insightGroups.forEach((group) => {
      const paper = papers.find((item) => item.id === group.paperId)
      if (paper) addText(paper.title, { bold: true })
      const insights = group.insights || []
      insights.forEach((insight) => {
        addBullet(`${insight.type || 'Finding'}: ${insight.text}${insight.source ? ` (${insight.source})` : ''}`)
      })
    })
  }

  const dimensions = results.comparison?.dimensions || []
  if (dimensions.length) {
    addSection('Methodology Comparison')
    dimensions.forEach((dimension) => {
      addText(dimension.name, { bold: true })
      papers.forEach((paper) => {
        const value = dimension.papers?.[paper.id]
        if (value) addText(`${paper.title}: ${value}`, { size: 9, indent: 4 })
      })
    })
  }

  const gaps = results.researchGaps || []
  if (gaps.length) {
    addSection('Research Gaps & Future Directions')
    gaps.forEach((gap, index) => {
      addText(`${index + 1}. ${gap.title} | ${gap.severity || 'Unrated'} priority`, { bold: true })
      addText(gap.description)
      const directions = gap.potentialDirections || []
      directions.forEach((direction) => addBullet(direction))
    })
  }

  const references = results.references || []
  if (references.length) {
    addSection('References')
    references.forEach((reference, index) => {
      addText(`[${index + 1}] ${reference.authors || 'Authors not listed'}. "${reference.title}". ${reference.venue || ''} ${reference.year || ''}.`)
    })
  }

  const pageCount = doc.internal.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...palette.rule)
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...palette.muted)
    doc.text('ResearchHive | AI-assisted literature review', margin, pageHeight - 9)
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 9, { align: 'right' })
  }

  doc.save('ResearchHive_Literature_Review.pdf')
}

export function downloadReportMarkdown(papers, results) {
  let markdown = `# ResearchHive | ${results.overview.title}\n\n`
  markdown += '> ResearchHive literature review report\n\n'
  markdown += `**Research Question:** ${results.overview.researchQuestion}\n\n`
  markdown += `## Executive Summary\n\n${results.overview.summary}\n\n`
  markdown += '## Papers Reviewed\n\n'
  papers.forEach((paper, index) => {
    const authors = Array.isArray(paper.authors)
      ? paper.authors.join(', ')
      : paper.authors || 'Authors not listed'
    markdown += `${index + 1}. **${paper.title}** (${paper.year || 'Year not listed'}) - ${authors}\n`
  })

  const themes = results.overview.themes || []
  if (themes.length) {
    markdown += '\n## Key Themes\n\n'
    themes.forEach((theme) => {
      markdown += `### ${theme.name}\n${theme.description || ''}\n\n`
    })
  }

  const insightGroups = results.paperInsights || []
  if (insightGroups.length) {
    markdown += '## Paper-by-Paper Findings\n\n'
    insightGroups.forEach((group) => {
      const paper = papers.find((item) => item.id === group.paperId)
      if (paper) markdown += `### ${paper.title}\n\n`
      const insights = group.insights || []
      insights.forEach((insight) => {
        markdown += `- **${insight.type || 'Finding'}:** ${insight.text}${insight.source ? ` (${insight.source})` : ''}\n`
      })
      markdown += '\n'
    })
  }

  const dimensions = results.comparison?.dimensions || []
  if (dimensions.length) {
    markdown += '## Methodology Comparison\n\n'
    dimensions.forEach((dimension) => {
      markdown += `### ${dimension.name}\n`
      papers.forEach((paper) => {
        const value = dimension.papers?.[paper.id]
        if (value) markdown += `- **${paper.title}:** ${value}\n`
      })
      markdown += '\n'
    })
  }

  const gaps = results.researchGaps || []
  if (gaps.length) {
    markdown += '## Research Gaps & Future Directions\n\n'
    gaps.forEach((gap, index) => {
      markdown += `### ${index + 1}. ${gap.title}\n${gap.description || ''}\n\n`
      markdown += `**Priority:** ${gap.severity || 'Unrated'}\n\n`
      const directions = gap.potentialDirections || []
      if (directions.length) markdown += `**Future Directions:** ${directions.join(', ')}\n\n`
    })
  }

  const references = results.references || []
  if (references.length) {
    markdown += '## References\n\n'
    references.forEach((reference, index) => {
      markdown += `[${index + 1}] ${reference.authors || 'Authors not listed'}. "${reference.title}". ${reference.venue || ''} ${reference.year || ''}.\n`
    })
  }

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'ResearchHive_Literature_Review.md'
  anchor.click()
  URL.revokeObjectURL(url)
}
