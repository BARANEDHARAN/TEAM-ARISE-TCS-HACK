import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalNavbar } from '../../components/portal/PortalNavbar';
import { useAuth } from '../../context/AuthContext';
import { portalApi, BASE_URL } from '../../services/api';
import {
  PlusCircle,
  Car,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';

export const ClaimantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClaims();
  }, [user?.id]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = await portalApi.getCustomerClaims(user?.id);
      setClaims(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" /> Rejected
          </span>
        );
      case 'EVIDENCE_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Awaiting Evidence
          </span>
        );
      case 'AWAITING_HUMAN_REVIEW':
      case 'AI_PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Clock className="w-3 h-3 text-indigo-600" /> Under Investigation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const getInvestigationStatusBadge = (invStatus: string, claimStatus: string) => {
    const isCompleted = invStatus === 'Completed' || ['APPROVED', 'REJECTED', 'AWAITING_HUMAN_REVIEW'].includes(claimStatus);
    const isProcessing = invStatus === 'Processing' || claimStatus === 'AI_PROCESSING';
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100/70 text-emerald-800">
          <CheckCircle className="w-3 h-3 text-emerald-600" /> Completed
        </span>
      );
    }
    if (isProcessing) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100/70 text-indigo-800 animate-pulse">
          <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" /> Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
        <Clock className="w-3 h-3 text-slate-400" /> Not Started
      </span>
    );
  };

  const filtered = claims.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.claim_id?.toLowerCase().includes(q) ||
      c.policy_number?.toLowerCase().includes(q) ||
      c.vehicle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalNavbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Login 1
              </span>
              <span>Claimant / Customer Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome, {user?.name || 'Policyholder'}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Track your active vehicle insurance claims, view AI inspection summaries, and respond to investigator requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/claimant/new-claim')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Submit New Claim
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-xs font-medium text-slate-500">Total Claims</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{claims.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-xs font-medium text-blue-600">Under Investigation</p>
            <p className="text-2xl font-extrabold text-blue-900 mt-1">
              {claims.filter((c) => c.status === 'AI_PROCESSING' || c.status === 'AWAITING_HUMAN_REVIEW').length}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-xs font-medium text-amber-600">Action Required</p>
            <p className="text-2xl font-extrabold text-amber-800 mt-1">
              {claims.filter((c) => c.status === 'EVIDENCE_REQUESTED').length}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <p className="text-xs font-medium text-emerald-600">Approved / Settled</p>
            <p className="text-2xl font-extrabold text-emerald-800 mt-1">
              {claims.filter((c) => c.status === 'APPROVED').length}
            </p>
          </div>
        </div>

        {/* Claims Table Section */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Your Vehicle Insurance Claims</h2>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Claim ID or Vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Loading your claims...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center px-4">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No Claims Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't submitted any insurance claims yet.
              </p>
              <button
                onClick={() => navigate('/claimant/new-claim')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" /> Submit Claim Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Claim ID</th>
                    <th className="py-3 px-3">Submission Date</th>
                    <th className="py-3 px-3">Claim Status</th>
                    <th className="py-3 px-3">Investigation Status</th>
                    <th className="py-3 px-3">Final Decision</th>
                    <th className="py-3 px-4">Investigator Remarks</th>
                    <th className="py-3 px-3 text-right">Report & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => {
                    const isDecided = c.status === 'APPROVED' || c.status === 'REJECTED';
                    const finalDecisionText = isDecided
                      ? c.status
                      : c.final_decision && c.final_decision !== 'PENDING' && c.final_decision !== 'UNDER_REVIEW'
                      ? c.final_decision
                      : 'Pending Decision';

                    return (
                      <tr key={c.claim_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {c.claim_id}
                          <p className="font-sans font-normal text-[10px] text-slate-400 mt-0.5">{c.vehicle}</p>
                        </td>

                        <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {c.submission_date || c.created_at?.slice(0, 16) || 'N/A'}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getClaimStatusBadge(c.status)}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getInvestigationStatusBadge(c.investigation_status, c.status)}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {isDecided ? (
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                                c.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}
                            >
                              {c.status}
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400 italic">
                              {finalDecisionText}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                          {c.investigator_remarks ? (
                            <span className="italic" title={c.investigator_remarks}>
                              "{c.investigator_remarks}"
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Under initial review</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.report_url && (
                              <a
                                href={`${BASE_URL}${c.report_url}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Download Final PDF Report"
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all inline-flex items-center"
                              >
                                <Download className="w-3.5 h-3.5 text-blue-600" />
                              </a>
                            )}
                            <button
                              onClick={() => navigate(`/claimant/claim/${c.claim_id}`)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg text-emerald-700 text-xs font-bold transition-all cursor-pointer"
                            >
                              Track <ArrowRight className="w-3.5 h-3.5" />
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
export default ClaimantDashboardPage;
