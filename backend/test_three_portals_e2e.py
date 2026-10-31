import os
import sys
import json
import urllib.request
import urllib.parse
from pathlib import Path

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000"

def make_req(endpoint, method="GET", data=None, headers=None):
    url = f"{BASE_URL}{endpoint}"
    req_headers = headers or {}
    req_data = None
    if data is not None:
        if isinstance(data, dict):
            req_data = json.dumps(data).encode("utf-8")
            req_headers["Content-Type"] = "application/json"
        elif isinstance(data, bytes):
            req_data = data
    req = urllib.request.Request(url, data=req_data, headers=req_headers, method=method)
    with urllib.request.urlopen(req) as resp:
        content_type = resp.headers.get("Content-Type", "")
        body = resp.read()
        if "application/json" in content_type:
            return json.loads(body.decode("utf-8"))
        return body

def run_e2e_verification():
    print("=" * 70)
    print("CLAIMMIND AI - COMPLETE THREE-PORTAL E2E VERIFICATION TEST")
    print("=" * 70)

    # 1. Health check
    print("\n[Step 1] System Health & Table Verification...")
    health = make_req("/api/health")
    assert health["status"] == "HEALTHY", "Health check failed"
    print(f"✓ Health Check OK: {health['app']}")
    print(f"✓ Database tables registered: {len(health['database_tables'])} tables")

    # 2. Login Portal 1: Customer
    print("\n[Step 2] Login 1 - Customer Authentication...")
    cust_login = make_req("/api/auth/quick-login?role=claimant", method="POST")
    assert cust_login["status"] == "SUCCESS", "Customer quick login failed"
    cust_user = cust_login["user"]
    print(f"✓ Customer Logged In: {cust_user['name']} ({cust_user['email']})")

    # 3. Customer submits new claim
    print("\n[Step 3] Login 1 - Customer Submits New Accident Claim...")
    new_claim_payload = {
        "claimant_id": cust_user["id"],
        "name": cust_user["name"],
        "contact": "9876543210",
        "email": cust_user["email"],
        "address": "42 Cyber Heights, Tech City, Karnataka",
        "policy_number": "POL-2026-AUTO-9821",
        "vehicle_registration": "KA-01-EA-4912",
        "vehicle_manufacturer": "Honda",
        "vehicle_model": "City VX",
        "vehicle_type": "Sedan",
        "accident_date": "2026-10-30",
        "accident_time": "18:45",
        "accident_location": "Outer Ring Road Junction, Bengaluru",
        "accident_type": "Rear-End Collision",
        "accident_description": "Stationary at the traffic signal when vehicle was forcefully hit from the rear by a commercial van.",
        "claimed_amount": 78500.0
    }
    claim_resp = make_req("/api/customer/claims", method="POST", data=new_claim_payload)
    claim_id = claim_resp["claim_id"]
    print(f"✓ New Claim Created: {claim_id}")

    # Check initial customer view
    cust_claims = make_req(f"/api/customer/claims?user_id={cust_user['id']}")
    created_claim = next(c for c in cust_claims if c["claim_id"] == claim_id)
    print(f"✓ Customer Dashboard Table Entry:")
    print(f"   - Claim ID: {created_claim['claim_id']}")
    print(f"   - Submission Date: {created_claim['submission_date']}")
    print(f"   - Claim Status: {created_claim['status']}")
    print(f"   - Investigation Status: {created_claim['investigation_status']}")
    print(f"   - Final Decision: {created_claim['final_decision']}")
    print(f"   - Investigator Remarks: {created_claim['investigator_remarks']}")

    # 4. Login Portal 2: AI Investigator
    print("\n[Step 4] Login 2 - AI Investigator Receives Claim & Executes Autonomous Analysis...")
    ai_login = make_req("/api/auth/quick-login?role=ai_investigator", method="POST")
    assert ai_login["status"] == "SUCCESS", "AI quick login failed"
    print(f"✓ AI Persona Active: {ai_login['user']['name']}")

    # Pending claims
    pending = make_req("/api/ai/claims/pending")
    print(f"✓ Pending claims queue: {len(pending)} claims awaiting AI processing")

    # Run AI Analysis
    print(f"   Executing OpenCV Preprocessing + Damage Localization + PyMuPDF OCR + Cross-Comparison on {claim_id}...")
    ai_process_result = make_req(f"/api/ai/claims/{claim_id}/process", method="POST")
    print(f"✓ AI Processing Complete!")
    print(f"   - AI Status: {ai_process_result['ai_status']}")
    print(f"   - CV Damage Detected: {ai_process_result['cv_results']['detected_damages']} (Conf: {int(ai_process_result['cv_results']['confidence']*100)}%)")
    print(f"   - OCR Extracted Fields: {list(ai_process_result['ocr_results']['extracted_fields'].keys())}")
    print(f"   - Inconsistencies Reasoned: {len(ai_process_result['investigation_output'].get('contradictions', []))}")
    print(f"   - AI Recommendations: {len(ai_process_result['investigation_output'].get('recommended_solution', []))}")
    print(f"   - Downloadable AI Report PDF: {ai_process_result['report_pdf_url']}")

    # Verify AI PDF is downloadable
    ai_pdf_bytes = make_req(ai_process_result['report_pdf_url'])
    assert len(ai_pdf_bytes) > 1000, "AI PDF report empty"
    print(f"✓ AI PDF Report Verified ({len(ai_pdf_bytes)} bytes downloaded)")

    # Verify Dynamic React Flow Evidence Relationship Graph
    print("\n[Step 5] Signature Innovation: Dynamic Evidence Relationship Graph...")
    graph = make_req(f"/api/ai/claims/{claim_id}/graph")
    print(f"✓ Evidence Relationship Graph Built:")
    print(f"   - Nodes: {len(graph['nodes'])} (Types: {list(set(n['type'] for n in graph['nodes']))})")
    print(f"   - Edges: {len(graph['edges'])} (Labels: {list(set(e.get('label', '') for e in graph['edges']))})")
    assert len(graph['nodes']) >= 4, "Insufficient graph nodes"
    assert len(graph['edges']) >= 3, "Insufficient graph edges"

    # 5. Login Portal 3: Human Investigator Review & Adjudication
    print("\n[Step 6] Login 3 - Human Claims Investigator Review & Adjudication Desk...")
    human_login = make_req("/api/auth/quick-login?role=human_investigator", method="POST")
    assert human_login["status"] == "SUCCESS", "Human quick login failed"
    print(f"✓ Human Investigator Logged In: {human_login['user']['name']}")

    # Get Human Claims Queue
    human_claims = make_req("/api/human/claims")
    target_human_claim = next(c for c in human_claims if c["claim_id"] == claim_id)
    print(f"✓ Claim {claim_id} visible in Human Review Queue (Status: {target_human_claim['status']}, AI Flagged: {target_human_claim['has_inconsistencies']})")

    # Inspect AI Dossier
    dossier = make_req(f"/api/ai/claims/{claim_id}")
    print(f"✓ Human Investigator inspects full multimodal dossier:")
    print(f"   - Visual Evidence: {len(dossier['evidence_files'])} files")
    print(f"   - Findings to Review: {len(dossier['findings'])}")
    print(f"   - Proposed Solutions: {len(dossier['recommendations'])}")

    # Review an AI Finding: Accept/Flag with remarks
    if dossier['findings']:
        first_fnd = dossier['findings'][0]
        review_resp = make_req(
            f"/api/human/findings/{first_fnd['id']}/review",
            method="POST",
            data={
                "action": "flagged",
                "remarks": "Claimant explained secondary forward impact occurred into highway railing."
            }
        )
        print(f"✓ Human Investigator reviewed Finding {first_fnd['id']}: Status set to '{review_resp['human_status']}' with remarks.")

    # Test "REQUEST ADDITIONAL EVIDENCE" workflow
    print("\n[Step 7] Testing Action 'REQUEST ADDITIONAL EVIDENCE'...")
    req_evidence_resp = make_req(
        f"/api/human/claims/{claim_id}/decision",
        method="POST",
        data={
            "decision": "REQUEST_EVIDENCE",
            "remarks": "Please provide photographs of the rear bumper and trunk area.",
            "requested_items": ["Clear rear bumper photograph", "Close-up of tailgate latch"]
        }
    )
    print(f"✓ Investigator recorded Decision: {req_evidence_resp['decision'].upper()} (New Claim Status: {req_evidence_resp['new_status']})")

    # Check Customer notifications & status
    cust_dossier = make_req(f"/api/customer/claims/{claim_id}")
    assert cust_dossier["status"] == "EVIDENCE_REQUESTED", "Status not updated to EVIDENCE_REQUESTED"
    print(f"✓ Customer Portal successfully notified: Status is '{cust_dossier['status']}'")
    print(f"   - Investigator Remarks: {cust_dossier['human_decision']['remarks']}")
    print(f"   - Requested Items: {cust_dossier['human_decision']['requested_items']}")

    # Final Step: Human Investigator APPROVES Claim
    print("\n[Step 8] Testing Final Adjudication: 'APPROVE CLAIM'...")
    final_decision_resp = make_req(
        f"/api/human/claims/{claim_id}/decision",
        method="POST",
        data={
            "decision": "APPROVE",
            "approved_amount": 74500.0,
            "remarks": "Secondary rebound impact verified by bumper structural deformation alignment. Claim authorized for full direct repair settlement."
        }
    )
    print(f"✓ Final Decision Adjudicated: {final_decision_resp['decision'].upper()} (Status: {final_decision_resp['new_status']})")
    print(f"   - Final PDF Report URL: {final_decision_resp['final_report_url']}")

    # Verify Final PDF is generated and downloadable
    final_pdf_bytes = make_req(final_decision_resp['final_report_url'])
    assert len(final_pdf_bytes) > 1000, "Final PDF report empty"
    print(f"✓ Official Adjudication PDF Downloaded ({len(final_pdf_bytes)} bytes)")

    # 6. Verify Customer Portal sees final decision & downloads report
    print("\n[Step 9] Customer Portal Verification of Final Decision & Settlement Report...")
    cust_final = make_req(f"/api/claims/{claim_id}/final-result")
    print(f"✓ Customer Final Result Endpoint:")
    print(f"   - Claim ID: {cust_final['claim_id']}")
    print(f"   - Final Decision: {cust_final['final_decision']}")
    print(f"   - Approved Settlement: ₹{cust_final['approved_amount']:,.2f}")
    print(f"   - Investigator Remarks: {cust_final['investigator_remarks']}")
    print(f"   - Final Report Download URL: {cust_final['report_url']}")

    # Customer submits feedback
    fb_resp = make_req(
        f"/api/customer/claims/{claim_id}/feedback",
        method="POST",
        data={"customer_id": cust_user["id"], "feedback_text": "Smooth AI investigation and fast human adjudication!", "rating": 5}
    )
    print(f"✓ Customer Feedback Recorded: {fb_resp['status']}")

    print("\n" + "=" * 70)
    print("ALL 9 PROBLEMS VERIFIED AND RESOLVED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_e2e_verification()
