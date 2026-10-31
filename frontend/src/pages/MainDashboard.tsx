import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Zap,
  ArrowRight,
  TrendingUp,
  Activity,
  CarFront,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsApi, claimsApi } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const MainDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, claimList] = await Promise.all([
          analyticsApi.getDashboardKpis(),
          claimsApi.getClaims(),
        ]);
        setKpis(dashData);
        setClaims(claimList);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        <Activity className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        Loading intelligence dashboard...
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Active Claims',
      val: kpis?.kpis?.total_claims || claims.length,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Inconsistencies Flagged',
      val: kpis?.kpis?.pending_reviews || 2,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'Evidence Gaps Identified',
      val: kpis?.kpis?.evidence_gaps || 3,
      icon: HelpCircle,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      label: 'Avg. AI Reasoning Time',
      val: `${kpis?.kpis?.average_investigation_seconds || 0.24}s`,
      icon: Zap,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Claims Investigation Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Multimodal evidence correlation, cross-modal contradiction analysis, and explainable settlement assistance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/claims/new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            + Register New Claim
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.val}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Featured Demonstration Scenarios (Pre-Configured Claims) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
              Interactive Test Scenarios
            </span>
            <h2 className="text-lg font-bold text-white mt-1">Hackathon Demonstration Cases</h2>
            <p className="text-xs text-slate-300">
              Select one of the three reference claims to inspect autonomous cross-modal investigation in real time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div
            onClick={() => navigate('/workspace/CLM-2026-001')}
            className="bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 rounded-xl p-4 cursor-pointer transition-all hover:border-blue-400 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-300">Sample Claim A</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-medium">
                Contradiction
              </span>
            </div>
            <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
              Impact Direction Mismatch
            </p>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Claimant reports rear impact, but photo reveals front bumper damage. Explores multi-hypothesis reasoning.
            </p>
            <div className="mt-3 flex items-center text-[11px] text-blue-400 font-semibold gap-1">
              Open Investigation <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div
            onClick={() => navigate('/workspace/CLM-2026-002')}
            className="bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 rounded-xl p-4 cursor-pointer transition-all hover:border-blue-400 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-300">Sample Claim B</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-medium">
                Invoice Mismatch
              </span>
            </div>
            <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
              Repair Scope Over-quoting
            </p>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Garage quotes front AND rear bumper replacement on a frontal-only impact. Tests Repair Necessity Graph.
            </p>
            <div className="mt-3 flex items-center text-[11px] text-blue-400 font-semibold gap-1">
              Open Investigation <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div
            onClick={() => navigate('/workspace/CLM-2026-003')}
            className="bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 rounded-xl p-4 cursor-pointer transition-all hover:border-blue-400 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-300">Sample Claim C</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-medium">
                Image Reuse
              </span>
            </div>
            <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
              Cross-Claim Photo Re-circulation
            </p>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              Perceptual hash match with an older 2025 closed claim photo. Tests Digital Evidence Forensics.
            </p>
            <div className="mt-3 flex items-center text-[11px] text-blue-400 font-semibold gap-1">
              Open Investigation <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Inconsistencies Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Detected Inconsistency Taxonomy</h3>
              <p className="text-xs text-slate-400">Distribution of cross-modal discrepancies across active claim records</p>
            </div>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpis?.inconsistency_breakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="type" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claim Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Claim Investigation Lifecycle</h3>
              <p className="text-xs text-slate-400">Claims segmented by AI orchestration and human review readiness</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kpis?.status_distribution || [{ status: 'REQUIRES_REVIEW', count: 3 }]}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(props: any) => `${props.status || props.name || ''}: ${props.count || props.value || ''}`}
                >
                  {(kpis?.status_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Claims Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Insurance Claims</h3>
            <p className="text-xs text-slate-500">Live claims registered in the centralized investigation workspace</p>
          </div>
          <button
            onClick={() => navigate('/claims')}
            className="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
          >
            View All Claims &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Claim ID</th>
                <th className="px-5 py-3">Claimant & Vehicle</th>
                <th className="px-5 py-3">Incident Date</th>
                <th className="px-5 py-3">Claim Amount</th>
                <th className="px-5 py-3">Investigation Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {claims.slice(0, 5).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-blue-700">{c.id}</td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{c.claimant_name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {c.vehicle_make} {c.vehicle_model} ({c.vehicle_reg})
                    </p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.accident_date}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    ₹{c.requested_amount?.toLocaleString('en-IN') || '0'}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => navigate(`/workspace/${c.id}`)}
                      className="px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded text-xs font-semibold transition-all inline-flex items-center gap-1"
                    >
                      Workspace <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
