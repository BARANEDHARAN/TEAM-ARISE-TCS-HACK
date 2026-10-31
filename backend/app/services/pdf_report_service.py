import os
from pathlib import Path
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from app.config import UPLOAD_DIR

class PDFReportService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._init_custom_styles()

    def _init_custom_styles(self):
        self.title_style = ParagraphStyle(
            'DocTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A'),
            fontName='Helvetica-Bold'
        )
        self.sub_title_style = ParagraphStyle(
            'DocSubtitle',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#64748B'),
            fontName='Helvetica'
        )
        self.section_heading = ParagraphStyle(
            'SectionHeading',
            parent=self.styles['Heading2'],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#1E293B'),
            fontName='Helvetica-Bold',
            spaceBefore=8,
            spaceAfter=4
        )
        self.body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=self.styles['Normal'],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#334155'),
            fontName='Helvetica'
        )
        self.bold_label = ParagraphStyle(
            'BoldLabel',
            parent=self.styles['Normal'],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#0F172A'),
            fontName='Helvetica-Bold'
        )
        self.alert_box = ParagraphStyle(
            'AlertBox',
            parent=self.styles['Normal'],
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor('#991B1B'),
            fontName='Helvetica-Bold'
        )

    def generate_investigation_pdf(
        self,
        claim_data: dict,
        evidence_list: list,
        image_analysis: dict,
        ocr_result: dict,
        findings: list,
        recommendations: list,
        human_decision: dict = None,
        report_type: str = "ai"
    ) -> str:
        """
        Generates a professional multi-section PDF report.
        Returns the absolute filepath of the generated PDF.
        """
        claim_id = claim_data.get("id", "CLM-UNKNOWN")
        filename = f"{report_type.upper()}_REPORT_{claim_id}_{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
        output_path = UPLOAD_DIR / filename

        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        story = []

        # 1. Header Banner
        header_text = (
            "CLAIMMIND AI – AUTONOMOUS VEHICLE CLAIMS INVESTIGATION DOSSIER"
            if report_type == "ai"
            else "CLAIMMIND AI – FINAL ADJUDICATION & SETTLEMENT DOSSIER"
        )
        story.append(Paragraph(header_text, self.title_style))
        sub_text = f"Official Investigation Artifact • Reference ID: {claim_id} • Generated: {datetime.datetime.utcnow().strftime('%d-%b-%Y %H:%M UTC')}"
        story.append(Paragraph(sub_text, self.sub_title_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=12))

        # 2. Key Metadata Table (Claimant & Vehicle)
        claimant = claim_data.get("claimant", {})
        vehicle = claim_data.get("vehicle", {})

        meta_data = [
            [
                Paragraph("<b>Claimant Name:</b>", self.body_style),
                Paragraph(claim_data.get("claimant_name", claimant.get("name", "N/A")), self.body_style),
                Paragraph("<b>Policy Number:</b>", self.body_style),
                Paragraph(claim_data.get("policy_number", "N/A"), self.body_style),
            ],
            [
                Paragraph("<b>Contact Mobile:</b>", self.body_style),
                Paragraph(claim_data.get("claimant_contact", claimant.get("mobile", "N/A")), self.body_style),
                Paragraph("<b>Contact Email:</b>", self.body_style),
                Paragraph(claim_data.get("claimant_email", claimant.get("email", "N/A")), self.body_style),
            ],
            [
                Paragraph("<b>Vehicle Reg:</b>", self.body_style),
                Paragraph(vehicle.get("registration_number", "N/A"), self.body_style),
                Paragraph("<b>Vehicle Make/Model:</b>", self.body_style),
                Paragraph(f"{vehicle.get('manufacturer', '')} {vehicle.get('model', '')} ({vehicle.get('vehicle_type', 'Sedan')})", self.body_style),
            ],
            [
                Paragraph("<b>Accident Date & Time:</b>", self.body_style),
                Paragraph(f"{claim_data.get('accident_date', '')} {claim_data.get('accident_time', '')}", self.body_style),
                Paragraph("<b>Claimed Amount:</b>", self.body_style),
                Paragraph(f"INR {claim_data.get('claimed_amount', 0):,.2f}", self.body_style),
            ],
            [
                Paragraph("<b>Accident Location:</b>", self.body_style),
                Paragraph(claim_data.get("accident_location", "N/A"), self.body_style),
                Paragraph("<b>Collision Type:</b>", self.body_style),
                Paragraph(claim_data.get("accident_type", "N/A"), self.body_style),
            ]
        ]

        t_meta = Table(meta_data, colWidths=[1.3*inch, 2.2*inch, 1.3*inch, 2.2*inch])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 10))

        # 3. Accident Description
        story.append(Paragraph("1. Reported Accident Description (Claimant Statement)", self.section_heading))
        desc_box = [[Paragraph(claim_data.get("accident_description", "No narrative provided."), self.body_style)]]
        t_desc = Table(desc_box, colWidths=[7.0*inch])
        t_desc.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t_desc)
        story.append(Spacer(1, 10))

        # 4. Uploaded Evidence Summary
        story.append(Paragraph("2. Uploaded Physical Evidence", self.section_heading))
        ev_rows = [["Evidence ID", "Category", "Filename", "Status"]]
        for ev in evidence_list:
            ev_rows.append([
                ev.get("id", "EVD"),
                ev.get("category", "photo"),
                ev.get("file_name", ""),
                ev.get("processing_status", "PROCESSED")
            ])
        if len(ev_rows) == 1:
            ev_rows.append(["None", "N/A", "No files uploaded", "N/A"])

        t_ev = Table(ev_rows, colWidths=[1.2*inch, 1.8*inch, 2.8*inch, 1.2*inch])
        t_ev.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8.5),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_ev)
        story.append(Spacer(1, 10))

        # 5. Computer Vision Damage Detection
        story.append(Paragraph("3. Computer Vision Vehicle Damage Analysis (OpenCV / Contour Detection)", self.section_heading))
        damages = image_analysis.get("detected_damage", [])
        conf = image_analysis.get("confidence", 0.85)

        cv_summary = f"<b>CV Inspection Status:</b> {image_analysis.get('status', 'COMPLETED')} | <b>Overall Confidence:</b> {int(conf*100)}%<br/>"
        cv_summary += f"<b>Detected Structural Deformation Components:</b> {', '.join(damages) if damages else 'No severe external structural deformation detected.'}"
        
        cv_box = [[Paragraph(cv_summary, self.body_style)]]
        t_cv = Table(cv_box, colWidths=[7.0*inch])
        t_cv.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#BFDBFE')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t_cv)
        story.append(Spacer(1, 10))

        # 6. OCR Accident Report Extraction
        story.append(Paragraph("4. OCR Accident Report Extracted Attributes (PyMuPDF / Tesseract)", self.section_heading))
        fields = ocr_result.get("extracted_fields", {})
        ocr_rows = [
            [Paragraph("<b>Extracted Attribute</b>", self.bold_label), Paragraph("<b>Parsed Document Value</b>", self.bold_label)],
            [Paragraph("Accident Date & Time", self.body_style), Paragraph(str(fields.get("accident_date_time", "Not found")), self.body_style)],
            [Paragraph("Accident Location", self.body_style), Paragraph(str(fields.get("accident_location", "Not found")), self.body_style)],
            [Paragraph("Impact Direction", self.body_style), Paragraph(str(fields.get("impact_direction", "Not found")), self.body_style)],
            [Paragraph("Parties Involved", self.body_style), Paragraph(str(fields.get("parties_involved", "Not found")), self.body_style)],
            [Paragraph("Reported Physical Damage", self.body_style), Paragraph(str(fields.get("reported_damage", "Not found")), self.body_style)],
        ]
        t_ocr = Table(ocr_rows, colWidths=[2.2*inch, 4.8*inch])
        t_ocr.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_ocr)
        story.append(Spacer(1, 10))

        # 7. AI Inconsistency & Finding Analysis
        story.append(Paragraph("5. AI Inconsistency Detection & Multimodal Hypotheses", self.section_heading))
        finding_rows = [["Type", "Finding Details & Explanation", "Human Status"]]
        for f in findings:
            details = f"<b>{f.get('title', 'Inconsistency')}</b><br/>"
            if f.get('claimant_statement'):
                details += f"<i>Statement:</i> {f.get('claimant_statement')}<br/>"
            if f.get('image_analysis'):
                details += f"<i>Image CV:</i> {f.get('image_analysis')}<br/>"
            details += f"<b>Analysis:</b> {f.get('finding_text', '')}"
            if f.get('possible_explanations'):
                details += "<br/><b>Possible Explanations:</b> " + "; ".join(f.get('possible_explanations', []))

            finding_rows.append([
                Paragraph(f.get("finding_type", "Finding").upper(), self.bold_label),
                Paragraph(details, self.body_style),
                Paragraph(f.get("human_status", "PENDING").upper(), self.bold_label)
            ])

        if len(finding_rows) == 1:
            finding_rows.append(["N/A", "No direct contradictions detected.", "VERIFIED"])

        t_findings = Table(finding_rows, colWidths=[1.1*inch, 4.7*inch, 1.2*inch])
        t_findings.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ]))
        story.append(t_findings)
        story.append(Spacer(1, 10))

        # 8. AI Recommendations
        story.append(Paragraph("6. AI Recommended Actions", self.section_heading))
        rec_texts = "<br/>".join([f"• <b>[{r.get('priority', 'High')}]</b> {r.get('action_text', '')}" for r in recommendations]) or "No further actions required."
        rec_box = [[Paragraph(rec_texts, self.body_style)]]
        t_rec = Table(rec_box, colWidths=[7.0*inch])
        t_rec.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F0FDF4')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#BBF7D0')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t_rec)
        story.append(Spacer(1, 12))

        # 9. Human Decision Section (if report_type == "final" or decision present)
        if human_decision or report_type == "final":
            story.append(Paragraph("7. Human Investigator Final Adjudication", self.section_heading))
            dec_type = (human_decision.get("decision") or "UNDER_REVIEW").upper()
            
            dec_color = colors.HexColor('#15803D') if dec_type == "APPROVED" else (
                colors.HexColor('#B91C1C') if dec_type == "REJECTED" else colors.HexColor('#B45309')
            )

            dec_content = f"<b>FINAL CLAIM DETERMINATION: <font color='{dec_color}'>{dec_type}</font></b><br/>"
            if dec_type == "APPROVED":
                dec_content += f"<b>Approved Settlement Amount:</b> INR {human_decision.get('approved_amount', 0):,.2f}<br/>"
            if human_decision.get("rejection_reason"):
                dec_content += f"<b>Rejection Grounds:</b> {human_decision.get('rejection_reason')}<br/>"
            if human_decision.get("requested_items"):
                dec_content += f"<b>Additional Items Requested:</b> {', '.join(human_decision.get('requested_items', []))}<br/>"
            if human_decision.get("remarks"):
                dec_content += f"<b>Investigator Notes:</b> {human_decision.get('remarks')}<br/>"
            dec_content += f"<b>Adjudicated Timestamp:</b> {human_decision.get('decided_at', datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'))}"

            dec_box = [[Paragraph(dec_content, self.body_style)]]
            t_dec = Table(dec_box, colWidths=[7.0*inch])
            t_dec.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
                ('BOX', (0, 0), (-1, -1), 1.5, dec_color),
                ('PADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(t_dec)
            story.append(Spacer(1, 10))

        # 10. Footer Disclaimer
        story.append(Spacer(1, 15))
        disclaimer_text = (
            "NOTICE: CLAIMMIND AI operates under strict Human-in-the-Loop governance. Automated algorithms do not "
            "independently approve or deny insurance claims. Final settlement liability is governed solely by authorized "
            "licensed human insurance investigators. All records cryptographically audited."
        )
        story.append(Paragraph(disclaimer_text, self.sub_title_style))

        doc.build(story)
        return str(output_path)

pdf_report_service = PDFReportService()
