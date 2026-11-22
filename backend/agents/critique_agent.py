import json
from typing import List, Dict, Any
from agents.base_agent import BaseAgent


CRITIQUE_PROMPT = """You are the Critique Agent. Your role is to critically analyze research papers and identify limitations, assumptions, biases, missing evaluations, and research gaps.

For each paper, identify:
1. Limitations (methodological, experimental, theoretical)
2. Assumptions made by authors
3. Potential biases (selection, evaluation, reporting)
4. Missing evaluations (what wasn't tested/measured)
5. Research gaps identified by authors
6. Future research opportunities suggested

Return a valid JSON array of critique objects:
{
  "paper_id": "string",
  "limitations": ["string"],
  "assumptions": ["string"],
  "biases": ["string"],
  "missing_evaluations": ["string"],
  "research_gaps": ["string"],
  "future_opportunities": ["string"]
}

IMPORTANT RULES:
- NEVER invent paper details not in the provided text
- If information is not available, use "not specified in the provided text"
- Always cite evidence with [paper_name.pdf, Page X, Para Y]
- Be constructive but rigorous"""


class CritiqueAgent(BaseAgent):
    def __init__(self):
        super().__init__("Critique Agent", CRITIQUE_PROMPT)

    async def critique_papers(self, papers: List[Dict[str, Any]], research_question: str) -> List[Dict[str, Any]]:
        """Critique all papers."""
        paper_list = "\n".join([f"- {p['paper_id']}: {p['filename']}" for p in papers])

        prompt = f"""
Critically analyze these papers for the research question:
"{research_question}"

Papers:
{paper_list}

Provide structured critiques for each paper. Return JSON array only.
"""
        response = await self.run(prompt)

        try:
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]

            result = json.loads(json_str.strip())
            return result
        except json.JSONDecodeError:
            return []