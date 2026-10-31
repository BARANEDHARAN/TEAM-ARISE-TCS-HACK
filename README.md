# CLAIMMIND AI
## Multimodal Autonomous Insurance Claims Investigator

> **AI for Business Hackathon &bull; Insurance Track**  
> Focus: Multimodal AI, Computer Vision, Document AI, NLP, Counterfactual AI Reasoning, and Evidence Intelligence.

---

## 🌟 Executive Summary

**CLAIMMIND AI** is a production-grade, full-stack autonomous insurance claims investigation assistant. In traditional motor insurance adjusting, evidence is fragmented across phone snapshots, claimant narratives, garage repair estimates, policy PDFs, and vehicle telematics. Investigators face overwhelming delays, missed policy exclusions, over-scoped repair invoices, and unsupported conclusions.

CLAIMMIND AI connects this fragmented evidence to answer five fundamental questions:
1. **What does the available evidence show?** (CV damage detection & Damage Fingerprints)
2. **Does the evidence agree with the claimant's explanation?** (Cross-modal contradiction analysis)
3. **What are the possible explanations for inconsistencies?** (Counterfactual multi-hypothesis reasoning)
4. **What additional evidence is required?** (Next-best-evidence intelligence & formal request notices)
5. **What should the human investigator do next?** (Transparent, non-autonomous settlement assistant)

---

## 🚀 The Three Signature Innovations

### 1. Dynamic Evidence Intelligence Graph (React Flow)
A dynamic, connected knowledge graph mapping claims, claimant narratives, photo evidence, damage fingerprints, policy clauses, and repair invoices. Every node preserves cryptographic and relational provenance, allowing investigators to visually explore dependencies, filter entity classes, and highlight contradictory edges.

### 2. Counterfactual Accident Reasoning Engine
Rather than leaping to accusations of fraud, the engine tests competing accident hypotheses (e.g., Scenario A: Chain-Reaction Sandwich Impact vs. Scenario B: Statement Inaccuracy vs. Scenario C: Pre-Existing Damage). Each scenario is mapped against a structured matrix of supporting signals, contradictory observations, and decisive missing evidence.

### 3. Next-Best-Evidence Intelligence
Avoids generic missing-document checklists. The engine articulates precisely *why* each missing piece is needed, *which* contradiction or hypothesis it resolves, *what* the claimant should provide, and *what* next step follows. With one click, investigators can compile and dispatch an official evidence request notice.

---

## 🧩 The Ten Core AI Investigation Modules

| Module | Name | Key Feature |
|---|---|---|
| **M01** | **AI Damage Intelligence** | OpenCV image preprocessing, vehicle component detection, and immutable **Damage Fingerprint (DFP)** tagging. |
| **M02** | **Cross-Modal Contradiction Intelligence** | Cross-examines claimant statements against photographs, repair quotes, and telematics without speculative fraud bias. |
| **M03** | **Policy Intelligence** | **Policy-to-Evidence Mapping** linking claim facts to exact policy clauses, page numbers, and deductibles. |
| **M04** | **Visual-to-Invoice Cost Intelligence** | Audits estimates line-by-line; constructs the **Repair Necessity Graph** (*Damage &rarr; Component &rarr; Repair &rarr; Cost*). |
| **M05** | **Digital Evidence Forensics** | EXIF metadata extraction, SHA-256 byte hashing, and **Cross-Claim Image Reuse Detection** via 64-bit dHash. |
| **M06** | **Context-Aware Reconstruction** | Synthesizes IoT deceleration triggers, GPS, and weather into a chronological incident timeline. |
| **M07** | **Cross-Claim Pattern Intelligence** | Analyzes historical records for recurring vehicles, shared repair bodycraft shops, and regional clusters. |
| **M08** | **Intelligent Evidence Gap Predictor** | Predicts decisive missing evidence and compiles formal claimant notice letters. |
| **M09** | **Explainable Settlement Intelligence** | Decomposes submitted amounts into supported, unsupported, and unverified brackets minus compulsory policy excess. |
| **M10** | **Investigator Feedback Intelligence** | Captures investigator corrections, tracks false positives, and enables continuous model calibration without algorithmic drift. |

---

## 🧪 Pre-Configured Sample Claims

The platform comes pre-seeded with three reference claims tailored for live hackathon evaluation:

1. **Sample Claim A (`CLM-2026-001`): Contradictory Accident Direction**
   - *Claimant Statement:* "My vehicle was waiting at a red light when struck from behind."
   - *Evidence Photo:* Severe front bumper deformation and broken left projector lamp. No rear damage documented.
   - *AI Findings:* Flags impact direction discrepancy; evaluates 3 counterfactual collision scenarios (including chain-reaction sandwich impact); identifies rear exterior photographs as the decisive missing evidence.

2. **Sample Claim B (`CLM-2026-002`): Repair Scope Over-Quoting**
   - *Claimant Statement:* Frontal collision at low speed on an urban ring road.
   - *Repair Estimate:* Front bumper replacement (₹21,240), Left headlamp (₹16,520), and **Rear bumper replacement (₹25,370)**.
   - *AI Findings:* Flags rear bumper replacement as visually unsupported (saving ₹25,370 in unsupported scope).

3. **Sample Claim C (`CLM-2026-003`): Cross-Claim Image Reuse**
   - *Scenario:* Current claim submits an accident photograph matching a settled 2025 file (`CLM-2025-HIST-08`).
   - *AI Findings:* 64-bit perceptual hash (dHash) detects 100% visual similarity; alerts investigator to verify pre-existing unrepaired damage without pre-judging fraud.

---

## 🔑 Pre-Seeded Demonstration Accounts

| Role | Username | Password | Full Name | Primary Capabilities |
|---|---|---|---|---|
| **Investigator** | `investigator` | `investigator123` | Rajesh Sharma | Intake claims, upload evidence, trigger AI investigation, dispatch gap requests, inspect findings |
| **Reviewer** | `reviewer` | `reviewer123` | Dr. Amanda Torres | Review queue adjudication, record final settlement payouts, challenge/accept AI findings |
| **Administrator** | `admin` | `admin123` | Sarah Jenkins | Organization user management, system settings, sensitivity thresholds, legal audit logs |

*(One-click demo buttons are available on the login page for instant authentication).*

---

## 💻 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Flow (`reactflow`), Axios.
- **Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy, Uvicorn, PyJWT.
- **AI & Analytics:** OpenCV (`cv2`), Pillow (`PIL`), NumPy, PyPDF, ReportLab (PDF compilation), Perceptual Hash (64-bit dHash).
- **Database:** SQLite (default zero-config out-of-the-box, fully compatible with PostgreSQL via `DATABASE_URL`).

---

## 🛠️ Quickstart Installation & Execution

### 1. Start the Unified Backend & Application Server
From the project root:

```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The server automatically initializes the database, creates tables, seeds all sample claims and accounts, and serves:
- **Full Web Application UI:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger REST API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **System Health Endpoint:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. (Optional) Run the Vite Hot-Reload Frontend Development Server
If you wish to make live UI modifications with instant hot module replacement:

```bash
cd frontend
npm run dev
```
Access the Vite dev server at [http://localhost:5173](http://localhost:5173).

---

## 📄 Exporting Official Investigation Dossiers

Every claim generates an official, downloadable **19-Section PDF Investigation Dossier** via ReportLab. You can download the PDF directly from the UI or via API:
- In the UI: Click **Download Official PDF Report** in the claim workspace or report tab.
- Via API: `GET http://127.0.0.1:8000/api/investigation/CLM-2026-001/report/pdf`

---

## ⚖️ Ethical AI & Governance Statement

1. **Human-in-the-Loop Authority:** CLAIMMIND AI never autonomously approves, denies, or settles high-impact claims. All decisions require human sign-off.
2. **Anti-Bias Principles:** Protected personal attributes are excluded from all risk scoring. Metadata stripping, shared workshops, and missing records are classified as investigative leads, never standalone proof of fraud.
3. **Traceable Evidence Lineage:** Every single finding is traceable to a specific image hash, policy clause code, or line item.
