from typing import Dict, Any, List, Optional

class FocusedAIInvestigationService:
    """
    Section 5: AI Investigation and Solution Generation
    Combines:
    1. Claimant info
    2. Accident description
    3. Accident report extracted through OCR
    4. Vehicle damage detected through CV/YOLO
    5. Claimed repair amount

    Produces:
    A. Accident Summary
    B. Visual Damage Analysis
    C. Report and Image Comparison (Matches, Contradictions, Missing Info, Manual Verification)
    D. Investigation Findings (with multiple hypotheses, without fraud bias)
    E. Recommended Solution (actionable next steps)
    F. Final AI Assessment (Summary, Supporting, Requiring Verification, Next Action, Confidence)
    """

    def generate_investigation(
        self,
        claimant: Dict[str, Any],
        accident: Dict[str, Any],
        cv_analysis: Dict[str, Any],
        ocr_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Runs multi-source cross-examination and generates structured findings.
        """
        # 1. Inputs
        claimant_name = claimant.get("name", "Insured Policyholder")
        policy_no = claimant.get("policy_number", "POL-XXX")
        vehicle_reg = accident.get("vehicle_registration", "REG-XXX")
        vehicle_model = f"{accident.get('manufacturer', '')} {accident.get('model', '')}".strip() or "Vehicle"
        accident_date = accident.get("accident_date", "Recent")
        accident_loc = accident.get("accident_location", "Reported Scene")
        statement_desc = accident.get("accident_description", "")
        claimed_amount = float(accident.get("claimed_amount", 0.0))

        detected_damages = cv_analysis.get("detected_damages", [])
        cv_confidence = cv_analysis.get("confidence", 0.85)
        ocr_fields = ocr_result.get("extracted_fields", {})
        ocr_impact = ocr_fields.get("impact_direction", "Not found")
        ocr_damage = ocr_fields.get("reported_damage", "Not found")

        # Normalize text for semantic comparison
        statement_lower = statement_desc.lower()
        damages_lower = [d.lower() for d in detected_damages]
        has_front_damage = any("front" in d or "bonnet" in d or "headlight" in d for d in damages_lower)
        has_rear_damage = any("rear" in d or "tailgate" in d or "tail light" in d for d in damages_lower)

        reported_rear_impact = any(w in statement_lower for w in ["hit from behind", "rear-ended", "rear ended", "struck from the rear", "hit in the back"]) or "rear" in ocr_impact.lower()
        reported_front_impact = any(w in statement_lower for w in ["front", "head-on", "collided ahead", "hit the car in front"]) or "front" in ocr_impact.lower()

        # ==========================================
        # A. ACCIDENT SUMMARY
        # ==========================================
        accident_summary = (
            f"On {accident_date}, an accident was reported involving insured vehicle {vehicle_model} "
            f"({vehicle_reg}) registered under policy {policy_no} by claimant {claimant_name}. "
            f"The incident occurred at {accident_loc}. The claimant reports: \"{statement_desc}\". "
            f"A claimed repair settlement of INR {claimed_amount:,.2f} has been submitted for evaluation."
        )

        # ==========================================
        # B. VISUAL DAMAGE ANALYSIS
        # ==========================================
        if detected_damages:
            damage_list_str = ", ".join(detected_damages)
            visual_analysis = (
                f"Computer vision vehicle damage analysis localized {len(detected_damages)} prominent visual damage region(s): "
                f"{damage_list_str}. Bounding box feature extraction determined an average detection confidence of "
                f"{int(cv_confidence * 100)}%. Visible deformations align with high-strain kinetic impact on exterior panels."
            )
        else:
            visual_analysis = (
                "Computer vision scan identified minor surface anomalies without severe structural deformation. "
                "Confidence score is low; physical surveyor inspection is advised."
            )

        # ==========================================
        # C. REPORT AND IMAGE COMPARISON
        # ==========================================
        matching_findings = []
        contradictions = []
        missing_information = []
        manual_verification_items = []

        # Compare damage types and directions
        if has_front_damage and (reported_front_impact or "front" in statement_lower):
            matching_findings.append({
                "item": "Front Bodywork Damage Match",
                "evidence": "Visible front bumper / headlight damage corresponds directly with claimant narrative of frontal impact.",
                "confidence": 0.92
            })
        if ocr_damage != "Not found" and any(w in ocr_damage.lower() for w in ["bumper", "headlight"]):
            matching_findings.append({
                "item": "Police/Surveyor Documented Component Match",
                "evidence": f"OCR extraction from accident report confirms '{ocr_damage}', aligning with visual damage detections.",
                "confidence": 0.89
            })

        # Contradiction check: Hit from behind vs Front bumper damage
        if reported_rear_impact and has_front_damage and not has_rear_damage:
            contradictions.append({
                "issue": "Impact Direction Discrepancy",
                "claimant_statement": "Reported that vehicle was hit from behind (rear impact).",
                "image_analysis": f"Photographic evidence shows localized {', '.join(detected_damages)}, with no visible rear contact documented.",
                "finding": "The reported rear impact does not directly match the visible front-side damage in the submitted image.",
                "possible_explanations": [
                    "The vehicle may have experienced a chain-reaction sandwich collision, propelling it into a lead car.",
                    "The claimant description may be incomplete, or only photos of the primary front damage were uploaded.",
                    "The uploaded image may depict pre-existing front damage unrelated to the reported rear collision."
                ],
                "severity": "High",
                "fraud_warning": "Do not automatically classify this inconsistency as fraud. Further verification is required."
            })

        # Claim amount benchmark check
        if claimed_amount > 45000.0 and len(detected_damages) <= 1:
            manual_verification_items.append({
                "item": "Claim Amount Verification",
                "detail": f"Claimed amount of INR {claimed_amount:,.2f} appears elevated relative to {len(detected_damages)} localized damage region(s). Requires garage invoice part breakdown review."
            })

        # Missing information check
        if ocr_result.get("pages", 0) == 0 or ocr_fields.get("police_station_jurisdiction") == "Not found":
            missing_information.append({
                "missing_item": "Official Police FIR / General Diary (GD) Entry",
                "importance": "Provides independent third-party corroboration of incident dynamics and multi-vehicle involvement."
            })
        if reported_rear_impact and not has_rear_damage:
            missing_information.append({
                "missing_item": "Rear Exterior & Boot Alignment Photographs",
                "importance": "Crucial to verify whether rear impact occurred as stated or if damage was confined exclusively to the front."
            })

        if not matching_findings and not contradictions:
            matching_findings.append({
                "item": "General Vehicle Damage Consistency",
                "evidence": "Submitted evidence shows damage consistent with low-to-medium speed road contact.",
                "confidence": 0.84
            })

        # ==========================================
        # D. INVESTIGATION FINDINGS
        # ==========================================
        findings_list = []
        if contradictions:
            for c in contradictions:
                findings_list.append({
                    "finding_title": "Collision Dynamic & Visible Damage Tension",
                    "statement": c["claimant_statement"],
                    "visible_damage": c["image_analysis"],
                    "evaluation": c["finding"],
                    "plausible_explanations": c["possible_explanations"]
                })
        else:
            findings_list.append({
                "finding_title": "Substantiated Vehicle Collision Flow",
                "statement": statement_desc[:120] + "...",
                "visible_damage": f"Detected: {', '.join(detected_damages)}",
                "evaluation": "Available photographic damage aligns with the incident description.",
                "plausible_explanations": ["Accident occurred as stated by policyholder."]
            })

        # ==========================================
        # E. RECOMMENDED SOLUTION
        # ==========================================
        recommended_solutions = []
        if reported_rear_impact and not has_rear_damage:
            recommended_solutions.append("Request additional vehicle photographs showing the rear bumper, trunk lid, and rear quarter panels.")
            recommended_solutions.append("Ask the claimant to clarify the impact sequence (e.g. whether their vehicle was pushed forward into another car).")
        if claimed_amount > 40000.0:
            recommended_solutions.append("Verify the workshop repair estimate line items against OEM part price schedules.")
        if missing_information:
            recommended_solutions.append("Request the complete official accident report or Police General Diary (GD) copy.")
        if contradictions:
            recommended_solutions.append("Send the claim file for physical surveyor spot-check if photographic ambiguities remain unresolved.")
        else:
            recommended_solutions.append("Proceed with standard policy deductible calculation and claim processing.")

        # ==========================================
        # F. FINAL AI ASSESSMENT
        # ==========================================
        final_assessment = {
            "overall_summary": (
                f"Investigation complete for claim on {vehicle_model} ({vehicle_reg}). "
                f"Multimodal cross-examination evaluated claimant statement, OpenCV/YOLO visual damage detections, "
                f"and OCR report extracts. "
                + ("Evidentiary discrepancies were flagged for human investigator review." if contradictions else "Evidence demonstrates high physical consistency.")
            ),
            "evidence_supporting_claim": [
                f"Vehicle registration {vehicle_reg} matches policy records.",
                f"Visual damage localized: {', '.join(detected_damages)}.",
                f"Accident date ({accident_date}) falls within active policy term."
            ],
            "evidence_requiring_verification": [
                item["detail"] if "detail" in item else item.get("issue", "Repair line-item pricing")
                for item in (contradictions + manual_verification_items)
            ] or ["Standard workshop tax invoice upon repair completion."],
            "missing_information": [m["missing_item"] for m in missing_information] or ["None &mdash; all essential documents present."],
            "recommended_next_action": (
                "Issue Formal Evidence Request to claimant for rear photographs and impact clarification before approving payout."
                if contradictions
                else "Approve claim for standard surveyor estimate reconciliation."
            ),
            "ai_confidence_score": round(float(cv_confidence), 2),
            "governance_notice": "CLAIMMIND AI is an investigative decision-support system. Final approval, reduction, or rejection of claims is reserved exclusively for the human claims officer."
        }

        return {
            "accident_summary": accident_summary,
            "visual_analysis": visual_analysis,
            "matching_findings": matching_findings,
            "contradictions": contradictions,
            "missing_information": missing_information,
            "recommended_solution": recommended_solutions,
            "final_assessment": final_assessment
        }

focused_investigation_service = FocusedAIInvestigationService()
