Now build the backend for ResearchHive and connect it to the existing React UI.

Important:
Use only free or free-tier tools. Do NOT use Azure OpenAI, OpenAI paid APIs, or paid databases.

Backend stack:
- Python FastAPI
- Google Gemini API using google-generativeai
- Gemini free-tier model configurable through environment variables
- pypdf for PDF text extraction
- sentence-transformers using all-MiniLM-L6-v2 for free local embeddings
- FAISS for local vector search
- python-dotenv

Create these agents:

1. Paper Analysis Agent
- Summarizes each uploaded paper.
- Extracts title, objective, methodology, datasets, models, findings, and conclusion.
- Includes evidence references like [paper_name.pdf, chunk 3].

2. Methodology Agent
- Compares papers by algorithms, datasets, metrics, results, strengths, and limitations.
- Returns structured JSON for a comparison table.

3. Critique Agent
- Identifies limitations, assumptions, bias, missing evaluations, and common research gaps.
- Suggests future research opportunities.
- Never invents paper details.

4. Citation Agent
- Extracts title, authors, year, and source details when available.
- Creates IEEE-style citations.
- Uses “not specified” if metadata is missing.

5. Research Manager Agent
- Coordinates all agent tasks.
- Combines outputs into a final structured literature review.
- Removes duplicate content.
- Marks uncertain information clearly.

API endpoints:
- POST /upload-papers
- POST /analyze
- GET /analysis/{analysis_id}
- GET /report/{analysis_id}

Use a local data folder only. Implement RAG:
- Extract PDF text.
- Split it into chunks.
- Generate local embeddings.
- Store them in FAISS.
- Retrieve relevant chunks before every agent response.

Create .env.example:

GEMINI_API_KEY=
GEMINI_MODEL=

Connect the backend to the React frontend. Show genuine progress for extraction, indexing, individual agent analysis, and final report generation.