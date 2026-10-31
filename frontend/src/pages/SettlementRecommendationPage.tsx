import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calculator,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Info,
  DollarSign,
} from 'lucide-react';
import { modulesApi } from '../services/api';

export const SettlementRecommendationPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettlement = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const res = await modulesApi.getSettlement(claimId);
        setData(res);
      } catch (err) {
        console.error('Failed to load settlement assessment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettlement();
  }, [claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Calculating explainable settlement bracket against policy clauses...
      </div>
    );
  }

  if (data?.status === 'NOT_CALCULATED') {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <Calculator className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-slate-800">Settlement Assessment Pending</h2>
        <p className="text-xs text-slate-500 mt-1">Run the 15-Stage AI Investigation to generate settlement calculations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            Module 09
          </span>
          <span className="text-xs text-slate-400">Claim {claimId}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Explainable Settlement Intelligence & Assistant
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Mathematical decomposition of submitted repair estimates, verified damage items, policy excesses, and indicative settlement brackets.
        </p>
      </div>

      {/* Human Governance Disclaimer */}
      <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-950">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Human-in-the-Loop Settlement Protocol:</span> CLAIMMIND AI does not autonomously approve, negotiate, or reject claims. Calculated brackets are transparent mathematical baselines intended to empower the assigned Claims Investigator and Chief Review Officer.
        </div>
      </div>

      {/* Primary Settlement Metric Bracket */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
              Indicative Settlement Recommendation Bracket
            </span>
            <div className="text-3xl font-extrabold text-white mt-1">
              ₹{data?.indicative_settlement_min?.toLocaleString('en-IN')} &mdash; ₹
              {data?.indicative_settlement_max?.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              Currency: {data?.currency || 'INR'} &bull; Derived from currently verified evidence
            </p>
          </div>

          <button
            onClick={() => navigate(`/workspace/${claimId}/review`)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            Forward to Review Queue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transparent Calculation Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Transparent Cost Component Breakdown
          </h2>
        </div>

        <div className="p-5 space-y-4">
          <div className="divide-y divide-slate-100 text-xs">
            <div className="flex items-center justify-between py-2.5">
              <div>
                <span className="font-semibold text-slate-800">1. Total Submitted Estimate</span>
                <p className="text-[11px] text-slate-400">Gross repair quotation submitted by claimant / garage</p>
              </div>
              <span className="font-mono font-bold text-slate-900">
                ₹{data?.submitted_total?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <span className="font-semibold text-emerald-700">2. Visually Supported Repair Items</span>
                <p className="text-[11px] text-slate-400">Correlated directly with AI Damage Fingerprints</p>
              </div>
              <span className="font-mono font-bold text-emerald-700">
                + ₹{data?.supported_total?.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <span className="font-semibold text-amber-700">3. Unverified Ancillary / Teardown</span>
                <p className="text-[11px] text-slate-400">Internal clips, brackets, and paint requiring physical surveyor sign-off</p>
              </div>
              <span className="font-mono font-bold text-amber-700">
                ₹{data?.unverified_total?.toLocaleString('en-IN')} (Pending)
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <span className="font-semibold text-rose-700">4. Unsupported Over-Scoped Line Items</span>
                <p className="text-[11px] text-slate-400">Items lacking visual damage evidence in submitted accident photographs</p>
              </div>
              <span className="font-mono font-bold text-rose-700">
                ₹{data?.unsupported_total?.toLocaleString('en-IN')} (Flagged)
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div>
                <span className="font-semibold text-slate-800">5. Compulsory Policy Excess / Deductible</span>
                <p className="text-[11px] text-slate-400">Subtracted as per Policy Clause SEC_3.4</p>
              </div>
              <span className="font-mono font-bold text-slate-900">
                - ₹{data?.deductible_applied?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Explanation narrative */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">Calculation Provenance:</span>
            {data?.explanation_text}
          </div>
        </div>
      </div>

      {/* Conditions & Caveats */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Settlement Conditions & Caveats
        </h2>
        <ul className="space-y-2 text-xs text-slate-600">
          {data?.conditions_and_caveats?.map((c: string, i: number) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
