import sys
import os
from pathlib import Path

# Add backend directory to path
sys.path.append(str(Path(__file__).resolve().parent))

from app.config import UPLOAD_DIR
from app.database import SessionLocal, engine
from app.models.three_portal_models import (
    ThreePortalBase, User, Claim, Vehicle, EvidenceItem, ImageAnalysisRecord, OCRResultRecord,
    InvestigationFindingRecord, AIRecommendationRecord, InvestigationReportRecord,
    HumanDecisionRecord, MessageRecord, Notification, CustomerFeedback, AuditLogRecord
)
from app.services.focused_cv_service import focused_cv_service
from app.services.focused_ocr_service import focused_ocr_service
from app.services.focused_investigation_service import focused_investigation_service
from app.services.pdf_report_service import pdf_report_service

def seed():
    print("Initializing Database Tables for Three-Portal Architecture...")
    ThreePortalBase.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed 3 Personas
        print("Seeding Personas...")
        personas = [
            {
                "name": "Rajesh Sharma",
                "email": "customer@claimmind.com",
                "mobile": "+91 98201 44321",
                "role": "claimant"
            },
            {
                "name": "CLAIMMIND AI Engine",
                "email": "ai@claimmind.com",
                "mobile": "+91 00000 00000",
                "role": "ai_investigator"
            },
            {
                "name": "Priya Nair",
                "email": "investigator@claimmind.com",
                "mobile": "+91 98110 55443",
                "role": "human_investigator"
            }
        ]

        users_by_role = {}
        for p in personas:
            user = db.query(User).filter(User.email == p["email"]).first()
            if not user:
                user = User(
                    name=p["name"],
                    email=p["email"],
                    mobile=p["mobile"],
                    password_hash="password123",
                    role=p["role"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            users_by_role[p["role"]] = user

        claimant = users_by_role["claimant"]
        ai_user = users_by_role["ai_investigator"]
        human_user = users_by_role["human_investigator"]

        # 2. Seed Initial Demonstration Claim
        claim_id = "CLM-2026-0001"
        existing_claim = db.query(Claim).filter(Claim.id == claim_id).first()
        if existing_claim:
            print(f"Claim {claim_id} already exists.")
            return

        print(f"Seeding Initial Claim {claim_id}...")
        claim = Claim(
            id=claim_id,
            claimant_id=claimant.id,
            policy_number="POL-MUM-892147",
            claimant_name=claimant.name,
            claimant_contact=claimant.mobile,
            claimant_email=claimant.email,
            claimant_address="Flat 402, Sea Breeze Apts, Bandra West, Mumbai",
            accident_date="2026-10-24",
            accident_time="18:45",
            accident_location="Western Express Highway, Goregaon flyover junction, Mumbai",
            accident_type="Rear-End Collision",
            accident_description="Vehicle was stationary at a red signal when another car struck us firmly from behind.",
            claimed_amount=48500.0,
            status="AWAITING_HUMAN_REVIEW",
            ai_status="INCONSISTENCIES_DETECTED",
            human_status="UNDER_REVIEW"
        )
        db.add(claim)
        db.commit()
        db.refresh(claim)

        # Vehicle
        vehicle = Vehicle(
            claim_id=claim.id,
            registration_number="MH 02 EE 4519",
            manufacturer="Honda",
            model="City",
            vehicle_type="Sedan"
        )
        db.add(vehicle)

        # Evidence: 1 image + 1 PDF report
        img_name = "sample_a_front_damage.jpg"
        img_path = UPLOAD_DIR / img_name
        ev_img = EvidenceItem(
            id="EVD-IMG-001",
            claim_id=claim.id,
            file_name=img_name,
            file_type="image",
            file_path=str(img_path),
            category="accident_photo",
            uploaded_by="claimant",
            processing_status="PROCESSED"
        )
        db.add(ev_img)

        pdf_name = "police_accident_report_ACC0001.pdf"
        pdf_path = UPLOAD_DIR / pdf_name
        ev_pdf = EvidenceItem(
            id="EVD-PDF-001",
            claim_id=claim.id,
            file_name=pdf_name,
            file_type="pdf",
            file_path=str(pdf_path),
            category="accident_report",
            uploaded_by="claimant",
            processing_status="PROCESSED"
        )
        db.add(ev_pdf)
        db.commit()

        # Run CV & Image Analysis
        print("Running Computer Vision damage detection...")
        cv_res = focused_cv_service.process_accident_image(
            image_path=str(img_path),
            accident_context={"description": claim.accident_description, "accident_type": claim.accident_type}
        )
        img_analysis = ImageAnalysisRecord(
            id="IMG-0001",
            claim_id=claim.id,
            evidence_id=ev_img.id,
            detected_damage=cv_res["detected_damages"],
            confidence=cv_res["confidence"],
            processed_image_path=cv_res["processed_image_url"],
            bounding_boxes=cv_res["bounding_boxes"],
            status="COMPLETED"
        )
        db.add(img_analysis)

        # Run OCR
        print("Running OCR text extraction...")
        ocr_res = focused_ocr_service.extract_document_text(str(pdf_path))
        ocr_rec = OCRResultRecord(
            id="OCR-0001",
            claim_id=claim.id,
            evidence_id=ev_pdf.id,
            extracted_fields=ocr_res["extracted_fields"],
            raw_text=ocr_res.get("raw_text", ""),
            page_count=ocr_res.get("page_count", 1)
        )
        db.add(ocr_rec)

        # Investigation Findings
        print("Creating Investigation Findings...")
        fnd1 = InvestigationFindingRecord(
            id="FND-0001",
            claim_id=claim.id,
            finding_type="contradiction",
            title="Impact Direction vs Observed Front Damage",
            claimant_statement="Vehicle was hit from behind (rear impact).",
            image_analysis="Visible damage detected primarily around front bumper and lower apron.",
            finding_text="The reported rear impact does not directly match the visible front-side damage in the uploaded photograph.",
            possible_explanations=[
                "The vehicle may have experienced a multi-car sandwich collision, being pushed into a lead car.",
                "The claimant description may be incomplete, or only photos of the secondary damage were uploaded.",
                "The uploaded image may show pre-existing front damage."
            ],
            human_status="pending",
            human_remarks=None
        )
        db.add(fnd1)

        fnd2 = InvestigationFindingRecord(
            id="FND-0002",
            claim_id=claim.id,
            finding_type="matching",
            title="Vehicle Registration Match",
            claimant_statement="Registration MH 02 EE 4519",
            image_analysis=None,
            finding_text="Registration matches active insurance policy and official police accident report.",
            possible_explanations=[],
            human_status="accepted",
            human_remarks="Verified from RTO registry"
        )
        db.add(fnd2)

        # AI Recommendations
        recs = [
            "Request supplementary photographs of the vehicle rear bumper and tailgate.",
            "Ask claimant to clarify whether forward secondary contact occurred.",
            "Cross-verify repair estimate line-items against authorized bodyshop rates."
        ]
        for r_text in recs:
            rec = AIRecommendationRecord(
                id=f"REC-{os.urandom(3).hex().upper()}",
                claim_id=claim.id,
                action_text=r_text,
                priority="High",
                status="PROPOSED"
            )
            db.add(rec)

        # Generate Initial AI Investigation PDF Report
        print("Generating AI Investigation PDF Report...")
        ai_pdf_path = pdf_report_service.generate_investigation_pdf(
            claim_data={
                "id": claim.id,
                "claimant_name": claim.claimant_name,
                "claimant_contact": claim.claimant_contact,
                "claimant_email": claim.claimant_email,
                "policy_number": claim.policy_number,
                "vehicle": {
                    "registration_number": vehicle.registration_number,
                    "manufacturer": vehicle.manufacturer,
                    "model": vehicle.model,
                    "vehicle_type": vehicle.vehicle_type
                },
                "accident_date": claim.accident_date,
                "accident_time": claim.accident_time,
                "accident_location": claim.accident_location,
                "accident_type": claim.accident_type,
                "accident_description": claim.accident_description,
                "claimed_amount": claim.claimed_amount
            },
            evidence_list=[
                {"id": ev_img.id, "category": ev_img.category, "file_name": ev_img.file_name, "processing_status": "PROCESSED"},
                {"id": ev_pdf.id, "category": ev_pdf.category, "file_name": ev_pdf.file_name, "processing_status": "PROCESSED"}
            ],
            image_analysis={"detected_damage": cv_res["detected_damages"], "confidence": cv_res["confidence"], "status": "COMPLETED"},
            ocr_result={"extracted_fields": ocr_res["extracted_fields"]},
            findings=[
                {
                    "finding_type": "contradiction",
                    "title": fnd1.title,
                    "claimant_statement": fnd1.claimant_statement,
                    "image_analysis": fnd1.image_analysis,
                    "finding_text": fnd1.finding_text,
                    "possible_explanations": fnd1.possible_explanations,
                    "human_status": "pending"
                }
            ],
            recommendations=[{"action_text": r, "priority": "High"} for r in recs],
            report_type="ai"
        )

        rpt = InvestigationReportRecord(
            id="RPT-AI-0001",
            claim_id=claim.id,
            report_type="ai",
            pdf_path=ai_pdf_path,
            summary_json={"summary": "AI Inconsistency identified between rear statement and front damage."}
        )
        db.add(rpt)

        # Messages
        msg1 = MessageRecord(
            claim_id=claim.id,
            sender_id=ai_user.id,
            sender_name="CLAIMMIND AI Engine",
            sender_role="ai_investigator",
            recipient_role="human_investigator",
            message_text="AI Analysis flagged inconsistency: Stated rear-end collision vs visible front bumper deformation. Recommended requesting rear photos."
        )
        db.add(msg1)

        # Notifications
        notif1 = Notification(
            user_id=claimant.id,
            claim_id=claim.id,
            title="Claim Submitted Successfully",
            message=f"Claim {claim.id} is registered and currently in automated AI processing.",
            notification_type="SUBMITTED"
        )
        notif2 = Notification(
            user_id=claimant.id,
            claim_id=claim.id,
            title="Investigation In Progress",
            message=f"Autonomous AI analysis completed. Case transferred to Human Investigator {human_user.name}.",
            notification_type="INVESTIGATION_STARTED"
        )
        db.add(notif1)
        db.add(notif2)

        # Audit Log
        audit = AuditLogRecord(
            claim_id=claim.id,
            user_id=claimant.id,
            user_role="claimant",
            action="CLAIM_SUBMITTED",
            details="Seeded demonstration claim with photos and police report."
        )
        db.add(audit)

        db.commit()
        print("Seeding completed successfully for Three-Portal Architecture!")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
