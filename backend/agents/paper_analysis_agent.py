import json
from typing import List, Dict, Any, Optional
from agents.base_agent import BaseAgent


PAPER_ANALYSIS_PROMPT = """You are the Paper Analysis Agent. Your role is to thoroughly analyze research papers and extract structured information.

Extract the following from each paper:
1. Title
2. Research Objective/Question
3. Methodology (approach, algorithms, techniques)
4. Datasets used
5. Models/Architectures proposed or evaluated
6. Key Findings/Results
7. Conclusions

For each piece of information, ALWAYS include evidence references in the format [paper_name.pdf, Page X, Para Y] based on the provided context.

Return a valid JSON object with these exact keys:
{
  "title": "string",
  "objective": "string",
  "methodology": "string",
  "datasets": ["string"],
  "models": ["string"],
  "findings": ["string"],
  "conclusion": "string",
  "evidence_references": ["string"]
}"""


class PaperAnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__("Paper Analysis Agent", PAPER_ANALYSIS_PROMPT)

    async def analyze_paper(self, paper_id: str, filename: str, research_question: str) -> Dict[str, Any]:
        """Analyze a single paper."""
        prompt = f"""
Analyze the paper "{filename}" (paper_id: {paper_id}) in the context of the research question:
"{research_question}"

Provide a comprehensive analysis with all required fields. Be specific and cite evidence from the paper.
"""
        response = await self.run(prompt, paper_id=paper_id)

        # Parse JSON response
        try:
            # Extract JSON from response (handle markdown code blocks)
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]

            result = json.loads(json_str.strip())
            result["paper_id"] = paper_id
            result["filename"] = filename
            return result
        except json.JSONDecodeError:
            # Fallback: create structured result from text
            return {
                "paper_id": paper_id,
                "filename": filename,
                "title": "Could not parse",
                "objective": response[:500] if response else "No response",
                "methodology": "Not extracted",
                "datasets": [],
                "models": [],
                "findings": [],
                "conclusion": "Not extracted",
                "evidence_references": []
            }

    async def analyze_multiple_papers(self, papers: List[Dict[str, Any]], research_question: str) -> List[Dict[str, Any]]:
        """Analyze all papers in a single LLM call (keeps free-tier quota usage low)."""
        paper_list = "\n".join(
            f"- paper_id: {p['paper_id']}, filename: {p['filename']}" for p in papers
        )
        prompt = f"""
Analyze EACH of the following papers in the context of the research question:
"{research_question}"

Papers:
{paper_list}

For each paper, extract: title, objective, methodology, datasets, models, findings, conclusion.
Provide a comprehensive analysis per paper with all required fields. Be specific and cite evidence from the papers.

Return a valid JSON array with one object per paper, each with these exact keys:
{{
  "paper_id": "string (copy from the list above)",
  "filename": "string",
  "title": "string",
  "objective": "string",
  "methodology": "string",
  "datasets": ["string"],
  "models": ["string"],
  "findings": ["string"],
  "conclusion": "string",
  "evidence_references": ["string"]
}}
"""
        # Search across all papers' chunks (no paper_id filter)
        response = await self.run(prompt, k=15)

        try:
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]

            result = json.loads(json_str.strip())
            if isinstance(result, list):
                return result
            return [result]
        except json.JSONDecodeError:
            return [
                {
                    "paper_id": p["paper_id"],
                    "filename": p["filename"],
                    "title": "Could not parse",
                    "objective": response[:500] if response else "No response",
                    "methodology": "Not extracted",
                    "datasets": [],
                    "models": [],
                    "findings": [],
                    "conclusion": "Not extracted",
                    "evidence_references": []
                }
                for p in papers
            ]