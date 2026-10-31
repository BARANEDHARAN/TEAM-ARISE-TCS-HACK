import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Network,
  Share2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Car,
  MapPin,
  Info,
} from 'lucide-react';
import { modulesApi } from '../services/api';

export const HistoricalPatternsPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatterns = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const res = await modulesApi.getPatterns(claimId);
        setData(res);
      } catch (err) {
        console.error('Failed to load pattern intelligence:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatterns();
  }, [claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Querying centralized claims network and building relationship graph...
      </div>
    );
  }

  const findings = data?.findings || [];
  const graph = data?.relationship_graph || { nodes: [], links: [] };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded">
            Module 07
          </span>
          <span className="text-xs text-slate-400">Claim {claimId}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Cross-Claim Pattern Intelligence & Relationship Graph
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Analyzes historical vehicle registries, shared repair bodycraft centers, and collision clusters.
        </p>
      </div>

      {/* Ethical Guardrail Notice */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-950">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Fairness Boundary:</span> Network clustering displays factual operational overlaps (e.g., insured vehicles patronizing an authorized dealer bodycraft center or frequenting high-traffic arterial junctions). A shared garage, location, or vehicle owner is an investigative lead, NOT proof of collusion or organized fraud.
        </div>
      </div>

      {/* Unique Feature: Claim Relationship Topology Visualization */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Unique Feature: Claim Relationship Graph
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Entities: {graph.nodes.length} | Relationships: {graph.links.length}
          </span>
        </div>

        {/* Visual Relationship Grid Representation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-4">
          {graph.nodes.map((node: any) => {
            const isClaim = node.type === 'current_claim';
            const isVehicle = node.type === 'vehicle';
            const isWorkshop = node.type === 'workshop';
            const isLocation = node.type === 'location';

            return (
              <div
                key={node.id}
                className={`p-3 rounded-xl border text-xs ${
                  isClaim
                    ? 'bg-blue-950/80 border-blue-600 text-blue-200'
                    : isVehicle
                    ? 'bg-slate-800/90 border-slate-700 text-slate-200'
                    : isWorkshop
                    ? 'bg-indigo-950/80 border-indigo-700 text-indigo-200'
                    : 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isClaim && <Share2 className="w-3.5 h-3.5 text-blue-400" />}
                  {isVehicle && <Car className="w-3.5 h-3.5 text-slate-400" />}
                  {isWorkshop && <Building2 className="w-3.5 h-3.5 text-indigo-400" />}
                  {isLocation && <MapPin className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="font-bold truncate">{node.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">
                  {node.type.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Link Relationships Table */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
          {graph.links.map((link: any, i: number) => (
            <p key={i}>
              <span className="text-slate-300">{link.source}</span> &mdash;[
              <span className="text-cyan-400">{link.relation}</span>]&rarr;{' '}
              <span className="text-slate-300">{link.target}</span>
            </p>
          ))}
        </div>
      </div>

      {/* Pattern Findings */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Pattern Screening Findings</h2>
        {findings.map((f: any, idx: number) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-start justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xs text-slate-900">{f.pattern_type.replace(/_/g, ' ')}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {f.severity}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
              <p className="text-[11px] text-blue-600 font-medium mt-2">Notice: {f.fairness_notice}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
