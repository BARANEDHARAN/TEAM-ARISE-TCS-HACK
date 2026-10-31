from typing import Dict, Any, List

class GraphService:
    """
    Signature Innovation 01: Dynamic Evidence Intelligence Graph
    Constructs a connected knowledge graph of all claim entities, evidence sources,
    contradictions, and hypotheses formatted directly for React Flow interactive rendering.
    """

    def build_claim_graph(
        self,
        claim: Any,
        evidence_files: List[Any],
        damage_records: List[Any],
        contradictions: List[Any],
        hypotheses: List[Any],
        policy_clauses: List[Any],
        repair_items: List[Any],
        timeline_events: List[Any],
        findings: List[Any]
    ) -> Dict[str, Any]:
        """
        Converts relational claim entities into interactive React Flow nodes and edges.
        """
        nodes = []
        edges = []

        # Center Root Node: The Claim
        claim_node_id = f"claim_{claim.id}"
        nodes.append({
            "id": claim_node_id,
            "type": "claimNode",
            "position": {"x": 500, "y": 300},
            "data": {
                "label": f"Claim: {claim.id}",
                "title": f"{claim.vehicle_make} {claim.vehicle_model}",
                "subtitle": f"Status: {claim.status}",
                "entityType": "CLAIM",
                "badge": claim.accident_type,
                "amount": f"₹{claim.requested_amount:,.0f}",
                "id": claim.id
            }
        })

        # Statement Node
        stmt_id = f"stmt_{claim.id}"
        nodes.append({
            "id": stmt_id,
            "type": "statementNode",
            "position": {"x": 200, "y": 120},
            "data": {
                "label": "Claimant Statement",
                "title": f"By: {claim.claimant_name}",
                "subtitle": claim.description[:70] + "..." if len(claim.description) > 70 else claim.description,
                "entityType": "STATEMENT",
                "badge": "Narrative",
                "id": stmt_id
            }
        })
        edges.append({
            "id": f"e_stmt_{claim.id}",
            "source": stmt_id,
            "target": claim_node_id,
            "label": "DESCRIBES_INCIDENT",
            "animated": False,
            "style": {"stroke": "#2563eb", "strokeWidth": 2}
        })

        # Evidence Photo Nodes
        photo_x = 200
        photo_y = 480
        for i, ev in enumerate(evidence_files):
            ev_id = f"ev_{ev.id}"
            nodes.append({
                "id": ev_id,
                "type": "evidenceNode",
                "position": {"x": photo_x + (i * 220), "y": photo_y},
                "data": {
                    "label": f"Evidence: {ev.category.upper()}",
                    "title": ev.original_filename,
                    "subtitle": f"SHA: {ev.sha256_hash[:8]}... | pHash: {ev.perceptual_hash[:8] if ev.perceptual_hash else 'N/A'}",
                    "entityType": "EVIDENCE",
                    "badge": ev.category,
                    "id": ev.id
                }
            })
            edges.append({
                "id": f"e_ev_{ev.id}",
                "source": ev_id,
                "target": claim_node_id,
                "label": "SUBMITTED_FOR",
                "style": {"stroke": "#0284c7"}
            })

        # Damage Records Nodes
        dmg_x = 750
        dmg_y = 480
        for i, dmg in enumerate(damage_records):
            dmg_id = f"dmg_{dmg.id}"
            nodes.append({
                "id": dmg_id,
                "type": "damageNode",
                "position": {"x": dmg_x + (i * 220), "y": dmg_y + (i * 70)},
                "data": {
                    "label": f"Damage: {dmg.component}",
                    "title": dmg.damage_type,
                    "subtitle": f"Fingerprint: {dmg.fingerprint}",
                    "entityType": "DAMAGE",
                    "badge": f"{int(dmg.confidence * 100)}% Conf",
                    "id": dmg.id
                }
            })
            # Connect photo to damage
            if dmg.evidence_id:
                edges.append({
                    "id": f"e_photo_dmg_{dmg.id}",
                    "source": f"ev_{dmg.evidence_id}",
                    "target": dmg_id,
                    "label": "SHOWS_DAMAGE",
                    "style": {"stroke": "#ea580c", "strokeWidth": 2}
                })

        # Repair Items Nodes
        repair_x = 1050
        repair_y = 300
        for i, rpr in enumerate(repair_items):
            rpr_id = f"rpr_{rpr.id}"
            nodes.append({
                "id": rpr_id,
                "type": "repairNode",
                "position": {"x": repair_x, "y": repair_y + (i * 90)},
                "data": {
                    "label": f"Repair: {rpr.component_name}",
                    "title": f"Cost: ₹{rpr.total_amount:,.0f}",
                    "subtitle": f"Status: {rpr.supported_status}",
                    "entityType": "REPAIR_ITEM",
                    "badge": rpr.supported_status,
                    "id": rpr.id
                }
            })
            # Connect repair to claim
            edges.append({
                "id": f"e_rpr_claim_{rpr.id}",
                "source": rpr_id,
                "target": claim_node_id,
                "label": "INVOICED_FOR",
                "style": {"stroke": "#16a34a" if rpr.supported_status == "SUPPORTED" else "#dc2626"}
            })
            # If damage fingerprint matches, connect damage to repair
            if rpr.damage_fingerprint_ref:
                for dmg in damage_records:
                    if dmg.fingerprint == rpr.damage_fingerprint_ref:
                        edges.append({
                            "id": f"e_dmg_rpr_{rpr.id}",
                            "source": f"dmg_{dmg.id}",
                            "target": rpr_id,
                            "label": "CORRESPONDS_TO",
                            "animated": True,
                            "style": {"stroke": "#16a34a", "strokeWidth": 2}
                        })

        # Contradictions Nodes
        ctr_x = 500
        ctr_y = 70
        for i, ctr in enumerate(contradictions):
            ctr_id = f"ctr_{ctr.id}"
            nodes.append({
                "id": ctr_id,
                "type": "contradictionNode",
                "position": {"x": ctr_x + (i * 260), "y": ctr_y},
                "data": {
                    "label": f"Inconsistency: {ctr.contradiction_type}",
                    "title": ctr.severity + " Severity",
                    "subtitle": ctr.description[:80] + "...",
                    "entityType": "CONTRADICTION",
                    "badge": ctr.severity,
                    "id": ctr.id
                }
            })
            edges.append({
                "id": f"e_stmt_ctr_{ctr.id}",
                "source": stmt_id,
                "target": ctr_id,
                "label": "CONTRADICTS",
                "animated": True,
                "style": {"stroke": "#ef4444", "strokeWidth": 2.5}
            })

        # Hypotheses Nodes
        hyp_x = 800
        hyp_y = 120
        for i, hyp in enumerate(hypotheses):
            hyp_id = f"hyp_{hyp.id}"
            nodes.append({
                "id": hyp_id,
                "type": "hypothesisNode",
                "position": {"x": hyp_x + (i * 240), "y": hyp_y},
                "data": {
                    "label": hyp.scenario_code,
                    "title": hyp.title,
                    "subtitle": hyp.description[:70] + "...",
                    "entityType": "HYPOTHESIS",
                    "badge": hyp.plausibility,
                    "id": hyp.id
                }
            })
            edges.append({
                "id": f"e_hyp_claim_{hyp.id}",
                "source": hyp_id,
                "target": claim_node_id,
                "label": "EXPLAINS",
                "style": {"stroke": "#8b5cf6", "strokeDasharray": "5,5"}
            })

        # Policy Clause Nodes
        pol_x = 200
        pol_y = 300
        for i, pol in enumerate(policy_clauses[:2]):  # show top 2 key clauses
            pol_id = f"pol_{pol.id}"
            nodes.append({
                "id": pol_id,
                "type": "policyNode",
                "position": {"x": pol_x, "y": pol_y + (i * 90)},
                "data": {
                    "label": pol.clause_code,
                    "title": pol.clause_title,
                    "subtitle": f"Pg {pol.page_number} | {pol.applicability}",
                    "entityType": "POLICY_CLAUSE",
                    "badge": pol.applicability,
                    "id": pol.id
                }
            })
            edges.append({
                "id": f"e_pol_claim_{pol.id}",
                "source": pol_id,
                "target": claim_node_id,
                "label": "APPLIES_TO",
                "style": {"stroke": "#64748b"}
            })

        return {
            "claim_id": claim.id,
            "nodes": nodes,
            "edges": edges,
            "total_nodes": len(nodes),
            "total_edges": len(edges)
        }

    def build_three_portal_graph(self, claim: Any, db: Any = None) -> Dict[str, Any]:
        """
        Builds the complete React Flow graph for the Three-Login Architecture.
        Connects:
        - Statement
        - Report
        - Image
        - Damage
        - Vehicle
        - Estimate
        - Findings
        - Contradictions
        - Recommendations
        - Decisions
        """
        nodes = []
        edges = []

        # 1. Root Claim Node
        claim_node_id = f"node_claim_{claim.id}"
        nodes.append({
            "id": claim_node_id,
            "type": "claimNode",
            "position": {"x": 420, "y": 240},
            "data": {
                "id": claim.id,
                "label": f"Claim: {claim.id}",
                "title": f"Policy #{claim.policy_number}",
                "subtitle": f"Status: {claim.status}",
                "entityType": "CLAIM",
                "badge": claim.status,
                "amount": f"₹{claim.claimed_amount:,.0f}" if claim.claimed_amount else "₹0",
                "details": {
                    "claim_id": claim.id,
                    "policy_number": claim.policy_number,
                    "claimant_name": claim.claimant_name,
                    "claimant_contact": claim.claimant_contact,
                    "accident_date": claim.accident_date,
                    "accident_location": claim.accident_location,
                    "status": claim.status,
                    "ai_status": claim.ai_status,
                    "human_status": claim.human_status
                }
            }
        })

        # 2. Vehicle Node
        if claim.vehicle:
            veh = claim.vehicle
            veh_id = f"node_veh_{claim.id}"
            nodes.append({
                "id": veh_id,
                "type": "vehicleNode",
                "position": {"x": 50, "y": 80},
                "data": {
                    "id": veh_id,
                    "label": f"Vehicle: {veh.registration_number}",
                    "title": f"{veh.manufacturer} {veh.model}",
                    "subtitle": f"Type: {veh.vehicle_type}",
                    "entityType": "VEHICLE",
                    "badge": veh.vehicle_type,
                    "details": {
                        "registration_number": veh.registration_number,
                        "manufacturer": veh.manufacturer,
                        "model": veh.model,
                        "type": veh.vehicle_type
                    }
                }
            })
            edges.append({
                "id": f"e_veh_claim_{claim.id}",
                "source": veh_id,
                "target": claim_node_id,
                "label": "INSURED_VEHICLE",
                "style": {"stroke": "#0284c7", "strokeWidth": 2}
            })

        # 3. Claimant Statement Node
        stmt_id = f"node_stmt_{claim.id}"
        desc = claim.accident_description or ""
        nodes.append({
            "id": stmt_id,
            "type": "statementNode",
            "position": {"x": 50, "y": 240},
            "data": {
                "id": stmt_id,
                "label": "Claimant Statement",
                "title": f"Accident: {claim.accident_type}",
                "subtitle": (desc[:65] + "...") if len(desc) > 65 else desc,
                "entityType": "STATEMENT",
                "badge": claim.accident_type,
                "details": {
                    "claimant_name": claim.claimant_name,
                    "accident_date": claim.accident_date,
                    "accident_time": claim.accident_time,
                    "accident_location": claim.accident_location,
                    "accident_type": claim.accident_type,
                    "full_narrative": desc,
                    "claimed_amount": claim.claimed_amount
                }
            }
        })
        edges.append({
            "id": f"e_stmt_claim_{claim.id}",
            "source": stmt_id,
            "target": claim_node_id,
            "label": "DESCRIBES_INCIDENT",
            "style": {"stroke": "#2563eb", "strokeWidth": 2}
        })

        # 4. Evidence Items (Photos & PDFs)
        evidence_list = claim.evidence_list or []
        for i, ev in enumerate(evidence_list):
            ev_node_id = f"node_ev_{ev.id}"
            cat_name = (ev.category or "evidence").replace('_', ' ').title()
            nodes.append({
                "id": ev_node_id,
                "type": "evidenceNode",
                "position": {"x": 50, "y": 400 + (i * 140)},
                "data": {
                    "id": ev_node_id,
                    "label": f"Evidence: {cat_name}",
                    "title": ev.file_name,
                    "subtitle": f"Status: {ev.processing_status} ({(ev.file_type or 'file').upper()})",
                    "entityType": "EVIDENCE",
                    "badge": ev.category or "evidence",
                    "details": {
                        "evidence_id": ev.id,
                        "file_name": ev.file_name,
                        "file_type": ev.file_type,
                        "category": ev.category,
                        "processing_status": ev.processing_status,
                        "uploaded_by": ev.uploaded_by
                    }
                }
            })
            edges.append({
                "id": f"e_ev_claim_{ev.id}",
                "source": ev_node_id,
                "target": claim_node_id,
                "label": "SUBMITTED_FOR",
                "style": {"stroke": "#0284c7", "strokeWidth": 2}
            })

        # 5. OCR Results
        ocr_list = claim.ocr_results or []
        for i, ocr in enumerate(ocr_list):
            ocr_node_id = f"node_ocr_{ocr.id}"
            fields = ocr.extracted_fields or {}
            dmg_rep = fields.get("reported_damage", "Damage reported")
            imp_dir = fields.get("impact_direction", "Impact reported")
            nodes.append({
                "id": ocr_node_id,
                "type": "ocrNode",
                "position": {"x": 420, "y": 80 + (i * 120)},
                "data": {
                    "id": ocr_node_id,
                    "label": "OCR Document Extraction",
                    "title": f"Impact: {imp_dir}",
                    "subtitle": f"Damage: {dmg_rep[:60]}",
                    "entityType": "OCR_RESULT",
                    "badge": f"{ocr.page_count} Pages Extracted",
                    "details": {
                        "ocr_id": ocr.id,
                        "extracted_fields": fields,
                        "raw_text_snippet": (ocr.raw_text[:200] + "...") if ocr.raw_text else "",
                        "page_count": ocr.page_count
                    }
                }
            })
            source_ev = f"node_ev_{ocr.evidence_id}" if ocr.evidence_id else stmt_id
            edges.append({
                "id": f"e_ev_ocr_{ocr.id}",
                "source": source_ev,
                "target": ocr_node_id,
                "label": "EXTRACTED_FROM",
                "style": {"stroke": "#3b82f6", "strokeWidth": 2}
            })

        # 6. CV Damage Analysis & Detections
        cv_list = claim.image_analyses or []
        for i, cv_rec in enumerate(cv_list):
            detected_items = cv_rec.detected_damage or []
            label_text = ", ".join(detected_items) if detected_items else "Structural Damage"
            cv_node_id = f"node_cv_{cv_rec.id}"
            conf_val = cv_rec.confidence or 0.85
            nodes.append({
                "id": cv_node_id,
                "type": "damageNode",
                "position": {"x": 420, "y": 400 + (i * 130)},
                "data": {
                    "id": cv_node_id,
                    "label": "CV Damage Detection",
                    "title": label_text,
                    "subtitle": f"Confidence: {int(conf_val * 100)}% | Bounding Boxes: {len(cv_rec.bounding_boxes or [])}",
                    "entityType": "DAMAGE",
                    "badge": f"{int(conf_val * 100)}% Conf",
                    "details": {
                        "analysis_id": cv_rec.id,
                        "detected_damage": detected_items,
                        "confidence": conf_val,
                        "bounding_boxes": cv_rec.bounding_boxes or [],
                        "processed_image_path": cv_rec.processed_image_path,
                        "status": cv_rec.status
                    }
                }
            })
            source_ev = f"node_ev_{cv_rec.evidence_id}" if cv_rec.evidence_id else claim_node_id
            edges.append({
                "id": f"e_ev_cv_{cv_rec.id}",
                "source": source_ev,
                "target": cv_node_id,
                "label": "DETECTED_IN",
                "style": {"stroke": "#6366f1", "strokeWidth": 2}
            })

        # 7. AI Findings & Contradictions
        findings_list = claim.findings or []
        for i, fnd in enumerate(findings_list):
            fnd_node_id = f"node_fnd_{fnd.id}"
            is_contradiction = fnd.finding_type == "contradiction"
            is_match = fnd.finding_type == "matching"
            badge_label = "CONTRADICTION" if is_contradiction else ("MATCH" if is_match else fnd.finding_type.upper())
            fnd_text = fnd.finding_text or ""

            nodes.append({
                "id": fnd_node_id,
                "type": "contradictionNode" if is_contradiction else "findingNode",
                "position": {"x": 820, "y": 80 + (i * 160)},
                "data": {
                    "id": fnd_node_id,
                    "label": f"AI Finding: {fnd.title}",
                    "title": fnd.finding_type.replace('_', ' ').title(),
                    "subtitle": (fnd_text[:75] + "...") if len(fnd_text) > 75 else fnd_text,
                    "entityType": "FINDING",
                    "badge": badge_label,
                    "details": {
                        "finding_id": fnd.id,
                        "finding_type": fnd.finding_type,
                        "title": fnd.title,
                        "claimant_statement": fnd.claimant_statement,
                        "image_analysis": fnd.image_analysis,
                        "finding_text": fnd.finding_text,
                        "possible_explanations": fnd.possible_explanations or [],
                        "human_status": fnd.human_status,
                        "human_remarks": fnd.human_remarks
                    }
                }
            })

            # Edge style depending on finding type
            if is_contradiction:
                edge_style = {"stroke": "#ef4444", "strokeWidth": 2.5, "strokeDasharray": "5,5"}
                edge_label = "CONTRADICTS"
            elif is_match:
                edge_style = {"stroke": "#10b981", "strokeWidth": 2}
                edge_label = "SUPPORTS"
            else:
                edge_style = {"stroke": "#f59e0b", "strokeWidth": 2, "strokeDasharray": "4,4"}
                edge_label = "REQUIRES_VERIFICATION"

            # Connect finding to statement
            edges.append({
                "id": f"e_fnd_stmt_{fnd.id}",
                "source": stmt_id,
                "target": fnd_node_id,
                "label": edge_label,
                "animated": is_contradiction,
                "style": edge_style
            })

            # Also connect to OCR or CV node if available
            if ocr_list:
                edges.append({
                    "id": f"e_ocr_fnd_{fnd.id}",
                    "source": f"node_ocr_{ocr_list[0].id}",
                    "target": fnd_node_id,
                    "label": "COMPARED_AGAINST",
                    "style": {"stroke": "#94a3b8", "strokeWidth": 1.5}
                })
            if cv_list:
                edges.append({
                    "id": f"e_cv_fnd_{fnd.id}",
                    "source": f"node_cv_{cv_list[0].id}",
                    "target": fnd_node_id,
                    "label": "EVIDENCED_BY",
                    "style": {"stroke": "#a855f7", "strokeWidth": 1.5}
                })

        # 8. AI Recommendations
        recs_list = claim.recommendations or []
        for i, rec in enumerate(recs_list):
            rec_node_id = f"node_rec_{rec.id}"
            rec_act = rec.action_text or ""
            nodes.append({
                "id": rec_node_id,
                "type": "recommendationNode",
                "position": {"x": 1220, "y": 80 + (i * 140)},
                "data": {
                    "id": rec_node_id,
                    "label": f"Recommendation ({rec.priority} Priority)",
                    "title": rec.status,
                    "subtitle": (rec_act[:70] + "...") if len(rec_act) > 70 else rec_act,
                    "entityType": "RECOMMENDATION",
                    "badge": f"{rec.priority} Priority",
                    "details": {
                        "recommendation_id": rec.id,
                        "action_text": rec.action_text,
                        "priority": rec.priority,
                        "status": rec.status
                    }
                }
            })

            # Connect from finding to recommendation
            if findings_list:
                edges.append({
                    "id": f"e_fnd_rec_{rec.id}",
                    "source": f"node_fnd_{findings_list[0].id}",
                    "target": rec_node_id,
                    "label": "RECOMMENDS",
                    "style": {"stroke": "#8b5cf6", "strokeWidth": 2}
                })
            else:
                edges.append({
                    "id": f"e_claim_rec_{rec.id}",
                    "source": claim_node_id,
                    "target": rec_node_id,
                    "label": "RECOMMENDS",
                    "style": {"stroke": "#8b5cf6", "strokeWidth": 2}
                })

        # 9. Human Adjudication Decision (if exists)
        decisions_list = claim.decisions or []
        if decisions_list:
            dec = decisions_list[-1]
            dec_node_id = f"node_dec_{dec.id}"
            is_approved = (dec.decision or "").lower() == "approved"
            is_rejected = (dec.decision or "").lower() == "rejected"
            nodes.append({
                "id": dec_node_id,
                "type": "decisionNode",
                "position": {"x": 1220, "y": 380},
                "data": {
                    "id": dec_node_id,
                    "label": f"Human Decision: {dec.decision.upper()}",
                    "title": f"Payout: ₹{dec.approved_amount:,.0f}" if is_approved else dec.decision.upper(),
                    "subtitle": (dec.remarks[:70] + "...") if dec.remarks else "Decision adjudicated",
                    "entityType": "HUMAN_DECISION",
                    "badge": dec.decision.upper(),
                    "details": {
                        "decision_id": dec.id,
                        "decision": dec.decision,
                        "approved_amount": dec.approved_amount,
                        "remarks": dec.remarks,
                        "rejection_reason": dec.rejection_reason,
                        "requested_items": dec.requested_items or [],
                        "decided_at": str(dec.decided_at)
                    }
                }
            })
            edges.append({
                "id": f"e_dec_claim_{dec.id}",
                "source": dec_node_id,
                "target": claim_node_id,
                "label": "FINAL_ADJUDICATION",
                "style": {"stroke": "#16a34a" if is_approved else ("#dc2626" if is_rejected else "#f59e0b"), "strokeWidth": 2.5}
            })

        return {
            "claim_id": claim.id,
            "nodes": nodes,
            "edges": edges,
            "total_nodes": len(nodes),
            "total_edges": len(edges)
        }

graph_service = GraphService()
