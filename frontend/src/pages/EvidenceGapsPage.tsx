import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  HelpCircle,
  FileCheck2,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { modulesApi } from '../services/api';

export const EvidenceGapsPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [gaps, setGaps] = useState<any[]>([]);
  const [letterText, setLetterText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!claimId) return;
    try {
      setLoading(true);
      const [gapRes, letterRes] = await Promise.all([
        modulesApi.getGaps(claimId),
        modulesApi.getGapLetter(claimId),
      ]);
      setGaps(gapRes.evidence_gaps || []);
      setLetterText(letterRes.letter_text || '');
    } catch (err) {
      console.error('Failed to load evidence gaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [claimId]);

  const handleRequestGap = async (gapId: string) => {
    if (!claimId) return;
    try {
      setRequestingId(gapId);
      await modulesApi.requestGap(claimId, gapId);
      await fetchData();
    } catch (err) {
      console.error('Failed to request gap:', err);
    } finally {
      setRequestingId(null);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Running Next-Best-Evidence gap prediction engine...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
            Module 08 & Innovation 03
          </span>
          <span className="text-xs text-slate-400">Claim {claimId}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Next-Best-Evidence Intelligence & Gap Elimination
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Avoids generic missing document checklists. Explains specifically which contradiction each document resolves and compiles formal requests.
        </p>
      </div>

      {/* Section 1: Next-Best-Evidence Action Items */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-rose-600" />
          Targeted Evidentiary Deficiencies ({gaps.length})
        </h2>

        {gaps.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-400">
            No critical evidence gaps detected for this claim.
          </div>
        ) : (
          <div className="space-y-4">
            {gaps.map((gap: any) => (
              <div
                key={gap.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{gap.id}</span>
                    <h3 className="text-sm font-bold text-slate-900">{gap.missing_evidence_type}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        gap.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : gap.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {gap.priority} PRIORITY
                    </span>
                    {gap.is_requested ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched to Claimant
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRequestGap(gap.id)}
                        disabled={requestingId === gap.id}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-all flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        {requestingId === gap.id ? 'Dispatching...' : 'Dispatch Evidence Request'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Why This Evidence Is Critical:
                      </span>
                      <p className="text-slate-700 leading-relaxed mt-0.5">{gap.importance_rationale}</p>
                    </div>
                    {gap.target_hypothesis && (
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                          Resolves Competing Hypotheses:
                        </span>
                        <p className="text-indigo-900 font-medium mt-0.5">{gap.target_hypothesis}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                        Specific Items Claimant Must Provide:
                      </span>
                      <p className="text-blue-950 font-medium mt-0.5">{gap.what_claimant_should_provide}</p>
                    </div>
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Action Upon Receipt:
                      </span>
                      <p className="text-emerald-900 mt-0.5">{gap.next_step_after_receiving}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Unique Feature: Generated Formal Evidence Request Letter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Formal Claimant Evidence Request Notice (Auto-Generated)
              </h2>
              <p className="text-xs text-slate-400">
                Reviewable official notice tailored to the specific identified inconsistencies
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyLetter}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy Notice Text'}
          </button>
        </div>

        <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800">
          {letterText}
        </div>
      </div>
    </div>
  );
};
