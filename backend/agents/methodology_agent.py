import json
from typing import List, Dict, Any
from agents.base_agent import BaseAgent


METHODOLOGY_PROMPT = """You are the Methodology Agent. Your role is to compare and contrast research methodologies across multiple papers.

Compare papers across these dimensions:
1. Algorithms/Approaches used
2. Datasets
3. Evaluation Metrics
4. Results/Performance
5. Strengths
6. Limitations

Return a valid JSON array of comparison objects, each with:
{
  "dimension": "string",
  "papers": {
    "paper_id_1": "description",
    "paper_id_2": "description",
    ...
  }
}

Always cite evidence using [paper_name.pdf, Page X, Para Y] format from the context.
Be objective and only state what is in the papers."""


class MethodologyAgent(BaseAgent):
    def __init__(self):
        super().__init__("Methodology Agent", METHODOLOGY_PROMPT)

    async def compare_methodologies(self, papers: List[Dict[str, Any]], research_question: str) -> List[Dict[str, Any]]:
        """Compare methodologies across all papers."""
        paper_list = "\n".join([f"- {p['paper_id']}: {p['filename']}" for p in papers])

        prompt = f"""
Compare the methodologies of these papers for the research question:
"{research_question}"

Papers:
{paper_list}

Provide a structured comparison across all dimensions. Return JSON array only.
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
            return []