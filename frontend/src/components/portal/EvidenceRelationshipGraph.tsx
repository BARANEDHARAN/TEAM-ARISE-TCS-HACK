import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Layers,
  Filter,
  Eye,
  Info,
  X,
  ShieldCheck,
  Sparkles,
  Scale,
  Wrench,
  FileText,
  Scan,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { BASE_URL } from '../../services/api';

// Custom Graph Node Renderer
const CustomEvidenceNode = ({ data, selected }: any) => {
  const getStyle = () => {
    switch (data.entityType) {
      case 'CLAIM':
        return {
          border: 'border-blue-600 bg-blue-950/80 text-blue-100',
          badge: 'bg-blue-600/30 text-blue-300 border-blue-500/50',
          icon: ShieldCheck,
        };
      case 'STATEMENT':
        return {
          border: 'border-indigo-500 bg-indigo-950/80 text-indigo-100',
          badge: 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50',
          icon: FileText,
        };
      case 'VEHICLE':
        return {
          border: 'border-cyan-500 bg-cyan-950/80 text-cyan-100',
          badge: 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50',
          icon: Wrench,
        };
      case 'EVIDENCE':
        return {
          border: 'border-sky-500 bg-sky-950/80 text-sky-100',
          badge: 'bg-sky-600/30 text-sky-300 border-sky-500/50',
          icon: Eye,
        };
      case 'OCR_RESULT':
        return {
          border: 'border-emerald-500 bg-emerald-950/80 text-emerald-100',
          badge: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50',
          icon: FileText,
        };
      case 'DAMAGE':
        return {
          border: 'border-rose-500 bg-rose-950/80 text-rose-100',
          badge: 'bg-rose-600/30 text-rose-300 border-rose-500/50',
          icon: Scan,
        };
      case 'FINDING':
        return {
          border: 'border-amber-500 bg-amber-950/80 text-amber-100',
          badge: 'bg-amber-600/30 text-amber-300 border-amber-500/50',
          icon: AlertTriangle,
        };
      case 'RECOMMENDATION':
        return {
          border: 'border-purple-500 bg-purple-950/80 text-purple-100',
          badge: 'bg-purple-600/30 text-purple-300 border-purple-500/50',
          icon: Sparkles,
        };
      case 'HUMAN_DECISION':
        return {
          border: 'border-emerald-400 bg-emerald-950/90 text-emerald-100 ring-2 ring-emerald-500/50',
          badge: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50',
          icon: Scale,
        };
      default:
        return {
          border: 'border-slate-600 bg-slate-900/90 text-slate-100',
          badge: 'bg-slate-700/50 text-slate-300 border-slate-600',
          icon: Info,
        };
    }
  };

  const style = getStyle();
  const IconComponent = style.icon;

  return (
    <div
      className={`px-3.5 py-2.5 rounded-xl border-2 backdrop-blur-md shadow-lg transition-all w-60 cursor-pointer ${
        style.border
      } ${selected ? 'ring-2 ring-indigo-400 shadow-indigo-500/30 scale-105' : 'hover:scale-102'}`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-slate-400" />
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <IconComponent className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-80 truncate">
            {data.entityType || 'NODE'}
          </span>
        </div>
        {data.badge && (
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${style.badge}`}
          >
            {data.badge}
          </span>
        )}
      </div>

      <p className="text-xs font-bold leading-tight line-clamp-2">{data.title || data.label}</p>
      {data.subtitle && (
        <p className="text-[10px] opacity-75 line-clamp-2 mt-1 leading-snug">{data.subtitle}</p>
      )}

      {data.amount && (
        <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
          <span className="opacity-70">Amount:</span>
          <span className="font-bold text-emerald-400 font-mono">{data.amount}</span>
        </div>
      )}
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-slate-400" />
    </div>
  );
};

interface Props {
  claimId: string;
  height?: string;
  onSelectNode?: (nodeData: any) => void;
}

export const EvidenceRelationshipGraph: React.FC<Props> = ({
  claimId,
  height = '620px',
  onSelectNode,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filterType, setFilterType] = useState('ALL');

  const nodeTypes = useMemo(
    () => ({
      claimNode: CustomEvidenceNode,
      vehicleNode: CustomEvidenceNode,
      statementNode: CustomEvidenceNode,
      evidenceNode: CustomEvidenceNode,
      ocrNode: CustomEvidenceNode,
      damageNode: CustomEvidenceNode,
      findingNode: CustomEvidenceNode,
      contradictionNode: CustomEvidenceNode,
      recommendationNode: CustomEvidenceNode,
      decisionNode: CustomEvidenceNode,
    }),
    []
  );

  const fetchGraph = useCallback(async () => {
    if (!claimId) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/ai/claims/${claimId}/graph`);
      if (!res.ok) throw new Error('Graph fetch failed');
      const data = await res.json();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } catch (err) {
      console.error('Failed to load evidence graph:', err);
    } finally {
      setLoading(false);
    }
  }, [claimId, setNodes, setEdges]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  const onNodeClick = useCallback(
    (_: any, node: any) => {
      setSelectedNode(node.data);
      if (onSelectNode) onSelectNode(node.data);
    },
    [onSelectNode]
  );

  const filteredNodes = useMemo(() => {
    if (filterType === 'ALL') return nodes;
    return nodes.filter(
      (n) => n.data?.entityType === filterType || n.data?.entityType === 'CLAIM'
    );
  }, [nodes, filterType]);

  const filterOptions = [
    { id: 'ALL', label: 'All Entities' },
    { id: 'EVIDENCE', label: 'Evidence Files' },
    { id: 'DAMAGE', label: 'CV Damage Detections' },
    { id: 'OCR_RESULT', label: 'OCR Extractions' },
    { id: 'FINDING', label: 'Inconsistency Findings' },
    { id: 'RECOMMENDATION', label: 'Recommendations' },
    { id: 'HUMAN_DECISION', label: 'Final Decision' },
  ];

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs p-10"
        style={{ height }}
      >
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="font-semibold text-slate-300">
          Constructing Evidence Relationship Graph Topology...
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Synthesizing Statement, OCR Attributes, OpenCV Damage Contours & AI Inconsistency Links
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Graph Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            Evidence Relationship Graph
          </span>
          <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
            {nodes.length} Nodes • {edges.length} Edges
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filter:
          </span>
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterType === f.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Viewport & Inspector */}
      <div className="flex gap-4 relative" style={{ height }}>
        {/* React Flow Viewport */}
        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls className="bg-slate-900 border-slate-800 text-white fill-white rounded-lg shadow-md" />
            <MiniMap
              nodeColor={(n: any) => {
                switch (n.data?.entityType) {
                  case 'CLAIM':
                    return '#3b82f6';
                  case 'DAMAGE':
                    return '#f43f5e';
                  case 'FINDING':
                    return '#f59e0b';
                  case 'RECOMMENDATION':
                    return '#a855f7';
                  case 'HUMAN_DECISION':
                    return '#10b981';
                  default:
                    return '#64748b';
                }
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-md"
            />
          </ReactFlow>

          {/* Floating Canvas Legend */}
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1 shadow-lg pointer-events-none">
            <span className="font-bold text-white block uppercase tracking-wider mb-1.5">
              Graph Relations
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1 bg-emerald-500 rounded" /> Supports / Corroborated
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1 bg-red-500 rounded border-dashed" /> Contradicts / Inconsistency
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1 bg-blue-500 rounded" /> Submitted / Extracted From
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1 bg-indigo-500 rounded" /> CV Damage Detected In
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1 bg-purple-500 rounded" /> Recommended Action
            </div>
          </div>
        </div>

        {/* Node Inspection Drawer */}
        {selectedNode && (
          <div className="w-88 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between shrink-0 overflow-y-auto text-slate-200">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                  {selectedNode.entityType}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-sm font-bold text-white mb-1">{selectedNode.title || selectedNode.label}</h2>
              {selectedNode.subtitle && (
                <p className="text-xs text-slate-400 mb-4">{selectedNode.subtitle}</p>
              )}

              {/* Node Detailed Key-Value Attributes */}
              {selectedNode.details && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                    {Object.entries(selectedNode.details).map(([k, v]) => {
                      if (v === null || v === undefined) return null;
                      if (typeof v === 'object') {
                        return (
                          <div key={k} className="pt-1 border-t border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase font-mono block">
                              {k.replace(/_/g, ' ')}:
                            </span>
                            <pre className="text-[10px] text-slate-300 font-mono mt-1 whitespace-pre-wrap bg-slate-900 p-2 rounded max-h-36 overflow-y-auto">
                              {JSON.stringify(v, null, 2)}
                            </pre>
                          </div>
                        );
                      }
                      return (
                        <div key={k}>
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">
                            {k.replace(/_/g, ' ')}:
                          </span>
                          <span className="text-slate-200 font-semibold break-words">{String(v)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Interactive Multimodal Provenance</span>
              <span className="text-emerald-400 font-mono font-bold">Verified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default EvidenceRelationshipGraph;