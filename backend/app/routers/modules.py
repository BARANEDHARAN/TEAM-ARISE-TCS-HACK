import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import (
    Claim, DamageRecord, Contradiction, Hypothesis, PolicyClause,
    RepairItem, TimelineEvent, EvidenceGap, SettlementAssessment,
    ReviewerDecision, InvestigatorFeedback, User, AuditLog
)
from app.schemas.all_schemas import (
    ReviewerDecisionCreate, ReviewerDecisionOut, FeedbackCreate, FeedbackOut
)
from app.services.auth_service import get_current_user, require_role
from app.services.reconstruction_service import reconstruction_service
from app.services.pattern_service import pattern_service
from app.services.gap_service import gap_service
from app.services.feedback_service import feedback_service
from app.services.forensics_service import forensics_service

router = APIRouter(prefix="/modules", tags=["Investigation Modules 01-10"])

# Module 01: Damage Intelligence
@router.get("/{claim_id}/damage")
def get_damage_intelligence(claim_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    damages = db.query(DamageRecord).filter(DamageRecord.claim_id == claim_id).all()
    return {
        "claim_id": claim_id,
        "total_damages": len(damages),
        "model_engine": "ClaimMind-Vision-Hybrid-v1.0 (Demo Mode)",
        "damage_records": damages
    }

# Module 02: Cross-Modal Contradictions & Multi-Hypothesis Reasoning
@router.get("/{claim_id}/contradictions")
def get_contradictions(claim_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contradictions = db.query(Contradiction).filter(Contradiction.claim_id == claim_id).all()
    hypotheses = db.query(Hypothesis).filter(Hypothesis.claim_id == claim_id).all()
    return {
        "claim_id": claim_id,
        "contradictions": contradictions,
        "hypotheses": hypotheses
    }

# Module 03: Policy Intelligence
@router.get("/{claim_id}/policy")
def get_policy_intelligence(claim_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    clauses = db.query(PolicyClause).filter(PolicyClause.claim_id == claim_id).all()
    return {
        "claim_id": claim_id,
        "clauses": clauses
    }

# Module 04: Visual-to-Invoice Cost Intelligence & Necessity Graph
@router.get("/{claim_id}/repair")
def get_repair_verification(claim_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(RepairItem).filter(RepairItem.claim_id == claim_id).all()
    supported = sum(i.total_amount for i in items if i.supported_status == "SUPPORTED")
    unsupported = sum(i.total_amount for i in items if i.supported_status == "UNSUPPORTED")
    unverified = sum(i.total_amount for i in items if i.supported_status == "UNVERIFIED")
    return {
        "claim_id": claim_id,
        "repair_items": items,
        "supported_total": round(supported, 2),
        "unsupported_total": round(unsupported, 2),
        "unverified_total": round(unverified, 2),
        "total_estimate": round(supported + unsupported + unverified, 2)
    }

# Module 05: Digital Evidence Forensics
@router.get("/{claim_id}/forensics")
def get_forensics(claim_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    evidence_files = claim.evidence_files
    historical_files = db.query(Claim).filter(Claim.id != claim_id).all()
    
    results = []
    for ev in evidence_files:
        matches = []
        if ev.perceptual_hash:
            # Check against other claims
            for hist in historical_files:
                for h_ev in hist.evidence_files:
                    if h_ev.perceptual_hash and forensics_service.hamming_distance(ev.perceptual_hash, h_ev.perceptual_hash) <= 6:
                        matches.append({
                            "historical_claim_id": hist.id,
                            "historical_claimant": hist.claimant_name,
                            "historical_filename": h_ev.original_filename,
                            "similarity_pct": round((1 - (forensics_service.hamming_distance(ev.perceptual_hash, h_ev.perceptual_hash) / 64.0)) * 100, 1)
                        })
        results.append({
            "evidence_id": ev.id,
            "filename": ev.original_filename,
            "sha256": ev.sha256_hash,
            "perceptual_hash": ev.perceptual_hash,
            "metadata": ev.metadata_json or {},
            "cross_claim_matches": matches
        })

    return {
        "claim_id": claim_id,
        "forensics_summary": results
    }

# Module 06: Context-Aware Reconstruction & Scenarios
@router.get("/{claim_id}/reconstruction")
def get_reconstruction(claim_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    timeline = db.query(TimelineEvent).filter(TimelineEvent.claim_id == claim_id).all()
    damages = [{"component": d.component} for d in claim.damage_records]
    scenarios = reconstruction_service.simulate_scenarios(
        {"description": claim.description},
        damages,
        []
    )
    return {
        "claim_id": claim_id,
        "timeline": timeline,
        "simulated_scenarios": scenarios
    }

# Module 07: Cross-Claim Pattern Intelligence
@router.get("/{claim_id}/patterns")
def get_pattern_intelligence(claim_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    all_claims = db.query(Claim).all()
    hist_dicts = [
        {"id": c.id, "vehicle_reg": c.vehicle_reg, "accident_date": c.accident_date, "accident_location": c.accident_location}
        for c in all_claims
    ]
    patterns = pattern_service.analyze_cross_claim_patterns(
        {"id": claim.id, "vehicle_reg": claim.vehicle_reg, "accident_location": claim.accident_location},
        hist_dicts,
        [e.perceptual_hash for e in claim.evidence_files if e.perceptual_hash]
    )
    return patterns

# Module 08: Intelligent Evidence Gap Predictor & Formal Letter
@router.get("/{claim_id}/gaps")
def get_evidence_gaps(claim_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    gaps = db.query(EvidenceGap).filter(EvidenceGap.claim_id == claim_id).all()
    return {"claim_id": claim_id, "evidence_gaps": gaps}

@router.get("/{claim_id}/gaps/letter")
def get_formal_gap_request_letter(claim_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    gaps = db.query(EvidenceGap).filter(EvidenceGap.claim_id == claim_id).all()
    gap_dicts = [
        {"missing_evidence_type": g.missing_evidence_type, "importance_rationale": g.importance_rationale, "what_claimant_should_provide": g.what_claimant_should_provide}
        for g in gaps
    ]
    letter = gap_service.generate_formal_request_letter(
        {"id": claim.id, "claimant_name": claim.claimant_name, "policy_number": claim.policy_number, "vehicle_make": claim.vehicle_make, "vehicle_model": claim.vehicle_model, "vehicle_reg": claim.vehicle_reg},
        gap_dicts
    )
    return {"letter_text": letter}

@router.post("/{claim_id}/gaps/{gap_id}/request")
def mark_gap_requested(claim_id: str, gap_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    gap = db.query(EvidenceGap).filter(EvidenceGap.id == gap_id).first()
    if not gap:
        raise HTTPException(status_code=404, detail="Evidence gap record not found")
    gap.is_requested = True
    db.commit()
    return {"status": "SUCCESS", "message": f"Evidence request for '{gap.missing_evidence_type}' marked as dispatched."}

# Module 09: Settlement Intelligence
@router.get("/{claim_id}/settlement")
def get_settlement_assessment(claim_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assessment = db.query(SettlementAssessment).filter(SettlementAssessment.claim_id == claim_id).first()
    if not assessment:
        return {"status": "NOT_CALCULATED", "detail": "Run AI Investigation to generate settlement assessment."}
    return assessment

# Human Review Decision Recording
@router.post("/{claim_id}/review", response_model=ReviewerDecisionOut)
def record_reviewer_decision(
    claim_id: str,
    decision_in: ReviewerDecisionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["reviewer", "admin"]))
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    rev_decision = ReviewerDecision(
        id=f"REV-{claim_id[-4:]}-{int(datetime.datetime.utcnow().timestamp())}",
        claim_id=claim_id,
        reviewer_id=current_user.id,
        decision=decision_in.decision,
        final_settlement_amount=decision_in.final_settlement_amount,
        reviewer_notes=decision_in.reviewer_notes,
        accepted_findings=decision_in.accepted_findings,
        challenged_findings=decision_in.challenged_findings,
        created_at=datetime.datetime.utcnow()
    )
    db.add(rev_decision)

    if decision_in.decision == "ACCEPTED_FOR_SETTLEMENT":
        claim.status = "COMPLETED"
    elif decision_in.decision == "REQUEST_ADDITIONAL_EVIDENCE":
        claim.status = "EVIDENCE_MISSING"
    else:
        claim.status = "REQUIRES_REVIEW"

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="RECORD_HUMAN_REVIEW_DECISION",
        target_type="CLAIM",
        target_id=claim_id,
        details={"decision": decision_in.decision, "final_amount": decision_in.final_settlement_amount}
    )
    db.add(audit)
    db.commit()
    db.refresh(rev_decision)
    return rev_decision

# Module 10: Feedback Intelligence
@router.post("/{claim_id}/feedback", response_model=FeedbackOut)
def record_investigator_feedback(
    claim_id: str,
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fdb = InvestigatorFeedback(
        id=f"FDB-{claim_id[-4:]}-{int(datetime.datetime.utcnow().timestamp())}",
        claim_id=claim_id,
        finding_id=feedback_in.finding_id,
        module_name=feedback_in.module_name,
        feedback_type=feedback_in.feedback_type,
        correction_reason=feedback_in.correction_reason,
        created_at=datetime.datetime.utcnow()
    )
    db.add(fdb)
    db.commit()
    db.refresh(fdb)
    return fdb

@router.get("/feedback/analytics")
def get_feedback_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    feedbacks = db.query(InvestigatorFeedback).all()
    feed_dicts = [{"feedback_type": f.feedback_type, "module_name": f.module_name} for f in feedbacks]
    return feedback_service.aggregate_feedback_metrics(feed_dicts)
