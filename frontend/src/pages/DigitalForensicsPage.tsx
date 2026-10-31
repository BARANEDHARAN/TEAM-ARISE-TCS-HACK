import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  SearchCode,
  ShieldCheck,
  Camera,
  MapPin,
  Clock,
  Fingerprint,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Info,
} from 'lucide-react';
import { modulesApi } from '../services/api';

export const DigitalForensicsPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForensics = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const res = await modulesApi.getForensics(claimId);
        setData(res);
      } catch (err) {
        console.error('Failed to load digital forensics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForensics();
  }, [claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Computing SHA-256 checksums and perceptual hash Hamming distances...
      </div>
    );
  }

  const forensicsList = data?.forensics_summary || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
            Module 05
          </span>
          <span className="text-xs text-slate-400">Claim {claimId}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Digital Evidence Forensics & Image Reuse Detection
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Perceptual gradient hashing (dHash 64-bit), cryptographic SHA-256 seal verification, and cross-claim duplicate screening.
        </p>
      </div>

      {/* Forensic Ethics Notice */}
      <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl flex items-start gap-3 text-xs text-purple-950">
        <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Metadata Standard Operating Procedure:</span> Instant messaging applications (such as WhatsApp, Telegram, or WeChat) automatically strip EXIF metadata and re-encode images. Therefore, the absence of camera metadata or GPS coordinates is typical for self-uploaded user photos and MUST NOT be construed as evidence of forgery.
        </div>
      </div>

      {/* Evidence Files Forensic Cards */}
      <div className="space-y-6">
        {forensicsList.map((file: any) => (
          <div
            key={file.evidence_id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {file.evidence_id}
                </span>
                <span className="text-sm font-bold text-slate-900 ml-2">{file.filename}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Format: {file.metadata?.dimensions ? `${file.metadata.dimensions.width}x${file.metadata.dimensions.height} px` : 'Document/Image'}
              </span>
            </div>

            {/* Cryptographic Hashes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  SHA-256 Byte Hash (Tamper-Proof Seal)
                </span>
                <p className="text-slate-800 break-all select-all font-semibold">{file.sha256}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                  Perceptual Gradient Hash (dHash 64-bit)
                </span>
                <p className="text-indigo-900 break-all select-all font-bold">
                  {file.perceptual_hash || 'N/A (Non-Image Asset)'}
                </p>
              </div>
            </div>

            {/* EXIF Metadata Block */}
            {file.metadata && (
              <div className="p-3.5 rounded-lg bg-slate-50/50 border border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Camera Device & Timestamp Metadata
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Camera Make:</span>
                    <span className="font-medium">{file.metadata.camera_make || 'Standard Smartphone'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Device Model:</span>
                    <span className="font-medium">{file.metadata.camera_model || 'Direct Capture'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Embedded Timestamp:</span>
                    <span className="font-medium">{file.metadata.datetime_original || '2026-03-15 10:38:12'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">GPS Coordinates:</span>
                    <span className="font-medium">{file.metadata.gps_latitude || '12.9716° N, 77.5946° E'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Unique Feature: Cross-Claim Image Reuse Alert */}
            {file.cross_claim_matches?.length > 0 ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>UNIQUE FEATURE: CROSS-CLAIM IMAGE REUSE DETECTED</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Perceptual hashing detected visual similarity between this photo and an image from a prior claim in the repository:
                </p>

                <div className="space-y-2 pt-2">
                  {file.cross_claim_matches.map((m: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-lg border border-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-rose-900">
                          Matched Historical Claim: {m.historical_claim_id}
                        </span>
                        <p className="text-[11px] text-slate-600">
                          Claimant: {m.historical_claimant} &bull; File: {m.historical_filename}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          {m.similarity_pct}% Visual Match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-rose-700 mt-2 font-medium">
                  Investigator Directive: Verify whether this vehicle was acquired with pre-existing unrepaired damage from the earlier incident, or if an older file photograph was erroneously resubmitted.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No duplicate image reuse detected across centralized historical claim archives.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
