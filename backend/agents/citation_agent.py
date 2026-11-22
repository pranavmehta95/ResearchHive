import json
from typing import List, Dict, Any
from agents.base_agent import BaseAgent


CITATION_PROMPT = """You are the Citation Agent. Your role is to extract citation metadata and create proper IEEE-style citations.

For each paper, extract:
1. Title
2. Authors (full names)
3. Year
4. Venue/Conference/Journal
5. DOI if available

Create IEEE-style citations in format:
[1] A. Author, B. Author, "Title," in Proc. Conference, Year, pp. XX-XX.

If metadata is missing, use "not specified" for that field.

Return a valid JSON array:
{
  "paper_id": "string",
  "ieee_citation": "string",
  "title": "string",
  "authors": ["string"],
  "year": integer,
  "venue": "string",
  "doi": "string or null"
}"""


class CitationAgent(BaseAgent):
    def __init__(self):
        super().__init__("Citation Agent", CITATION_PROMPT)

    async def extract_citations(self, papers: List[Dict[str, Any]], research_question: str) -> List[Dict[str, Any]]:
        """Extract citations for all papers."""
        paper_list = "\n".join([f"- {p['paper_id']}: {p['filename']}" for p in papers])

        prompt = f"""
Extract citation metadata for these papers:
{paper_list}

Create proper IEEE-style citations. Return JSON array only.
"""
        response = await self.run(prompt, k=12)

        try:
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]

            result = json.loads(json_str.strip())
            return result
        except json.JSONDecodeError:
            # Generate basic citations from filenames
            return self._generate_basic_citations(papers)

    def _generate_basic_citations(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate basic citations when LLM fails."""
        citations = []
        for i, paper in enumerate(papers, 1):
            # Clean filename to extract potential title
            title = paper["filename"].replace(".pdf", "").replace("_", " ")
            citations.append({
                "paper_id": paper["paper_id"],
                "ieee_citation": f"[{i}] {title}, not specified, not specified, not specified.",
                "title": title,
                "authors": ["not specified"],
                "year": 0,
                "venue": "not specified",
                "doi": None
            })
        return citations