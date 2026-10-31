import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalNavbar } from '../../components/portal/PortalNavbar';
import { portalApi } from '../../services/api';
import {
  Bot,
  Scan,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Search,
  Zap,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const AiInvestigatorDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiData, claimsData] = await Promise.all([
        portalApi.getAiDashboardKpis(),
        portalApi.getAiClaims(),
      ]);
      setKpis(kpiData);
      setClaims(claimsData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAi = async (claimId: string) => {
    try {
      setProcessingId(claimId);
      await portalApi.runAiProcessing(claimId);
      await loadData();
      navigate(`/ai-investigator/claim/${claimId}`);
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'AI processing encountered an error.');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = claims.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.claim_id?.toLowerCase().includes(q) ||
      c.claimant_name?.toLowerCase().includes(q) ||
      c.vehicle?.toLowerCase().includes(q) ||
      c.policy_number?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalNavbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Login 2
              </span>
              <span>AI Autonomous Insurance Investigator Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-600" /> Autonomous AI Processing Engine
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Automated vehicle damage detection with OpenCV, accident report extraction via PyMuPDF OCR, and cross-evidence inconsistency reasoning.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} /> Refresh Pipeline
          </button>
        </div>

        {/* 6 KPI Cards (Prompt Requirement Section 1 - Login 2.A) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-500">Total Claims</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{kpis?.total_claims || 0}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-amber-600">Awaiting Analysis</p>
            <p className="text-xl font-extrabold text-amber-800 mt-1">{kpis?.awaiting_analysis || 0}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-indigo-600">Under Investigation</p>
            <p className="text-xl font-extrabold text-indigo-800 mt-1">{kpis?.under_investigation || 0}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-red-600">Inconsistencies</p>
            <p className="text-xl font-extrabold text-red-800 mt-1">{kpis?.claims_with_inconsistencies || 0}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-purple-600">Evidence Required</p>
            <p className="text-xl font-extrabold text-purple-800 mt-1">{kpis?.claims_requiring_evidence || 0}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-[11px] font-semibold text-emerald-600">Completed Reports</p>
            <p className="text-xl font-extrabold text-emerald-800 mt-1">{kpis?.completed_ai_reports || 0}</p>
          </div>
        </div>

        {/* AI Processing Queue Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" /> Autonomous Investigation Queue
              </h2>
              <p className="text-xs text-slate-500">
                Incoming claims automatically processed through OpenCV bounding box localization and OCR comparison.
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search claims in AI queue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Synchronizing AI processing queues...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No claims currently in the queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Claim ID</th>
                    <th className="py-3 px-4">Claimant & Policy</th>
                    <th className="py-3 px-4">Vehicle Details</th>
                    <th className="py-3 px-4">Collision & Amount</th>
                    <th className="py-3 px-4">AI Detection Status</th>
                    <th className="py-3 px-4 text-right">Autonomous Engine Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => {
                    const isProcessing = processingId === c.claim_id;
                    const hasInconsistency = c.ai_status === 'INCONSISTENCIES_DETECTED';

                    return (
                      <tr key={c.claim_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {c.claim_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{c.claimant_name}</p>
                          <p className="font-mono text-[11px] text-slate-400">{c.policy_number}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-800">{c.vehicle}</p>
                          <p className="text-[10px] text-slate-400">{c.evidence_count} evidence files</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{c.accident_type}</span>
                          <p className="font-bold text-emerald-600">₹{Number(c.claimed_amount || 0).toLocaleString('en-IN')}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          {hasInconsistency ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> Inconsistency Flagged
                            </span>
                          ) : c.ai_status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> AI Analysis Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3" /> Awaiting Inspection
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRunAi(c.claim_id)}
                              disabled={isProcessing}
                              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-xs font-bold transition-all border border-indigo-200 cursor-pointer"
                            >
                              <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                              {isProcessing ? 'Processing...' : 'Run / Re-run AI'}
                            </button>

                            <button
                              onClick={() => navigate(`/ai-investigator/claim/${c.claim_id}`)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                              Inspect AI Hub <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default AiInvestigatorDashboardPage;
