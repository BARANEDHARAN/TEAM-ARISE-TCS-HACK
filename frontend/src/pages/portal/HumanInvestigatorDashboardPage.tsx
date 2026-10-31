import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalNavbar } from '../../components/portal/PortalNavbar';
import { portalApi } from '../../services/api';
import {
  Scale,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  Search,
  Car,
  FileCheck,
  ShieldCheck,
  User,
} from 'lucide-react';

export const HumanInvestigatorDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData(activeFilter);
  }, [activeFilter]);

  const loadData = async (filter: string) => {
    try {
      setLoading(true);
      const [kpiData, claimsData] = await Promise.all([
        portalApi.getHumanDashboardKpis(),
        portalApi.getHumanClaims(filter),
      ]);
      setKpis(kpiData);
      setClaims(claimsData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = claims.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.claim_id?.toLowerCase().includes(q) ||
      c.claimant_name?.toLowerCase().includes(q) ||
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
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Login 3
              </span>
              <span>Human Insurance Investigator Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Scale className="w-6 h-6 text-amber-600" /> Human Claims Adjudication & Review Queue
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Review AI damage models, verify or correct AI inconsistency deductions, and execute final claim settlement decisions.
            </p>
          </div>

          <button
            onClick={() => loadData(activeFilter)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} /> Refresh Queue
          </button>
        </div>

        {/* 7 KPI Filter Cards (Section 1 - Login 3.A) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 mb-8">
          {[
            { id: 'ALL', label: 'All Active Claims', count: claims.length, color: 'text-slate-900', border: 'border-slate-300' },
            { id: 'SUBMITTED', label: 'New Claims', count: kpis?.new_claims || 0, color: 'text-blue-700', border: 'border-blue-200' },
            { id: 'AWAITING_HUMAN_REVIEW', label: 'Awaiting Human', count: kpis?.awaiting_human_review || 0, color: 'text-indigo-700', border: 'border-indigo-200' },
            { id: 'FLAGGED', label: 'Flagged by AI', count: kpis?.claims_flagged_by_ai || 0, color: 'text-red-700', border: 'border-red-300' },
            { id: 'EVIDENCE_REQUESTED', label: 'Clarification Req', count: kpis?.claims_requiring_clarification || 0, color: 'text-amber-700', border: 'border-amber-200' },
            { id: 'APPROVED', label: 'Approved Claims', count: kpis?.approved_claims || 0, color: 'text-emerald-700', border: 'border-emerald-200' },
            { id: 'REJECTED', label: 'Rejected Claims', count: kpis?.rejected_claims || 0, color: 'text-rose-700', border: 'border-rose-200' },
          ].map((k) => (
            <button
              key={k.id}
              onClick={() => setActiveFilter(k.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                activeFilter === k.id
                  ? 'bg-white shadow-sm ring-2 ring-amber-500 border-transparent'
                  : 'bg-white/80 hover:bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">{k.label}</p>
              <p className={`text-xl font-extrabold mt-1 ${k.color}`}>{k.count}</p>
            </button>
          ))}
        </div>

        {/* Claims Table Section */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-600" /> Claims Adjudication Roster
              </h2>
              <p className="text-xs text-slate-500">
                Active filter: <span className="font-bold text-slate-800">{activeFilter.replace(/_/g, ' ')}</span>
              </p>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search claimant, policy, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Retrieving claims queue...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No claims match the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Claim ID</th>
                    <th className="py-3 px-4">Claimant & Policy</th>
                    <th className="py-3 px-4">Vehicle Details</th>
                    <th className="py-3 px-4">Claimed Amount</th>
                    <th className="py-3 px-4">AI Inconsistency Flag</th>
                    <th className="py-3 px-4">Adjudication Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
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
                        <p className="text-[10px] text-slate-400">{c.accident_type}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        ₹{Number(c.claimed_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.has_inconsistencies ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                            <AlertTriangle className="w-3 h-3 text-red-600" /> Vector Mismatch Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Evidence Consistent
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/human-investigator/claim/${c.claim_id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          Review & Adjudicate <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default HumanInvestigatorDashboardPage;
