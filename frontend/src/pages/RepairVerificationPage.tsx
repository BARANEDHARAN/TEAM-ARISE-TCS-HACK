import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Calculator,
  GitCommit,
  ShieldCheck,
} from 'lucide-react';
import { modulesApi } from '../services/api';

export const RepairVerificationPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepair = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const res = await modulesApi.getRepair(claimId);
        setData(res);
      } catch (err) {
        console.error('Failed to load repair verification:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepair();
  }, [claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Cross-auditing repair invoice line items against damage fingerprints...
      </div>
    );
  }

  const items = data?.repair_items || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            Module 04
          </span>
          <span className="text-xs text-slate-400">Claim {claimId}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Visual-to-Invoice Cost Intelligence & Necessity Graph
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Audits workshop repair estimates line-by-line against detected Damage Fingerprints to prevent over-scoping and unverified parts inflation.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Submitted Total</p>
          <p className="text-xl font-bold text-slate-900 mt-1">₹{data?.total_estimate?.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Visually Supported</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">₹{data?.supported_total?.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Unsupported Line Items</p>
          <p className="text-xl font-bold text-rose-700 mt-1">₹{data?.unsupported_total?.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Unverified Teardown</p>
          <p className="text-xl font-bold text-amber-700 mt-1">₹{data?.unverified_total?.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Unique Feature: Repair Necessity Graph Walkthrough */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <GitCommit className="w-4 h-4 text-teal-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-300">
            Unique Feature: Repair Necessity Graph Chain
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Every eligible repair expenditure must trace an authenticated causal lineage:
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="bg-slate-800 px-3 py-2 rounded text-slate-200 border border-slate-700 text-center w-full md:w-auto">
            <span className="text-[10px] text-slate-400 block">STEP 1</span>
            Visible Damage (Photo)
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block shrink-0" />
          <div className="bg-slate-800 px-3 py-2 rounded text-slate-200 border border-slate-700 text-center w-full md:w-auto">
            <span className="text-[10px] text-slate-400 block">STEP 2</span>
            Vehicle Component
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block shrink-0" />
          <div className="bg-slate-800 px-3 py-2 rounded text-slate-200 border border-slate-700 text-center w-full md:w-auto">
            <span className="text-[10px] text-slate-400 block">STEP 3</span>
            Proposed Repair Action
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block shrink-0" />
          <div className="bg-teal-950 px-3 py-2 rounded text-teal-300 border border-teal-700 text-center w-full md:w-auto font-bold">
            <span className="text-[10px] text-teal-400 block font-normal">STEP 4</span>
            Verified Repair Cost
          </div>
        </div>
      </div>

      {/* Itemized Line Items Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Workshop Estimate Line-Item Audit ({items.length})
          </h2>
          <span className="text-[11px] text-slate-400">Checked against photographic fingerprints</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Component & Part No</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Unit Price</th>
                <th className="px-5 py-3">Total (with Tax)</th>
                <th className="px-5 py-3">Verification Status</th>
                <th className="px-5 py-3">Auditor Notes & Fingerprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item: any) => {
                const isSupported = item.supported_status === 'SUPPORTED';
                const isUnsupported = item.supported_status === 'UNSUPPORTED';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{item.component_name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{item.part_number || 'OEM Standard'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{item.action}</td>
                    <td className="px-5 py-3.5 text-slate-600">{item.quantity}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">₹{item.unit_price?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      ₹{item.total_amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSupported
                            ? 'bg-emerald-100 text-emerald-800'
                            : isUnsupported
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isSupported && <CheckCircle2 className="w-3 h-3" />}
                        {isUnsupported && <XCircle className="w-3 h-3" />}
                        {!isSupported && !isUnsupported && <AlertTriangle className="w-3 h-3" />}
                        {item.supported_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-600">
                      <p>{item.notes}</p>
                      {item.damage_fingerprint_ref && (
                        <span className="font-mono text-[10px] text-indigo-600 font-semibold block mt-0.5">
                          DFP: {item.damage_fingerprint_ref}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
