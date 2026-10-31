from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: str
    role: str = "investigator"

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Claim Schemas
class ClaimCreate(BaseModel):
    claimant_name: str
    claimant_phone: Optional[str] = None
    claimant_email: Optional[str] = None
    policy_number: str
    vehicle_reg: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int
    accident_date: str
    accident_time: str
    accident_location: str
    accident_type: str
    description: str
    requested_amount: float = 0.0

class ClaimUpdate(BaseModel):
    claimant_name: Optional[str] = None
    claimant_phone: Optional[str] = None
    claimant_email: Optional[str] = None
    description: Optional[str] = None
    requested_amount: Optional[float] = None
    status: Optional[str] = None

class EvidenceFileOut(BaseModel):
    id: str
    claim_id: str
    filename: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    sha256_hash: str
    perceptual_hash: Optional[str] = None
    category: str
    upload_time: datetime
    status: str
    metadata_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class DamageRecordOut(BaseModel):
    id: str
    claim_id: str
    evidence_id: Optional[str] = None
    component: str
    damage_type: str
    severity: str
    confidence: float
    bbox_json: Dict[str, Any] = {}
    fingerprint: str
    visual_annotation_url: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

class ContradictionOut(BaseModel):
    id: str
    claim_id: str
    contradiction_type: str
    severity: str
    description: str
    source_a_name: str
    source_a_fact: str
    source_b_name: str
    source_b_fact: str
    supporting_evidence_ids: List[str] = []
    confidence: float
    potential_explanations: List[Dict[str, Any]] = []
    status: str

    class Config:
        from_attributes = True

class HypothesisOut(BaseModel):
    id: str
    claim_id: str
    title: str
    scenario_code: str
    description: str
    plausibility: str
    supporting_evidence_ids: List[str] = []
    contradicting_evidence_ids: List[str] = []
    missing_evidence_ids: List[str] = []
    recommended_verification: Optional[str] = None

    class Config:
        from_attributes = True

class PolicyClauseOut(BaseModel):
    id: str
    claim_id: str
    clause_code: str
    clause_title: str
    page_number: int
    clause_text: str
    applicability: str
    rationale: str
    deductible_amount: float
    max_coverage_limit: float
    requires_human_interpretation: bool

    class Config:
        from_attributes = True

class RepairItemOut(BaseModel):
    id: str
    claim_id: str
    evidence_id: Optional[str] = None
    component_name: str
    part_number: Optional[str] = None
    action: str
    quantity: int
    unit_price: float
    labor_charges: float
    tax: float
    total_amount: float
    supported_status: str
    damage_fingerprint_ref: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class TimelineEventOut(BaseModel):
    id: str
    claim_id: str
    timestamp_str: str
    source_type: str
    event_title: str
    event_description: str
    telemetry_metrics: Dict[str, Any] = {}
    consistency_flag: str

    class Config:
        from_attributes = True

class EvidenceGapOut(BaseModel):
    id: str
    claim_id: str
    missing_evidence_type: str
    priority: str
    importance_rationale: str
    related_inconsistency: Optional[str] = None
    target_hypothesis: Optional[str] = None
    what_claimant_should_provide: str
    next_step_after_receiving: str
    is_requested: bool
    is_resolved: bool

    class Config:
        from_attributes = True

class SettlementAssessmentOut(BaseModel):
    id: str
    claim_id: str
    submitted_total: float
    supported_total: float
    unsupported_total: float
    unverified_total: float
    deductible_applied: float
    max_coverage_limit: float
    indicative_settlement_min: float
    indicative_settlement_max: float
    currency: str
    explanation_text: str
    conditions_and_caveats: List[str] = []

    class Config:
        from_attributes = True

class InvestigationFindingOut(BaseModel):
    id: str
    claim_id: str
    module_name: str
    finding_type: str
    description: str
    severity: str
    confidence: float
    supporting_evidence_ids: List[str] = []
    contradicting_evidence_ids: List[str] = []
    missing_evidence_ids: List[str] = []
    suggested_action: Optional[str] = None
    model_or_rule_version: str
    created_at: datetime

    class Config:
        from_attributes = True

class InvestigationRunOut(BaseModel):
    id: str
    claim_id: str
    trigger_type: str
    current_stage: int
    total_stages: int
    stage_name: str
    status: str
    stages_log: List[Dict[str, Any]] = []
    started_at: datetime
    completed_at: Optional[datetime] = None
    execution_time_seconds: float
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class ReviewerDecisionCreate(BaseModel):
    decision: str  # ACCEPTED_FOR_SETTLEMENT, REQUEST_ADDITIONAL_EVIDENCE, ESCALATE_TO_SPECIAL_INVESTIGATION, REJECTED
    final_settlement_amount: Optional[float] = None
    reviewer_notes: str
    accepted_findings: List[str] = []
    challenged_findings: List[str] = []

class ReviewerDecisionOut(BaseModel):
    id: str
    claim_id: str
    reviewer_id: int
    decision: str
    final_settlement_amount: Optional[float] = None
    reviewer_notes: str
    accepted_findings: List[str] = []
    challenged_findings: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    finding_id: Optional[str] = None
    module_name: str
    feedback_type: str  # ACCEPTED, CHALLENGED, FALSE_POSITIVE, MISSED_DAMAGE
    correction_reason: str

class FeedbackOut(BaseModel):
    id: str
    claim_id: str
    finding_id: Optional[str] = None
    module_name: str
    feedback_type: str
    correction_reason: str
    created_at: datetime

    class Config:
        from_attributes = True

class ClaimDetailOut(BaseModel):
    id: str
    claimant_name: str
    claimant_phone: Optional[str] = None
    claimant_email: Optional[str] = None
    policy_number: str
    vehicle_reg: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int
    accident_date: str
    accident_time: str
    accident_location: str
    accident_type: str
    description: str
    requested_amount: float
    status: str
    created_at: datetime
    updated_at: datetime
    
    evidence_files: List[EvidenceFileOut] = []
    damage_records: List[DamageRecordOut] = []
    contradictions: List[ContradictionOut] = []
    hypotheses: List[HypothesisOut] = []
    policy_clauses: List[PolicyClauseOut] = []
    repair_items: List[RepairItemOut] = []
    timeline_events: List[TimelineEventOut] = []
    evidence_gaps: List[EvidenceGapOut] = []
    settlement_assessment: Optional[SettlementAssessmentOut] = None
    findings: List[InvestigationFindingOut] = []
    reviewer_decisions: List[ReviewerDecisionOut] = []

    class Config:
        from_attributes = True
