import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortalNavbar } from '../../components/portal/PortalNavbar';
import { portalApi, BASE_URL } from '../../services/api';
import {
  Car,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Send,
  UploadCloud,
  FileText,
  Star,
  RefreshCw,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Eye,
  Info,
} from 'lucide-react';

export const ClaimantClaimDetailPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat message state
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Additional Evidence Upload state
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [evidenceSuccess, setEvidenceSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    if (!claimId) return;
    loadDossier();
  }, [claimId]);

  const loadDossier = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await portalApi.getCustomerClaimDossier(claimId!);
      setDossier(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to retrieve claim dossier.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !claimId) return;

    try {
      setSendingMsg(true);
      await portalApi.sendCustomerClarification(claimId, messageText);
      setMessageText('');
      await loadDossier();
    } catch (e) {
      alert('Failed to send clarification message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUploadAdditionalEvidence = async (files: FileList | null) => {
    if (!files || files.length === 0 || !claimId) return;
    const file = files[0];

    try {
      setUploadingEvidence(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'damage_photo');

      await portalApi.uploadCustomerEvidence(claimId, formData);
      setEvidenceSuccess(`Successfully uploaded ${file.name}. Triggered investigation refresh.`);
      setTimeout(() => setEvidenceSuccess(null), 5000);
      await loadDossier();
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimId) return;
    try {
      await portalApi.submitCustomerFeedback(claimId, feedbackText, rating);
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 4000);
    } catch (e) {
      alert('Failed to submit feedback.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PortalNavbar />
        <div className="max-w-4xl mx-auto py-24 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading claim tracking status...</p>
        </div>
      </div>
    );
  }

  const claim = dossier;
  const decision = claim?.human_decision;
  const isEvidenceRequested = claim?.status === 'EVIDENCE_REQUESTED';
  const isApproved = claim?.status === 'APPROVED';
  const isRejected = claim?.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PortalNavbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Customer Tracker
              </span>
              <span>&rsaquo;</span>
              <span className="font-mono text-slate-800 font-bold">{claimId}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Claim Tracking & Adjudication Dossier
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Live updates from Computer Vision damage detection, OCR cross-checks, and human claims investigator decisions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/claimant/dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Claims
            </button>

            {claim?.report && (
              <a
                href={`${BASE_URL}${claim.report.pdf_url}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" /> Download Investigation PDF Report
              </a>
            )}
          </div>
        </div>

        {/* Action Required Banner (When Evidence is Requested) */}
        {isEvidenceRequested && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-950">Action Required: Additional Evidence Requested</h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    The human insurance investigator reviewed the AI damage findings and requested additional clarification
                    and photos before settlement authorization.
                  </p>

                  {decision?.requested_items && decision.requested_items.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-bold text-amber-900 mb-1">Requested Items:</p>
                      <ul className="text-xs text-amber-800 list-disc list-inside space-y-0.5">
                        {decision.requested_items.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {decision?.remarks && (
                    <p className="text-xs text-amber-900 mt-2 italic bg-amber-100/60 p-2.5 rounded-lg border border-amber-200">
                      Investigator Note: "{decision.remarks}"
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Upload Button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => handleUploadAdditionalEvidence(e.target.files)}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingEvidence}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <UploadCloud className="w-4 h-4" />
                  {uploadingEvidence ? 'Uploading...' : 'Upload Requested Files'}
                </button>
              </div>
            </div>

            {evidenceSuccess && (
              <p className="text-xs font-bold text-emerald-800 bg-emerald-100/80 p-2 rounded-lg mt-3 border border-emerald-300">
                {evidenceSuccess}
              </p>
            )}
          </div>
        )}

        {/* Approved Banner */}
        {isApproved && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 rounded-xl p-5 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-emerald-950">Claim Approved & Settled</h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Your insurance claim has been verified and authorized for payout of{' '}
                  <span className="font-bold text-emerald-900">
                    ₹{Number(decision?.approved_amount || claim.accident.claimed_amount).toLocaleString('en-IN')}
                  </span>
                  .
                </p>
                {decision?.remarks && (
                  <p className="text-xs text-emerald-900 italic mt-1">Investigator Remarks: "{decision.remarks}"</p>
                )}
              </div>
            </div>

            {claim?.report && (
              <a
                href={`${BASE_URL}${claim.report.pdf_url}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-emerald-800 flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Official Settlement Letter (PDF)
              </a>
            )}
          </div>
        )}

        {/* Rejected Banner */}
        {isRejected && (
          <div className="mb-6 bg-red-50 border border-red-300 rounded-xl p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-red-950">Claim Decision: Denied</h3>
                <p className="text-xs text-red-800 mt-1">
                  Rejection Grounds: <span className="font-semibold">{decision?.rejection_reason || 'Inconsistent evidence.'}</span>
                </p>
                {decision?.remarks && (
                  <p className="text-xs text-red-900 mt-1 italic">Investigator Remarks: "{decision.remarks}"</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Claim & Vehicle Snapshot */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Policyholder</p>
              <p className="font-bold text-slate-900 mt-0.5">{claim.personal.name}</p>
              <p className="text-[11px] text-slate-500">{claim.personal.contact}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Policy & Case ID</p>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{claim.policy_number}</p>
              <p className="font-mono text-[11px] text-emerald-700 font-bold">{claimId}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Insured Vehicle</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {claim.vehicle.manufacturer} {claim.vehicle.model}
              </p>
              <p className="font-mono text-[11px] text-slate-600">{claim.vehicle.registration_number}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Claimed Repair Amount</p>
              <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                ₹{Number(claim.accident.claimed_amount || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500">{claim.accident.accident_type}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Evidence & Remarks */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Investigation Remarks Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> AI Autonomous Investigation Summary
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-indigo-50/40 p-3.5 rounded-lg border border-indigo-100">
                {claim.ai_remarks || 'AI inspection is currently running.'}
              </p>
            </div>

            {/* Uploaded Physical Evidence Gallery */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> Submitted Evidence ({claim.evidence_files?.length || 0})
                </h3>
              </div>

              {claim.evidence_files && claim.evidence_files.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {claim.evidence_files.map((ev: any) => (
                    <div
                      key={ev.id}
                      className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-xs flex flex-col justify-between"
                    >
                      <div className="overflow-hidden mb-2">
                        {ev.file_type === 'image' ? (
                          <img
                            src={`${BASE_URL}${ev.file_url}`}
                            alt={ev.file_name}
                            className="w-full h-24 object-cover rounded border border-slate-200"
                          />
                        ) : (
                          <div className="w-full h-24 rounded bg-amber-50 border border-amber-200 text-amber-700 font-bold flex items-center justify-center text-sm">
                            PDF REPORT
                          </div>
                        )}
                        <p className="font-semibold text-slate-800 truncate mt-1.5">{ev.file_name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{ev.category.replace('_', ' ')}</p>
                      </div>

                      <a
                        href={`${BASE_URL}${ev.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View File
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No evidence uploaded yet.</p>
              )}
            </div>

            {/* Customer Feedback Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-amber-500" /> Rate Your Claim Experience
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Your rating helps our claims automation team ensure transparent and speedy claim investigations.
              </p>

              {feedbackSuccess ? (
                <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  Thank you! Your feedback has been recorded.
                </p>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          rating >= s
                            ? 'bg-amber-50 border-amber-300 text-amber-500'
                            : 'bg-slate-50 border-slate-200 text-slate-300'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{rating} of 5 Stars</span>
                  </div>

                  <textarea
                    rows={2}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share any comments regarding speed, clarity, or ease of upload..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Col: Communication Thread with Investigator */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-[520px]">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" /> Messages & Clarifications
                  </h3>
                  <p className="text-[11px] text-slate-500">Live thread with insurance investigator</p>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {claim.messages && claim.messages.length > 0 ? (
                  claim.messages.map((m: any) => {
                    const isFromCustomer = m.sender_role === 'claimant';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isFromCustomer ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5">
                          {m.sender_name} • {m.created_at?.slice(11, 16) || ''}
                        </span>
                        <div
                          className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                            isFromCustomer
                              ? 'bg-emerald-600 text-white rounded-br-2xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-2xs border border-slate-200'
                          }`}
                        >
                          {m.message_text}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 text-center py-10">No messages exchanged yet.</p>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Send clarification or reply..."
                  className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition-colors shadow-2xs cursor-pointer"
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
export default ClaimantClaimDetailPage;
