import hashlib
from pypdf import PdfReader
from typing import List, Dict, Any, Optional
import uuid

from services.database import get_doc_cache, set_doc_cache


def compute_file_hash(file_path: str) -> str:
    """Compute SHA-256 hash of file contents (stable across renames/re-uploads)."""
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for block in iter(lambda: f.read(8192), b''):
            sha256.update(block)
    return sha256.hexdigest()


def load_cached_document(file_hash: str) -> Optional[Dict[str, Any]]:
    """Load cached document (metadata + chunks) by content hash."""
    return get_doc_cache(file_hash)


def save_cached_document(file_hash: str, metadata: Dict[str, Any], chunks: List[Dict[str, Any]]):
    """Persist extracted document data permanently under its content hash."""
    set_doc_cache(file_hash, {"metadata": metadata, "chunks": chunks})


def get_cached_or_extract(file_path: str) -> Dict[str, Any]:
    """
    Return cached {'metadata': ..., 'chunks': ...} for a PDF.
    On first hit, extracts and caches permanently; later hits are served from cache.
    """
    file_hash = compute_file_hash(file_path)
    cached = load_cached_document(file_hash)
    if cached:
        return cached

    metadata = get_pdf_metadata(file_path)
    chunks = extract_text_from_pdf(file_path)
    save_cached_document(file_hash, metadata, chunks)
    return {"metadata": metadata, "chunks": chunks}


def extract_text_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    """
    Extract text from PDF with page numbers and chunk information.
    Returns list of chunks with metadata.
    """
    chunks = []

    try:
        reader = PdfReader(file_path)

        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                # Split into paragraphs/chunks
                paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]

                for para_idx, paragraph in enumerate(paragraphs):
                    if len(paragraph) > 50:  # Only keep substantial chunks
                        chunk_id = str(uuid.uuid4())[:8]
                        chunks.append({
                            "chunk_id": chunk_id,
                            "page": page_num + 1,
                            "paragraph": para_idx,
                            "text": paragraph,
                            "source": f"[Page {page_num + 1}, Para {para_idx + 1}]"
                        })
    except Exception as e:
        raise Exception(f"Failed to extract text: {str(e)}")

    return chunks


def get_pdf_metadata(file_path: str) -> Dict[str, Any]:
    """Extract basic PDF metadata."""
    try:
        reader = PdfReader(file_path)
        metadata = reader.metadata or {}
        return {
            "title": metadata.get("/Title", "Unknown"),
            "author": metadata.get("/Author", "Unknown"),
            "subject": metadata.get("/Subject", ""),
            "creator": metadata.get("/Creator", ""),
            "producer": metadata.get("/Producer", ""),
            "pages": len(reader.pages)
        }
    except Exception:
        return {
            "title": "Unknown",
            "author": "Unknown",
            "subject": "",
            "creator": "",
            "producer": "",
            "pages": 0
        }