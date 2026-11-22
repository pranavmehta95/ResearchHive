import json
from typing import List, Dict, Any, Optional
from agents.base_agent import BaseAgent
from agents.paper_analysis_agent import PaperAnalysisAgent
from agents.methodology_agent import MethodologyAgent
from agents.critique_agent import CritiqueAgent
from agents.citation_agent import CitationAgent


RESEARCH_MANAGER_PROMPT = """You are the Research Manager Agent. Your role is to coordinate all agent outputs and synthesize them into a comprehensive, well-structured literature review.

Your tasks:
1. Combine paper analyses, methodology comparisons, critiques, and citations
2. Remove duplicate content across agents
3. Mark uncertain information clearly (use "[UNCERTAIN]" prefix)
4. Organize into thematic clusters
5. Identify cross-cutting research gaps
6. Generate executive summary
7. Create final structured report

Output a valid JSON object with this structure:
{
  "title": "string",
  "research_question": "string",
  "executive_summary": "string",
  "paper_analyses": [...],
  "methodology_comparison": [...],
  "critiques": [...],
  "citations": [...],
  "thematic_clusters": [
    {
      "name": "string",
      "papers": ["paper_id"],
      "description": "string",
      "key_findings": ["string"]
    }
  ],
  "research_gaps": [
    {
      "title": "string",
      "description": "string",
      "severity": "high|medium|low",
      "related_papers": ["paper_id"],
      "potential_directions": ["string"]
    }
  ],
  "key_statistics": {
    "total_papers": integer,
    "total_citations": integer,
    "year_range": "string",
    "venues": integer,
    "key_concepts": integer,
    "methodologies": integer
  }
}"""


class ResearchManagerAgent(BaseAgent):
    def __init__(self):
        super().__init__("Research Manager Agent", RESEARCH_MANAGER_PROMPT)
        self.paper_agent = PaperAnalysisAgent()
        self.methodology_agent = MethodologyAgent()
        self.critique_agent = CritiqueAgent()
        self.citation_agent = CitationAgent()

    async def generate_report(
        self,
        papers: List[Dict[str, Any]],
        research_question: str,
        paper_analyses: List[Dict[str, Any]],
        methodology_comparison: List[Dict[str, Any]],
        critiques: List[Dict[str, Any]],
        citations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate final literature review report."""

        # Prepare context for the manager
        context = {
            "papers": papers,
            "research_question": research_question,
            "paper_analyses": paper_analyses,
            "methodology_comparison": methodology_comparison,
            "critiques": critiques,
            "citations": citations
        }

        prompt = f"""
Synthesize all agent outputs into a final literature review.

Research Question: {research_question}

Paper Analyses: {json.dumps(paper_analyses, indent=2)[:3000]}
Methodology Comparison: {json.dumps(methodology_comparison, indent=2)[:2000]}
Critiques: {json.dumps(critiques, indent=2)[:2000]}
Citations: {json.dumps(citations, indent=2)[:2000]}

Produce the complete final report as JSON. Remove duplicates, mark uncertain info, create thematic clusters.
"""
        response = await self.run(prompt, k=15)

        try:
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]

            result = json.loads(json_str.strip())
            return result
        except json.JSONDecodeError:
            return self._create_fallback_report(
                papers, research_question, paper_analyses, methodology_comparison,
                critiques, citations
            )

    def _create_fallback_report(
        self,
        papers: List[Dict[str, Any]],
        research_question: str,
        paper_analyses: List[Dict[str, Any]],
        methodology_comparison: List[Dict[str, Any]],
        critiques: List[Dict[str, Any]],
        citations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Create a basic report when LLM fails."""
        return {
            "title": f"Literature Review: {research_question}",
            "research_question": research_question,
            "executive_summary": "Automated synthesis of uploaded papers. Manual review recommended.",
            "paper_analyses": paper_analyses,
            "methodology_comparison": methodology_comparison,
            "critiques": critiques,
            "citations": citations,
            "thematic_clusters": [],
            "research_gaps": [],
            "key_statistics": {
                "total_papers": len(papers),
                "total_citations": 0,
                "year_range": "not specified",
                "venues": 0,
                "key_concepts": 0,
                "methodologies": 0
            }
        }