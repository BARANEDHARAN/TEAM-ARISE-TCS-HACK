import React, { useState } from 'react';
import { Settings, Cpu, ShieldCheck, Sliders, Database, Info, CheckCircle2 } from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const [visionConfidence, setVisionConfidence] = useState(85);
  const [hammingThreshold, setHammingThreshold] = useState(6);
  const [compulsoryDeductible, setCompulsoryDeductible] = useState(2000);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Model Architecture</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure model adapter interfaces, confidence filtering cutoffs, and regulatory compliance flags.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Investigation parameters updated successfully.</span>
        </div>
      )}

      {/* Model Adapters & Replacability Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">AI Model Adapters & Extensibility Architecture</h2>
            <p className="text-xs text-slate-400">Replaceable service adapters decoupling models from business logic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Computer Vision Damage Engine</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                DEMO ADAPTER
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Active Adapter: <code>ClaimMind-Vision-Hybrid-v1.0</code>
            </p>
            <p className="text-[11px] text-slate-600">
              Integrates OpenCV image preprocessing with bounding box heuristics and Damage Fingerprint generation. Supports drop-in replacement with YOLOv8 or SegFormer weights in <code>app/services/cv_damage_service.py</code>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Perceptual Hashing (Forensics)</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Active Adapter: <code>64-bit dHash + SHA-256</code>
            </p>
            <p className="text-[11px] text-slate-600">
              Generates difference gradient hashes resilient to re-compression, cropping, and messaging metadata stripping.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Document Parsing & OCR</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Active Adapter: <code>pypdf-6.21 + PyMuPDF Interface</code>
            </p>
            <p className="text-[11px] text-slate-600">
              Extracts text from repair invoices, police FIRs, and policy schedules with structured regex clause identification.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Official Report Compilation Engine</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Active Adapter: <code>ReportLab-5.0 Engine</code>
            </p>
            <p className="text-[11px] text-slate-600">
              Generates tamper-evident 19-section PDF dossiers with cryptographic hash seals and tabular damage breakdown.
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Sliders Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Investigation Parameters & Sensitivity Thresholds</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Minimum Damage Detection Confidence Threshold</label>
              <span className="font-mono font-bold text-blue-600">{visionConfidence}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={visionConfidence}
              onChange={(e) => setVisionConfidence(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">Detections below this threshold are omitted to reduce false alerts.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Perceptual Hash Duplicate Hamming Distance Cutoff</label>
              <span className="font-mono font-bold text-blue-600">&le; {hammingThreshold} bits (&ge; 90% visual match)</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={hammingThreshold}
              onChange={(e) => setHammingThreshold(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">Flags images with 6 or fewer bit variances across historical claims.</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Default Compulsory Policy Deductible (INR)</label>
            <input
              type="number"
              value={compulsoryDeductible}
              onChange={(e) => setCompulsoryDeductible(Number(e.target.value))}
              className="w-full max-w-xs p-2 rounded-lg border bg-slate-50 font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
          >
            Save Parameter Configurations
          </button>
        </form>
      </div>
    </div>
  );
};
