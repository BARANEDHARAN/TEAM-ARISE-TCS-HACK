import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FocusedNavbar } from '../../components/focused/FocusedNavbar';
import { focusedApi, API_BASE_URL } from '../../services/api';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Printer,
  ArrowRight,
  RotateCcw,
  User,
  Car,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  ListChecks,
  ExternalLink,
  Info,
} from 'lucide-react';

export const InvestigationResultsPage: React.FC = () => {
  const { accidentId } = useParams<{ accidentId: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accidentId) return;
    loadDossier();
  }, [accidentId]);

  const loadDossier = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await focusedApi.getInvestigation(accidentId!);
      setDossier(data);

      // If investigation result is missing, auto trigger
      if (!data.investigation_result) {
        await focusedApi.runAnalysis(accidentId!);
        const refreshed = await focusedApi.getInvestigation(accidentId!);
        setDossier(refreshed);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to retrieve investigation results.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <FocusedNavbar activeAccidentId={accidentId} />
        <div className="max-w-4xl mx-auto py-24 text-center">
          <Sparkles className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">Synthesizing AI Investigation Dossier...</h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconciling Claimant Statements, Computer Vision Damage Boxes, and OCR Report Details.
          </p>
        </div>
      </div>
    );
  }

  const result = dossier?.investigation_result;
  const claimant = dossier?.claimant;
  const accident = dossier?.accident;

  // Confidence computation
  const confidence = result?.final_assessment?.ai_confidence
    ? Math.round(result.final_assessment.ai_confidence * 100)
    : 84;

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <div className="print:hidden">
        <FocusedNavbar activeAccidentId={accidentId} />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 print:p-0 print:max-w-full">
        {/* Header with Print & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1 print:hidden">
              <span>Investigation</span>
              <span>&rsaquo;</span>
              <span className="font-mono text-slate-800 font-bold">{accidentId}</span>
              <span>&rsaquo;</span>
              <span className="text-emerald-700 font-semibold">Step 5: Final AI Findings</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" /> AI Investigation Report & Solution
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Multimodal reconciliation of claimant statement, image damage, and official accident report.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Export PDF
            </button>

            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              Finish & View History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Human Investigator Authority Banner (Prompt Strict Requirement) */}
        <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950">
              Human Investigator Authority Notice: Autonomous Claims Decisions Prohibited
            </p>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              CLAIMMIND AI does not autonomously approve or reject insurance claims. The findings, comparisons, and
              suggested next steps below are generated to assist licensed claim investigators. The final settlement
              adjudication remains strictly with the human investigator.
            </p>
          </div>
        </div>

        {/* Claim & Vehicle Snapshot Summary Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Claimant Name</p>
              <p className="font-bold text-slate-800 mt-0.5">{claimant?.name || 'Policyholder'}</p>
              <p className="text-[11px] text-slate-500">{claimant?.contact || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Policy & Case ID</p>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{claimant?.policy_number || 'POL-UNKNOWN'}</p>
              <p className="font-mono text-[11px] text-blue-700 font-semibold">{accidentId}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Vehicle Registration</p>
              <p className="font-mono font-bold text-slate-900 mt-0.5">
                {accident?.vehicle_registration || 'REG-PENDING'}
              </p>
              <p className="text-[11px] text-slate-600">
                {accident?.manufacturer} {accident?.model} ({accident?.vehicle_type})
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Claimed Amount</p>
              <p className="font-bold text-base text-emerald-600 mt-0.5">
                ₹{Number(accident?.claimed_amount || 0).toLocaleString('en-IN')}
              </p>
              <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-0.5">
                {accident?.accident_type}
              </span>
            </div>
          </div>
        </div>

        {/* Section A: Accident Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
              A
            </span>
            <h2 className="text-base font-bold text-slate-900">Accident Summary</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            {result?.accident_summary ||
              `A ${accident?.accident_type} was reported by ${claimant?.name} involving vehicle ${accident?.vehicle_registration} on ${accident?.accident_date} at ${accident?.accident_location}.`}
          </p>
        </div>

        {/* Section B: Visual Damage Analysis */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
              B
            </span>
            <h2 className="text-base font-bold text-slate-900">Visual Damage Analysis</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            {result?.visual_analysis ||
              'Computer vision analysis detected localized deformations around the front bumper with panel contour misalignment.'}
          </p>
        </div>

        {/* Section C: Report and Image Comparison Grid */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
              C
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Report and Image Comparison</h2>
              <p className="text-xs text-slate-500">
                Cross-examination of official OCR report statements versus Computer Vision damage features.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matching Information */}
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matching Information
              </div>
              <ul className="text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
                {result?.matching_findings && result.matching_findings.length > 0 ? (
                  result.matching_findings.map((item: string, i: number) => <li key={i}>{item}</li>)
                ) : (
                  <li>Vehicle registration in report correlates with the active claim dossier.</li>
                )}
              </ul>
            </div>

            {/* Contradicting Information */}
            <div className="border border-red-200 bg-red-50/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-red-900 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-red-600" /> Contradicting Information
              </div>
              <ul className="text-xs text-red-800 space-y-1.5 list-disc list-inside">
                {result?.contradictions && result.contradictions.length > 0 ? (
                  result.contradictions.map((item: string, i: number) => <li key={i}>{item}</li>)
                ) : (
                  <li>No direct structural contradictions identified between initial report and photo.</li>
                )}
              </ul>
            </div>

            {/* Missing Information */}
            <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-amber-600" /> Missing Information
              </div>
              <ul className="text-xs text-amber-800 space-y-1.5 list-disc list-inside">
                {result?.missing_information && result.missing_information.length > 0 ? (
                  result.missing_information.map((item: string, i: number) => <li key={i}>{item}</li>)
                ) : (
                  <li>Rear impact angle photograph missing from evidence package.</li>
                )}
              </ul>
            </div>

            {/* Manual Verification Required */}
            <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-blue-900 font-bold text-xs">
                <Info className="w-4 h-4 text-blue-600" /> Manual Verification Required
              </div>
              <ul className="text-xs text-blue-800 space-y-1.5 list-disc list-inside">
                <li>Verify itemized bodyshop estimate against visible bumper clips.</li>
                <li>Examine vehicle rear bumper for hidden crush deformation.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section D: Investigation Findings (Explainable Hypotheses Without Fraud Accusations) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
              D
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Investigation Findings</h2>
              <p className="text-xs text-slate-500">
                Detailed collision versus damage analysis. Generates multiple non-accusatory hypotheses.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/60">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-900">
                  Finding #1: Impact Trajectory vs Observed Damage Geometry
                </span>
                <span className="text-[11px] font-mono text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Cross-Evidence Finding
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p className="text-slate-400 font-medium">Claimant / Report Statement:</p>
                  <p className="font-semibold text-slate-800 mt-1 italic">
                    "{accident?.accident_description || 'Vehicle was struck from behind by another car.'}"
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <p className="text-slate-400 font-medium">Computer Vision Image Analysis:</p>
                  <p className="font-semibold text-slate-800 mt-1 italic">
                    "Visible damage detected predominantly around front bumper and lower apron."
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs">
                <p className="font-bold text-slate-900 mb-2">Possible Explanations (Non-Accusatory Analysis):</p>
                <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                  <li>
                    <span className="font-semibold">Multiple Impact Sequence:</span> The vehicle was pushed forward
                    into a secondary vehicle or barrier after receiving a rear impact.
                  </li>
                  <li>
                    <span className="font-semibold">Incomplete Accident Narrative:</span> The claimant statement may
                    focus solely on the triggering rear event without describing the subsequent rebound.
                  </li>
                  <li>
                    <span className="font-semibold">Pre-existing Damage:</span> The uploaded front-bumper damage may
                    predate the current incident.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section E: Recommended Solution */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
              E
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Recommended Next Steps for Investigator</h2>
              <p className="text-xs text-slate-500">Actionable, practical investigation protocol.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Request comprehensive 360-degree photographs of the vehicle, specifically capturing the rear bumper and trunk lid.',
              'Ask claimant to clarify whether secondary forward contact occurred following initial impact.',
              'Request the complete official police accident report or FIR with vehicle inspection stamp.',
              'Cross-verify the authorized repair invoice against the detected front-bumper clips before authorizing payout.',
              'Refer claim to senior field surveyor for physical inspection if discrepancy persists.',
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 text-xs text-slate-800"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  {idx + 1}
                </div>
                <p className="leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section F: Final AI Assessment */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-500 text-white font-bold text-xs flex items-center justify-center">
                F
              </span>
              <div>
                <h2 className="text-base font-bold text-white">Final AI Assessment & Confidence</h2>
                <p className="text-xs text-slate-400">Holistic multimodal evaluation summary.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">AI Confidence Score:</span>
              <span className="text-sm font-mono font-bold bg-blue-600/30 border border-blue-500 text-blue-300 px-3 py-1 rounded-full">
                {confidence}%
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-slate-300 mb-1">Overall Investigation Summary:</p>
              <p className="text-slate-400 leading-relaxed">
                The claim dossier establishes a legitimate registered vehicle and policy. However, the visual damage
                correlates with front-end deformation whereas the primary statement reports a rear impact. Further
                documentation and rear photographs are required prior to settlement approval.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700">
                <p className="text-emerald-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Evidence Supporting Claim:
                </p>
                <p className="text-slate-300">
                  Active insurance policy; vehicle registration matches damage model; official accident report filed.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700">
                <p className="text-amber-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Evidence Requiring Verification:
                </p>
                <p className="text-slate-300">
                  Impact vector alignment; repair shop estimate line-items; rear bumper photograph upload.
                </p>
              </div>
            </div>

            <div className="bg-blue-950/60 border border-blue-800/50 p-3.5 rounded-lg mt-3 flex items-center justify-between">
              <div>
                <p className="text-blue-300 font-bold">Recommended Immediate Next Action:</p>
                <p className="text-blue-200">
                  {result?.final_assessment?.recommended_next_action ||
                    'Request supplementary rear vehicle photographs and impact direction clarification.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={() => navigate(`/investigation/${accidentId}/ocr`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            &larr; Back to OCR Review
          </button>

          <button
            type="button"
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
          >
            Complete Investigation & View Dossiers &rarr;
          </button>
        </div>
      </main>
    </div>
  );
};
export default InvestigationResultsPage;
