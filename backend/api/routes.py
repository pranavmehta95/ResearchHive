import os
import uuid
import json
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from utils.config import settings
from models.schemas import (
    PaperUploadResponse, UploadPapersResponse,
    AnalysisResponse, AnalysisDetailResponse,
    AnalysisStatus, AgentStatus, AgentProgress, PaperStatus,
    PaperMetadata
)
from services.pdf_processor import extract_text_from_pdf, get_pdf_metadata
from services.embedding_service import embedding_service
from agents.paper_analysis_agent import PaperAnalysisAgent
from agents.methodology_agent import MethodologyAgent
from agents.critique_agent import CritiqueAgent
from agents.citation_agent import CitationAgent
from agents.research_manager_agent import ResearchManagerAgent

router = APIRouter()

# In-memory storage for analysis status (use Redis in production)
analysis_store: Dict[str, Dict[str, Any]] = {}
paper_store: Dict[str, Dict[str, Any]] = {}


def get_analysis_dir(analysis_id: str) -> str:
    dir_path = os.path.join(settings.DATA_DIR, "analyses", analysis_id)
    os.makedirs(dir_path, exist_ok=True)
    return dir_path


def save_analysis(analysis_id: str, data: Dict[str, Any]):
    analysis_store[analysis_id] = data
    # Also persist to disk
    dir_path = get_analysis_dir(analysis_id)
    with open(os.path.join(dir_path, "status.json"), 'w') as f:
        # Convert datetime to string for JSON serialization
        serializable = {k: v.isoformat() if isinstance(v, datetime) else v for k, v in data.items()}
        json.dump(serializable, f, default=str)


def load_analysis(analysis_id: str) -> Optional[Dict[str, Any]]:
    if analysis_id in analysis_store:
        return analysis_store[analysis_id]
    # Try loading from disk
    dir_path = get_analysis_dir(analysis_id)
    status_file = os.path.join(dir_path, "status.json")
    if os.path.exists(status_file):
        with open(status_file, 'r') as f:
            data = json.load(f)
            analysis_store[analysis_id] = data
            return data
    return None


@router.post("/upload-papers", response_model=UploadPapersResponse)
async def upload_papers(files: List[UploadFile] = File(...)):
    """Upload PDF papers for analysis."""
    if len(files) < 3 or len(files) > 5:
        raise HTTPException(status_code=400, detail="Please upload 3-5 PDF papers")

    upload_id = str(uuid.uuid4())
    upload_dir = os.path.join(settings.DATA_DIR, "uploads", upload_id)
    os.makedirs(upload_dir, exist_ok=True)

    papers_response = []
    paper_metadata_list = []

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

        # Get metadata
        metadata = get_pdf_metadata(file_path)
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
            "upload_id": upload_id
        }

        paper_metadata_list.append(paper_info)
        paper_store[paper_id] = paper_info

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
    research_question: str = Form(...)
):
    """Start the multi-agent analysis pipeline."""
    # Get papers for this upload
    papers = [p for p in paper_store.values() if p.get("upload_id") == upload_id]
    if not papers:
        raise HTTPException(status_code=404, detail="No papers found for this upload")

    if len(papers) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 papers for analysis")

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
        "paper_ids": [p["paper_id"] for p in papers]
    }

    save_analysis(analysis_id, analysis_data)

    # Start background processing
    background_tasks.add_task(run_analysis_pipeline, analysis_id, papers, research_question)

    return {"analysis_id": analysis_id, "status": "started"}


async def run_analysis_pipeline(analysis_id: str, papers: List[Dict[str, Any]], research_question: str):
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

            chunks = extract_text_from_pdf(paper["file_path"])
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

    except Exception as e:
        analysis = load_analysis(analysis_id)
        if analysis:
            analysis["status"] = AnalysisStatus.ERROR
            analysis["error"] = str(e)
            analysis["current_stage"] = f"Error: {str(e)}"
            analysis["updated_at"] = datetime.now()
            save_analysis(analysis_id, analysis)


@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_status(analysis_id: str):
    """Get analysis progress status."""
    analysis = load_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

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
async def get_analysis_report(analysis_id: str):
    """Get the complete analysis report."""
    analysis = load_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

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
async def get_papers_for_upload(upload_id: str):
    """Get list of papers for an upload."""
    papers = [p for p in paper_store.values() if p.get("upload_id") == upload_id]
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