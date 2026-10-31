import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ScrollText,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { modulesApi } from '../services/api';

export const PolicyIntelligencePage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const res = await modulesApi.getPolicy(claimId);
        setData(res);
      } catch (err) {
        console.error('Failed to load policy intelligence:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Parsing policy wording and mapping clause applicability...
      </div>
    );
  }

  const clauses = data?.clauses || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
            Module 03
          </span>
          <span className="text-xs text-slate-400">Claim {claimId}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Policy Intelligence & Coverage Mapping</h1>
        <p className="text-xs text-slate-500 mt-1">
          NLP-driven policy document parsing, deductible identification, and clause-to-evidence cross-referencing.
        </p>
      </div>

      {/* Unique Feature: Policy-to-Evidence Mapping Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Unique Feature: Policy-to-Evidence Clause Mapping ({clauses.length})
        </h2>

        {clauses.length === 0 ? (
          <p className="text-xs text-slate-400 p-6 bg-white rounded-xl border border-slate-200 text-center">
            No policy clauses mapped yet. Trigger AI investigation to evaluate policy wording.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clauses.map((clause: any) => {
              const isCovered = clause.applicability === 'POTENTIALLY_COVERED';
              const isExcluded = clause.applicability === 'POTENTIALLY_EXCLUDED';

              return (
                <div
                  key={clause.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {clause.clause_code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isCovered
                            ? 'bg-emerald-100 text-emerald-800'
                            : isExcluded
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {clause.applicability.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 mb-1">{clause.clause_title}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mb-3">Policy Document &bull; Page {clause.page_number}</p>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-700 italic mb-3 font-serif">
                      "{clause.clause_text}"
                    </div>

                    <div className="text-xs space-y-2 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Why This Clause Matters:
                        </span>
                        <p className="text-slate-700 mt-0.5 leading-relaxed">{clause.rationale}</p>
                      </div>

                      {clause.deductible_amount > 0 && (
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-slate-500">Compulsory Excess / Deductible:</span>
                          <span className="font-bold text-slate-900">₹{clause.deductible_amount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Human Discretion:</span>
                    <span className="font-semibold text-slate-700">
                      {clause.requires_human_interpretation ? 'Reviewer Assessment Required' : 'Standard Deterministic Clause'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
