from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


class PaperStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"


class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"


class PaperUploadResponse(BaseModel):
    paper_id: str
    filename: str
    status: PaperStatus
    message: str


class UploadPapersRequest(BaseModel):
    pass  # Files are multipart/form-data


class UploadPapersResponse(BaseModel):
    papers: List[PaperUploadResponse]
    upload_id: str


class AnalysisStatus(str, Enum):
    QUEUED = "queued"
    EXTRACTING = "extracting"
    INDEXING = "indexing"
    AGENTS_RUNNING = "agents_running"
    COMPLETED = "completed"
    ERROR = "error"


class AgentProgress(BaseModel):
    agent_name: str
    status: AgentStatus
    progress: int
    message: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class AnalysisResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    progress: int
    current_stage: str
    agents: List[AgentProgress]
    started_at: datetime
    updated_at: datetime
    error: Optional[str] = None
    upload_id: Optional[str] = None


class PaperAnalysisResult(BaseModel):
    paper_id: str
    filename: str
    title: str
    objective: str
    methodology: str
    datasets: List[str]
    models: List[str]
    findings: List[str]
    conclusion: str
    evidence_references: List[str]


class MethodologyComparison(BaseModel):
    dimension: str
    papers: Dict[str, str]


class CritiqueResult(BaseModel):
    paper_id: str
    limitations: List[str]
    assumptions: List[str]
    biases: List[str]
    missing_evaluations: List[str]
    research_gaps: List[str]
    future_opportunities: List[str]


class CitationResult(BaseModel):
    paper_id: str
    ieee_citation: str
    title: str
    authors: List[str]
    year: int
    venue: str


class FinalReport(BaseModel):
    title: str
    research_question: str
    executive_summary: str
    paper_analyses: List[PaperAnalysisResult]
    methodology_comparison: List[MethodologyComparison]
    critiques: List[CritiqueResult]
    citations: List[CitationResult]
    thematic_clusters: List[Dict[str, Any]]
    research_gaps: List[Dict[str, Any]]
    key_statistics: Dict[str, Any]


class AnalysisDetailResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    progress: int
    # LLM-generated report shape varies; keep it as a free-form dict
    report: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class PaperMetadata(BaseModel):
    paper_id: str
    filename: str
    title: str
    pages: int
    size: str
    upload_time: datetime
    status: PaperStatus