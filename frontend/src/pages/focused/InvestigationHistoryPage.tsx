import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FocusedNavbar } from '../../components/focused/FocusedNavbar';
import { focusedApi } from '../../services/api';
import {
  History,
  Search,
  PlusCircle,
  Eye,
  Car,
  FileCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface HistoryItem {
  accident_id: string;
  claimant_name: string;
  policy_number: string;
  vehicle: string;
  accident_date: string;
  accident_type: string;
  claimed_amount: number;
  has_investigation_result: boolean;
  created_at: string;
}

export const InvestigationHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [investigations, setInvestigations] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await focusedApi.listInvestigations();
      setInvestigations(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to load investigation history.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = investigations.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      item.accident_id.toLowerCase().includes(q) ||
      item.claimant_name.toLowerCase().includes(q) ||
      item.policy_number.toLowerCase().includes(q) ||
      item.vehicle.toLowerCase().includes(q);

    const matchesType = typeFilter === 'ALL' || item.accident_type === typeFilter;
    return matchesQuery && matchesType;
  });

  const accidentTypes = Array.from(new Set(investigations.map((i) => i.accident_type).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50">
      <FocusedNavbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-blue-600" /> Investigation History & Dossiers
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Search, inspect, and reopen past accident investigations, CV damage models, and AI findings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadHistory}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>

            <button
              onClick={() => navigate('/new-investigation')}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Start New Investigation
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to load cases</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Case ID, Claimant, Policy No, or Vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Filter Collision:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Accident Types</option>
              {accidentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table of Investigations */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Loading investigation records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center px-4">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Investigation Cases Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No claims match your search filters. Try adjusting the query.'
                  : 'Start your first autonomous multimodal claim investigation.'}
              </p>
              <button
                onClick={() => navigate('/new-investigation')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" /> Create New Case
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Accident ID</th>
                    <th className="py-3 px-4">Claimant & Policy</th>
                    <th className="py-3 px-4">Vehicle Details</th>
                    <th className="py-3 px-4">Collision Type & Date</th>
                    <th className="py-3 px-4">Claimed Amount</th>
                    <th className="py-3 px-4">AI Dossier Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filtered.map((item) => (
                    <tr key={item.accident_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {item.accident_id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{item.claimant_name}</p>
                        <p className="font-mono text-[11px] text-slate-400">{item.policy_number}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{item.vehicle}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {item.accident_type}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.accident_date}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        ₹{Number(item.claimed_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.has_investigation_result ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                            <CheckCircle className="w-3 h-3" /> AI Findings Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px]">
                            <Clock className="w-3 h-3" /> In Progress
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                item.has_investigation_result
                                  ? `/investigation/${item.accident_id}/results`
                                  : `/investigation/${item.accident_id}/upload`
                              )
                            }
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-md text-slate-700 text-xs font-bold transition-all shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Reopen
                          </button>
                        </div>
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
export default InvestigationHistoryPage;
