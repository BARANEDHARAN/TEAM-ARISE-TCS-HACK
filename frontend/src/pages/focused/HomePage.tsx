import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  PlusCircle,
  FileText,
  Camera,
  SearchCode,
  ArrowRight,
  History,
  CarFront,
  CheckCircle2,
} from 'lucide-react';
import { focusedApi } from '../../services/api';
import { FocusedNavbar } from '../../components/focused/FocusedNavbar';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await focusedApi.listInvestigations();
        setInvestigations(data);
      } catch (err) {
        console.error('Failed to load investigations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <FocusedNavbar />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Hero Section */}
        <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              Autonomous Multimodal Accident Investigation
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI-Powered Vehicle Damage & Accident Report Investigator
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload accident vehicle photographs and police/surveyor reports. CLAIMMIND AI extracts document facts via OCR, performs OpenCV & YOLO damage detection, cross-examines the collision dynamics, and generates explainable investigation solutions.
            </p>
          </div>

          <button
            onClick={() => navigate('/new-investigation')}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Start New Investigation
          </button>
        </div>

        {/* 4-Step Focused Pipeline Graphic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h2 className="text-xs font-bold text-slate-900">Claimant & Incident Intake</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Capture claimant contact, vehicle registration specs, collision date, location, and description.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h2 className="text-xs font-bold text-slate-900">CV Damage Detection</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              OpenCV preprocessing and YOLO detect visible dents, scratches, bumper deformations, and broken lights with bounding boxes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h2 className="text-xs font-bold text-slate-900">OCR Report Extraction</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              PyMuPDF & Tesseract parse police FIRs and accident reports into an editable, reviewable format.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h2 className="text-xs font-bold text-slate-900">AI Findings & Solution</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cross-examines visual damage against statement facts, pinpoints contradictions, and recommends actionable next steps.
            </p>
          </div>
        </div>

        {/* Previous Investigations Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Previously Submitted Investigations</h2>
              <p className="text-xs text-slate-500">Reopen any past case to inspect processed images, OCR text, and AI recommendations</p>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              View Full History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400">Loading stored investigations...</div>
          ) : investigations.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No investigations created yet. Click "Start New Investigation" above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Case ID</th>
                    <th className="px-5 py-3">Claimant & Policy</th>
                    <th className="px-5 py-3">Vehicle Details</th>
                    <th className="px-5 py-3">Accident Date</th>
                    <th className="px-5 py-3">Claimed Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {investigations.slice(0, 5).map((inv) => (
                    <tr key={inv.accident_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-700">{inv.accident_id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{inv.claimant_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{inv.policy_number}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-700">{inv.vehicle}</td>
                      <td className="px-5 py-3.5 text-slate-600">{inv.accident_date}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        ₹{inv.claimed_amount?.toLocaleString('en-IN') || '0'}
                      </td>
                      <td className="px-5 py-3.5">
                        {inv.has_investigation_result ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Investigated
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Pending Analysis
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => navigate(`/investigation/${inv.accident_id}/results`)}
                          className="px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded text-xs font-semibold transition-all inline-flex items-center gap-1"
                        >
                          Reopen <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
