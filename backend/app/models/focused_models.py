import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class Claimant(Base):
    __tablename__ = "claimants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    contact = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    policy_number = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    accidents = relationship("Accident", back_populates="claimant", cascade="all, delete-orphan")

class Accident(Base):
    __tablename__ = "accidents"

    id = Column(String(50), primary_key=True, index=True)  # ACC-2026-0001
    claimant_id = Column(Integer, ForeignKey("claimants.id"), nullable=False)
    vehicle_registration = Column(String(50), nullable=False, index=True)
    manufacturer = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    vehicle_type = Column(String(50), default="Sedan")  # Sedan, SUV, Hatchback, Commercial, etc.
    accident_date = Column(String(50), nullable=False)
    accident_location = Column(String(255), nullable=False)
    accident_type = Column(String(100), nullable=False)  # Rear-End, Frontal, Side Impact, etc.
    accident_description = Column(Text, nullable=False)
    claimed_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    claimant = relationship("Claimant", back_populates="accidents")
    evidences = relationship("Evidence", back_populates="accident", cascade="all, delete-orphan")
    image_analyses = relationship("ImageAnalysis", back_populates="accident", cascade="all, delete-orphan")
    investigation_results = relationship("InvestigationResult", back_populates="accident", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "focused_evidence"

    id = Column(String(50), primary_key=True, index=True)  # EVD-0001
    accident_id = Column(String(50), ForeignKey("accidents.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # image/jpeg, application/pdf
    file_path = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=True)
    processing_status = Column(String(50), default="UPLOADED")  # UPLOADED, PROCESSED, ERROR
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    accident = relationship("Accident", back_populates="evidences")

class ImageAnalysis(Base):
    __tablename__ = "focused_image_analysis"

    id = Column(String(50), primary_key=True, index=True)  # IMG-0001
    accident_id = Column(String(50), ForeignKey("accidents.id"), nullable=False)
    detected_damage = Column(JSON, default=list)  # ["Front Bumper Dent", "Broken Left Headlight"]
    confidence = Column(Float, default=0.85)  # 0.0 to 1.0
    processed_image_path = Column(String(500), nullable=True)  # Path to image with drawn bounding boxes
    bounding_boxes = Column(JSON, default=list)  # [{"label": "Front Bumper Dent", "confidence": 0.88, "box": [x, y, w, h]}]
    analysis_status = Column(String(50), default="COMPLETED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    accident = relationship("Accident", back_populates="image_analyses")

class InvestigationResult(Base):
    __tablename__ = "focused_investigation_results"

    id = Column(String(50), primary_key=True, index=True)  # RES-0001
    accident_id = Column(String(50), ForeignKey("accidents.id"), nullable=False)
    accident_summary = Column(Text, nullable=False)
    visual_analysis = Column(Text, nullable=False)
    matching_findings = Column(JSON, default=list)
    contradictions = Column(JSON, default=list)
    missing_information = Column(JSON, default=list)
    recommended_solution = Column(JSON, default=list)
    final_assessment = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    accident = relationship("Accident", back_populates="investigation_results")
