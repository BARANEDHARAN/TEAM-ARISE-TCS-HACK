import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CarFront,
  ShieldCheck,
  Play,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  ScrollText,
  Wrench,
  SearchCode,
  History,
  Network,
  HelpCircle,
  Calculator,
  FileSpreadsheet,
  Download,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { claimsApi, investigationApi } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const ClaimWorkspacePage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningAI, setRunningAI] = useState(false);
  const [investigationRun, setInvestigationRun] = useState<any>(null);

  const fetchClaimData = async () => {
    if (!claimId) return;
    try {
      setLoading(true);
      const [claimData, statusData] = await Promise.all([
        claimsApi.getClaim(claimId),
        investigationApi.getStatus(claimId),
      ]);
      setClaim(claimData);
      setInvestigationRun(statusData);
    } catch (err) {
      console.error('Failed to load workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimData();
  }, [claimId]);

  const handleStartInvestigation = async () => {
    if (!claimId) return;
    try {
      setRunningAI(true);
      await investigationApi.start(claimId);
      await fetchClaimData();
    } catch (err) {
      console.error('Investigation failed:', err);
    } finally {
      setRunningAI(false);
    }
  };

  if (loading || !claim) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        Loading Investigation Workspace for {claimId}...
      </div>
    );
  }

  const moduleShortcuts = [
    { title: 'Damage AI', desc: `${claim.damage_records?.length || 0} damage regions tagged`, icon: Sparkles, path: 'damage', color: 'text-blue-600 bg-blue-50' },
    { title: 'Contradiction AI', desc: `${claim.contradictions?.length || 0} inconsistencies found`, icon: Scale, path: 'contradictions', color: 'text-amber-600 bg-amber-50' },
    { title: 'Policy Intelligence', desc: `${claim.policy_clauses?.length || 0} clauses evaluated`, icon: ScrollText, path: 'policy', color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Repair Audit', desc: `${claim.repair_items?.length || 0} line items verified`, icon: Wrench, path: 'repair', color: 'text-teal-600 bg-teal-50' },
    { title: 'Digital Forensics', desc: `${claim.evidence_files?.length || 0} files hashed`, icon: SearchCode, path: 'forensics', color: 'text-purple-600 bg-purple-50' },
    { title: 'Reconstruction', desc: `${claim.timeline_events?.length || 0} events indexed`, icon: History, path: 'reconstruction', color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Evidence Graph', desc: 'Interactive topology', icon: Network, path: 'graph', color: 'text-cyan-600 bg-cyan-50' },
    { title: 'Evidence Gaps', desc: `${claim.evidence_gaps?.length || 0} items requested`, icon: HelpCircle, path: 'gaps', color: 'text-rose-600 bg-rose-50' },
    { title: 'Settlement Assist', desc: 'Transparent breakdown', icon: Calculator, path: 'settlement', color: 'text-blue-600 bg-blue-50' },
    { title: 'Dossier Report', desc: '19-section dossier & PDF', icon: FileSpreadsheet, path: 'report', color: 'text-slate-700 bg-slate-100' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Workspace Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded">
              {claim.id}
            </span>
            <StatusBadge status={claim.status} />
            <span className="text-xs text-slate-400">Accident Date: {claim.accident_date}</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {claim.claimant_name} &bull; {claim.vehicle_make} {claim.vehicle_model}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
            <span>Reg: <b className="text-slate-800">{claim.vehicle_reg}</b></span>
            <span>&bull;</span>
            <span>Policy: <b className="text-slate-800">{claim.policy_number}</b></span>
            <span>&bull;</span>
            <span>Claim Amount: <b className="text-slate-900 font-bold">₹{claim.requested_amount?.toLocaleString('en-IN')}</b></span>
            <span>&bull;</span>
            <span>Type: <b className="text-slate-800">{claim.accident_type}</b></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(investigationApi.pdfUrl(claim.id), '_blank')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> PDF Report
          </button>
          <button
            onClick={handleStartInvestigation}
            disabled={runningAI}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {runningAI ? 'Orchestrating 15 AI Stages...' : 'Run 15-Stage AI Investigation'}
          </button>
        </div>
      </div>

      {/* Orchestration Stage Status Banner */}
      {investigationRun && investigationRun.status === 'COMPLETED' && (
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <b>Investigation Orchestration Complete:</b> Executed 15 pipeline stages in{' '}
              <b>{investigationRun.execution_time_seconds}s</b>. All multimodal artifacts indexed in database.
            </span>
          </div>
          <button
            onClick={() => navigate(`/workspace/${claim.id}/report`)}
            className="text-emerald-700 font-bold hover:underline shrink-0 ml-4"
          >
            Review Report &rarr;
          </button>
        </div>
      )}

      {/* Incident Narrative Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Claimant Incident Statement
        </h2>
        <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
          "{claim.description}"
        </p>
        <p className="text-[11px] text-slate-400 mt-2">
          Location: <span className="text-slate-600 font-medium">{claim.accident_location}</span> | Time:{' '}
          <span className="text-slate-600 font-medium">{claim.accident_time}</span>
        </p>
      </div>

      {/* Module Investigation Shortcuts Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3">Investigation Modules & AI Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {moduleShortcuts.map((mod, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/workspace/${claim.id}/${mod.path}`)}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className={`w-8 h-8 rounded-lg ${mod.color} flex items-center justify-center mb-3`}>
                  <mod.icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{mod.desc}</p>
              </div>
              <div className="mt-3 flex items-center text-[10px] text-blue-600 font-semibold gap-0.5">
                Inspect <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Finding Highlights (Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contradictions Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Cross-Modal Inconsistencies</h3>
            <Scale className="w-4 h-4 text-amber-500" />
          </div>
          {claim.contradictions?.length > 0 ? (
            <div className="space-y-2">
              {claim.contradictions.map((c: any, i: number) => (
                <div key={i} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs">
                  <p className="font-semibold text-amber-900">{c.contradiction_type.replace(/_/g, ' ')}</p>
                  <p className="text-[11px] text-amber-700 mt-1 line-clamp-2">{c.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No severe contradictions flagged.</p>
          )}
          <button
            onClick={() => navigate(`/workspace/${claim.id}/contradictions`)}
            className="mt-3 text-xs text-blue-600 font-semibold hover:underline block"
          >
            Explore Multi-Hypothesis Scenarios &rarr;
          </button>
        </div>

        {/* Settlement Assessment Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Settlement Verification</h3>
            <Calculator className="w-4 h-4 text-teal-600" />
          </div>
          {claim.settlement_assessment ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Submitted Estimate:</span>
                <span className="font-semibold text-slate-800">
                  ₹{claim.settlement_assessment.submitted_total?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Supported Repairs:</span>
                <span className="font-semibold text-emerald-600">
                  ₹{claim.settlement_assessment.supported_total?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Policy Deductible:</span>
                <span className="font-semibold text-slate-800">
                  - ₹{claim.settlement_assessment.deductible_applied?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 mt-2">
                <span className="text-[10px] text-blue-600 font-bold uppercase">Indicative Settlement Range</span>
                <p className="text-sm font-bold text-blue-900">
                  ₹{claim.settlement_assessment.indicative_settlement_min?.toLocaleString('en-IN')} - ₹
                  {claim.settlement_assessment.indicative_settlement_max?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Run investigation to compute settlement breakdown.</p>
          )}
          <button
            onClick={() => navigate(`/workspace/${claim.id}/settlement`)}
            className="mt-3 text-xs text-blue-600 font-semibold hover:underline block"
          >
            View Mathematical Breakdown &rarr;
          </button>
        </div>

        {/* Missing Evidence Gaps */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Next-Best-Evidence Action</h3>
            <HelpCircle className="w-4 h-4 text-rose-500" />
          </div>
          {claim.evidence_gaps?.length > 0 ? (
            <div className="space-y-2">
              {claim.evidence_gaps.slice(0, 2).map((g: any, i: number) => (
                <div key={i} className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-lg text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900">{g.missing_evidence_type}</span>
                    <span className="text-[9px] bg-rose-200 text-rose-800 px-1 rounded font-bold">{g.priority}</span>
                  </div>
                  <p className="text-[11px] text-rose-700 mt-1 line-clamp-2">{g.importance_rationale}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No decisive evidence gaps identified.</p>
          )}
          <button
            onClick={() => navigate(`/workspace/${claim.id}/gaps`)}
            className="mt-3 text-xs text-blue-600 font-semibold hover:underline block"
          >
            Generate Formal Evidence Request &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
