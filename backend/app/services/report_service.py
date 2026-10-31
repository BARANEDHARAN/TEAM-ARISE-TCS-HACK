import os
import io
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class ReportService:
    """
    Part 11: Complete Investigation Report Generator
    Generates structured multi-section investigation reports with full evidence lineage
    and downloadable professional PDF documents via ReportLab.
    """

    def generate_report_json(self, claim: Any) -> Dict[str, Any]:
        """
        Builds the 19-section complete investigation report data payload.
        """
        evidence_list = claim.evidence_files or []
        damage_list = claim.damage_records or []
        contradictions = claim.contradictions or []
        hypotheses = claim.hypotheses or []
        policy_clauses = claim.policy_clauses or []
        repair_items = claim.repair_items or []
        timeline = claim.timeline_events or []
        gaps = claim.evidence_gaps or []
        settlement = claim.settlement_assessment
        reviews = claim.reviewer_decisions or []

        return {
            "title": "CLAIMMIND AI - MULTIMODAL AUTONOMOUS CLAIMS INVESTIGATION REPORT",
            "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "claim_id": claim.id,
            "status": claim.status,
            "claimant": {
                "name": claim.claimant_name,
                "phone": claim.claimant_phone,
                "email": claim.claimant_email,
                "policy_number": claim.policy_number
            },
            "vehicle": {
                "registration": claim.vehicle_reg,
                "make": claim.vehicle_make,
                "model": claim.vehicle_model,
                "year": claim.vehicle_year
            },
            "incident": {
                "date": claim.accident_date,
                "time": claim.accident_time,
                "location": claim.accident_location,
                "type": claim.accident_type,
                "description": claim.description,
                "requested_amount": claim.requested_amount
            },
            "evidence_inventory": [
                {
                    "id": e.id,
                    "filename": e.original_filename,
                    "type": e.file_type,
                    "category": e.category,
                    "sha256": e.sha256_hash,
                    "perceptual_hash": e.perceptual_hash,
                    "upload_time": str(e.upload_time)
                } for e in evidence_list
            ],
            "damage_findings": [
                {
                    "id": d.id,
                    "component": d.component,
                    "damage_type": d.damage_type,
                    "severity": d.severity,
                    "confidence": d.confidence,
                    "fingerprint": d.fingerprint
                } for d in damage_list
            ],
            "cross_modal_inconsistencies": [
                {
                    "id": c.id,
                    "type": c.contradiction_type,
                    "severity": c.severity,
                    "description": c.description,
                    "source_a": f"{c.source_a_name}: {c.source_a_fact}",
                    "source_b": f"{c.source_b_name}: {c.source_b_fact}",
                    "confidence": c.confidence
                } for c in contradictions
            ],
            "alternative_hypotheses": [
                {
                    "id": h.id,
                    "code": h.scenario_code,
                    "title": h.title,
                    "description": h.description,
                    "plausibility": h.plausibility,
                    "verification": h.recommended_verification
                } for h in hypotheses
            ],
            "policy_interpretation": [
                {
                    "clause_code": p.clause_code,
                    "clause_title": p.clause_title,
                    "page": p.page_number,
                    "applicability": p.applicability,
                    "rationale": p.rationale
                } for p in policy_clauses
            ],
            "repair_verification": [
                {
                    "item": r.component_name,
                    "action": r.action,
                    "amount": r.total_amount,
                    "status": r.supported_status,
                    "fingerprint_ref": r.damage_fingerprint_ref,
                    "notes": r.notes
                } for r in repair_items
            ],
            "timeline": [
                {
                    "timestamp": t.timestamp_str,
                    "source": t.source_type,
                    "title": t.event_title,
                    "description": t.event_description,
                    "consistency": t.consistency_flag
                } for t in timeline
            ],
            "missing_evidence_gaps": [
                {
                    "type": g.missing_evidence_type,
                    "priority": g.priority,
                    "rationale": g.importance_rationale,
                    "request_text": g.what_claimant_should_provide
                } for g in gaps
            ],
            "settlement_assessment": {
                "submitted_total": settlement.submitted_total if settlement else claim.requested_amount,
                "supported_total": settlement.supported_total if settlement else 0.0,
                "unsupported_total": settlement.unsupported_total if settlement else 0.0,
                "unverified_total": settlement.unverified_total if settlement else 0.0,
                "deductible_applied": settlement.deductible_applied if settlement else 2000.0,
                "indicative_min": settlement.indicative_settlement_min if settlement else 0.0,
                "indicative_max": settlement.indicative_settlement_max if settlement else 0.0,
                "explanation": settlement.explanation_text if settlement else "Assessment pending."
            },
            "reviewer_decisions": [
                {
                    "decision": rev.decision,
                    "notes": rev.reviewer_notes,
                    "final_amount": rev.final_settlement_amount,
                    "date": str(rev.created_at)
                } for rev in reviews
            ],
            "disclaimer": "CLAIMMIND AI is an investigative decision-support system. All findings, hypotheses, and settlement calculations require independent human investigator verification prior to claim authorization."
        }

    def generate_pdf(self, claim: Any) -> bytes:
        """
        Builds a high-quality multi-page PDF document buffer.
        """
        report_data = self.generate_report_json(claim)
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'RepTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'RepSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=12
        )
        h2_style = ParagraphStyle(
            'RepH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'RepBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#334155')
        )
        caption_style = ParagraphStyle(
            'RepCap',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#64748b')
        )

        story = []

        # Header Cover Block
        story.append(Paragraph("CLAIMMIND AI", title_style))
        story.append(Paragraph("Autonomous Multimodal Insurance Claims Investigation Dossier", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceAfter=10))

        # Metadata Table
        meta_data = [
            [
                Paragraph("<b>Claim ID:</b>", body_style), Paragraph(report_data["claim_id"], body_style),
                Paragraph("<b>Date Generated:</b>", body_style), Paragraph(report_data["generated_at"], body_style)
            ],
            [
                Paragraph("<b>Claimant:</b>", body_style), Paragraph(report_data["claimant"]["name"], body_style),
                Paragraph("<b>Policy No:</b>", body_style), Paragraph(report_data["claimant"]["policy_number"], body_style)
            ],
            [
                Paragraph("<b>Vehicle:</b>", body_style), Paragraph(f"{report_data['vehicle']['make']} {report_data['vehicle']['model']} ({report_data['vehicle']['registration']})", body_style),
                Paragraph("<b>Current Status:</b>", body_style), Paragraph(f"<b>{report_data['status']}</b>", body_style)
            ],
            [
                Paragraph("<b>Accident Date & Time:</b>", body_style), Paragraph(f"{report_data['incident']['date']} at {report_data['incident']['time']}", body_style),
                Paragraph("<b>Claim Amount:</b>", body_style), Paragraph(f"₹{report_data['incident']['requested_amount']:,.2f}", body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[1.3*inch, 2.3*inch, 1.4*inch, 2.3*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 12))

        # Incident Description
        story.append(Paragraph("1. Incident Narrative", h2_style))
        story.append(Paragraph(f"<i>Location:</i> {report_data['incident']['location']}", body_style))
        story.append(Paragraph(f"<i>Claimant Description:</i> {report_data['incident']['description']}", body_style))
        story.append(Spacer(1, 10))

        # Damage Intelligence Section
        story.append(Paragraph("2. Computer Vision Damage Intelligence", h2_style))
        damage_rows = [["Damage ID", "Component", "Identified Type", "Confidence", "Damage Fingerprint"]]
        for d in report_data["damage_findings"]:
            damage_rows.append([
                d["id"], d["component"], d["damage_type"], f"{int(d['confidence']*100)}%", d["fingerprint"]
            ])
        if len(damage_rows) == 1:
            damage_rows.append(["None", "No damages detected", "-", "-", "-"])
        dmg_table = Table(damage_rows, colWidths=[1.1*inch, 1.6*inch, 1.6*inch, 0.9*inch, 2.1*inch])
        dmg_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0,0), (-1,-1), 4),
            ('FONTSIZE', (0,0), (-1,-1), 8)
        ]))
        story.append(dmg_table)
        story.append(Spacer(1, 10))

        # Cross-Modal Contradictions & Multi-Hypothesis Section
        story.append(Paragraph("3. Cross-Modal Inconsistencies & Counterfactual Scenarios", h2_style))
        if report_data["cross_modal_inconsistencies"]:
            for ctr in report_data["cross_modal_inconsistencies"]:
                story.append(Paragraph(f"<b>[!] Contradiction ({ctr['severity']}):</b> {ctr['description']}", body_style))
                story.append(Paragraph(f"   • <b>Source A:</b> {ctr['source_a']}", caption_style))
                story.append(Paragraph(f"   • <b>Source B:</b> {ctr['source_b']}", caption_style))
                story.append(Spacer(1, 4))
        else:
            story.append(Paragraph("No severe cross-modal contradictions detected across submitted records.", body_style))
        story.append(Spacer(1, 6))

        # Hypotheses
        story.append(Paragraph("<b>Evaluated Explanatory Scenarios:</b>", body_style))
        for hyp in report_data["alternative_hypotheses"]:
            story.append(Paragraph(f"• <b>{hyp['code']} ({hyp['title']}) - Plausibility: {hyp['plausibility']}:</b> {hyp['description']}", body_style))
        story.append(Spacer(1, 10))

        # Settlement Assessment Section
        story.append(Paragraph("4. Transparent Settlement Breakdown", h2_style))
        set_data = report_data["settlement_assessment"]
        settle_table_data = [
            ["Metric", "Amount (INR)", "Verification Basis"],
            ["Total Submitted Estimate", f"₹{set_data['submitted_total']:,.2f}", "Workshop invoice total submitted by claimant"],
            ["Supported Bodywork Repairs", f"₹{set_data['supported_total']:,.2f}", "Visually verified with camera evidence and damage fingerprints"],
            ["Unverified Internal Items", f"₹{set_data['unverified_total']:,.2f}", "Requires physical surveyor teardown / clip inspection"],
            ["Unsupported Claim Items", f"₹{set_data['unsupported_total']:,.2f}", "Lacks visual correlation with accident photos"],
            ["Policy Excess / Deductible", f"- ₹{set_data['deductible_applied']:,.2f}", "Compulsory deductible under Policy Clause SEC_3.4"],
            ["Indicative Range (Min - Max)", f"₹{set_data['indicative_min']:,.2f} - ₹{set_data['indicative_max']:,.2f}", "Indicative baseline range for human reviewer determination"]
        ]
        settle_table = Table(settle_table_data, colWidths=[2.2*inch, 1.8*inch, 3.3*inch])
        settle_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f766e')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0,0), (-1,-1), 4),
            ('FONTSIZE', (0,0), (-1,-1), 8)
        ]))
        story.append(settle_table)
        story.append(Spacer(1, 10))

        # Next Best Evidence Gaps
        story.append(Paragraph("5. Next-Best-Evidence Action Plan", h2_style))
        for g in report_data["missing_evidence_gaps"]:
            story.append(Paragraph(f"• <b>[{g['priority']}] {g['type']}:</b> {g['rationale']}", body_style))
        story.append(Spacer(1, 10))

        # Reviewer Sign-off Section
        story.append(Paragraph("6. Human Reviewer Governance & Determination", h2_style))
        if report_data["reviewer_decisions"]:
            for r in report_data["reviewer_decisions"]:
                story.append(Paragraph(f"<b>Final Decision:</b> {r['decision']} | <b>Approved Amount:</b> ₹{r['final_amount'] or 0:,.2f}", body_style))
                story.append(Paragraph(f"<b>Reviewer Rationale:</b> {r['notes']}", body_style))
        else:
            story.append(Paragraph("Status: <i>Pending Human Reviewer Determination in Review Queue.</i>", caption_style))

        story.append(Spacer(1, 14))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#94a3b8'), spaceAfter=8))
        story.append(Paragraph(report_data["disclaimer"], caption_style))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

report_service = ReportService()
