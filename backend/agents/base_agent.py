import google.generativeai as genai
from typing import List, Dict, Any, Optional
from utils.config import settings
from services.embedding_service import embedding_service


class BaseAgent:
    def __init__(self, name: str, system_prompt: str):
        self.name = name
        self.system_prompt = system_prompt
        self.model = None
        self._initialize_model()

    def _initialize_model(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(
                model_name=settings.GEMINI_MODEL,
                system_instruction=self.system_prompt
            )
        else:
            raise ValueError("GEMINI_API_KEY not configured")

    def retrieve_context(self, query: str, paper_id: Optional[str] = None, k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve relevant chunks from FAISS."""
        if paper_id:
            return embedding_service.search_by_paper(query, paper_id, k)
        return embedding_service.search(query, k)

    def format_context(self, chunks: List[Dict[str, Any]]) -> str:
        """Format retrieved chunks for the prompt."""
        if not chunks:
            return "No relevant context found."

        context_parts = []
        for chunk in chunks:
            source = f"[{chunk['filename']}, {chunk['source']}]"
            context_parts.append(f"{source}\n{chunk['text']}")

        return "\n\n---\n\n".join(context_parts)

    async def run(self, prompt: str, paper_id: Optional[str] = None, **kwargs) -> str:
        """Run the agent with RAG context retrieval."""
        # Retrieve relevant context
        chunks = self.retrieve_context(prompt, paper_id)
        context = self.format_context(chunks)

        # Build full prompt with context
        full_prompt = f"""
{self.system_prompt}

CONTEXT FROM PAPERS:
{context}

TASK:
{prompt}

IMPORTANT: Always reference evidence from the context using the source citations like [paper_name.pdf, Page X, Para Y].
If information is not in the context, state "not specified in the provided text" or similar.
"""

        response = self.model.generate_content(full_prompt)
        return response.text