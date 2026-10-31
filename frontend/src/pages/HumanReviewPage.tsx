import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  ShieldCheck,
  Scale,
  DollarSign,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  History,
} from 'lucide-react';
import { claimsApi, modulesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const HumanReviewPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const { user, isReviewer, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Review Form state
  const [decision, setDecision] = useState('ACCEPTED_FOR_SETTLEMENT');
  const [finalAmount, setFinalAmount] = useState<number>(33000);
  const [notes, setNotes] = useState(
    'Front bumper and left headlamp verified with visual damage fingerprints. Compulsory policy excess applied.'
  );

  // Module 10 Feedback state
  const [feedbackType, setFeedbackType] = useState('ACCEPTED');
  const [feedbackReason, setFeedbackReason] = useState('Accurately detected front bumper deformation.');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchClaim = async () => {
    if (!claimId) return;
    try {
      setLoading(true);
      const data = await claimsApi.getClaim(claimId);
      setClaim(data);
      if (data.settlement_assessment) {
        setFinalAmount(data.settlement_assessment.indicative_settlement_min || 33000);
      }
    } catch (err) {
      console.error('Failed to load review data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [claimId]);

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimId) return;
    setSubmitting(true);
    try {
      await modulesApi.recordReview(claimId, {
        decision,
        final_settlement_amount: finalAmount,
        reviewer_notes: notes,
        accepted_findings: ['FP-FRONT_BUMPER', 'FP-LEFT_HEADLIGHT'],
        challenged_findings: [],
      });
      await fetchClaim();
      alert('Human Reviewer Decision recorded successfully.');
    } catch (err) {
      console.error('Failed to record reviewer decision:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimId) return;
    try {
      await modulesApi.submitFeedback(claimId, {
        module_name: 'cv_damage',
        feedback_type: feedbackType,
        correction_reason: feedbackReason,
      });
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading reviewer governance console...
      </div>
    );
  }

  const existingReviews = claim?.reviewer_decisions || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
            Part 3 Governance & Module 10
          </span>
          <span className="text-xs text-slate-400">Claim {claimId}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Human Reviewer Decision & Model Feedback Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ensures autonomous AI recommendations remain accountable to licensed insurance adjusters and review officers.
        </p>
      </div>

      {/* Main Review Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            Official Claims Determination Sign-Off
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Acting Reviewer: <b className="text-slate-800">{user?.full_name}</b> ({user?.role})
          </span>
        </div>

        <form onSubmit={handleSubmitDecision} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Final Adjudication Decision
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="ACCEPTED_FOR_SETTLEMENT">ACCEPTED FOR SETTLEMENT</option>
                <option value="REQUEST_ADDITIONAL_EVIDENCE">REQUEST ADDITIONAL EVIDENCE (GAPS PENDING)</option>
                <option value="ESCALATE_TO_SPECIAL_INVESTIGATION">ESCALATE TO SPECIAL INVESTIGATION UNIT (SIU)</option>
                <option value="REJECTED">REJECTED (POLICY EXCLUSION APPLIES)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Authorized Settlement Payout Amount (₹)
              </label>
              <input
                type="number"
                value={finalAmount}
                onChange={(e) => setFinalAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Reviewer Assessment Justification & Legal Audit Trail Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              placeholder="State the rationale for accepting or modifying the AI indicative settlement..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? 'Recording Adjudication...' : 'Record Final Adjudication Decision'}
          </button>
        </form>
      </div>

      {/* Module 10: Investigator Feedback Intelligence Component */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Module 10: Investigator Feedback & Calibration
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Continuous Quality Improvement</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Help calibrate ClaimMind models by recording whether AI findings were accepted, challenged, or flagged as false positives.
        </p>

        {feedbackSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Investigator feedback submitted to model calibration queue.</span>
          </div>
        )}

        <form onSubmit={handleSubmitFeedback} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Feedback Response</label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
              >
                <option value="ACCEPTED">ACCEPTED (Finding accurately matches damage)</option>
                <option value="CHALLENGED">CHALLENGED (Finding questioned by surveyor)</option>
                <option value="FALSE_POSITIVE">FALSE POSITIVE (Pre-existing wear marked as impact)</option>
                <option value="MISSED_DAMAGE">MISSED DAMAGE (Additional visual damage present)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Correction Rationale</label>
              <input
                type="text"
                value={feedbackReason}
                onChange={(e) => setFeedbackReason(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold transition-all"
          >
            Submit Feedback
          </button>
        </form>
      </div>

      {/* Historical Review Audit Trail */}
      {existingReviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Prior Human Review Audit Trail
          </h2>
          <div className="space-y-2">
            {existingReviews.map((rev: any) => (
              <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rev.decision}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{rev.created_at}</span>
                </div>
                <p className="text-slate-700">Settlement Amount: ₹{rev.final_settlement_amount?.toLocaleString('en-IN')}</p>
                <p className="text-slate-600 italic">Notes: "{rev.reviewer_notes}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
