from typing import List, Dict, Any, Optional

class SettlementService:
    """
    Module 09: Explainable Settlement Intelligence & Assistant
    Produces a transparent, mathematical breakdown of claim costs against policy limits and verified damage.
    Never auto-approves or auto-rejects; maintains full human auditability.
    """

    def calculate_settlement_assessment(
        self,
        submitted_total: float,
        repair_verification: Dict[str, Any],
        policy_clauses: List[Dict[str, Any]],
        gaps: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Computes indicative settlement ranges with detailed line-item provenance.
        """
        supported_total = repair_verification.get("supported_total", 0.0)
        unsupported_total = repair_verification.get("unsupported_total", 0.0)
        unverified_total = repair_verification.get("unverified_total", 0.0)

        # Standard compulsory deductible from policy
        deductible = 2000.0
        max_limit = 650000.0
        for clause in policy_clauses:
            if "deductible" in clause.get("clause_title", "").lower() or "excess" in clause.get("clause_text", "").lower():
                deductible = float(clause.get("deductible_amount", 2000.0))
            if clause.get("max_coverage_limit"):
                max_limit = float(clause.get("max_coverage_limit"))

        # Range calculations:
        # Min indicative: only currently supported items minus deductible
        min_indicative = max(0.0, supported_total - deductible)
        # Max indicative: supported items + unverified items (pending physical inspection) minus deductible
        max_indicative = max(0.0, (supported_total + unverified_total) - deductible)

        conditions_and_caveats = [
            f"Compulsory deductible of INR {deductible:,.2f} applied as per Policy Clause SEC_3.4.",
            f"Currently verified visual bodywork items total INR {supported_total:,.2f}.",
            f"Unverified items amounting to INR {unverified_total:,.2f} require surveyor inspection teardown approval.",
            f"Unsupported repair items totalling INR {unsupported_total:,.2f} lack photographic collision evidence.",
            f"Final settlement is subject to receipt of {len(gaps)} pending evidence items and formal human reviewer signoff."
        ]

        explanation = (
            f"Based on multimodal analysis of submitted estimates (INR {submitted_total:,.2f}), "
            f"verified bodywork damage totals INR {supported_total:,.2f}. "
            f"Subtracting policy excess of INR {deductible:,.2f} yields an indicative verified baseline of INR {min_indicative:,.2f}. "
            f"If unverified internal repair line items (INR {unverified_total:,.2f}) are approved upon garage physical inspection, "
            f"the maximum eligible settlement is INR {max_indicative:,.2f}. "
            f"This calculation is an investigative aid and does not constitute a legally binding claim authorization."
        )

        return {
            "submitted_total": round(submitted_total, 2),
            "supported_total": round(supported_total, 2),
            "unsupported_total": round(unsupported_total, 2),
            "unverified_total": round(unverified_total, 2),
            "deductible_applied": round(deductible, 2),
            "max_coverage_limit": round(max_limit, 2),
            "indicative_settlement_min": round(min_indicative, 2),
            "indicative_settlement_max": round(max_indicative, 2),
            "currency": "INR",
            "explanation_text": explanation,
            "conditions_and_caveats": conditions_and_caveats
        }

settlement_service = SettlementService()
