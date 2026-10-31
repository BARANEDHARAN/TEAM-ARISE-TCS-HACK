import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { claimsApi } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const ReviewQueuePage: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviewQueue = async () => {
      try {
        setLoading(true);
        const data = await claimsApi.getClaims({ status_filter: 'REQUIRES_REVIEW' });
        setClaims(data);
      } catch (err) {
        console.error('Failed to load review queue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviewQueue();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chief Reviewer Adjudication Queue</h1>
        <p className="text-xs text-slate-500 mt-1">
          Claims where autonomous multimodal investigation identified evidentiary tensions, estimate discrepancies, or missing documents requiring human determination.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading pending reviews...</div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            All claims adjudicated. No pending reviews in queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Claim ID</th>
                  <th className="px-5 py-3.5">Claimant & Policy</th>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Claimed Amount</th>
                  <th className="px-5 py-3.5">Pending Action</th>
                  <th className="px-5 py-3.5 text-right">Adjudicate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => navigate(`/workspace/${claim.id}/review`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-700">{claim.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{claim.claimant_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{claim.policy_number}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      {claim.vehicle_make} {claim.vehicle_model} ({claim.vehicle_reg})
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      ₹{claim.requested_amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Contradiction / Gap Review
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workspace/${claim.id}/review`);
                        }}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-1"
                      >
                        Review Decision <ArrowRight className="w-3 h-3" />
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
