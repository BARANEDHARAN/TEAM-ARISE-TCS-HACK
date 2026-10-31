import sys
import os
from pathlib import Path

# Add backend directory to path
sys.path.append(str(Path(__file__).resolve().parent))

import fitz  # PyMuPDF
from app.config import UPLOAD_DIR
from app.database import SessionLocal, engine, Base
from app.models.focused_models import Claimant, Accident, Evidence, ImageAnalysis, InvestigationResult
from app.services.focused_cv_service import focused_cv_service
from app.services.focused_ocr_service import focused_ocr_service
from app.services.focused_investigation_service import focused_investigation_service

def seed():
    print("Initializing Database Tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing = db.query(Accident).filter(Accident.id == "ACC-2026-0001").first()
        if existing:
            print("ACC-2026-0001 already seeded.")
            return

        print("Seeding Claimant & Accident...")
        claimant = Claimant(
            name="Rajesh Sharma",
            contact="+91 98201 44321",
            email="rajesh.sharma@example.com",
            policy_number="POL-MUM-892147"
        )
        db.add(claimant)
        db.commit()
        db.refresh(claimant)

        accident = Accident(
            id="ACC-2026-0001",
            claimant_id=claimant.id,
            vehicle_registration="MH 02 EE 4519",
            manufacturer="Honda",
            model="City",
            vehicle_type="Sedan",
            accident_date="2026-10-24",
            accident_location="Western Express Highway, Goregaon, Mumbai",
            accident_type="Rear-End Collision",
            accident_description="Vehicle was stationary at a red signal when another car struck us firmly from behind.",
            claimed_amount=48500.0
        )
        db.add(accident)
        db.commit()
        db.refresh(accident)

        # 1. Create a real sample Accident Report PDF in uploads/
        pdf_filename = "police_accident_report_ACC0001.pdf"
        pdf_path = UPLOAD_DIR / pdf_filename
        doc = fitz.open()
        page = doc.new_page(width=595, height=842) # A4
        text_content = """TRAFFIC POLICE ACCIDENT & INCIDENT REPORT
Report ID: FIR-2026-MUM-9812
Date of Incident: 2026-10-24 18:45 IST
Location: Western Express Highway, Goregaon flyover junction, Mumbai

VEHICLE & CLAIMANT DETAILS:
Vehicle Registration: MH 02 EE 4519
Vehicle Model: Honda City Sedan (Silver Metallic)
Registered Owner / Driver: Rajesh Sharma
Insurance Policy Number: POL-MUM-892147

INCIDENT SUMMARY & DESCRIPTION:
Driver reports that vehicle MH 02 EE 4519 was stationary in the middle lane at Goregaon traffic signal.
Third-party vehicle (Registration MH 04 AB 1120) approached from the rear and initiated a rear-end collision.

REPORTED PHYSICAL DAMAGE:
Rear bumper cracked and deformed. Tailgate lock misaligned.
Officer Note: Investigating surveyor should also check forward bumper condition for secondary impact against barrier.

PARTIES INVOLVED:
Party 1: Rajesh Sharma (Honda City MH 02 EE 4519)
Party 2: Amit Verma (Hyundai Creta MH 04 AB 1120)

WEATHER & CONDITIONS: Clear roadway, dry asphalt, signal functioning normally.
"""
        page.insert_text((50, 60), text_content, fontsize=10)
        doc.save(str(pdf_path))
        doc.close()
        print(f"Generated realistic PDF report at {pdf_path}")

        # 2. Add Evidence records
        img_name = "sample_a_front_damage.jpg"
        img_path = UPLOAD_DIR / img_name

        ev_img = Evidence(
            id="EVD-IMG-001",
            accident_id=accident.id,
            file_name=img_name,
            file_type="image",
            file_path=str(img_path),
            processing_status="PROCESSED"
        )
        db.add(ev_img)

        ev_pdf = Evidence(
            id="EVD-PDF-001",
            accident_id=accident.id,
            file_name=pdf_filename,
            file_type="pdf",
            file_path=str(pdf_path),
            extracted_text=text_content,
            processing_status="PROCESSED"
        )
        db.add(ev_pdf)
        db.commit()

        # 3. Process CV on image
        print("Running Computer Vision damage detection...")
        cv_res = focused_cv_service.process_accident_image(
            image_path=str(img_path),
            accident_context={
                "description": accident.accident_description,
                "accident_type": accident.accident_type
            }
        )

        img_analysis = ImageAnalysis(
            id="IMG-0001",
            accident_id=accident.id,
            detected_damage=cv_res["detected_damages"],
            confidence=cv_res["confidence"],
            processed_image_path=cv_res["processed_image_url"],
            bounding_boxes=cv_res["bounding_boxes"],
            analysis_status=cv_res["status"]
        )
        db.add(img_analysis)
        db.commit()

        # 4. Extract OCR
        print("Running OCR extraction...")
        ocr_res = focused_ocr_service.extract_document_text(str(pdf_path))

        # 5. Run AI Investigation
        print("Synthesizing AI Investigation Findings...")
        ai_res = focused_investigation_service.generate_investigation(
            claimant={"name": claimant.name, "policy_number": claimant.policy_number},
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
            cv_analysis={"detected_damages": cv_res["detected_damages"], "confidence": cv_res["confidence"]},
            ocr_result={"extracted_fields": ocr_res["extracted_fields"]}
        )

        inv_result = InvestigationResult(
            id="RES-0001",
            accident_id=accident.id,
            accident_summary=ai_res["accident_summary"],
            visual_analysis=ai_res["visual_analysis"],
            matching_findings=ai_res["matching_findings"],
            contradictions=ai_res["contradictions"],
            missing_information=ai_res["missing_information"],
            recommended_solution=ai_res["recommended_solution"],
            final_assessment=ai_res["final_assessment"]
        )
        db.add(inv_result)
        db.commit()

        print(f"Successfully seeded demonstration case {accident.id}!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
