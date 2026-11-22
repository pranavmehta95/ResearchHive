import asyncio
import itertools
import re
import time
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from utils.config import settings
from services.embedding_service import embedding_service


class BaseAgent:
    # Shared pacing across all agents so concurrent/sequential calls stay under the RPM limit
    _call_lock = asyncio.Lock()
    _last_call_at = 0.0
    # Round-robin so each agent instance starts on a different model (separate quotas)
    _model_cycle = itertools.count()

    def __init__(self, name: str, system_prompt: str):
        self.name = name
        self.system_prompt = system_prompt
        self.model = None
        pool = settings.gemini_models_list
        start = next(BaseAgent._model_cycle) % len(pool)
        # Rotate forward from this agent's assigned model on failures
        self._model_pool = pool[start:] + pool[:start]
        self._model_pos = 0
        self._initialize_model(self._model_pool[0])

    def _initialize_model(self, model_name: str):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model_name = model_name
            self.model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=self.system_prompt
            )
        else:
            raise ValueError("GEMINI_API_KEY not configured")

    def _rotate_model(self):
        """Switch to the next model in the pool (each has its own quota)."""
        if len(self._model_pool) <= 1:
            return False
        self._model_pos = (self._model_pos + 1) % len(self._model_pool)
        self._initialize_model(self._model_pool[self._model_pos])
        return True

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

    async def run(self, prompt: str, paper_id: Optional[str] = None, k: int = 5, **kwargs) -> str:
        """Run the agent with RAG context retrieval."""
        # Retrieve relevant context
        chunks = self.retrieve_context(prompt, paper_id, k=k)
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

        response = await self._generate_with_retry(full_prompt)
        return response.text

    async def _generate_with_retry(self, prompt: str, max_retries: int = 12):
        """Call generate_content with exponential backoff on rate-limit (429) errors."""
        for attempt in range(max_retries):
            try:
                return await self._throttled_generate(prompt)
            except Exception as e:
                msg = str(e)
                is_rate_limited = "429" in msg or "RESOURCE_EXHAUSTED" in msg
                lower = msg.lower()
                # Daily quota or unknown model -> switch to next model in pool and retry
                is_daily_quota = "per day" in lower or "PerDay" in msg
                should_rotate = (
                    is_daily_quota
                    or "not found" in lower
                    or "not supported" in lower
                    or "no longer available" in lower
                )
                if should_rotate and self._rotate_model():
                    await asyncio.sleep(1)
                    continue
                if not is_rate_limited or is_daily_quota or attempt == max_retries - 1:
                    raise
                delay = self._extract_retry_delay(msg) or min(60.0, 5.0 * (2 ** attempt))
                await asyncio.sleep(delay)

    async def _throttled_generate(self, prompt: str):
        """Space out generate_content calls so we stay under the per-minute quota."""
        async with BaseAgent._call_lock:
            wait = settings.GEMINI_MIN_INTERVAL - (time.monotonic() - BaseAgent._last_call_at)
            if wait > 0:
                await asyncio.sleep(wait)
            BaseAgent._last_call_at = time.monotonic()
        return await asyncio.to_thread(self.model.generate_content, prompt)

    @staticmethod
    def _extract_retry_delay(msg: str) -> Optional[float]:
        """Parse 'Please retry in Xs' or retry_delay seconds from a 429 error."""
        m = re.search(r"retry in ([\d.]+)s", msg)
        if m:
            return float(m.group(1))
        m = re.search(r"retry_delay\s*\{[^}]*seconds:\s*(\d+)", msg)
        if m:
            return float(m.group(1))
        return None