import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  History,
  Activity,
  CloudRain,
  Navigation,
  Camera,
  AlertTriangle,
  GitBranch,
  CheckCircle2,
  Clock,
  Gauge,
} from 'lucide-react';
import { modulesApi } from '../services/api';

export const AccidentReconstructionPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReconstruction = async () => {
      if (!claimId) return;
      try {
        setLoading(true);
        const res = await modulesApi.getReconstruction(claimId);
        setData(res);
      } catch (err) {
        console.error('Failed to load reconstruction:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReconstruction();
  }, [claimId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Reconstructing temporal telematics sequence and simulating crash scenarios...
      </div>
    );
  }

  const timeline = data?.timeline || [];
  const scenarios = data?.simulated_scenarios || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            Module 06
          </span>
          <span className="text-xs text-slate-400">Claim {claimId}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Context-Aware Accident Reconstruction & Scenario Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Synchronizes IoT telematics telemetry, ambient weather conditions, and photographic EXIF timestamps to reconstruct the incident sequence.
        </p>
      </div>

      {/* Section 1: Chronological Incident Timeline */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          Chronological Multimodal Incident Timeline
        </h2>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {timeline.map((event: any, idx: number) => {
            const isTelematics = event.source_type === 'TELEMATICS';
            const isPhoto = event.source_type === 'PHOTO_EXIF';
            const isWeather = event.source_type === 'WEATHER_SERVICE';

            return (
              <div key={event.id || idx} className="relative group">
                <span
                  className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                    isTelematics
                      ? 'border-rose-500 bg-rose-500'
                      : isWeather
                      ? 'border-blue-500'
                      : isPhoto
                      ? 'border-purple-500'
                      : 'border-emerald-500'
                  }`}
                />

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-900">{event.event_title}</span>
                    <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 self-start sm:self-auto">
                      {event.timestamp_str}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{event.event_description}</p>

                  {/* Telemetry Chips */}
                  {event.telemetry_metrics && Object.keys(event.telemetry_metrics).length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 font-mono text-[10px]">
                      {Object.entries(event.telemetry_metrics).map(([k, v]) => (
                        <span key={k} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          {k}: <b>{String(v)}</b>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Unique Feature: Accident Scenario Simulator */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            Unique Feature: Accident Scenario Simulator
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Algorithmic scenario generation evaluates alternative collision dynamics against physical evidence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((scen: any) => (
            <div
              key={scen.scenario_id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {scen.scenario_id}
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {scen.alignment_score}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mb-2">{scen.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{scen.description}</p>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="font-bold text-emerald-800 block text-[11px] mb-1">
                      Supporting Observations:
                    </span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px]">
                      {scen.supporting_observations?.map((o: string, i: number) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-bold text-rose-800 block text-[11px] mb-1">
                      Inconsistencies & Tensions:
                    </span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px]">
                      {scen.inconsistencies?.map((inc: string, i: number) => (
                        <li key={i}>{inc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] bg-slate-50 p-2.5 rounded text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Verification Action:</span>
                {scen.investigation_recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
