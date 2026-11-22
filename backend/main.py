from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from utils.config import settings
from api.routes import router as api_router
from services.embedding_service import embedding_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting ResearchHive Backend...")
    print(f"Data directory: {settings.DATA_DIR}")
    print(f"Gemini Model: {settings.GEMINI_MODEL}")
    yield
    # Shutdown
    print("Shutting down ResearchHive Backend...")


app = FastAPI(
    title="ResearchHive API",
    description="Multi-Agent Literature Review Platform Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "ResearchHive API",
        "version": "1.0.0",
        "description": "Multi-Agent Literature Review Platform Backend",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "model": settings.GEMINI_MODEL
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )