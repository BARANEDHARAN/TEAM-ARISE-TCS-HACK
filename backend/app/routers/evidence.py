import os
import shutil
import uuid
import datetime
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.config import UPLOAD_DIR, settings
from app.database import get_db
from app.models.all_models import Claim, EvidenceFile, AuditLog, User
from app.schemas.all_schemas import EvidenceFileOut
from app.services.auth_service import get_current_user
from app.services.forensics_service import forensics_service

router = APIRouter(prefix="/claims", tags=["Evidence Collection"])

@router.post("/{claim_id}/evidence", response_model=EvidenceFileOut)
async def upload_evidence(
    claim_id: str,
    file: UploadFile = File(...),
    category: str = Form("photo"),  # photo, police_report, repair_estimate, policy_doc, telematics
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    saved_path = UPLOAD_DIR / unique_filename

    # Save to disk
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = saved_path.stat().st_size
    if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        saved_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB}MB")

    # Hash computations
    sha256_hash = forensics_service.calculate_sha256(str(saved_path))
    perceptual_hash = None
    metadata_json = {}

    if ext in [".jpg", ".jpeg", ".png"]:
        perceptual_hash = forensics_service.calculate_perceptual_hash(str(saved_path))
        metadata_json = forensics_service.extract_metadata(str(saved_path))

    ev_id = f"EVD-{claim_id[-4:]}-{uuid.uuid4().hex[:4].upper()}"
    evidence_record = EvidenceFile(
        id=ev_id,
        claim_id=claim_id,
        filename=unique_filename,
        original_filename=file.filename,
        file_type=file.content_type or "application/octet-stream",
        file_size_bytes=file_size,
        storage_path=str(saved_path),
        sha256_hash=sha256_hash,
        perceptual_hash=perceptual_hash,
        category=category,
        upload_time=datetime.datetime.utcnow(),
        status="UPLOADED",
        metadata_json=metadata_json
    )
    db.add(evidence_record)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="UPLOAD_EVIDENCE",
        target_type="EVIDENCE",
        target_id=ev_id,
        details={"filename": file.filename, "category": category, "sha256": sha256_hash}
    )
    db.add(audit)
    db.commit()
    db.refresh(evidence_record)
    return evidence_record

@router.get("/{claim_id}/evidence", response_model=List[EvidenceFileOut])
def get_claim_evidence(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(EvidenceFile).filter(EvidenceFile.claim_id == claim_id).all()

@router.get("/evidence/{evidence_id}/download")
def download_evidence(
    evidence_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ev = db.query(EvidenceFile).filter(EvidenceFile.id == evidence_id).first()
    if not ev or not os.path.exists(ev.storage_path):
        raise HTTPException(status_code=404, detail="Evidence file not found on disk")
    return FileResponse(ev.storage_path, filename=ev.original_filename, media_type=ev.file_type)

@router.delete("/evidence/{evidence_id}")
def delete_evidence(
    evidence_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ev = db.query(EvidenceFile).filter(EvidenceFile.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence file not found")
    if os.path.exists(ev.storage_path):
        try:
            os.remove(ev.storage_path)
        except Exception:
            pass
    db.delete(ev)
    db.commit()
    return {"message": "Evidence removed"}
