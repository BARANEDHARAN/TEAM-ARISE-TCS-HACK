import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="investigator")  # admin, investigator, reviewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    audit_logs = relationship("AuditLog", back_populates="user")
    reviews = relationship("ReviewerDecision", back_populates="reviewer")

class Claim(Base):
    __tablename__ = "claims"
    
    id = Column(String(50), primary_key=True, index=True)  # e.g. CLM-2026-001
    claimant_name = Column(String(255), nullable=False)
    claimant_phone = Column(String(50), nullable=True)
    claimant_email = Column(String(255), nullable=True)
    policy_number = Column(String(100), index=True, nullable=False)
    
    # Vehicle details
    vehicle_reg = Column(String(50), nullable=False)
    vehicle_make = Column(String(100), nullable=False)
    vehicle_model = Column(String(100), nullable=False)
    vehicle_year = Column(Integer, nullable=False)
    
    # Incident details
    accident_date = Column(String(50), nullable=False)
    accident_time = Column(String(50), nullable=False)
    accident_location = Column(String(255), nullable=False)
    accident_type = Column(String(100), nullable=False)  # Rear-End, Side Impact, Front Collision, Single Vehicle, etc.
    description = Column(Text, nullable=False)
    requested_amount = Column(Float, default=0.0)
    
    # Workflow status
    status = Column(String(50), default="REGISTERED")
    # REGISTERED, PROCESSING, ANALYSED, REQUIRES_REVIEW, EVIDENCE_MISSING, COMPLETED, HUMAN_DECISION_PENDING
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    evidence_files = relationship("EvidenceFile", back_populates="claim", cascade="all, delete-orphan")
    damage_records = relationship("DamageRecord", back_populates="claim", cascade="all, delete-orphan")
    extracted_facts = relationship("ExtractedFact", back_populates="claim", cascade="all, delete-orphan")
    contradictions = relationship("Contradiction", back_populates="claim", cascade="all, delete-orphan")
    hypotheses = relationship("Hypothesis", back_populates="claim", cascade="all, delete-orphan")
    policy_clauses = relationship("PolicyClause", back_populates="claim", cascade="all, delete-orphan")
    repair_items = relationship("RepairItem", back_populates="claim", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="claim", cascade="all, delete-orphan")
    evidence_gaps = relationship("EvidenceGap", back_populates="claim", cascade="all, delete-orphan")
    settlement_assessment = relationship("SettlementAssessment", back_populates="claim", uselist=False, cascade="all, delete-orphan")
    investigation_runs = relationship("InvestigationRun", back_populates="claim", cascade="all, delete-orphan")
    findings = relationship("InvestigationFinding", back_populates="claim", cascade="all, delete-orphan")
    reviewer_decisions = relationship("ReviewerDecision", back_populates="claim", cascade="all, delete-orphan")
    feedbacks = relationship("InvestigatorFeedback", back_populates="claim", cascade="all, delete-orphan")

class EvidenceFile(Base):
    __tablename__ = "evidence_files"
    
    id = Column(String(50), primary_key=True, index=True)  # EVD-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # image/jpeg, application/pdf, etc.
    file_size_bytes = Column(Integer, nullable=False)
    storage_path = Column(String(500), nullable=False)
    sha256_hash = Column(String(64), index=True, nullable=False)
    perceptual_hash = Column(String(64), index=True, nullable=True)
    category = Column(String(50), default="photo")  # photo, police_report, repair_estimate, policy_doc, telematics
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="UPLOADED")  # UPLOADED, PROCESSED, ERROR
    metadata_json = Column(JSON, default=dict)
    
    claim = relationship("Claim", back_populates="evidence_files")
    damage_records = relationship("DamageRecord", back_populates="evidence")
    repair_items = relationship("RepairItem", back_populates="evidence")

class DamageRecord(Base):
    __tablename__ = "damage_records"
    
    id = Column(String(50), primary_key=True, index=True)  # DMG-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    evidence_id = Column(String(50), ForeignKey("evidence_files.id"), nullable=True)
    component = Column(String(100), nullable=False)  # Front Bumper, Left Headlight, Rear Bumper, Bonnet, Door, etc.
    damage_type = Column(String(100), nullable=False)  # Dent, Scratch, Crack, Deformation, Broken Headlight, Shattered Glass
    severity = Column(String(50), default="Moderate")  # Minor, Moderate, Severe
    confidence = Column(Float, default=0.92)
    bbox_json = Column(JSON, default=dict)  # {x, y, width, height} or segmentation mask coordinates
    fingerprint = Column(String(255), index=True, nullable=False)  # COMP-TYPE-LOC-HASH
    visual_annotation_url = Column(String(500), nullable=True)
    status = Column(String(50), default="DETECTED")  # DETECTED, VERIFIED_BY_HUMAN, CHALLENGED
    
    claim = relationship("Claim", back_populates="damage_records")
    evidence = relationship("EvidenceFile", back_populates="damage_records")

class ExtractedFact(Base):
    __tablename__ = "extracted_facts"
    
    id = Column(String(50), primary_key=True, index=True)  # FCT-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    source_name = Column(String(100), nullable=False)  # Claimant Statement, Police Report, Telematics, Invoice
    source_evidence_id = Column(String(50), nullable=True)
    fact_type = Column(String(100), nullable=False)  # impact_direction, time_of_day, weather, road_condition, speed
    fact_value = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    raw_text_snippet = Column(Text, nullable=True)
    
    claim = relationship("Claim", back_populates="extracted_facts")

class Contradiction(Base):
    __tablename__ = "contradictions"
    
    id = Column(String(50), primary_key=True, index=True)  # CTR-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    contradiction_type = Column(String(100), nullable=False)  # IMPACT_DIRECTION_MISMATCH, DAMAGE_LOCATION_CONFLICT, etc.
    severity = Column(String(50), default="High")  # Critical, High, Medium, Low
    description = Column(Text, nullable=False)
    source_a_name = Column(String(100), nullable=False)
    source_a_fact = Column(Text, nullable=False)
    source_b_name = Column(String(100), nullable=False)
    source_b_fact = Column(Text, nullable=False)
    supporting_evidence_ids = Column(JSON, default=list)
    confidence = Column(Float, default=0.88)
    potential_explanations = Column(JSON, default=list)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, RESOLVED, DISMISSED
    
    claim = relationship("Claim", back_populates="contradictions")

class Hypothesis(Base):
    __tablename__ = "hypotheses"
    
    id = Column(String(50), primary_key=True, index=True)  # HYP-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    title = Column(String(255), nullable=False)
    scenario_code = Column(String(50), nullable=False)  # SCENARIO_A, SCENARIO_B, SCENARIO_C
    description = Column(Text, nullable=False)
    plausibility = Column(String(50), default="Plentiful Evidence")  # High, Moderate, Plausible, Unlikely
    supporting_evidence_ids = Column(JSON, default=list)
    contradicting_evidence_ids = Column(JSON, default=list)
    missing_evidence_ids = Column(JSON, default=list)
    recommended_verification = Column(Text, nullable=True)
    
    claim = relationship("Claim", back_populates="hypotheses")

class PolicyClause(Base):
    __tablename__ = "policy_clauses"
    
    id = Column(String(50), primary_key=True, index=True)  # POL-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    clause_code = Column(String(100), nullable=False)  # SEC_4.2_EXCLUSION, SEC_2.1_COLLISION
    clause_title = Column(String(255), nullable=False)
    page_number = Column(Integer, default=1)
    clause_text = Column(Text, nullable=False)
    applicability = Column(String(100), nullable=False)  # POTENTIALLY_COVERED, POTENTIALLY_EXCLUDED, NEEDS_VERIFICATION
    rationale = Column(Text, nullable=False)
    deductible_amount = Column(Float, default=0.0)
    max_coverage_limit = Column(Float, default=500000.0)
    requires_human_interpretation = Column(Boolean, default=True)
    
    claim = relationship("Claim", back_populates="policy_clauses")

class RepairItem(Base):
    __tablename__ = "repair_items"
    
    id = Column(String(50), primary_key=True, index=True)  # RPR-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    evidence_id = Column(String(50), ForeignKey("evidence_files.id"), nullable=True)
    component_name = Column(String(255), nullable=False)
    part_number = Column(String(100), nullable=True)
    action = Column(String(50), default="Replace")  # Replace, Repair, Paint, Inspect
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    labor_charges = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    supported_status = Column(String(50), default="SUPPORTED")  # SUPPORTED, UNSUPPORTED, UNVERIFIED
    damage_fingerprint_ref = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    
    claim = relationship("Claim", back_populates="repair_items")
    evidence = relationship("EvidenceFile", back_populates="repair_items")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    
    id = Column(String(50), primary_key=True, index=True)  # TML-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    timestamp_str = Column(String(50), nullable=False)
    source_type = Column(String(50), nullable=False)  # TELEMATICS, GPS, STATEMENT, POLICE, PHOTO_EXIF, WEATHER
    event_title = Column(String(255), nullable=False)
    event_description = Column(Text, nullable=False)
    telemetry_metrics = Column(JSON, default=dict)  # speed_kmh, g_force, deceleration_mps2, lat_long
    consistency_flag = Column(String(50), default="CONSISTENT")  # CONSISTENT, ANOMALOUS, DISCREPANCY
    
    claim = relationship("Claim", back_populates="timeline_events")

class EvidenceGap(Base):
    __tablename__ = "evidence_gaps"
    
    id = Column(String(50), primary_key=True, index=True)  # GAP-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    missing_evidence_type = Column(String(255), nullable=False)  # e.g. "Rear Impact Photos", "Official Police FIR"
    priority = Column(String(50), default="HIGH")  # CRITICAL, HIGH, MEDIUM, OPTIONAL
    importance_rationale = Column(Text, nullable=False)
    related_inconsistency = Column(Text, nullable=True)
    target_hypothesis = Column(String(100), nullable=True)
    what_claimant_should_provide = Column(Text, nullable=False)
    next_step_after_receiving = Column(Text, nullable=False)
    is_requested = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    
    claim = relationship("Claim", back_populates="evidence_gaps")

class SettlementAssessment(Base):
    __tablename__ = "settlement_assessments"
    
    id = Column(String(50), primary_key=True, index=True)  # SET-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), unique=True, nullable=False)
    submitted_total = Column(Float, default=0.0)
    supported_total = Column(Float, default=0.0)
    unsupported_total = Column(Float, default=0.0)
    unverified_total = Column(Float, default=0.0)
    deductible_applied = Column(Float, default=0.0)
    max_coverage_limit = Column(Float, default=0.0)
    indicative_settlement_min = Column(Float, default=0.0)
    indicative_settlement_max = Column(Float, default=0.0)
    currency = Column(String(10), default="INR")
    explanation_text = Column(Text, nullable=False)
    conditions_and_caveats = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    claim = relationship("Claim", back_populates="settlement_assessment")

class InvestigationRun(Base):
    __tablename__ = "investigation_runs"
    
    id = Column(String(50), primary_key=True, index=True)  # RUN-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    trigger_type = Column(String(50), default="MANUAL")  # MANUAL, AUTO
    current_stage = Column(Integer, default=1)
    total_stages = Column(Integer, default=15)
    stage_name = Column(String(100), default="Claim Validation")
    status = Column(String(50), default="QUEUED")  # QUEUED, RUNNING, COMPLETED, FAILED
    stages_log = Column(JSON, default=list)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    execution_time_seconds = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    
    claim = relationship("Claim", back_populates="investigation_runs")

class InvestigationFinding(Base):
    __tablename__ = "investigation_findings"
    
    id = Column(String(50), primary_key=True, index=True)  # FND-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    module_name = Column(String(100), nullable=False)  # damage_ai, contradiction, policy, repair, forensics, etc.
    finding_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), default="INFO")  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence = Column(Float, default=0.9)
    supporting_evidence_ids = Column(JSON, default=list)
    contradicting_evidence_ids = Column(JSON, default=list)
    missing_evidence_ids = Column(JSON, default=list)
    suggested_action = Column(Text, nullable=True)
    model_or_rule_version = Column(String(100), default="ClaimMind-V1.0-Hybrid")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    claim = relationship("Claim", back_populates="findings")

class ReviewerDecision(Base):
    __tablename__ = "reviewer_decisions"
    
    id = Column(String(50), primary_key=True, index=True)  # REV-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(String(50), nullable=False)  # ACCEPTED_FOR_SETTLEMENT, REQUEST_ADDITIONAL_EVIDENCE, ESCALATE_TO_SPECIAL_INVESTIGATION, REJECTED
    final_settlement_amount = Column(Float, nullable=True)
    reviewer_notes = Column(Text, nullable=False)
    accepted_findings = Column(JSON, default=list)
    challenged_findings = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    claim = relationship("Claim", back_populates="reviewer_decisions")
    reviewer = relationship("User", back_populates="reviews")

class InvestigatorFeedback(Base):
    __tablename__ = "investigator_feedback"
    
    id = Column(String(50), primary_key=True, index=True)  # FDB-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    finding_id = Column(String(50), nullable=True)
    module_name = Column(String(100), nullable=False)
    feedback_type = Column(String(50), nullable=False)  # ACCEPTED, CHALLENGED, FALSE_POSITIVE, MISSED_DAMAGE
    correction_reason = Column(Text, nullable=False)
    model_version = Column(String(100), default="ClaimMind-V1.0-Hybrid")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    claim = relationship("Claim", back_populates="feedbacks")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    target_type = Column(String(100), nullable=False)  # CLAIM, EVIDENCE, INVESTIGATION, DECISION
    target_id = Column(String(100), nullable=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="audit_logs")
