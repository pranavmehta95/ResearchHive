import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple
from utils.config import settings


class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.dimension = 384  # all-MiniLM-L6-v2 output dimension
        self.index = None
        self.metadata = []  # Store chunk metadata alongside vectors

    def get_index_path(self, upload_id: str) -> str:
        return os.path.join(settings.DATA_DIR, "faiss_index", f"{upload_id}.index")

    def get_metadata_path(self, upload_id: str) -> str:
        return os.path.join(settings.DATA_DIR, "faiss_index", f"{upload_id}_meta.json")

    def create_index(self, upload_id: str) -> faiss.IndexFlatL2:
        """Create a new FAISS index."""
        index = faiss.IndexFlatL2(self.dimension)
        self.index = index
        self.metadata = []
        return index

    def load_index(self, upload_id: str) -> bool:
        """Load existing FAISS index and metadata."""
        index_path = self.get_index_path(upload_id)
        meta_path = self.get_metadata_path(upload_id)

        if os.path.exists(index_path) and os.path.exists(meta_path):
            self.index = faiss.read_index(index_path)
            with open(meta_path, 'r') as f:
                self.metadata = json.load(f)
            return True
        return False

    def save_index(self, upload_id: str):
        """Save FAISS index and metadata to disk."""
        index_path = self.get_index_path(upload_id)
        meta_path = self.get_metadata_path(upload_id)

        faiss.write_index(self.index, index_path)
        with open(meta_path, 'w') as f:
            json.dump(self.metadata, f)

    def add_chunks(self, chunks: List[Dict[str, Any]], paper_id: str, filename: str):
        """Add text chunks to the index with metadata."""
        if self.index is None:
            self.create_index(paper_id)

        texts = [chunk["text"] for chunk in chunks]
        embeddings = self.model.encode(texts, show_progress_bar=False)
        embeddings = np.array(embeddings).astype('float32')

        self.index.add(embeddings)

        # Store metadata
        for i, chunk in enumerate(chunks):
            self.metadata.append({
                "chunk_id": chunk.get("chunk_id", str(i)),
                "paper_id": paper_id,
                "filename": filename,
                "page": chunk.get("page", 0),
                "paragraph": chunk.get("paragraph", 0),
                "text": chunk["text"],
                "source": chunk.get("source", "")
            })

    def search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant chunks."""
        if self.index is None or self.index.ntotal == 0:
            return []

        query_embedding = self.model.encode([query]).astype('float32')
        distances, indices = self.index.search(query_embedding, min(k, self.index.ntotal))

        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx < len(self.metadata):
                result = self.metadata[idx].copy()
                result["distance"] = float(dist)
                results.append(result)

        return results

    def search_by_paper(self, query: str, paper_id: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant chunks filtered by paper_id."""
        if self.index is None or self.index.ntotal == 0:
            return []

        query_embedding = self.model.encode([query]).astype('float32')
        distances, indices = self.index.search(query_embedding, min(k * 3, self.index.ntotal))

        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx < len(self.metadata) and self.metadata[idx]["paper_id"] == paper_id:
                result = self.metadata[idx].copy()
                result["distance"] = float(dist)
                results.append(result)
                if len(results) >= k:
                    break

        return results

    def get_all_chunks(self, paper_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a specific paper."""
        return [m for m in self.metadata if m["paper_id"] == paper_id]

    def get_all_papers(self) -> List[str]:
        """Get list of unique paper IDs in the index."""
        return list(set(m["paper_id"] for m in self.metadata))


# Global instance
embedding_service = EmbeddingService()