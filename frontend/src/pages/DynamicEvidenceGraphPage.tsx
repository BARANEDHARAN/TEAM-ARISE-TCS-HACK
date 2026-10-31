import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
  Network,
  Layers,
  Filter,
  Eye,
  Info,
  X,
  ShieldCheck,
  Sparkles,
  Scale,
  Wrench,
  ScrollText,
} from 'lucide-react';
import { investigationApi } from '../services/api';

// Custom Node Components
const CustomGraphNode = ({ data, selected }: any) => {
  const getBorderColor = () => {
    switch (data.entityType) {
      case 'CLAIM':
        return 'border-blue-600 bg-blue-50/90 text-blue-900';
      case 'STATEMENT':
        return 'border-indigo-500 bg-indigo-50/90 text-indigo-900';
      case 'EVIDENCE':
        return 'border-cyan-500 bg-cyan-50/90 text-cyan-900';
      case 'DAMAGE':
        return 'border-rose-500 bg-rose-50/90 text-rose-900';
      case 'REPAIR_ITEM':
        return 'border-teal-500 bg-teal-50/90 text-teal-900';
      case 'CONTRADICTION':
        return 'border-amber-500 bg-amber-50/90 text-amber-900';
      case 'HYPOTHESIS':
        return 'border-purple-500 bg-purple-50/90 text-purple-900';
      case 'POLICY_CLAUSE':
        return 'border-slate-500 bg-slate-50/90 text-slate-900';
      default:
        return 'border-slate-300 bg-white text-slate-800';
    }
  };

  return (
    <div
      className={`px-3.5 py-2.5 rounded-xl border-2 shadow-xs transition-all w-52 ${getBorderColor()} ${
        selected ? 'ring-2 ring-blue-500 shadow-md scale-105' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-slate-400" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider font-mono opacity-70">
          {data.entityType}
        </span>
        {data.badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/10">
            {data.badge}
          </span>
        )}
      </div>
      <p className="text-xs font-bold truncate">{data.title || data.label}</p>
      {data.subtitle && <p className="text-[10px] opacity-80 truncate mt-0.5">{data.subtitle}</p>}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-slate-400" />
    </div>
  );
};

export const DynamicEvidenceGraphPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [filterType, setFilterType] = useState('ALL');

  const nodeTypes = useMemo(
    () => ({
      claimNode: CustomGraphNode,
      statementNode: CustomGraphNode,
      evidenceNode: CustomGraphNode,
      damageNode: CustomGraphNode,
      repairNode: CustomGraphNode,
      contradictionNode: CustomGraphNode,
      hypothesisNode: CustomGraphNode,
      policyNode: CustomGraphNode,
    }),
    []
  );

  useEffect(() => {
    const fetchGraph = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const res = await investigationApi.getGraph(claimId);
        setNodes(res.nodes || []);
        setEdges(res.edges || []);
      } catch (err) {
        console.error('Failed to load evidence graph:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [claimId]);

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNodeData(node.data);
  }, []);

  const filteredNodes = useMemo(() => {
    if (filterType === 'ALL') return nodes;
    return nodes.filter((n) => n.data?.entityType === filterType || n.data?.entityType === 'CLAIM');
  }, [nodes, filterType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Constructing interactive evidence graph topology...
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
              Signature Innovation 01
            </span>
            <span className="text-xs text-slate-400">Claim {claimId}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dynamic Evidence Intelligence Graph</h1>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
          {['ALL', 'DAMAGE', 'REPAIR_ITEM', 'CONTRADICTION', 'HYPOTHESIS', 'POLICY_CLAUSE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all whitespace-nowrap ${
                filterType === f ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Entities' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas & Inspector Layout */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* React Flow Viewport */}
        <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls className="bg-slate-800 border-slate-700 text-white fill-white" />
            <MiniMap
              nodeColor={(n: any) => {
                switch (n.data?.entityType) {
                  case 'CLAIM':
                    return '#2563eb';
                  case 'DAMAGE':
                    return '#f43f5e';
                  case 'CONTRADICTION':
                    return '#f59e0b';
                  case 'HYPOTHESIS':
                    return '#a855f7';
                  default:
                    return '#64748b';
                }
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden"
            />
          </ReactFlow>

          {/* Canvas Floating Legend */}
          <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1 shadow-lg pointer-events-none">
            <span className="font-bold text-white block uppercase mb-1">Knowledge Topology</span>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Claim Node</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Damage Fingerprint</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Contradiction Link</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Explanatory Hypothesis</div>
          </div>
        </div>

        {/* Node Detail Drawer / Inspector */}
        {selectedNodeData && (
          <div className="w-80 bg-white border border-slate-200 rounded-2xl p-5 shadow-lg flex flex-col justify-between shrink-0 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedNodeData.entityType} Entity
                </span>
                <button
                  onClick={() => setSelectedNodeData(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-sm font-bold text-slate-900 mb-1">{selectedNodeData.title}</h2>
              <p className="text-xs text-slate-500 mb-4">{selectedNodeData.subtitle}</p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Entity ID:</span>
                  <span className="text-slate-800 font-bold">{selectedNodeData.id || selectedNodeData.label}</span>
                </div>
                {selectedNodeData.badge && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status / Confidence:</span>
                    <span className="text-emerald-700 font-bold">{selectedNodeData.badge}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
              Every entity node maintains strict cryptographic and relational provenance to the original evidence source.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
