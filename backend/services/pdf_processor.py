import os
from pypdf import PdfReader
from typing import List, Dict, Any
import uuid


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