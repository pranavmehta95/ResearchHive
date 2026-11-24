import os
import json
import uuid
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional

from utils.config import settings

DB_PATH = os.path.join(settings.DATA_DIR, "researchhive.db")


def _default_serializer(obj: Any) -> Any:
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    if isinstance(obj, datetime):
        return obj.isoformat()
    return str(obj)


def dumps(obj: Any) -> str:
    return json.dumps(obj, default=_default_serializer)


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    with _connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS papers (
                paper_id TEXT PRIMARY KEY,
                upload_id TEXT NOT NULL,
                data TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_papers_upload_id ON papers(upload_id);

            CREATE TABLE IF NOT EXISTS analyses (
                analysis_id TEXT PRIMARY KEY,
                upload_id TEXT,
                status TEXT,
                data TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS doc_cache (
                file_hash TEXT PRIMARY KEY,
                data TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS analysis_cache (
                cache_key TEXT PRIMARY KEY,
                analysis_id TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )

        # Add user_id columns to existing tables (no-op if already present)
        for table in ("papers", "analyses"):
            cols = {r[1] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()}
            if "user_id" not in cols:
                conn.execute(f"ALTER TABLE {table} ADD COLUMN user_id TEXT")


init_db()


# --- Papers ---

def save_paper(paper: Dict[str, Any]) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO papers (paper_id, upload_id, user_id, data) VALUES (?, ?, ?, ?)",
            (paper["paper_id"], paper.get("upload_id", ""), paper.get("user_id"), dumps(paper)),
        )


def get_papers_by_upload(upload_id: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    with _connect() as conn:
        if user_id is not None:
            rows = conn.execute(
                "SELECT data FROM papers WHERE upload_id = ? AND user_id = ?", (upload_id, user_id)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT data FROM papers WHERE upload_id = ?", (upload_id,)
            ).fetchall()
    return [json.loads(r["data"]) for r in rows]


# --- Users & sessions ---

def create_user(username: str, email: str, password_hash: str) -> Dict[str, Any]:
    user_id = str(uuid.uuid4())
    with _connect() as conn:
        conn.execute(
            "INSERT INTO users (id, username, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, username, email, password_hash, datetime.now().isoformat()),
        )
    return {"id": user_id, "username": username, "email": email}


def get_user_by_login(login: str) -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE username = ? OR email = ?", (login, login)
        ).fetchone()
    return dict(row) if row else None


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return dict(row) if row else None


def create_session(user_id: str, token: str) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
            (token, user_id, datetime.now().isoformat()),
        )


def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?",
            (token,),
        ).fetchone()
    if not row:
        return None
    user = dict(row)
    user.pop("password_hash", None)
    return user


def delete_session(token: str) -> None:
    with _connect() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))


# --- Analyses ---

def save_analysis_record(analysis_id: str, upload_id: str, status: str, data: Dict[str, Any], user_id: Optional[str] = None) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO analyses (analysis_id, upload_id, status, user_id, data) VALUES (?, ?, ?, ?, ?)",
            (analysis_id, upload_id, getattr(status, "value", status), user_id, dumps(data)),
        )


def load_analysis_record(analysis_id: str) -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT data FROM analyses WHERE analysis_id = ?", (analysis_id,)
        ).fetchone()
    return json.loads(row["data"]) if row else None


def list_analyses_for_user(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT analysis_id, status, data FROM analyses WHERE user_id = ? ORDER BY rowid DESC LIMIT ?",
            (user_id, limit),
        ).fetchall()
    results = []
    for r in rows:
        data = json.loads(r["data"])
        results.append({
            "analysis_id": r["analysis_id"],
            "status": data.get("status"),
            "progress": data.get("progress", 0),
            "current_stage": data.get("current_stage", ""),
            "research_question": data.get("research_question", ""),
            "started_at": data.get("started_at"),
            "error": data.get("error"),
        })
    return results


# --- Document cache (extracted metadata + chunks, keyed by content hash) ---

def get_doc_cache(file_hash: str) -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT data FROM doc_cache WHERE file_hash = ?", (file_hash,)
        ).fetchone()
    return json.loads(row["data"]) if row else None


def set_doc_cache(file_hash: str, payload: Dict[str, Any]) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO doc_cache (file_hash, data) VALUES (?, ?)",
            (file_hash, dumps(payload)),
        )


# --- Analysis result cache (papers + question -> analysis_id) ---

def get_cached_analysis_id(cache_key: str) -> Optional[str]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT analysis_id FROM analysis_cache WHERE cache_key = ?", (cache_key,)
        ).fetchone()
    return row["analysis_id"] if row else None


def set_analysis_cache(cache_key: str, analysis_id: str) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO analysis_cache (cache_key, analysis_id) VALUES (?, ?)",
            (cache_key, analysis_id),
        )
