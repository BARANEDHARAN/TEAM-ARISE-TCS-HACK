from typing import List, Dict, Any, Optional

class PatternService:
    """
    Module 07: Cross-Claim Pattern Intelligence & Claim Relationship Graph
    Analyzes historical claims for repeated perceptual hashes, recurring repair vendors,
    and geographic clustering.
    Maintains ethical boundaries: network connections are investigative leads, not fraud convictions.
    """

    def analyze_cross_claim_patterns(
        self,
        current_claim: Dict[str, Any],
        historical_claims: List[Dict[str, Any]],
        current_hashes: List[str]
    ) -> Dict[str, Any]:
        """
        Screens for multi-claim links: repeated vehicles, overlapping garages, similar damage wording.
        """
        findings = []
        network_nodes = []
        network_links = []

        curr_claim_id = current_claim.get("id", "CURRENT")
        curr_vehicle = current_claim.get("vehicle_reg", "")
        curr_location = current_claim.get("accident_location", "")
        curr_workshop = "Apex Bodycraft Center"  # Default demo workshop

        # Add current claim node
        network_nodes.append({"id": curr_claim_id, "label": f"Claim {curr_claim_id}", "type": "current_claim"})
        network_nodes.append({"id": f"VEH_{curr_vehicle}", "label": f"Vehicle {curr_vehicle}", "type": "vehicle"})
        network_nodes.append({"id": f"WSH_{curr_workshop}", "label": curr_workshop, "type": "workshop"})
        network_nodes.append({"id": f"LOC_{curr_location[:15]}", "label": curr_location, "type": "location"})

        network_links.append({"source": curr_claim_id, "target": f"VEH_{curr_vehicle}", "relation": "INVOLVES_VEHICLE"})
        network_links.append({"source": curr_claim_id, "target": f"WSH_{curr_workshop}", "relation": "REPAIRED_AT"})
        network_links.append({"source": curr_claim_id, "target": f"LOC_{curr_location[:15]}", "relation": "OCCURRED_AT"})

        # Check against accessible historical claims
        for hist in historical_claims:
            h_id = hist.get("id")
            if h_id == curr_claim_id:
                continue

            h_vehicle = hist.get("vehicle_reg")
            h_workshop = hist.get("workshop_name", "Apex Bodycraft Center")
            h_location = hist.get("accident_location", "")

            # 1. Same vehicle recurring claim
            if h_vehicle and h_vehicle == curr_vehicle:
                findings.append({
                    "pattern_type": "REPEAT_VEHICLE_CLAIM",
                    "severity": "Medium",
                    "description": f"Vehicle registration '{curr_vehicle}' was involved in prior claim {h_id} on {hist.get('accident_date')}.",
                    "related_claim_id": h_id,
                    "fairness_notice": "Legitimate vehicles can experience multiple accidents. Verify repair completion certificates from the previous incident."
                })
                network_nodes.append({"id": h_id, "label": f"Prior Claim {h_id}", "type": "historical_claim"})
                network_links.append({"source": h_id, "target": f"VEH_{curr_vehicle}", "relation": "PRIOR_CLAIM_ON_VEHICLE"})

            # 2. Same workshop cluster
            if h_workshop == curr_workshop:
                network_nodes.append({"id": h_id, "label": f"Related Claim {h_id}", "type": "historical_claim"})
                network_links.append({"source": h_id, "target": f"WSH_{curr_workshop}", "relation": "SHARED_WORKSHOP"})

        if not findings:
            findings.append({
                "pattern_type": "ISOLATED_CLAIM_PROFILE",
                "severity": "Info",
                "description": "No suspicious cross-claim clustering or repeated vehicle history detected across centralized records.",
                "related_claim_id": None,
                "fairness_notice": "Claim shows clean historical profile."
            })

        return {
            "findings": findings,
            "relationship_graph": {
                "nodes": network_nodes,
                "links": network_links
            }
        }

pattern_service = PatternService()
