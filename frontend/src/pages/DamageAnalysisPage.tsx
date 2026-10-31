import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  Layers,
  Fingerprint,
  Info,
  CheckCircle2,
  AlertCircle,
  Tag,
  Crosshair,
} from 'lucide-react';
import { modulesApi, evidenceApi } from '../services/api';

export const DamageAnalysisPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDamage, setSelectedDamage] = useState<any>(null);

  useEffect(() => {
    const fetchDamage = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const res = await modulesApi.getDamage(claimId);
        setData(res);
        if (res.damage_records?.length > 0) {
          setSelectedDamage(res.damage_records[0]);
        }
      } catch (err) {
        console.error('Failed to load damage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDamage();
  }, [claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Running Computer Vision damage inference...
      </div>
    );
  }

  const damages = data?.damage_records || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            Module 01
          </span>
          <span className="text-xs text-slate-400 font-mono">Engine: {data?.model_engine}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Vehicle Damage Intelligence</h1>
        <p className="text-xs text-slate-500 mt-1">
          Component-level visual damage segmentation, bounding box localization, and immutable Damage Fingerprint tagging.
        </p>
      </div>

      {/* Model Disclaimer Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Investigative Guardrail:</span> AI detection highlights visible surface deformations from submitted photographs. Visual assessment cannot determine concealed internal structural chassis damage or internal powertrain integrity from photos alone.
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Visual Canvas & Damage Inspector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
              <span>Visual Damage Localization Canvas</span>
              <span className="text-[11px] font-normal text-slate-400">Interactive Bounding Coordinate View</span>
            </h2>

            {/* Mock Vehicle Canvas with SVG Bounding Box Overlays */}
            <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30" />

              {/* Wireframe Silhouette */}
              <div className="text-center z-0 opacity-60">
                <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-mono">Vehicle Front Fascia & Bodywork Plane</p>
              </div>

              {/* Dynamic Bounding Box Overlay for Selected Damage */}
              {selectedDamage && (
                <div
                  className="absolute border-2 border-rose-500 bg-rose-500/20 rounded z-10 transition-all flex flex-col justify-between p-1.5"
                  style={{
                    left: `${selectedDamage.bbox_json?.x ? (selectedDamage.bbox_json.x / 1200) * 100 : 20}%`,
                    top: `${selectedDamage.bbox_json?.y ? (selectedDamage.bbox_json.y / 800) * 100 : 40}%`,
                    width: `${selectedDamage.bbox_json?.width ? (selectedDamage.bbox_json.width / 1200) * 100 : 50}%`,
                    height: `${selectedDamage.bbox_json?.height ? (selectedDamage.bbox_json.height / 800) * 100 : 40}%`,
                  }}
                >
                  <span className="text-[10px] bg-rose-600 text-white font-mono px-1 py-0.5 rounded self-start font-bold">
                    {selectedDamage.component} ({Math.round(selectedDamage.confidence * 100)}%)
                  </span>
                  <span className="text-[9px] bg-black/70 text-rose-300 font-mono px-1 py-0.5 rounded self-end">
                    {selectedDamage.damage_type}
                  </span>
                </div>
              )}
            </div>

            {/* Coordinates Strip */}
            {selectedDamage && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-[11px] text-slate-600 font-mono">
                <span>Coordinates: X:{selectedDamage.bbox_json?.x || 240} Y:{selectedDamage.bbox_json?.y || 440} W:{selectedDamage.bbox_json?.width || 720} H:{selectedDamage.bbox_json?.height || 280}</span>
                <span className="text-emerald-700 font-bold">Inference Confidence: {Math.round(selectedDamage.confidence * 100)}%</span>
              </div>
            )}
          </div>

          {/* Unique Feature: Damage Fingerprint Deep Dive */}
          {selectedDamage && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Fingerprint className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Unique Feature: Damage Fingerprint (DFP)</h3>
              </div>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Damage Fingerprint ID:</span>
                  <span className="text-indigo-400 font-bold">{selectedDamage.fingerprint}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500">Component:</span>{' '}
                    <span className="text-slate-300">{selectedDamage.component}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Damage Type:</span>{' '}
                    <span className="text-slate-300">{selectedDamage.damage_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Severity:</span>{' '}
                    <span className="text-amber-400 font-bold">{selectedDamage.severity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Model Version:</span>{' '}
                    <span className="text-slate-300">ClaimMind-Vision-Hybrid-v1.0</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                The Damage Fingerprint bridges computer vision and invoice auditing. It links photographic evidence directly to workshop repair line items in the <b>Repair Necessity Graph</b>.
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Detected Damage Components List */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Identified Damage Regions ({damages.length})
            </h2>

            {damages.length === 0 ? (
              <p className="text-xs text-slate-400">No damage records found. Trigger AI investigation to analyze photos.</p>
            ) : (
              <div className="space-y-2.5">
                {damages.map((dmg: any) => (
                  <div
                    key={dmg.id}
                    onClick={() => setSelectedDamage(dmg)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedDamage?.id === dmg.id
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{dmg.component}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                        {dmg.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">{dmg.damage_type}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono">
                      <span>Conf: {Math.round(dmg.confidence * 100)}%</span>
                      <span className="text-indigo-600 font-semibold truncate max-w-[140px]">{dmg.fingerprint}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
