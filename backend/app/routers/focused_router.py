import os
import shutil
import uuid
import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.database import get_db
from app.models.focused_models import (
    Claimant, Accident, Evidence, ImageAnalysis, InvestigationResult
)
from app.services.focused_cv_service import focused_cv_service
from app.services.focused_ocr_service import focused_ocr_service
from app.services.focused_investigation_service import focused_investigation_service

router = APIRouter(prefix="/focused", tags=["Focused Investigation Workflow"])

# 1. Enter Claimant Details & Accident Details
@router.post("/investigations")
def create_investigation(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Step 1 & 2: Enter Claimant & Accident Details.
    Validates required fields and saves to Claimant and Accident tables.
    """
    claimant_data = data.get("claimant", {})
    accident_data = data.get("accident", {})

    # Validation
    if not claimant_data.get("name") or not claimant_data.get("policy_number"):
        raise HTTPException(status_code=400, detail="Claimant Name and Policy Number are required.")
    if not accident_data.get("vehicle_registration") or not accident_data.get("accident_description"):
        raise HTTPException(status_code=400, detail="Vehicle Registration and Accident Description are required.")

    # 1. Save or find Claimant
    claimant = Claimant(
        name=claimant_data.get("name"),
        contact=claimant_data.get("contact", ""),
        email=claimant_data.get("email", ""),
        policy_number=claimant_data.get("policy_number")
    )
    db.add(claimant)
    db.commit()
    db.refresh(claimant)

    # 2. Save Accident
    acc_count = db.query(Accident).count() + 1
    acc_id = f"ACC-{datetime.datetime.utcnow().year}-{acc_count:04d}"

    accident = Accident(
        id=acc_id,
        claimant_id=claimant.id,
        vehicle_registration=accident_data.get("vehicle_registration", "").upper(),
        manufacturer=accident_data.get("manufacturer", ""),
        model=accident_data.get("model", ""),
        vehicle_type=accident_data.get("vehicle_type", "Sedan"),
        accident_date=accident_data.get("accident_date", datetime.datetime.utcnow().strftime("%Y-%m-%d")),
        accident_location=accident_data.get("accident_location", ""),
        accident_type=accident_data.get("accident_type", "Rear-End Collision"),
        accident_description=accident_data.get("accident_description", ""),
        claimed_amount=float(accident_data.get("claimed_amount", 0.0))
    )
    db.add(accident)
    db.commit()
    db.refresh(accident)

    return {
        "status": "SUCCESS",
        "accident_id": accident.id,
        "claimant_id": claimant.id,
        "message": "Accident and claimant records registered successfully."
    }

# 2. List Previous Investigations (History)
@router.get("/investigations")
def list_investigations(db: Session = Depends(get_db)):
    accidents = db.query(Accident).order_by(Accident.created_at.desc()).all()
    results = []
    for a in accidents:
        claimant = a.claimant
        has_result = len(a.investigation_results) > 0
        results.append({
            "accident_id": a.id,
            "claimant_name": claimant.name if claimant else "Unknown",
            "policy_number": claimant.policy_number if claimant else "N/A",
            "vehicle": f"{a.manufacturer} {a.model} ({a.vehicle_registration})",
            "accident_date": a.accident_date,
            "accident_type": a.accident_type,
            "claimed_amount": a.claimed_amount,
            "has_investigation_result": has_result,
            "created_at": str(a.created_at)
        })
    return results

# 3. Reopen an Investigation
@router.get("/investigations/{accident_id}")
def get_investigation_dossier(accident_id: str, db: Session = Depends(get_db)):
    accident = db.query(Accident).filter(Accident.id == accident_id).first()
    if not accident:
        raise HTTPException(status_code=404, detail="Investigation record not found")

    claimant = accident.claimant
    evidences = accident.evidences
    analyses = accident.image_analyses
    results = accident.investigation_results

    return {
        "accident_id": accident.id,
        "claimant": {
            "name": claimant.name if claimant else "",
            "contact": claimant.contact if claimant else "",
            "email": claimant.email if claimant else "",
            "policy_number": claimant.policy_number if claimant else ""
        },
        "accident": {
            "vehicle_registration": accident.vehicle_registration,
            "manufacturer": accident.manufacturer,
            "model": accident.model,
            "vehicle_type": accident.vehicle_type,
            "accident_date": accident.accident_date,
            "accident_location": accident.accident_location,
            "accident_type": accident.accident_type,
            "accident_description": accident.accident_description,
            "claimed_amount": accident.claimed_amount,
            "created_at": str(accident.created_at)
        },
        "evidence_files": [
            {
                "id": e.id,
                "file_name": e.file_name,
                "file_type": e.file_type,
                "file_url": f"/uploads/{e.file_name}",
                "extracted_text": e.extracted_text,
                "processing_status": e.processing_status
            } for e in evidences
        ],
        "image_analysis": {
            "detected_damage": analyses[-1].detected_damage if analyses else [],
            "confidence": analyses[-1].confidence if analyses else 0.0,
            "processed_image_url": analyses[-1].processed_image_path if analyses else None,
            "bounding_boxes": analyses[-1].bounding_boxes if analyses else [],
            "analysis_status": analyses[-1].analysis_status if analyses else "NOT_RUN"
        } if analyses else None,
        "investigation_result": {
            "accident_summary": results[-1].accident_summary,
            "visual_analysis": results[-1].visual_analysis,
            "matching_findings": results[-1].matching_findings,
            "contradictions": results[-1].contradictions,
            "missing_information": results[-1].missing_information,
            "recommended_solution": results[-1].recommended_solution,
            "final_assessment": results[-1].final_assessment,
            "created_at": str(results[-1].created_at)
        } if results else None
    }

# 4. Upload Actual Evidence Files (Image and Report)
@router.post("/investigations/{accident_id}/upload-evidence")
async def upload_evidence(
    accident_id: str,
    file: UploadFile = File(...),
    doc_type: str = Form("image"),  # 'image' or 'report'
    db: Session = Depends(get_db)
):
    accident = db.query(Accident).filter(Accident.id == accident_id).first()
    if not accident:
        raise HTTPException(status_code=404, detail="Accident record not found")

    ext = Path(file.filename).suffix.lower()
    allowed = [".jpg", ".jpeg", ".png", ".pdf"]
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File extension '{ext}' not supported. Allowed: JPG, PNG, PDF")

    unique_filename = f"{uuid.uuid4().hex[:10]}_{file.filename}"
    saved_path = UPLOAD_DIR / unique_filename

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    ev_id = f"EVD-{uuid.uuid4().hex[:6].upper()}"
    evidence = Evidence(
        id=ev_id,
        accident_id=accident_id,
        file_name=unique_filename,
        file_type="image" if ext in [".jpg", ".jpeg", ".png"] else "pdf",
        file_path=str(saved_path),
        processing_status="UPLOADED"
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return {
        "status": "SUCCESS",
        "evidence_id": evidence.id,
        "file_name": evidence.file_name,
        "file_type": evidence.file_type,
        "file_url": f"/uploads/{evidence.file_name}"
    }

# 5. Process Image Using OpenCV + Damage Detection
@router.post("/investigations/{accident_id}/process-image")
def process_vehicle_image(accident_id: str, db: Session = Depends(get_db)):
    accident = db.query(Accident).filter(Accident.id == accident_id).first()
    if not accident:
        raise HTTPException(status_code=404, detail="Accident record not found")

    # Find the latest uploaded vehicle image
    img_evidence = (
        db.query(Evidence)
        .filter(Evidence.accident_id == accident_id, Evidence.file_type == "image")
        .order_by(Evidence.uploaded_at.desc())
        .first()
    )

    if not img_evidence:
        raise HTTPException(status_code=400, detail="No vehicle image has been uploaded for this accident.")

    cv_results = focused_cv_service.process_accident_image(
        image_path=img_evidence.file_path,
        accident_context={
            "description": accident.accident_description,
            "accident_type": accident.accident_type
        }
    )

    # Save to ImageAnalysis table
    img_analysis = ImageAnalysis(
        id=f"IMG-{uuid.uuid4().hex[:6].upper()}",
        accident_id=accident_id,
        detected_damage=cv_results["detected_damages"],
        confidence=cv_results["confidence"],
        processed_image_path=cv_results["processed_image_url"],
        bounding_boxes=cv_results["bounding_boxes"],
        analysis_status=cv_results["status"]
    )
    db.add(img_analysis)
    img_evidence.processing_status = "PROCESSED"
    db.commit()
    db.refresh(img_analysis)

    return cv_results

# 6. Extract Accident Report Using OCR (PyMuPDF / PyPDF / OCR)
@router.post("/investigations/{accident_id}/process-ocr")
def process_report_ocr(accident_id: str, db: Session = Depends(get_db)):
    accident = db.query(Accident).filter(Accident.id == accident_id).first()
    if not accident:
        raise HTTPException(status_code=404, detail="Accident record not found")

    # Find the latest uploaded accident report document
    doc_evidence = (
        db.query(Evidence)
        .filter(Evidence.accident_id == accident_id, Evidence.file_type == "pdf")
        .order_by(Evidence.uploaded_at.desc())
        .first()
    )

    if not doc_evidence:
        # Check if there is an image report
        doc_evidence = (
            db.query(Evidence)
            .filter(Evidence.accident_id == accident_id)
            .order_by(Evidence.uploaded_at.desc())
            .first()
        )

    if not doc_evidence:
        raise HTTPException(status_code=400, detail="No accident report document has been uploaded.")

    ocr_results = focused_ocr_service.extract_document_text(doc_evidence.file_path)

    # Save extracted text to evidence record
    doc_evidence.extracted_text = ocr_results["raw_text"]
    doc_evidence.processing_status = "PROCESSED"
    db.commit()

    return ocr_results

# 7. Run AI Investigation Engine & Solution Generation
@router.post("/investigations/{accident_id}/run-analysis")
def run_ai_investigation(
    accident_id: str,
    editable_ocr: Optional[Dict[str, Any]] = Body(None),
    db: Session = Depends(get_db)
):
    """
    Step 8 & 9: Combines:
    1. Claimant info
    2. Accident description
    3. Accident report extracted through OCR
    4. Vehicle damage detected through OpenCV/YOLO
    5. Claimed repair amount
    Produces complete structured investigation findings and solutions.
    """
    accident = db.query(Accident).filter(Accident.id == accident_id).first()
    if not accident:
        raise HTTPException(status_code=404, detail="Accident record not found")

    claimant = accident.claimant

    # Fetch latest image analysis
    img_analysis = (
        db.query(ImageAnalysis)
        .filter(ImageAnalysis.accident_id == accident_id)
        .order_by(ImageAnalysis.created_at.desc())
        .first()
    )
    cv_data = {
        "detected_damages": img_analysis.detected_damage if img_analysis else ["Front Bumper Damage"],
        "confidence": img_analysis.confidence if img_analysis else 0.85
    }

    # Fetch latest OCR extraction
    doc_evidence = (
        db.query(Evidence)
        .filter(Evidence.accident_id == accident_id)
        .order_by(Evidence.uploaded_at.desc())
        .first()
    )
    ocr_data = {
        "extracted_fields": editable_ocr or (
            focused_ocr_service.extract_document_text(doc_evidence.file_path)["extracted_fields"]
            if doc_evidence else {}
        ),
        "pages": 1 if doc_evidence else 0
    }

    # Run AI Investigation Engine
    investigation_output = focused_investigation_service.generate_investigation(
        claimant={
            "name": claimant.name if claimant else "Policyholder",
            "policy_number": claimant.policy_number if claimant else "POL-XXX"
        },
        accident={
            "vehicle_registration": accident.vehicle_registration,
            "manufacturer": accident.manufacturer,
            "model": accident.model,
            "accident_date": accident.accident_date,
            "accident_location": accident.accident_location,
            "accident_description": accident.accident_description,
            "accident_type": accident.accident_type,
            "claimed_amount": accident.claimed_amount
        },
        cv_analysis=cv_data,
        ocr_result=ocr_data
    )

    # Save to InvestigationResult table
    res_rec = InvestigationResult(
        id=f"RES-{uuid.uuid4().hex[:6].upper()}",
        accident_id=accident_id,
        accident_summary=investigation_output["accident_summary"],
        visual_analysis=investigation_output["visual_analysis"],
        matching_findings=investigation_output["matching_findings"],
        contradictions=investigation_output["contradictions"],
        missing_information=investigation_output["missing_information"],
        recommended_solution=investigation_output["recommended_solution"],
        final_assessment=investigation_output["final_assessment"]
    )
    db.add(res_rec)
    db.commit()
    db.refresh(res_rec)

    return investigation_output
