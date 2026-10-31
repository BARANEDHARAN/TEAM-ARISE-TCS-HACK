import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Scale,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  GitBranch,
} from 'lucide-react';
import { modulesApi } from '../services/api';

export const ContradictionPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContradictions = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const res = await modulesApi.getContradictions(claimId);
        setData(res);
      } catch (err) {
        console.error('Failed to load contradictions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContradictions();
  }, [claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Running Cross-Modal Contradiction & Multi-Hypothesis Analysis...
      </div>
    );
  }

  const contradictions = data?.contradictions || [];
  const hypotheses = data?.hypotheses || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Module 02 & Innovation 02
          </span>
          <span className="text-xs text-slate-400">Claim {claimId}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Cross-Modal Contradiction & Counterfactual Reasoning
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Evaluates physical alignment between claimant statements, photographic damage, and telematics without speculative fraud accusations.
        </p>
      </div>

      {/* Ethical Guardrail Alert */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Investigative Objectivity Protocol:</span> Inconsistencies indicate evidentiary tension requiring clarification. They do NOT constitute proof of deceit or fraud. In multi-vehicle traffic accidents, secondary collisions, driver disorientation, and incomplete phone uploads frequently account for directional variances.
        </div>
      </div>

      {/* Section 1: Detected Inconsistencies */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-600" />
          Detected Cross-Modal Inconsistencies ({contradictions.length})
        </h2>

        {contradictions.length === 0 ? (
          <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-400">
            No severe cross-modal inconsistencies detected for this claim.
          </div>
        ) : (
          <div className="space-y-4">
            {contradictions.map((ctr: any) => (
              <div
                key={ctr.id}
                className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden"
              >
                <div className="p-4 bg-amber-50/50 border-b border-amber-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-900">{ctr.id}</span>
                    <span className="text-xs font-bold text-slate-800">
                      {ctr.contradiction_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    {ctr.severity} Severity
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {ctr.description}
                  </p>

                  {/* Side by side comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                        Source A: {ctr.source_a_name}
                      </span>
                      <p className="text-slate-800 italic">"{ctr.source_a_fact}"</p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                        Source B: {ctr.source_b_name}
                      </span>
                      <p className="text-slate-800 italic">"{ctr.source_b_fact}"</p>
                    </div>
                  </div>

                  {/* Explanations */}
                  {ctr.potential_explanations?.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-2">
                        Plausible Alternative Explanations Considered:
                      </span>
                      <div className="space-y-1.5">
                        {ctr.potential_explanations.map((exp: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded bg-slate-50 text-[11px] text-slate-700 flex items-start gap-2 border border-slate-100"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <span>{exp.hypothesis}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                                Support Context: {exp.support_level}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Counterfactual Accident Reasoning Engine */}
      <div className="pt-4 border-t border-slate-200">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Counterfactual Accident Reasoning Engine (Innovation 02)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tests competing hypotheses by evaluating expected evidence, observed physical patterns, and missing records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hypotheses.map((hyp: any) => (
            <div
              key={hyp.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {hyp.scenario_code}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {hyp.plausibility}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mb-2">{hyp.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{hyp.description}</p>

                {/* Supporting Evidence */}
                <div className="space-y-2 text-[11px] pt-3 border-t border-slate-100">
                  <div>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Supporting Signals:
                    </span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                      {hyp.supporting_evidence_ids?.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Contradicting Evidence */}
                  <div>
                    <span className="font-semibold text-rose-700 flex items-center gap-1 mb-1">
                      <XCircle className="w-3.5 h-3.5" /> Tension / Contradictions:
                    </span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                      {hyp.contradicting_evidence_ids?.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Decisive Missing Evidence */}
                  <div>
                    <span className="font-semibold text-amber-700 flex items-center gap-1 mb-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Decisive Missing Proof:
                    </span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                      {hyp.missing_evidence_ids?.map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] bg-slate-50 p-2.5 rounded text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Recommended Verification:</span>
                {hyp.recommended_verification}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
