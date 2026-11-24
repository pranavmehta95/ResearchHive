import os
import uuid
import json
import hashlib
import hmac
import secrets
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends, Header
from fastapi.responses import JSONResponse

from utils.config import settings
from models.schemas import (
    PaperUploadResponse, UploadPapersResponse,
    AnalysisResponse, AnalysisDetailResponse,
    AnalysisStatus, AgentStatus, AgentProgress, PaperStatus,
    PaperMetadata, RegisterRequest, LoginRequest
)
from services.pdf_processor import get_cached_or_extract, compute_file_hash
from services.database import (
    save_paper, get_papers_by_upload,
    save_analysis_record, load_analysis_record,
    get_cached_analysis_id, set_analysis_cache,
    create_user, get_user_by_login, get_user_by_token,
    create_session, delete_session, list_analyses_for_user,
)
from services.embedding_service import embedding_service
from agents.paper_analysis_agent import PaperAnalysisAgent
from agents.methodology_agent import MethodologyAgent
from agents.critique_agent import CritiqueAgent
from agents.citation_agent import CitationAgent
from agents.research_manager_agent import ResearchManagerAgent

router = APIRouter()

# In-memory L1 cache for live analyses (agents hold object refs during a run);
# SQLite is the durable store.
analysis_store: Dict[str, Dict[str, Any]] = {}


# --- Auth helpers ---

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return f"pbkdf2${salt}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt, hex_hash = stored.split("$")
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
        return hmac.compare_digest(dk.hex(), hex_hash)
    except Exception:
        return False


def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = get_user_by_token(authorization[7:])
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user


def get_analysis_dir(analysis_id: str) -> str:
    dir_path = os.path.join(settings.DATA_DIR, "analyses", analysis_id)
    os.makedirs(dir_path, exist_ok=True)
    return dir_path


def save_analysis(analysis_id: str, data: Dict[str, Any]):
    analysis_store[analysis_id] = data
    save_analysis_record(analysis_id, data.get("upload_id", ""), data.get("status", ""), data, data.get("user_id"))


def load_analysis(analysis_id: str) -> Optional[Dict[str, Any]]:
    if analysis_id in analysis_store:
        return analysis_store[analysis_id]
    return load_analysis_record(analysis_id)


def get_analysis_cache_key(papers: List[Dict[str, Any]], research_question: str, user_id: str = "") -> str:
    """Stable key for (user, set of papers, research question)."""
    paper_hashes = sorted(compute_file_hash(p["file_path"]) for p in papers)
    payload = json.dumps({"user": user_id, "papers": paper_hashes, "question": research_question.strip().lower()}, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()


# --- Auth endpoints ---

def public_user(user: Dict[str, Any]) -> Dict[str, Any]:
    return {"id": user["id"], "username": user["username"], "email": user["email"]}


@router.post("/auth/register")
async def register(payload: RegisterRequest):
    existing = get_user_by_login(payload.username) or get_user_by_login(payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="Username or email already registered")

    user = create_user(payload.username, payload.email, hash_password(payload.password))
    token = secrets.token_urlsafe(32)
    create_session(user["id"], token)
    return {"token": token, "user": public_user(user)}


@router.post("/auth/login")
async def login(payload: LoginRequest):
    user = get_user_by_login(payload.login)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = secrets.token_urlsafe(32)
    create_session(user["id"], token)
    return {"token": token, "user": public_user(user)}


@router.post("/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        delete_session(authorization[7:])
    return {"status": "logged out"}


@router.get("/auth/me")
async def me(user: Dict[str, Any] = Depends(get_current_user)):
    return {"user": public_user(user)}


@router.get("/analyses")
async def list_analyses(user: Dict[str, Any] = Depends(get_current_user)):
    """List the current user's analyses (survives refresh/restart)."""
    return {"analyses": list_analyses_for_user(user["id"])}


@router.post("/upload-papers", response_model=UploadPapersResponse)
async def upload_papers(files: List[UploadFile] = File(...), user: Dict[str, Any] = Depends(get_current_user)):
    """Upload PDF papers for analysis."""
    if len(files) < 3 or len(files) > 5:
        raise HTTPException(status_code=400, detail="Please upload 3-5 PDF papers")

    upload_id = str(uuid.uuid4())
    upload_dir = os.path.join(settings.DATA_DIR, "uploads", upload_id)
    os.makedirs(upload_dir, exist_ok=True)

    papers_response = []

    for file in files:
        if not file.filename.endswith('.pdf'):
            papers_response.append(PaperUploadResponse(
                paper_id=str(uuid.uuid4()),
                filename=file.filename,
                status=PaperStatus.ERROR,
                message="Only PDF files are allowed"
            ))
            continue

        paper_id = str(uuid.uuid4())
        file_path = os.path.join(upload_dir, f"{paper_id}.pdf")

        # Save file
        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)

        # Get metadata (served from permanent doc cache after first extraction)
        doc = get_cached_or_extract(file_path)
        metadata = doc["metadata"]
        pages = metadata.get("pages", 0)
        size_mb = len(content) / (1024 * 1024)

        paper_info = {
            "paper_id": paper_id,
            "filename": file.filename,
            "file_path": file_path,
            "title": metadata.get("title", file.filename.replace(".pdf", "")),
            "pages": pages,
            "size": f"{size_mb:.1f} MB",
            "status": PaperStatus.COMPLETED,
            "upload_time": datetime.now(),
            "upload_id": upload_id,
            "user_id": user["id"]
        }

        save_paper(paper_info)

        papers_response.append(PaperUploadResponse(
            paper_id=paper_id,
            filename=file.filename,
            status=PaperStatus.COMPLETED,
            message=f"Uploaded successfully ({pages} pages)"
        ))

    return UploadPapersResponse(papers=papers_response, upload_id=upload_id)


@router.post("/analyze")
async def start_analysis(
    background_tasks: BackgroundTasks,
    upload_id: str = Form(...),
    research_question: str = Form(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Start the multi-agent analysis pipeline."""
    # Get papers for this upload
    papers = get_papers_by_upload(upload_id, user_id=user["id"])
    if not papers:
        raise HTTPException(status_code=404, detail="No papers found for this upload")

    if len(papers) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 papers for analysis")

    # Return cached result if this exact paper set + question was already analyzed
    cache_key = get_analysis_cache_key(papers, research_question, user["id"])
    cached_analysis_id = get_cached_analysis_id(cache_key)
    if cached_analysis_id and load_analysis(cached_analysis_id):
        return {"analysis_id": cached_analysis_id, "status": "cached"}

    analysis_id = str(uuid.uuid4())

    # Initialize analysis status
    agents_progress = [
        AgentProgress(agent_name="Paper Analyst", status=AgentStatus.PENDING, progress=0, message="Waiting to start"),
        AgentProgress(agent_name="Methodology Analyst", status=AgentStatus.PENDING, progress=0, message="Waiting to start"),
        AgentProgress(agent_name="Critique Agent", status=AgentStatus.PENDING, progress=0, message="Waiting to start"),
        AgentProgress(agent_name="Citation Agent", status=AgentStatus.PENDING, progress=0, message="Waiting to start"),
        AgentProgress(agent_name="Research Manager", status=AgentStatus.PENDING, progress=0, message="Waiting to start"),
    ]

    analysis_data = {
        "analysis_id": analysis_id,
        "upload_id": upload_id,
        "research_question": research_question,
        "status": AnalysisStatus.QUEUED,
        "progress": 0,
        "current_stage": "Initializing...",
        "agents": agents_progress,
        "started_at": datetime.now(),
        "updated_at": datetime.now(),
        "error": None,
        "paper_ids": [p["paper_id"] for p in papers],
        "user_id": user["id"]
    }

    save_analysis(analysis_id, analysis_data)

    # Start background processing
    background_tasks.add_task(run_analysis_pipeline, analysis_id, papers, research_question, cache_key)

    return {"analysis_id": analysis_id, "status": "started"}


async def run_analysis_pipeline(analysis_id: str, papers: List[Dict[str, Any]], research_question: str, cache_key: str = None):
    """Run the complete analysis pipeline."""
    try:
        analysis = load_analysis(analysis_id)
        if not analysis:
            return

        # Stage 1: Extract and index PDF text
        analysis["status"] = AnalysisStatus.EXTRACTING
        analysis["current_stage"] = "Extracting text from PDFs..."
        analysis["progress"] = 10
        analysis["updated_at"] = datetime.now()
        save_analysis(analysis_id, analysis)

        # Process each paper
        for i, paper in enumerate(papers):
            analysis["current_stage"] = f"Processing {paper['filename']}..."
            analysis["progress"] = 10 + (i * 10)
            save_analysis(analysis_id, analysis)

            doc = get_cached_or_extract(paper["file_path"])
            chunks = doc["chunks"]
            embedding_service.add_chunks(chunks, paper["paper_id"], paper["filename"])

        # Save FAISS index
        embedding_service.save_index(analysis["upload_id"])

        # Stage 2: Indexing complete
        analysis["status"] = AnalysisStatus.INDEXING
        analysis["current_stage"] = "Building search index..."
        analysis["progress"] = 50
        analysis["updated_at"] = datetime.now()
        save_analysis(analysis_id, analysis)

        # Stage 3: Run agents
        analysis["status"] = AnalysisStatus.AGENTS_RUNNING
        analysis["current_stage"] = "Running Paper Analyst..."
        analysis["progress"] = 55
        analysis["updated_at"] = datetime.now()
        save_analysis(analysis_id, analysis)

        # Initialize agents
        paper_agent = PaperAnalysisAgent()
        methodology_agent = MethodologyAgent()
        critique_agent = CritiqueAgent()
        citation_agent = CitationAgent()
        manager_agent = ResearchManagerAgent()

        # Agent 1: Paper Analysis
        analysis["agents"][0].status = AgentStatus.RUNNING
        analysis["agents"][0].started_at = datetime.now()
        analysis["agents"][0].message = "Analyzing papers..."
        save_analysis(analysis_id, analysis)

        paper_analyses = await paper_agent.analyze_multiple_papers(papers, research_question)

        analysis["agents"][0].status = AgentStatus.COMPLETED
        analysis["agents"][0].progress = 100
        analysis["agents"][0].completed_at = datetime.now()
        analysis["agents"][0].message = "Completed"
        analysis["progress"] = 65
        analysis["current_stage"] = "Running Methodology Analyst..."
        save_analysis(analysis_id, analysis)

        # Agent 2: Methodology
        analysis["agents"][1].status = AgentStatus.RUNNING
        analysis["agents"][1].started_at = datetime.now()
        analysis["agents"][1].message = "Comparing methodologies..."
        save_analysis(analysis_id, analysis)

        methodology_comparison = await methodology_agent.compare_methodologies(papers, research_question)

        analysis["agents"][1].status = AgentStatus.COMPLETED
        analysis["agents"][1].progress = 100
        analysis["agents"][1].completed_at = datetime.now()
        analysis["agents"][1].message = "Completed"
        analysis["progress"] = 75
        analysis["current_stage"] = "Running Critique Agent..."
        save_analysis(analysis_id, analysis)

        # Agent 3: Critique
        analysis["agents"][2].status = AgentStatus.RUNNING
        analysis["agents"][2].started_at = datetime.now()
        analysis["agents"][2].message = "Critiquing papers..."
        save_analysis(analysis_id, analysis)

        critiques = await critique_agent.critique_papers(papers, research_question)

        analysis["agents"][2].status = AgentStatus.COMPLETED
        analysis["agents"][2].progress = 100
        analysis["agents"][2].completed_at = datetime.now()
        analysis["agents"][2].message = "Completed"
        analysis["progress"] = 82
        analysis["current_stage"] = "Running Citation Agent..."
        save_analysis(analysis_id, analysis)

        # Agent 4: Citation
        analysis["agents"][3].status = AgentStatus.RUNNING
        analysis["agents"][3].started_at = datetime.now()
        analysis["agents"][3].message = "Extracting citations..."
        save_analysis(analysis_id, analysis)

        citations = await citation_agent.extract_citations(papers, research_question)

        analysis["agents"][3].status = AgentStatus.COMPLETED
        analysis["agents"][3].progress = 100
        analysis["agents"][3].completed_at = datetime.now()
        analysis["agents"][3].message = "Completed"
        analysis["progress"] = 88
        analysis["current_stage"] = "Running Research Manager..."
        save_analysis(analysis_id, analysis)

        # Agent 5: Research Manager
        analysis["agents"][4].status = AgentStatus.RUNNING
        analysis["agents"][4].started_at = datetime.now()
        analysis["agents"][4].message = "Synthesizing final report..."
        save_analysis(analysis_id, analysis)

        final_report = await manager_agent.generate_report(
            papers, research_question,
            paper_analyses, methodology_comparison,
            critiques, citations
        )

        analysis["agents"][4].status = AgentStatus.COMPLETED
        analysis["agents"][4].progress = 100
        analysis["agents"][4].completed_at = datetime.now()
        analysis["agents"][4].message = "Completed"

        # Save final report
        dir_path = get_analysis_dir(analysis_id)
        with open(os.path.join(dir_path, "report.json"), 'w') as f:
            json.dump(final_report, f, default=str, indent=2)

        # Complete
        analysis["status"] = AnalysisStatus.COMPLETED
        analysis["progress"] = 100
        analysis["current_stage"] = "Analysis complete!"
        analysis["updated_at"] = datetime.now()
        analysis["report"] = final_report
        save_analysis(analysis_id, analysis)

        # Cache the final result so identical paper sets + questions return instantly
        if cache_key:
            set_analysis_cache(cache_key, analysis_id)

    except Exception as e:
        analysis = load_analysis(analysis_id)
        if analysis:
            analysis["status"] = AnalysisStatus.ERROR
            analysis["error"] = str(e)
            analysis["current_stage"] = f"Error: {str(e)}"
            analysis["updated_at"] = datetime.now()
            save_analysis(analysis_id, analysis)


def check_analysis_owner(analysis: Dict[str, Any], user: Dict[str, Any]):
    owner = analysis.get("user_id")
    if owner and owner != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized for this analysis")


@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_status(analysis_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Get analysis progress status."""
    analysis = load_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    check_analysis_owner(analysis, user)

    # Convert datetime strings back to datetime objects if needed
    agents = []
    for a in analysis.get("agents", []):
        if isinstance(a, dict):
            agents.append(AgentProgress(**a))
        else:
            agents.append(a)

    return AnalysisResponse(
        analysis_id=analysis["analysis_id"],
        status=analysis["status"],
        progress=analysis["progress"],
        current_stage=analysis["current_stage"],
        agents=agents,
        started_at=analysis["started_at"] if isinstance(analysis["started_at"], datetime) else datetime.fromisoformat(analysis["started_at"]),
        updated_at=analysis["updated_at"] if isinstance(analysis["updated_at"], datetime) else datetime.fromisoformat(analysis["updated_at"]),
        error=analysis.get("error")
    )


@router.get("/report/{analysis_id}", response_model=AnalysisDetailResponse)
async def get_analysis_report(analysis_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Get the complete analysis report."""
    analysis = load_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    check_analysis_owner(analysis, user)

    # Try to load report from disk if not in memory
    report = analysis.get("report")
    if not report:
        dir_path = get_analysis_dir(analysis_id)
        report_file = os.path.join(dir_path, "report.json")
        if os.path.exists(report_file):
            with open(report_file, 'r') as f:
                report = json.load(f)

    return AnalysisDetailResponse(
        analysis_id=analysis["analysis_id"],
        status=analysis["status"],
        progress=analysis["progress"],
        report=report,
        error=analysis.get("error")
    )


@router.get("/papers/{upload_id}")
async def get_papers_for_upload(upload_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Get list of papers for an upload."""
    papers = get_papers_by_upload(upload_id, user_id=user["id"])
    if not papers:
        raise HTTPException(status_code=404, detail="No papers found for this upload")

    return {
        "papers": [
            PaperMetadata(
                paper_id=p["paper_id"],
                filename=p["filename"],
                title=p["title"],
                pages=p["pages"],
                size=p["size"],
                upload_time=p["upload_time"],
                status=p["status"]
            ) for p in papers
        ]
    }