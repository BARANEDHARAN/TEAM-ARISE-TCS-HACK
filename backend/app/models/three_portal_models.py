import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship, declarative_base

ThreePortalBase = declarative_base()

# 1. users
class User(ThreePortalBase):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    mobile = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'claimant', 'ai_investigator', 'human_investigator'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    claims = relationship("Claim", back_populates="claimant")
    notifications = relationship("Notification", back_populates="user")
    feedback = relationship("CustomerFeedback", back_populates="customer")

# 2. claims
class Claim(ThreePortalBase):
    __tablename__ = "claims"

    id = Column(String(50), primary_key=True, index=True)  # e.g., CLM-2026-0001
    claimant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    policy_number = Column(String(100), index=True, nullable=False)
    
    # Claimant Contact Snapshot
    claimant_name = Column(String(255), nullable=False)
    claimant_contact = Column(String(50), nullable=True)
    claimant_email = Column(String(255), nullable=True)
    claimant_address = Column(Text, nullable=True)

    # Accident Details
    accident_date = Column(String(50), nullable=False)
    accident_time = Column(String(50), nullable=True)
    accident_location = Column(String(255), nullable=False)
    accident_type = Column(String(100), nullable=False)
    accident_description = Column(Text, nullable=False)
    claimed_amount = Column(Float, default=0.0)

    # Status tracking across workflow
    # SUBMITTED -> AI_PROCESSING -> AI_COMPLETED -> AWAITING_HUMAN_REVIEW -> EVIDENCE_REQUESTED -> APPROVED -> REJECTED
    status = Column(String(50), default="SUBMITTED", index=True)
    ai_status = Column(String(50), default="PENDING")  # PENDING, IN_PROGRESS, COMPLETED, INCONSISTENCIES_DETECTED
    human_status = Column(String(50), default="PENDING")  # PENDING, UNDER_REVIEW, APPROVED, REJECTED, EVIDENCE_REQUESTED

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    claimant = relationship("User", back_populates="claims")
    vehicle = relationship("Vehicle", back_populates="claim", uselist=False, cascade="all, delete-orphan")
    evidence_list = relationship("EvidenceItem", back_populates="claim", cascade="all, delete-orphan")
    image_analyses = relationship("ImageAnalysisRecord", back_populates="claim", cascade="all, delete-orphan")
    ocr_results = relationship("OCRResultRecord", back_populates="claim", cascade="all, delete-orphan")
    findings = relationship("InvestigationFindingRecord", back_populates="claim", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendationRecord", back_populates="claim", cascade="all, delete-orphan")
    reports = relationship("InvestigationReportRecord", back_populates="claim", cascade="all, delete-orphan")
    decisions = relationship("HumanDecisionRecord", back_populates="claim", cascade="all, delete-orphan")
    messages = relationship("MessageRecord", back_populates="claim", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="claim", cascade="all, delete-orphan")
    feedbacks = relationship("CustomerFeedback", back_populates="claim", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLogRecord", back_populates="claim", cascade="all, delete-orphan")

# 3. vehicles
class Vehicle(ThreePortalBase):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    registration_number = Column(String(50), nullable=False)
    manufacturer = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    vehicle_type = Column(String(50), default="Sedan")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="vehicle")

# 4. evidence
class EvidenceItem(ThreePortalBase):
    __tablename__ = "evidence"

    id = Column(String(50), primary_key=True, index=True)  # EVD-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # image, pdf
    file_path = Column(String(500), nullable=False)
    category = Column(String(50), default="accident_photo")  # accident_photo, accident_report, damage_photo, repair_estimate, other
    uploaded_by = Column(String(50), default="claimant")
    processing_status = Column(String(50), default="UPLOADED")  # UPLOADED, PROCESSED, ERROR
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="evidence_list")
    image_analyses = relationship("ImageAnalysisRecord", back_populates="evidence")
    ocr_results = relationship("OCRResultRecord", back_populates="evidence")

# 5. image_analysis
class ImageAnalysisRecord(ThreePortalBase):
    __tablename__ = "image_analysis"

    id = Column(String(50), primary_key=True, index=True)  # IMG-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    evidence_id = Column(String(50), ForeignKey("evidence.id"), nullable=True)
    detected_damage = Column(JSON, default=list)  # ["Front Bumper Damage", "Dent"]
    confidence = Column(Float, default=0.88)
    processed_image_path = Column(String(500), nullable=True)
    bounding_boxes = Column(JSON, default=list)  # [{"label": "...", "box": [x,y,w,h], "confidence": 0.88}]
    status = Column(String(50), default="COMPLETED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="image_analyses")
    evidence = relationship("EvidenceItem", back_populates="image_analyses")

# 6. ocr_results
class OCRResultRecord(ThreePortalBase):
    __tablename__ = "ocr_results"

    id = Column(String(50), primary_key=True, index=True)  # OCR-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    evidence_id = Column(String(50), ForeignKey("evidence.id"), nullable=True)
    extracted_fields = Column(JSON, default=dict)
    raw_text = Column(Text, nullable=True)
    page_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="ocr_results")
    evidence = relationship("EvidenceItem", back_populates="ocr_results")

# 7. investigation_findings
class InvestigationFindingRecord(ThreePortalBase):
    __tablename__ = "investigation_findings"

    id = Column(String(50), primary_key=True, index=True)  # FND-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    finding_type = Column(String(50), default="contradiction")  # matching, contradiction, missing, verification
    title = Column(String(255), nullable=False)
    claimant_statement = Column(Text, nullable=True)
    image_analysis = Column(Text, nullable=True)
    finding_text = Column(Text, nullable=False)
    possible_explanations = Column(JSON, default=list)
    human_status = Column(String(50), default="pending")  # pending, accepted, rejected, flagged
    human_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="findings")

# 8. ai_recommendations
class AIRecommendationRecord(ThreePortalBase):
    __tablename__ = "ai_recommendations"

    id = Column(String(50), primary_key=True, index=True)  # REC-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    action_text = Column(Text, nullable=False)
    priority = Column(String(50), default="High")  # High, Medium, Low
    status = Column(String(50), default="PROPOSED")  # PROPOSED, ACCEPTED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="recommendations")

# 9. investigation_reports
class InvestigationReportRecord(ThreePortalBase):
    __tablename__ = "investigation_reports"

    id = Column(String(50), primary_key=True, index=True)  # RPT-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    report_type = Column(String(50), default="ai")  # 'ai' or 'final'
    pdf_path = Column(String(500), nullable=False)
    summary_json = Column(JSON, default=dict)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="reports")

# 10. human_decisions
class HumanDecisionRecord(ThreePortalBase):
    __tablename__ = "human_decisions"

    id = Column(String(50), primary_key=True, index=True)  # DEC-xxxx
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    investigator_id = Column(Integer, nullable=True)
    decision = Column(String(50), nullable=False)  # approved, rejected, evidence_requested
    approved_amount = Column(Float, default=0.0)
    remarks = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    requested_items = Column(JSON, default=list)  # ["Rear Bumper Photos", "Clarification on impact"]
    decided_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="decisions")

# 11. messages
class MessageRecord(ThreePortalBase):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    sender_id = Column(Integer, nullable=True)
    sender_name = Column(String(100), default="Investigator")
    sender_role = Column(String(50), nullable=False)  # claimant, human_investigator, ai_investigator
    recipient_role = Column(String(50), nullable=False)
    message_text = Column(Text, nullable=False)
    attachment_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="messages")

# 12. notifications
class Notification(ThreePortalBase):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO")  # SUBMITTED, INVESTIGATION_STARTED, EVIDENCE_REQUIRED, MESSAGE_RECEIVED, APPROVED, REJECTED
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    claim = relationship("Claim", back_populates="notifications")

# 13. customer_feedback
class CustomerFeedback(ThreePortalBase):
    __tablename__ = "customer_feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feedback_text = Column(Text, nullable=False)
    rating = Column(Integer, default=5)  # 1-5
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="feedbacks")
    customer = relationship("User", back_populates="feedback")

# 14. audit_logs
class AuditLogRecord(ThreePortalBase):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    claim_id = Column(String(50), ForeignKey("claims.id"), nullable=True)
    user_id = Column(Integer, nullable=True)
    user_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., CLAIM_SUBMITTED, AI_ANALYSIS_STARTED, FINDING_REVIEWED, DECISION_RECORDED
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    claim = relationship("Claim", back_populates="audit_logs")
