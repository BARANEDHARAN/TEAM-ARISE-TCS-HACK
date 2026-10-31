import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings, UPLOAD_DIR, BASE_DIR
from app.database import engine, Base, SessionLocal
from app.models.three_portal_models import ThreePortalBase  # Register all 14 tables
from app.routers import three_portal_router, focused_router, auth, claims, evidence, investigation, modules, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables including all 14 three-portal tables
    Base.metadata.create_all(bind=engine)
    ThreePortalBase.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="CLAIMMIND AI",
    version="3.0.0",
    description="Multimodal Autonomous Vehicle Insurance Claim Investigation Platform (Three-Portal Architecture)",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# 1. Mount Three-Portal Core Router
app.include_router(three_portal_router.router)

# 2. Mount Focused and Supporting Routers
app.include_router(focused_router.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(claims.router, prefix=settings.API_V1_STR)
app.include_router(investigation.router, prefix=settings.API_V1_STR)
app.include_router(modules.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "app": "CLAIMMIND AI (Three-Portal Platform)",
        "portals": [
            "Login 1: Claimant / Customer Portal",
            "Login 2: AI Insurance Investigator Portal",
            "Login 3: Human Insurance Investigator Portal"
        ],
        "cv_engine": "OpenCV + YOLO Vehicle Damage Detection",
        "ocr_engine": "PyMuPDF (fitz) + Tesseract OCR",
        "pdf_engine": "ReportLab 5.0.0 (Downloadable Investigation & Decision Reports)",
        "database_tables": [
            "users", "claims", "vehicles", "evidence", "image_analysis", "ocr_results",
            "investigation_findings", "ai_recommendations", "investigation_reports",
            "human_decisions", "messages", "notifications", "customer_feedback", "audit_logs"
        ]
    }

# Mount React frontend dist if built
frontend_dist = BASE_DIR.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_candidate = frontend_dist / full_path
        if file_candidate.is_file():
            return FileResponse(str(file_candidate))
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
else:
    @app.get("/")
    def root():
        return {
            "project": "CLAIMMIND AI",
            "version": "3.0.0",
            "docs": "/docs",
            "health": "/api/health"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
