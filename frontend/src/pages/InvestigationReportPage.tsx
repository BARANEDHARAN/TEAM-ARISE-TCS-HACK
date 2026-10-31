import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  CarFront,
  HelpCircle,
  Calculator,
} from 'lucide-react';
import { investigationApi } from '../services/api';

export const InvestigationReportPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const data = await investigationApi.getReport(claimId);
        setReport(data);
      } catch (err) {
        console.error('Failed to load investigation report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Compiling comprehensive 19-section investigation dossier...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Report could not be compiled. Please run AI investigation first.
      </div>
    );
  }

  const handleDownloadPdf = () => {
    if (!claimId) return;
    window.open(investigationApi.pdfUrl(claimId), '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            Part 11 Report Dossier
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Investigation Report Dossier</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print View
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Download Official PDF Report
          </button>
        </div>
      </div>

      {/* Structured Document Container */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 space-y-8 font-sans print:border-none print:shadow-none">
        {/* Dossier Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-wider text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>CLAIMMIND AI ENTERPRISE INVESTIGATION DOSSIER</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              INSURANCE CLAIMS INVESTIGATION REPORT
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Dossier ID: {report.claim_id} &bull; Generated: {report.generated_at}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Investigation Status</span>
            <span className="text-xs font-bold font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
              {report.status}
            </span>
          </div>
        </div>

        {/* Section 1: Identification & Claim Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Policyholder & Coverage Details
            </span>
            <p className="text-slate-800"><b>Claimant:</b> {report.claimant.name}</p>
            <p className="text-slate-800"><b>Policy Number:</b> <span className="font-mono">{report.claimant.policy_number}</span></p>
            <p className="text-slate-800"><b>Contact:</b> {report.claimant.phone} &bull; {report.claimant.email}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Vehicle & Incident Context
            </span>
            <p className="text-slate-800"><b>Vehicle:</b> {report.vehicle.make} {report.vehicle.model} ({report.vehicle.year})</p>
            <p className="text-slate-800"><b>Registration:</b> <span className="font-mono font-bold">{report.vehicle.registration}</span></p>
            <p className="text-slate-800"><b>Incident Date/Time:</b> {report.incident.date} at {report.incident.time}</p>
            <p className="text-slate-800"><b>Claimed Amount:</b> ₹{report.incident.requested_amount?.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Section 2: Incident Narrative */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            1. Incident Statement & Location
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50/60 p-3 rounded-lg border border-slate-100">
            "{report.incident.description}"
          </p>
          <p className="text-[11px] text-slate-500">
            Location: <b>{report.incident.location}</b> &bull; Classification: <b>{report.incident.type}</b>
          </p>
        </div>

        {/* Section 3: Visual Damage Intelligence */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            2. Computer Vision Damage Findings
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Component</th>
                  <th className="py-2 px-3">Damage Classification</th>
                  <th className="py-2 px-3">Severity</th>
                  <th className="py-2 px-3">Confidence</th>
                  <th className="py-2 px-3">Damage Fingerprint (DFP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {report.damage_findings?.map((d: any) => (
                  <tr key={d.id}>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-800">{d.component}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">{d.damage_type}</td>
                    <td className="py-2 px-3 text-rose-700 font-bold">{d.severity}</td>
                    <td className="py-2 px-3 text-emerald-700">{Math.round(d.confidence * 100)}%</td>
                    <td className="py-2 px-3 text-indigo-700 font-bold">{d.fingerprint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Cross-Modal Inconsistencies & Hypotheses */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            3. Cross-Modal Evidence Tensions & Counterfactual Scenarios
          </h3>
          {report.cross_modal_inconsistencies?.length > 0 ? (
            report.cross_modal_inconsistencies.map((ctr: any) => (
              <div key={ctr.id} className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">{ctr.type.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded">
                    {ctr.severity}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{ctr.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <p className="text-blue-900"><b>Source A:</b> {ctr.source_a}</p>
                  <p className="text-rose-900"><b>Source B:</b> {ctr.source_b}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No cross-modal inconsistencies identified.</p>
          )}

          {/* Evaluated Hypotheses */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Evaluated Accident Hypotheses:</span>
            <div className="space-y-1.5">
              {report.alternative_hypotheses?.map((h: any) => (
                <div key={h.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <span className="font-bold text-indigo-900 font-mono">{h.code} ({h.title}):</span>{' '}
                  <span className="text-slate-700">{h.description}</span> &mdash;{' '}
                  <span className="text-[11px] font-semibold text-slate-500 font-mono">Plausibility: {h.plausibility}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Transparent Settlement Recommendation */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            4. Transparent Settlement Assessment Calculation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Submitted Total:</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                ₹{report.settlement_assessment?.submitted_total?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-emerald-700 block text-[10px]">Supported Repairs:</span>
              <span className="font-bold text-emerald-800 font-mono text-sm">
                ₹{report.settlement_assessment?.supported_total?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Policy Deductible:</span>
              <span className="font-bold text-slate-800 font-mono text-sm">
                - ₹{report.settlement_assessment?.deductible_applied?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-blue-700 block text-[10px]">Indicative Bracket:</span>
              <span className="font-bold text-blue-900 font-mono text-sm">
                ₹{report.settlement_assessment?.indicative_min?.toLocaleString('en-IN')} - ₹
                {report.settlement_assessment?.indicative_max?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
            {report.settlement_assessment?.explanation}
          </p>
        </div>

        {/* Section 6: Next Best Evidence Recommendations */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            5. Next-Best-Evidence Action Plan
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {report.missing_evidence_gaps?.map((g: any, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-600 font-bold font-mono">[{g.priority}]</span>
                <span><b>{g.type}:</b> {g.rationale}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 7: Human Reviewer Signoff */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
            6. Human Reviewer Governance & Authorization
          </h3>
          {report.reviewer_decisions?.length > 0 ? (
            report.reviewer_decisions.map((r: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">Decision: {r.decision.replace(/_/g, ' ')}</p>
                <p className="text-slate-600">Approved Settlement Amount: ₹{r.final_amount?.toLocaleString('en-IN')}</p>
                <p className="text-slate-700 italic">Reviewer Rationale: "{r.notes}"</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">
              Status: Pending human reviewer determination in the Review Queue.
            </p>
          )}
        </div>

        {/* Disclaimer Footer */}
        <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400 text-center leading-relaxed font-mono">
          {report.disclaimer}
        </div>
      </div>
    </div>
  );
};
