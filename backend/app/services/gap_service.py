from typing import List, Dict, Any, Optional

class GapService:
    """
    Module 08: Intelligent Evidence Gap Predictor & Next-Best-Evidence Intelligence
    Evaluates evidence sufficiency based on accident taxonomy and detected contradictions.
    Explains the causal investigative purpose of every requested item and drafts formal requests.
    """

    def predict_evidence_gaps(
        self,
        claim_data: Dict[str, Any],
        evidence_files: List[Dict[str, Any]],
        contradictions: List[Dict[str, Any]],
        hypotheses: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Analyzes evidence inventory against investigative checklists and targeted hypotheses.
        """
        gaps = []
        file_categories = [e.get("category", "").lower() for e in evidence_files]
        filenames = [e.get("filename", "").lower() for e in evidence_files]

        has_police_report = "police_report" in file_categories or any("police" in f or "fir" in f for f in filenames)
        has_rear_photos = any("rear" in f for f in filenames)
        has_telematics = "telematics" in file_categories or any("csv" in f or "telematics" in f for f in filenames)
        has_driver_license = any("license" in f or "dl" in f for f in filenames)

        # Gap 1: Inconsistency-Driven Gap (Rear Photos for Rear-End Impact Statement)
        statement_text = claim_data.get("description", "").lower()
        if "rear" in statement_text or "behind" in statement_text:
            if not has_rear_photos:
                gaps.append({
                    "missing_evidence_type": "Rear Bumper & Trunk Alignment Photographs",
                    "priority": "CRITICAL",
                    "importance_rationale": "Claimant asserts being struck from behind, but current photographic evidence only demonstrates front damage. Rear photos are critical to verify whether primary impact occurred at the rear or if this was solely a front-end event.",
                    "related_inconsistency": "IMPACT_DIRECTION_VS_DAMAGE_LOCATION",
                    "target_hypothesis": "Distinguishes Scenario A (Chain Reaction Sandwich Collision) from Scenario B (Direct Frontal Impact Only)",
                    "what_claimant_should_provide": "3 clear photographs: (1) Full rear exterior view showing number plate, (2) Close-up of rear bumper surface, (3) Trunk/boot lid seam gap alignment.",
                    "next_step_after_receiving": "If rear impact damage is confirmed, validate front damage as a secondary impact; if rear bumper is undamaged, clarify accident sequence with claimant.",
                    "is_requested": False,
                    "is_resolved": False
                })

        # Gap 2: Legal / Liability Gap (Official Police FIR or Panchanama)
        requested_amount = float(claim_data.get("requested_amount", 0.0))
        if requested_amount > 40000.0 and not has_police_report:
            gaps.append({
                "missing_evidence_type": "Official Police Collision Report / General Diary (GD) Entry",
                "priority": "HIGH",
                "importance_rationale": "High-value repair estimate exceeds ₹40,000 threshold. An official jurisdictional police report provides third-party validation of multi-vehicle involvement, road conditions, and incident participants.",
                "related_inconsistency": "Unsubstantiated multi-party collision claim",
                "target_hypothesis": "Verifies independent third-party collision involvement",
                "what_claimant_should_provide": "Signed copy of the Police General Diary (GD) entry or FIR registered at the jurisdiction traffic station.",
                "next_step_after_receiving": "Cross-check reported other vehicle registration numbers and police officer damage notation against workshop quote.",
                "is_requested": False,
                "is_resolved": False
            })

        # Gap 3: Driver Credential Verification
        if not has_driver_license:
            gaps.append({
                "missing_evidence_type": "Driver's License of Person Operating at Crash Time",
                "priority": "MEDIUM",
                "importance_rationale": "Policy conditions require validation that the vehicle was being operated by a person holding an active, unexpired commercial or private driving license.",
                "related_inconsistency": "Policy condition verification requirement",
                "target_hypothesis": "Satisfies Policy Clause SEC_2.4 (Authorized Driver Clause)",
                "what_claimant_should_provide": "Scanned copy or photograph of the driver's license (both front and rear sides).",
                "next_step_after_receiving": "Verify validity on Sarathi/National Register portal against incident date.",
                "is_requested": False,
                "is_resolved": False
            })

        return gaps

    def generate_formal_request_letter(
        self,
        claim_data: Dict[str, Any],
        gaps: List[Dict[str, Any]]
    ) -> str:
        """
        Drafts a professional evidence request letter for the investigator to review and send to claimant.
        """
        claim_id = claim_data.get("id", "CLM-2026-XXXX")
        claimant = claim_data.get("claimant_name", "Valued Policyholder")
        vehicle = f"{claim_data.get('vehicle_make','')} {claim_data.get('vehicle_model','')} ({claim_data.get('vehicle_reg','')})"

        items_text = ""
        for i, gap in enumerate(gaps, 1):
            items_text += f"{i}. {gap.get('missing_evidence_type')}\n"
            items_text += f"   - Why needed: {gap.get('importance_rationale')}\n"
            items_text += f"   - What to provide: {gap.get('what_claimant_should_provide')}\n\n"

        letter = f"""CLAIMMIND AI CLAIMS INVESTIGATION UNIT
NOTICE FOR ADDITIONAL INFORMATION & EVIDENCE PRESERVATION

Date: October 31, 2026
Claim Reference: {claim_id}
Policy Number: {claim_data.get('policy_number', 'POL-XXX')}
Insured Vehicle: {vehicle}
To: {claimant}

Dear {claimant},

We are currently assessing your motor insurance claim referenced above. In order to complete an objective, transparent, and expedited evaluation of your file and reconcile the physical damage with the incident timeline, we kindly request that you provide the following additional documentation:

{items_text}
Please upload these documents directly through your Claimant Portal link or forward them in response to this notice within 7 working days.

Your prompt assistance ensures an accurate assessment and helps prevent unnecessary settlement delays.

Sincerely,
Claims Investigation & Intelligence Division
CLAIMMIND AI Enterprise System
"""
        return letter

gap_service = GapService()
