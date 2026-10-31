import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortalNavbar } from '../../components/portal/PortalNavbar';
import { portalApi, BASE_URL } from '../../services/api';
import { EvidenceRelationshipGraph } from '../../components/portal/EvidenceRelationshipGraph';
import {
  Scale,
  CheckCircle,
  AlertTriangle,
  FileText,
  Scan,
  Download,
  Send,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Eye,
  MessageSquare,
  ShieldCheck,
  Check,
  X,
  Flag,
  User,
  Car,
  Receipt,
  HelpCircle,
  Layers,
} from 'lucide-react';

export const HumanReviewWorkspacePage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Finding review local state
  const [findingRemarks, setFindingRemarks] = useState<Record<string, string>>({});
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [deskView, setDeskView] = useState<'evidence' | 'graph'>('evidence');

  // Decision Modal State
  const [decisionType, setDecisionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_EVIDENCE' | null>(null);
  const [approvedAmount, setApprovedAmount] = useState<string>('0');
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestedItems, setRequestedItems] = useState<string[]>([
    'Rear Bumper and Trunk Clear Photos',
    'Clarification on whether vehicle struck another barrier forward',
  ]);
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Direct Message State
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    if (!claimId) return;
    loadAll();
  }, [claimId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [aiData, msgs] = await Promise.all([
        portalApi.getAiClaimDossier(claimId!),
        portalApi.getClaimMessages(claimId!),
      ]);
      setDossier(aiData);
      setMessages(msgs || []);
      setApprovedAmount(String(aiData?.accident?.claimed_amount || 0));

      // Pre-fill remarks if findings have any
      const remarksMap: Record<string, string> = {};
      aiData?.findings?.forEach((f: any) => {
        if (f.human_remarks) remarksMap[f.id] = f.human_remarks;
      });
      setFindingRemarks(remarksMap);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.detail || 'Failed to load adjudication dossier.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewFinding = async (findingId: string, action: 'accepted' | 'rejected' | 'flagged') => {
    try {
      const rem = findingRemarks[findingId] || '';
      await portalApi.reviewAiFinding(findingId, action, rem);
      setReviewSuccess(`Finding updated: Marked as ${action.toUpperCase()}`);
      setTimeout(() => setReviewSuccess(null), 3000);
      await loadAll();
    } catch (e) {
      alert('Failed to update finding status.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !claimId) return;

    try {
      setSendingMsg(true);
      await portalApi.sendHumanMessage(claimId, newMessage);
      setNewMessage('');
      const updatedMsgs = await portalApi.getClaimMessages(claimId);
      setMessages(updatedMsgs);
    } catch (e) {
      alert('Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleExecuteDecision = async () => {
    if (!decisionType || !claimId) return;

    if (decisionType === 'REJECT' && !rejectionReason.trim()) {
      alert('Please specify the mandatory rejection grounds.');
      return;
    }

    try {
      setSubmittingDecision(true);
      await portalApi.submitHumanDecision(claimId, {
        decision: decisionType,
        remarks,
        rejection_reason: rejectionReason,
        requested_items: decisionType === 'REQUEST_EVIDENCE' ? requestedItems : [],
        approved_amount: parseFloat(approvedAmount || '0'),
      });

      alert(`Decision recorded successfully: ${decisionType}! Notification delivered to customer.`);
      setDecisionType(null);
      await loadAll();
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Failed to execute decision.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PortalNavbar />
        <div className="max-w-4xl mx-auto py-24 text-center">
          <Scale className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading adjudication workspace...</p>
        </div>
      </div>
    );
  }

  const claim = dossier;
  const cv = claim?.image_analysis;
  const ocr = claim?.ocr_result;
  const findings = claim?.findings || [];
  const recommendations = claim?.recommendations || [];

  const originalImgUrl = claim?.evidence_files?.find((f: any) => f.file_type === 'image')?.file_url;
  const processedImgUrl = cv?.processed_image_url;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PortalNavbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Login 3
              </span>
              <span>&rsaquo;</span>
              <span className="font-mono text-slate-800 font-bold">{claimId}</span>
              <span>&rsaquo;</span>
              <span>Adjudication & Final Decision Desk</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Scale className="w-6 h-6 text-amber-600" /> Human Claims Investigator Review Desk
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Strict Human-in-the-Loop Governance: Review AI damage models, correct interpretations, and finalize payout decisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/human-investigator/dashboard')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Queue
            </button>

            {claim?.report_pdf_url && (
              <a
                href={`${BASE_URL}${claim.report_pdf_url}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" /> AI Findings Report (PDF)
              </a>
            )}

            <a
              href={portalApi.getReportUrl(claimId!, 'final')}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" /> Final Adjudication PDF
            </a>
          </div>
        </div>

        {/* Success Alert */}
        {reviewSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="font-semibold">{reviewSuccess}</p>
          </div>
        )}

        {/* Claim & Claimant Context Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Claimant Name</p>
              <p className="font-bold text-slate-900 mt-0.5">{claim?.claimant_name}</p>
              <p className="text-[11px] text-slate-500">{claim?.policy_number}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Vehicle Registration</p>
              <p className="font-mono font-bold text-slate-900 mt-0.5">
                {claim?.vehicle?.registration_number}
              </p>
              <p className="text-[11px] text-slate-600">
                {claim?.vehicle?.manufacturer} {claim?.vehicle?.model}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Reported Accident</p>
              <p className="font-semibold text-slate-900 mt-0.5">{claim?.accident?.type}</p>
              <p className="text-[11px] text-slate-500">{claim?.accident?.date} • {claim?.accident?.location}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Claimed Amount</p>
              <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                ₹{Number(claim?.accident?.claimed_amount || 0).toLocaleString('en-IN')}
              </p>
              <span className="font-bold text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Status: {claim?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Adjudication Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left 2 Cols: AI Evidence & Findings Review */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDeskView('evidence')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    deskView === 'evidence'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Adjudication Desk & Findings
                </button>
                <button
                  type="button"
                  onClick={() => setDeskView('graph')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    deskView === 'graph'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Interactive Evidence Graph
                </button>
              </div>
              <span className="text-[11px] font-mono text-slate-400 pr-2">
                {deskView === 'evidence' ? 'Findings & Bounding Boxes' : 'Multi-Modal Relational Topology'}
              </span>
            </div>

            {deskView === 'graph' ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-600" /> Evidence Relationship Graph
                    </h2>
                    <p className="text-xs text-slate-500">
                      Explore connected graph topology across Statement, OCR Attributes, OpenCV Damage Contours, Inconsistencies, and Decisions.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded border border-amber-200">
                    React Flow
                  </span>
                </div>
                <EvidenceRelationshipGraph claimId={claimId!} height="650px" />
              </div>
            ) : (
              <>
            {/* Section 1: Side-by-Side Visual Damage Inspection */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Scan className="w-4 h-4 text-indigo-600" /> Visual Evidence Inspection (OpenCV Damage Detection)
                </h2>
                <span className="text-xs font-mono text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  Confidence: {Math.round((cv?.confidence || 0.85) * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Original Photo */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    Original Claimant Photograph
                  </div>
                  <div className="p-3 bg-black min-h-[260px] flex items-center justify-center">
                    {originalImgUrl ? (
                      <img
                        src={`${BASE_URL}${originalImgUrl}`}
                        alt="Original"
                        className="max-h-[260px] object-contain rounded"
                      />
                    ) : (
                      <p className="text-xs text-slate-400">No original image.</p>
                    )}
                  </div>
                </div>

                {/* Annotated CV Photo */}
                <div className="border border-indigo-200 rounded-lg overflow-hidden bg-indigo-50/30">
                  <div className="px-3 py-1.5 bg-indigo-100/70 border-b border-indigo-200 text-[11px] font-bold text-indigo-900 flex items-center justify-between">
                    <span>OpenCV Damage Bounding Boxes</span>
                    <span className="text-[10px] text-indigo-600 font-mono">Annotated</span>
                  </div>
                  <div className="p-3 bg-black min-h-[260px] flex items-center justify-center">
                    {processedImgUrl ? (
                      <img
                        src={`${BASE_URL}${processedImgUrl}`}
                        alt="Processed"
                        className="max-h-[260px] object-contain rounded shadow-sm"
                      />
                    ) : (
                      <p className="text-xs text-slate-400">Annotated view pending.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Detected components */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-slate-700">Detected Structural Damage: </span>
                <span className="text-slate-900 font-semibold">
                  {cv?.detected_damage?.join(', ') || 'Front Bumper Damage & Dent'}
                </span>
              </div>
            </div>

            {/* Section 2: AI Inconsistency Review & Human Verification Controls (Prompt Section 1 - Login 3.C) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Interactive AI Finding Review
                  </h2>
                  <p className="text-xs text-slate-500">
                    Accept, reject, or flag individual AI findings and append official investigator remarks.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                  Human Oversight Required
                </span>
              </div>

              <div className="space-y-5">
                {findings.map((f: any) => {
                  const currentStatus = f.human_status || 'pending';
                  const isAccepted = currentStatus === 'accepted';
                  const isRejected = currentStatus === 'rejected';
                  const isFlagged = currentStatus === 'flagged';

                  return (
                    <div
                      key={f.id}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-xs">{f.title}</span>
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isRejected
                              ? 'bg-red-100 text-red-800'
                              : isFlagged
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Status: {currentStatus}
                        </span>
                      </div>

                      <p className="text-slate-700 mb-3 leading-relaxed">{f.finding_text}</p>

                      {/* Investigator Remarks Input */}
                      <div className="mb-3">
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Investigator Observation / Correction Remarks:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Verified with claimant - secondary impact confirmed into vehicle ahead."
                          value={findingRemarks[f.id] || ''}
                          onChange={(e) =>
                            setFindingRemarks({ ...findingRemarks, [f.id]: e.target.value })
                          }
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      {/* Finding Action Buttons (Prompt Section 1 - Login 3.C) */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleReviewFinding(f.id, 'accepted')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                            isAccepted
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" /> Accept Finding
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReviewFinding(f.id, 'rejected')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                            isRejected
                              ? 'bg-red-600 text-white shadow-2xs'
                              : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" /> Reject Finding
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReviewFinding(f.id, 'flagged')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                            isFlagged
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          <Flag className="w-3.5 h-3.5" /> Flag for Verification
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: OCR Extracted Incident Report Data */}
            {ocr && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" /> OCR Accident Report Extraction (PyMuPDF)
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {ocr.page_count || 1} Pages Processed
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-mono text-[10px] block">Impact Direction:</span>
                    <span className="font-semibold text-slate-800">{ocr.extracted_fields?.impact_direction || 'Not found'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-mono text-[10px] block">Reported Damage:</span>
                    <span className="font-semibold text-slate-800">{ocr.extracted_fields?.reported_damage || 'Not found'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 font-mono text-[10px] block">Parties Involved:</span>
                    <span className="font-semibold text-slate-800">{ocr.extracted_fields?.parties_involved || 'Not found'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: AI Recommendations & Solution Directives */}
            {recommendations && recommendations.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" /> AI Adjudication Directives & Solution Recommendations
                  </h2>
                </div>
                <div className="space-y-2">
                  {recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-purple-100 bg-purple-50/40 text-xs">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">{rec.action_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Right Col: Communication & Decision Desk */}
          <div className="space-y-6">
            {/* Final Claim Decision Panel (Prompt Section 1 - Login 3.D) */}
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 text-amber-400" /> Final Claim Settlement Determination
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">
                Execute final legal decision. Customer is automatically notified upon decision submission.
              </p>

              <div className="space-y-3">
                {/* 1. APPROVE CLAIM */}
                <button
                  type="button"
                  onClick={() => setDecisionType('APPROVE')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 hover:bg-emerald-900/80 transition-colors text-xs font-bold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> 1. APPROVE CLAIM
                  </span>
                  <span>&rarr;</span>
                </button>

                {/* 2. REJECT CLAIM */}
                <button
                  type="button"
                  onClick={() => setDecisionType('REJECT')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-red-950/60 border border-red-700 text-red-300 hover:bg-red-900/80 transition-colors text-xs font-bold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> 2. REJECT CLAIM
                  </span>
                  <span>&rarr;</span>
                </button>

                {/* 3. REQUEST ADDITIONAL EVIDENCE */}
                <button
                  type="button"
                  onClick={() => setDecisionType('REQUEST_EVIDENCE')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-amber-950/60 border border-amber-700 text-amber-300 hover:bg-amber-900/80 transition-colors text-xs font-bold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" /> 3. REQUEST EVIDENCE
                  </span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Decision Dialog Modal / In-line Drawer */}
              {decisionType && (
                <div className="mt-4 pt-4 border-t border-slate-800 text-xs space-y-3 bg-slate-950 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">Configure {decisionType}</span>
                    <button
                      type="button"
                      onClick={() => setDecisionType(null)}
                      className="text-slate-500 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {decisionType === 'APPROVE' && (
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Approved Settlement Amount (₹):
                      </label>
                      <input
                        type="number"
                        value={approvedAmount}
                        onChange={(e) => setApprovedAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
                      />
                    </div>
                  )}

                  {decisionType === 'REJECT' && (
                    <div>
                      <label className="text-[11px] text-red-400 block mb-1">
                        Mandatory Rejection Ground / Reason:
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="State why claim is denied (e.g. Damage unsupported by impact physics)..."
                        className="w-full bg-slate-900 border border-red-800 rounded-lg p-2 text-white"
                      />
                    </div>
                  )}

                  {decisionType === 'REQUEST_EVIDENCE' && (
                    <div>
                      <label className="text-[11px] text-amber-400 block mb-1">Requested Missing Items:</label>
                      <div className="space-y-1 text-[11px] text-slate-300">
                        {requestedItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded">
                            <span>•</span>
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Investigator Remarks:</label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add formal notes for the claim file and customer notification..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteDecision}
                    disabled={submittingDecision}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    {submittingDecision ? 'Submitting...' : `Confirm & Record ${decisionType}`}
                  </button>
                </div>
              )}
            </div>

            {/* Direct Communication System (Section 1 - Login 3.E) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[400px]">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" /> Customer Communication
                  </h3>
                  <p className="text-[11px] text-slate-500">Live thread with {claim?.claimant_name}</p>
                </div>
              </div>

              {/* Message history */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No messages yet.</p>
                ) : (
                  messages.map((m: any) => {
                    const isFromMe = m.sender_role === 'human_investigator';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5">
                          {m.sender_name} • {m.created_at?.slice(11, 16) || ''}
                        </span>
                        <div
                          className={`max-w-[85%] rounded-xl p-2.5 text-xs ${
                            isFromMe
                              ? 'bg-amber-600 text-white rounded-br-2xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-2xs border border-slate-200'
                          }`}
                        >
                          {m.message_text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send message */}
              <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask clarification or message claimant..."
                  className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-500 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default HumanReviewWorkspacePage;
