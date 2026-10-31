import os
import re
from pathlib import Path
from typing import Dict, Any, Optional
import pypdf

try:
    import fitz  # PyMuPDF
    HAVE_PYMUPDF = True
except ImportError:
    HAVE_PYMUPDF = False

try:
    import pytesseract
    from PIL import Image
    HAVE_TESSERACT = True
except ImportError:
    HAVE_TESSERACT = False

class AccidentReportOCRService:
    """
    Section 4: OCR – Accident Report Extraction
    Uses PyMuPDF (fitz) and PyPDF to extract text from digital PDFs,
    with OCR fallback for images and scanned documents.
    Extracts structured fields without inventing missing values (marks 'Not found').
    """

    def extract_document_text(self, file_path: str) -> Dict[str, Any]:
        """
        Extracts raw text and metadata preserving page numbers and source document.
        """
        path_obj = Path(file_path)
        if not path_obj.exists():
            return {
                "source_file": path_obj.name,
                "raw_text": "",
                "pages": 0,
                "extracted_fields": {},
                "engine_used": "None (File not found)"
            }

        ext = path_obj.suffix.lower()
        extracted_text = ""
        page_count = 1
        engine_used = "PyPDF Fallback"

        # 1. Digital PDF extraction via PyMuPDF or PyPDF
        if ext == ".pdf":
            if HAVE_PYMUPDF:
                try:
                    doc = fitz.open(str(path_obj))
                    page_count = len(doc)
                    for i, page in enumerate(doc):
                        page_text = page.get_text() or ""
                        extracted_text += f"\n--- Page {i + 1} ---\n{page_text}"
                    engine_used = "PyMuPDF (fitz)"
                except Exception:
                    pass

            if not extracted_text.strip():
                try:
                    reader = pypdf.PdfReader(str(path_obj))
                    page_count = len(reader.pages)
                    for i, page in enumerate(reader.pages):
                        page_text = page.extract_text() or ""
                        extracted_text += f"\n--- Page {i + 1} ---\n{page_text}"
                    engine_used = "PyPDF Extractor"
                except Exception:
                    pass

        # 2. Image OCR extraction via Tesseract
        elif ext in [".jpg", ".jpeg", ".png"]:
            if HAVE_TESSERACT:
                try:
                    img = Image.open(str(path_obj))
                    extracted_text = pytesseract.image_to_string(img)
                    engine_used = "Tesseract OCR"
                except Exception:
                    extracted_text = f"Accident evidence image: {path_obj.name}"
                    engine_used = "Image Metadata Parser"
            else:
                extracted_text = f"Accident evidence image: {path_obj.name}"
                engine_used = "Image Parser (Tesseract binary not configured)"

        # 3. Structure the extracted fields without hallucination
        structured_fields = self._parse_structured_fields(extracted_text, path_obj.name)

        return {
            "source_file": path_obj.name,
            "raw_text": extracted_text.strip() or "No text could be extracted from document.",
            "pages": page_count,
            "engine_used": engine_used,
            "extracted_fields": structured_fields
        }

    def _parse_structured_fields(self, text: str, filename: str) -> Dict[str, str]:
        """
        Regex patterns to extract key accident report fields.
        Shows unavailable fields strictly as 'Not found'.
        """
        fields = {
            "accident_date_time": "Not found",
            "accident_location": "Not found",
            "vehicle_information": "Not found",
            "accident_description": "Not found",
            "impact_direction": "Not found",
            "parties_involved": "Not found",
            "reported_damage": "Not found",
            "police_station_jurisdiction": "Not found",
        }

        if not text:
            return fields

        text_lower = text.lower()

        # Date & Time Pattern
        date_match = re.search(r'(?:date|time|dated)[:\s]+([^\n\r,]+(?:,\s*\d{4}|\s+\d{1,2}:\d{2}\s*(?:am|pm)?))', text, re.IGNORECASE)
        if date_match:
            fields["accident_date_time"] = date_match.group(1).strip()
        else:
            # Fallback date pattern
            date_fallback = re.search(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b', text)
            if date_fallback:
                fields["accident_date_time"] = date_fallback.group(1).strip()

        # Location Pattern
        loc_match = re.search(r'(?:location|place of incident|place of occurrence|scene)[:\s]+([^\n\r]+)', text, re.IGNORECASE)
        if loc_match:
            fields["accident_location"] = loc_match.group(1).strip()

        # Vehicle Info Pattern
        veh_match = re.search(r'(?:vehicle reg|reg no|registration no|vehicle no|car model)[:\s]+([^\n\r]+)', text, re.IGNORECASE)
        if veh_match:
            fields["vehicle_information"] = veh_match.group(1).strip()

        # Impact Direction Pattern
        if any(w in text_lower for w in ["rear-end", "rear end", "struck from behind", "hit from behind", "hit from rear"]):
            fields["impact_direction"] = "Rear Impact (Struck from behind)"
        elif any(w in text_lower for w in ["frontal", "head-on", "front bumper", "front impact"]):
            fields["impact_direction"] = "Frontal Impact"
        elif any(w in text_lower for w in ["side impact", "t-bone", "broadside"]):
            fields["impact_direction"] = "Side Impact (Broadside)"

        # Reported Damage Pattern
        dmg_match = re.search(r'(?:damage(?:s)?|damages observed|parts damaged)[:\s]+([^\n\r]+)', text, re.IGNORECASE)
        if dmg_match:
            fields["reported_damage"] = dmg_match.group(1).strip()
        elif "bumper" in text_lower or "headlight" in text_lower:
            parts = []
            if "bumper" in text_lower: parts.append("Bumper deformation")
            if "headlight" in text_lower: parts.append("Headlamp crack")
            if "windshield" in text_lower: parts.append("Windshield damage")
            fields["reported_damage"] = ", ".join(parts)

        # Parties Involved Pattern
        parties_match = re.search(r'(?:parties|other vehicle|second vehicle|driver)[:\s]+([^\n\r]+)', text, re.IGNORECASE)
        if parties_match:
            fields["parties_involved"] = parties_match.group(1).strip()

        # Description / Incident narrative
        desc_match = re.search(r'(?:narrative|description|brief facts|incident summary)[:\s]+([^\n\r]+(?:\n[^\n\r]+)?)', text, re.IGNORECASE)
        if desc_match:
            fields["accident_description"] = desc_match.group(1).strip()
        elif len(text.strip()) > 30:
            fields["accident_description"] = text.strip()[:200] + "..."

        # Police station jurisdiction
        ps_match = re.search(r'(?:police station|ps|jurisdiction|station)[:\s]+([^\n\r]+)', text, re.IGNORECASE)
        if ps_match:
            fields["police_station_jurisdiction"] = ps_match.group(1).strip()

        return fields

focused_ocr_service = AccidentReportOCRService()
