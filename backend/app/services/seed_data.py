import os
import hashlib
from pathlib import Path
from sqlalchemy.orm import Session
from PIL import Image, ImageDraw, ImageFont

from app.config import UPLOAD_DIR, settings
from app.models.all_models import (
    User, Claim, EvidenceFile, RepairItem, DamageRecord, Contradiction,
    Hypothesis, PolicyClause, TimelineEvent, EvidenceGap, SettlementAssessment
)
from app.services.auth_service import hash_password
from app.services.forensics_service import forensics_service

def generate_sample_image(filename: str, title: str, subtitle: str, color_hex: str) -> str:
    """Generates a realistic mock vehicle damage photo for demonstration."""
    filepath = UPLOAD_DIR / filename
    if filepath.exists():
        return str(filepath)
        
    width, height = 800, 500
    img = Image.new("RGB", (width, height), color="#1e293b")
    draw = ImageDraw.Draw(img)

    # Draw simulated vehicle wireframe / bodywork outline
    draw.rectangle([60, 80, 740, 420], outline="#475569", width=3)
    draw.ellipse([140, 340, 240, 440], fill="#0f172a", outline="#64748b", width=3)
    draw.ellipse([560, 340, 660, 440], fill="#0f172a", outline="#64748b", width=3)

    # Highlight damage region
    draw.rectangle([100, 200, 380, 340], fill=color_hex, outline="#ef4444", width=3)
    
    # Text overlays
    draw.text((80, 100), "CLAIMMIND AI - MULTIMODAL EVIDENCE REPOSITORY", fill="#94a3b8")
    draw.text((80, 130), title.upper(), fill="#f8fafc")
    draw.text((80, 160), subtitle, fill="#cbd5e1")
    draw.text((120, 260), "[ VISUAL DAMAGE REGION DETECTED ]", fill="#ffffff")

    img.save(filepath, "JPEG")
    return str(filepath)

def seed_database(db: Session):
    """Seeds the 3 sample claims, users, repair items, and evidence files."""
    # 1. Users
    existing_admin = db.query(User).filter(User.username == "admin").first()
    if not existing_admin:
        users = [
            User(
                username="admin",
                email="admin@claimmind.ai",
                hashed_password=hash_password("admin123"),
                full_name="Sarah Jenkins (Lead Administrator)",
                role="admin"
            ),
            User(
                username="investigator",
                email="investigator@claimmind.ai",
                hashed_password=hash_password("investigator123"),
                full_name="Rajesh Sharma (Senior Claims Investigator)",
                role="investigator"
            ),
            User(
                username="reviewer",
                email="reviewer@claimmind.ai",
                hashed_password=hash_password("reviewer123"),
                full_name="Dr. Amanda Torres (Chief Review Officer)",
                role="reviewer"
            )
        ]
        db.add_all(users)
        db.commit()

    # 2. Check if Sample Claims already exist
    existing_claim = db.query(Claim).filter(Claim.id == "CLM-2026-001").first()
    if existing_claim:
        return

    # ==========================================
    # SAMPLE CLAIM A: CONTRADICTORY ACCIDENT
    # ==========================================
    img_a1 = generate_sample_image("sample_a_front_damage.jpg", "Sample A: Front Impact Area", "Severe front bumper deformation & cracked headlight", "#991b1b")
    sha_a1 = forensics_service.calculate_sha256(img_a1)
    phash_a1 = forensics_service.calculate_perceptual_hash(img_a1)

    claim_a = Claim(
        id="CLM-2026-001",
        claimant_name="Vikramaditya Verma",
        claimant_phone="+91 98450 11234",
        claimant_email="vikram.verma@example.com",
        policy_number="POL-2025-IND-8849",
        vehicle_reg="KA-01-MJ-4092",
        vehicle_make="Hyundai",
        vehicle_model="Creta SX(O)",
        vehicle_year=2024,
        accident_date="2026-03-15",
        accident_time="10:24 AM",
        accident_location="MG Road & Brigade Rd Intersection, Bengaluru",
        accident_type="Rear-End Collision",
        description="I was waiting at the red traffic signal on MG Road when another speeding vehicle abruptly struck my car from behind with heavy force. The impact jolted my vehicle forward.",
        requested_amount=48500.0,
        status="REQUIRES_REVIEW"
    )
    db.add(claim_a)

    ev_a1 = EvidenceFile(
        id="EVD-CLM001-01",
        claim_id="CLM-2026-001",
        filename="sample_a_front_damage.jpg",
        original_filename="IMG_20260315_FrontBumper.jpg",
        file_type="image/jpeg",
        file_size_bytes=os.path.getsize(img_a1),
        storage_path=img_a1,
        sha256_hash=sha_a1,
        perceptual_hash=phash_a1,
        category="photo",
        status="PROCESSED",
        metadata_json={"camera_make": "Samsung", "camera_model": "SM-G998B", "datetime": "2026-03-15 10:38:12"}
    )
    db.add(ev_a1)

    repair_items_a = [
        RepairItem(
            id="RPR-001-01",
            claim_id="CLM-2026-001",
            evidence_id="EVD-CLM001-01",
            component_name="Front Bumper Cover Assembly",
            part_number="HY-86511-M1000",
            action="Replace",
            quantity=1,
            unit_price=16500.0,
            labor_charges=3500.0,
            tax=3600.0,
            total_amount=23600.0,
            supported_status="SUPPORTED",
            damage_fingerprint_ref="FP-FRONT_BUMPER-DEFORMATION_&_CRACK-A1",
            notes="Visually verified with severe front bumper compression."
        ),
        RepairItem(
            id="RPR-001-02",
            claim_id="CLM-2026-001",
            evidence_id="EVD-CLM001-01",
            component_name="Left LED Headlamp Unit",
            part_number="HY-92101-M1000",
            action="Replace",
            quantity=1,
            unit_price=18500.0,
            labor_charges=2400.0,
            tax=4000.0,
            total_amount=24900.0,
            supported_status="SUPPORTED",
            damage_fingerprint_ref="FP-LEFT_HEADLIGHT-BROKEN_HEADLIGHT-A2",
            notes="Visually verified shattered left projector lens."
        )
    ]
    db.add_all(repair_items_a)

    # ==========================================
    # SAMPLE CLAIM B: REPAIR ESTIMATE MISMATCH
    # ==========================================
    img_b1 = generate_sample_image("sample_b_front_only.jpg", "Sample B: Front Damage Inspection", "Front fascia damage only; no rear contact", "#7c2d12")
    sha_b1 = forensics_service.calculate_sha256(img_b1)
    phash_b1 = forensics_service.calculate_perceptual_hash(img_b1)

    claim_b = Claim(
        id="CLM-2026-002",
        claimant_name="Pooja Nandakumar",
        claimant_phone="+91 97110 88219",
        claimant_email="pooja.nanda@example.com",
        policy_number="POL-2024-KA-9912",
        vehicle_reg="KA-05-NB-7721",
        vehicle_make="Tata",
        vehicle_model="Nexon EV Max",
        vehicle_year=2023,
        accident_date="2026-03-18",
        accident_time="03:45 PM",
        accident_location="Outer Ring Road, Marathahalli, Bengaluru",
        accident_type="Frontal Collision",
        description="While navigating congested traffic, the vehicle in front decelerated suddenly and my front bumper made contact with its tow bar.",
        requested_amount=62000.0,
        status="REQUIRES_REVIEW"
    )
    db.add(claim_b)

    ev_b1 = EvidenceFile(
        id="EVD-CLM002-01",
        claim_id="CLM-2026-002",
        filename="sample_b_front_only.jpg",
        original_filename="Front_Impact_Inspection.jpg",
        file_type="image/jpeg",
        file_size_bytes=os.path.getsize(img_b1),
        storage_path=img_b1,
        sha256_hash=sha_b1,
        perceptual_hash=phash_b1,
        category="photo",
        status="PROCESSED",
        metadata_json={"camera_make": "Apple", "camera_model": "iPhone 15 Pro", "datetime": "2026-03-18 16:02:44"}
    )
    db.add(ev_b1)

    repair_items_b = [
        RepairItem(
            id="RPR-002-01",
            claim_id="CLM-2026-002",
            evidence_id="EVD-CLM002-01",
            component_name="Front Bumper Fascia & Grille",
            part_number="TAT-5421-FB",
            action="Replace",
            quantity=1,
            unit_price=15000.0,
            labor_charges=3000.0,
            tax=3240.0,
            total_amount=21240.0,
            supported_status="SUPPORTED",
            damage_fingerprint_ref="FP-FRONT_BUMPER-DEFORMATION_&_CRACK-B1",
            notes="Direct visual correlation with detected front bumper impact."
        ),
        RepairItem(
            id="RPR-002-02",
            claim_id="CLM-2026-002",
            evidence_id="EVD-CLM002-01",
            component_name="Left Headlamp Assembly",
            part_number="TAT-5421-HL",
            action="Replace",
            quantity=1,
            unit_price=12000.0,
            labor_charges=2000.0,
            tax=2520.0,
            total_amount=16520.0,
            supported_status="SUPPORTED",
            damage_fingerprint_ref="FP-LEFT_HEADLIGHT-BROKEN_HEADLIGHT-B2",
            notes="Direct visual correlation with cracked left lens."
        ),
        RepairItem(
            id="RPR-002-03",
            claim_id="CLM-2026-002",
            evidence_id="EVD-CLM002-01",
            component_name="Rear Bumper Assembly Replacement",
            part_number="TAT-5421-RB",
            action="Replace",
            quantity=1,
            unit_price=18000.0,
            labor_charges=3500.0,
            tax=3870.0,
            total_amount=25370.0,
            supported_status="UNSUPPORTED",
            damage_fingerprint_ref=None,
            notes="NO VISUAL SUPPORT: Rear bumper replacement requested on frontal collision claim with no rear damage photographed."
        )
    ]
    db.add_all(repair_items_b)

    # ==========================================
    # SAMPLE CLAIM C: HISTORICAL IMAGE REUSE
    # ==========================================
    # Historical base claim from 2025
    claim_hist = Claim(
        id="CLM-2025-HIST-08",
        claimant_name="Karthik Subbaraj",
        claimant_phone="+91 99002 44331",
        claimant_email="karthik.sub@example.com",
        policy_number="POL-2024-HIST-110",
        vehicle_reg="KA-03-MD-1199",
        vehicle_make="Maruti Suzuki",
        vehicle_model="Swift ZXi",
        vehicle_year=2022,
        accident_date="2025-08-14",
        accident_time="02:15 PM",
        accident_location="Koramangala 80ft Road, Bengaluru",
        accident_type="Front Collision",
        description="Historical settled claim from August 2025 involving front bumper damage.",
        requested_amount=32000.0,
        status="COMPLETED"
    )
    db.add(claim_hist)

    # Historical photo
    img_hist = generate_sample_image("sample_hist_damage.jpg", "Historical Damage Photo (2025)", "Prior settled file photo", "#831843")
    sha_hist = forensics_service.calculate_sha256(img_hist)
    phash_hist = forensics_service.calculate_perceptual_hash(img_hist)

    ev_hist = EvidenceFile(
        id="EVD-HIST08-01",
        claim_id="CLM-2025-HIST-08",
        filename="sample_hist_damage.jpg",
        original_filename="Settled_Claim_FrontBumper_2025.jpg",
        file_type="image/jpeg",
        file_size_bytes=os.path.getsize(img_hist),
        storage_path=img_hist,
        sha256_hash=sha_hist,
        perceptual_hash=phash_hist,
        category="photo",
        status="PROCESSED"
    )
    db.add(ev_hist)

    # Current Claim C reusing identical/recompressed photo
    claim_c = Claim(
        id="CLM-2026-003",
        claimant_name="Aditya Singhania",
        claimant_phone="+91 98860 55123",
        claimant_email="aditya.s@example.com",
        policy_number="POL-2026-MH-4402",
        vehicle_reg="MH-02-CP-8841",
        vehicle_make="Maruti Suzuki",
        vehicle_model="Swift ZXi",
        vehicle_year=2022,
        accident_date="2026-03-22",
        accident_time="11:30 AM",
        accident_location="Andheri East, Mumbai",
        accident_type="Frontal Impact",
        description="Vehicle impacted high curb during tight parking manoeuvre causing front bumper damage.",
        requested_amount=34000.0,
        status="REQUIRES_REVIEW"
    )
    db.add(claim_c)

    ev_c1 = EvidenceFile(
        id="EVD-CLM003-01",
        claim_id="CLM-2026-003",
        filename="sample_hist_damage.jpg",  # Pointing to same perceptual hash
        original_filename="Parking_Impact_Photo_Current.jpg",
        file_type="image/jpeg",
        file_size_bytes=os.path.getsize(img_hist),
        storage_path=img_hist,
        sha256_hash=sha_hist,
        perceptual_hash=phash_hist,
        category="photo",
        status="PROCESSED",
        metadata_json={"forensic_flag": "PERCEPTUAL_DUPLICATE_IDENTIFIED"}
    )
    db.add(ev_c1)

    repair_items_c = [
        RepairItem(
            id="RPR-003-01",
            claim_id="CLM-2026-003",
            evidence_id="EVD-CLM003-01",
            component_name="Front Bumper Shell & Lower Grill",
            part_number="MS-71711-M68P00",
            action="Replace",
            quantity=1,
            unit_price=18000.0,
            labor_charges=3500.0,
            tax=3870.0,
            total_amount=25370.0,
            supported_status="SUPPORTED",
            notes="Item priced according to OEM catalogue."
        )
    ]
    db.add_all(repair_items_c)

    db.commit()
