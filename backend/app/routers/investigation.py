from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import Claim, InvestigationRun, User
from app.schemas.all_schemas import InvestigationRunOut
from app.services.auth_service import get_current_user
from app.services.orchestrator import orchestrator
from app.services.graph_service import graph_service
from app.services.report_service import report_service

router = APIRouter(prefix="/investigation", tags=["AI Investigation Orchestrator"])

@router.post("/{claim_id}/start")
def start_investigation(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers the 15-stage AI Investigation Orchestrator for the given claim.
    """
    try:
        result = orchestrator.run_investigation(claim_id, db)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Investigation failed: {str(e)}")

@router.get("/{claim_id}/status")
def get_investigation_status(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    run = db.query(InvestigationRun).filter(InvestigationRun.claim_id == claim_id).order_by(InvestigationRun.started_at.desc()).first()
    if not run:
        return {"status": "NOT_STARTED", "current_stage": 0, "total_stages": 15, "stages_log": []}
    return {
        "id": run.id,
        "claim_id": run.claim_id,
        "status": run.status,
        "current_stage": run.current_stage,
        "total_stages": run.total_stages,
        "stage_name": run.stage_name,
        "execution_time_seconds": run.execution_time_seconds,
        "stages_log": run.stages_log or []
    }

@router.get("/{claim_id}/graph")
def get_evidence_graph(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Builds the Dynamic Evidence Intelligence Graph for React Flow visualization.
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    graph_data = graph_service.build_claim_graph(
        claim=claim,
        evidence_files=claim.evidence_files,
        damage_records=claim.damage_records,
        contradictions=claim.contradictions,
        hypotheses=claim.hypotheses,
        policy_clauses=claim.policy_clauses,
        repair_items=claim.repair_items,
        timeline_events=claim.timeline_events,
        findings=claim.findings
    )
    return graph_data

@router.get("/{claim_id}/report")
def get_investigation_report(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns structured 19-section investigation report data.
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return report_service.generate_report_json(claim)

@router.get("/{claim_id}/report/pdf")
def download_investigation_pdf(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates and downloads the official ClaimMind PDF Investigation Dossier.
    """
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    pdf_bytes = report_service.generate_pdf(claim)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ClaimMind_Report_{claim_id}.pdf"}
    )
