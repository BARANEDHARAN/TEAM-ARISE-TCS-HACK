import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  CarFront,
  Play,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { claimsApi, investigationApi } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const ClaimsManagementPage: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [investigatingId, setInvestigatingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await claimsApi.getClaims({
        search: search || undefined,
        status_filter: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setClaims(res);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClaims();
  };

  const handleRunInvestigation = async (e: React.MouseEvent, claimId: string) => {
    e.stopPropagation();
    try {
      setInvestigatingId(claimId);
      await investigationApi.start(claimId);
      await fetchClaims();
    } catch (err) {
      console.error('Investigation failed:', err);
    } finally {
      setInvestigatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Claims Portfolio Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, and orchestrate multimodal investigations across all registered claims.
          </p>
        </div>
        <button
          onClick={() => navigate('/claims/new')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          + Register New Claim
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, vehicle registration, claimant name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['ALL', 'REQUIRES_REVIEW', 'REGISTERED', 'EVIDENCE_MISSING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Claims' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading claims portfolio...</div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No claims matched your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Claim ID</th>
                  <th className="px-5 py-3.5">Claimant</th>
                  <th className="px-5 py-3.5">Vehicle Specs</th>
                  <th className="px-5 py-3.5">Accident Type</th>
                  <th className="px-5 py-3.5">Incident Date</th>
                  <th className="px-5 py-3.5">Claim Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => navigate(`/workspace/${claim.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-700">
                      {claim.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{claim.claimant_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{claim.policy_number}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-800 font-medium">
                        {claim.vehicle_make} {claim.vehicle_model}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono font-bold">{claim.vehicle_reg}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{claim.accident_type}</td>
                    <td className="px-5 py-3.5 text-slate-600">{claim.accident_date}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      ₹{claim.requested_amount?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={(e) => handleRunInvestigation(e, claim.id)}
                        disabled={investigatingId === claim.id}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                        title="Run AI 15-Stage Investigation Pipeline"
                      >
                        <Play className="w-3 h-3" />
                        {investigatingId === claim.id ? 'Analyzing...' : 'Run AI'}
                      </button>
                      <button
                        onClick={() => navigate(`/workspace/${claim.id}`)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                      >
                        Workspace <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
