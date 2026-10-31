import random
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import Claim, AuditLog, User
from app.schemas.all_schemas import ClaimCreate, ClaimUpdate, ClaimDetailOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/claims", tags=["Claims Management"])

def generate_claim_id(db: Session) -> str:
    year = datetime.datetime.utcnow().year
    count = db.query(Claim).count() + 1
    return f"CLM-{year}-{count:04d}"

@router.post("", response_model=ClaimDetailOut)
def create_claim(
    claim_in: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_id = generate_claim_id(db)
    claim = Claim(
        id=new_id,
        claimant_name=claim_in.claimant_name,
        claimant_phone=claim_in.claimant_phone,
        claimant_email=claim_in.claimant_email,
        policy_number=claim_in.policy_number,
        vehicle_reg=claim_in.vehicle_reg.upper(),
        vehicle_make=claim_in.vehicle_make,
        vehicle_model=claim_in.vehicle_model,
        vehicle_year=claim_in.vehicle_year,
        accident_date=claim_in.accident_date,
        accident_time=claim_in.accident_time,
        accident_location=claim_in.accident_location,
        accident_type=claim_in.accident_type,
        description=claim_in.description,
        requested_amount=claim_in.requested_amount,
        status="REGISTERED"
    )
    db.add(claim)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_CLAIM",
        target_type="CLAIM",
        target_id=new_id,
        details={"claimant": claim_in.claimant_name, "amount": claim_in.requested_amount}
    )
    db.add(audit)
    db.commit()
    db.refresh(claim)
    return claim

@router.get("", response_model=List[ClaimDetailOut])
def list_claims(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Claim)
    if status_filter and status_filter != "ALL":
        query = query.filter(Claim.status == status_filter)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Claim.id.ilike(search_fmt)) |
            (Claim.claimant_name.ilike(search_fmt)) |
            (Claim.vehicle_reg.ilike(search_fmt)) |
            (Claim.policy_number.ilike(search_fmt))
        )
    return query.order_by(Claim.created_at.desc()).all()

@router.get("/{claim_id}", response_model=ClaimDetailOut)
def get_claim(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.put("/{claim_id}", response_model=ClaimDetailOut)
def update_claim(
    claim_id: str,
    claim_update: ClaimUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    for field, val in claim_update.dict(exclude_unset=True).items():
        setattr(claim, field, val)
        
    claim.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(claim)
    return claim

@router.delete("/{claim_id}")
def delete_claim(
    claim_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    db.delete(claim)
    db.commit()
    return {"message": f"Claim {claim_id} deleted successfully"}
