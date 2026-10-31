from typing import List, Dict, Any, Optional

class RepairService:
    """
    Module 04: Visual-to-Invoice Cost Intelligence
    Cross-checks workshop repair estimate line items against visual damage fingerprints.
    Generates the Repair Necessity Graph:
    Visible Damage -> Vehicle Component -> Proposed Repair -> Repair Cost.
    """

    def verify_repair_estimates(
        self,
        repair_items: List[Dict[str, Any]],
        damage_records: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Cross-references each repair item against detected damage fingerprints.
        Marks items as SUPPORTED, UNSUPPORTED, or UNVERIFIED.
        """
        verified_items = []
        supported_total = 0.0
        unsupported_total = 0.0
        unverified_total = 0.0
        submitted_total = 0.0

        necessity_graph_nodes = []
        necessity_graph_edges = []

        # Map detected damage by component keyword
        detected_map = {}
        for d in damage_records:
            comp_key = d.get("component", "").lower()
            detected_map[comp_key] = d

        for item in repair_items:
            comp_name = item.get("component_name", "")
            comp_lower = comp_name.lower()
            total_cost = float(item.get("total_amount", 0.0))
            submitted_total += total_cost

            # Check visual correspondence
            matched_damage = None
            for key, d_val in detected_map.items():
                # Matching logic: e.g. "front bumper" matches "front bumper cover assembly"
                parts = key.split()
                if all(p in comp_lower for p in parts) or key in comp_lower or comp_lower in key:
                    matched_damage = d_val
                    break

            if matched_damage:
                status = "SUPPORTED"
                fingerprint = matched_damage.get("fingerprint")
                notes = f"Visually verified by damage detection {fingerprint} ({matched_damage.get('damage_type')}, confidence: {matched_damage.get('confidence')*100:.0f}%)."
                supported_total += total_cost
            elif "clip" in comp_lower or "bracket" in comp_lower or "paint" in comp_lower or "alignment" in comp_lower or "labor" in comp_lower:
                status = "UNVERIFIED"
                fingerprint = None
                notes = "Ancillary repair or internal mechanical adjustment. Requires physical surveyor teardown report."
                unverified_total += total_cost
            else:
                status = "UNSUPPORTED"
                fingerprint = None
                notes = "No visible external damage detected in submitted photographs. Flagged for surveyor inspection."
                unsupported_total += total_cost

            verified_item = {
                **item,
                "supported_status": status,
                "damage_fingerprint_ref": fingerprint,
                "notes": notes
            }
            verified_items.append(verified_item)

            # Build Repair Necessity Graph representation
            node_id = f"repair_{item.get('id', comp_name)}"
            necessity_graph_nodes.append({
                "id": node_id,
                "type": "repair_node",
                "label": comp_name,
                "cost": total_cost,
                "status": status,
                "damage_ref": fingerprint
            })
            if matched_damage:
                dmg_node_id = f"dmg_{matched_damage.get('id', matched_damage.get('fingerprint'))}"
                necessity_graph_edges.append({
                    "from": dmg_node_id,
                    "to": node_id,
                    "relationship": "CORRESPONDS_TO",
                    "evidence_id": matched_damage.get("evidence_id")
                })

        return {
            "verified_items": verified_items,
            "submitted_total": round(submitted_total, 2),
            "supported_total": round(supported_total, 2),
            "unsupported_total": round(unsupported_total, 2),
            "unverified_total": round(unverified_total, 2),
            "necessity_graph": {
                "nodes": necessity_graph_nodes,
                "edges": necessity_graph_edges
            }
        }

repair_service = RepairService()
