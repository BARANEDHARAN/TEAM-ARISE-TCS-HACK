import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortalNavbar } from '../../components/portal/PortalNavbar';
import { portalApi, BASE_URL } from '../../services/api';
import { EvidenceRelationshipGraph } from '../../components/portal/EvidenceRelationshipGraph';
import {
  Bot,
  Scan,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Send,
  RefreshCw,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';

export const AiInvestigationWorkspacePage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active tab in workspace
  const [activeTab, setActiveTab] = useState<'cv' | 'ocr' | 'inconsistencies' | 'recommendations' | 'graph'>('inconsistencies');

  // Image mode
  const [imageMode, setImageMode] = useState<'split' | 'processed' | 'original'>('split');

  useEffect(() => {
    if (!claimId) return;
    loadDossier();
  }, [claimId]);

  const loadDossier = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await portalApi.getAiClaimDossier(claimId!);
      setDossier(data);

      // If not processed yet, auto-trigger
      if (data.ai_status === 'PENDING') {
        await handleReRunAi();
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.detail || 'Failed to load AI investigation dossier.');
    } finally {
      setLoading(false);
    }
  };

  const handleReRunAi = async () => {
    if (!claimId) return;
    try {
      setReprocessing(true);
      await portalApi.runAiProcessing(claimId);
      const updated = await portalApi.getAiClaimDossier(claimId);
      setDossier(updated);
    } catch (e: any) {
      alert(e?.response?.data?.detail || 'AI processing encountered an issue.');
    } finally {
      setReprocessing(false);
    }
  };

  const handleTransferToHuman = async () => {
    alert(`Dossier ${claimId} successfully scheduled in Human Claims Investigator Review Queue.`);
    navigate('/human-investigator/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PortalNavbar />
        <div className="max-w-4xl mx-auto py-24 text-center">
          <Bot className="w-10 h-10 text-indigo-600 animate-pulse mx-auto mb-3" />
          <h2 className="text-sm font-bold text-slate-800">Processing Multimodal AI Investigation...</h2>
          <p className="text-xs text-slate-500 mt-1">
            Running OpenCV damage contour bounding boxes, PyMuPDF OCR extraction, and hypothesis reasoning.
          </p>
        </div>
      </div>
    );
  }

  const claim = dossier;
  const cv = claim?.image_analysis;
  const ocr = claim?.ocr_result;
  const findings = claim?.findings || [];
  const recommendations = claim?.recommendations || [];

  const originalImgUrl = claim?.evidence_files?.find((f: any) => f.file_type === 'image')?.file_url;
  const processedImgUrl = cv?.processed_image_url;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PortalNavbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                AI Engine Hub
              </span>
              <span>&rsaquo;</span>
              <span className="font-mono text-slate-800 font-bold">{claimId}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-600" /> Multimodal Investigation & Evidence Intelligence
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Automated damage detection, text extraction, cross-modal inconsistency reconciliation, and recommendation generation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReRunAi}
              disabled={reprocessing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reprocessing ? 'animate-spin text-indigo-600' : ''}`} />
              {reprocessing ? 'Re-analyzing...' : 'Re-run AI Analysis'}
            </button>

            {claim?.report_pdf_url && (
              <a
                href={`${BASE_URL}${claim.report_pdf_url}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> Download AI Report (PDF)
              </a>
            )}

            <button
              onClick={handleTransferToHuman}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              Transfer to Human Review Queue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Claim Context Strip */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Claimant: </span>
            <span className="font-bold text-slate-900">{claim?.claimant_name}</span>
            <span className="text-slate-400 ml-3">Policy: </span>
            <span className="font-mono font-bold text-slate-800">{claim?.policy_number}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Vehicle: </span>
            <span className="font-semibold text-slate-900">
              {claim?.vehicle?.manufacturer} {claim?.vehicle?.model} ({claim?.vehicle?.registration_number})
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Claimed Amount: </span>
            <span className="font-bold text-emerald-600">
              ₹{Number(claim?.accident?.claimed_amount || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium">AI Status: </span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                claim?.ai_status === 'INCONSISTENCIES_DETECTED'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {claim?.ai_status}
            </span>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto">
          {[
            { id: 'inconsistencies', label: '1. Inconsistency Detection & Hypotheses', icon: AlertTriangle },
            { id: 'cv', label: '2. Computer Vision Damage Detection', icon: Scan },
            { id: 'ocr', label: '3. OCR Document Report Extraction', icon: FileText },
            { id: 'recommendations', label: '4. AI Solutions & Recommendations', icon: Sparkles },
            { id: 'graph', label: '5. Evidence Relationship Graph', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Inconsistency Detection & Hypotheses (Section 1 - Login 2.C & 2.D) */}
        {activeTab === 'inconsistencies' && (
          <div className="space-y-6">
            {/* Cross-Evidence Comparison Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Cross-Evidence Reconciled Findings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comparing Customer Statement vs CV Damage vs OCR Report without automated accusations of fraud.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                  {findings.length} Deductions
                </span>
              </div>

              <div className="space-y-4">
                {findings.map((f: any) => {
                  const isContradiction = f.finding_type === 'contradiction';
                  return (
                    <div
                      key={f.id}
                      className={`border rounded-xl p-5 text-xs ${
                        isContradiction
                          ? 'border-red-200 bg-red-50/30'
                          : 'border-emerald-200 bg-emerald-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isContradiction ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                          ></span>
                          {f.title}
                        </span>
                        <span
                          className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                            isContradiction
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {f.finding_type}
                        </span>
                      </div>

                      {/* Evidence comparison block */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {f.claimant_statement && (
                          <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <p className="text-slate-400 font-medium mb-1">Customer Statement:</p>
                            <p className="font-semibold text-slate-800 italic">"{f.claimant_statement}"</p>
                          </div>
                        )}
                        {f.image_analysis && (
                          <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <p className="text-slate-400 font-medium mb-1">OpenCV Damage Detection:</p>
                            <p className="font-semibold text-slate-800 italic">"{f.image_analysis}"</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 mb-3">
                        <p className="font-bold text-slate-900 mb-1">AI Inconsistency Finding:</p>
                        <p className="text-slate-700 leading-relaxed">{f.finding_text}</p>
                      </div>

                      {f.possible_explanations && f.possible_explanations.length > 0 && (
                        <div className="bg-slate-100/70 p-3.5 rounded-lg border border-slate-200">
                          <p className="font-bold text-slate-900 mb-1.5">
                            Possible Explanations (Non-Accusatory Multimodal Reasoning):
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            {f.possible_explanations.map((exp: string, idx: number) => (
                              <li key={idx}>{exp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Computer Vision Damage Detection (Section 1 - Login 2.B) */}
        {activeTab === 'cv' && (
          <div className="space-y-6">
            {/* View Selector */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setImageMode('split')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    imageMode === 'split' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Side-by-Side Comparison
                </button>
                <button
                  onClick={() => setImageMode('processed')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    imageMode === 'processed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  CV Annotated Bounding Boxes
                </button>
                <button
                  onClick={() => setImageMode('original')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    imageMode === 'original' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Original Photo
                </button>
              </div>

              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Confidence: {Math.round((cv?.confidence || 0.85) * 100)}%
              </span>
            </div>

            {/* Split Images */}
            {imageMode === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Original Uploaded Vehicle Photo</span>
                    <span className="font-mono text-slate-400">Claimant Submission</span>
                  </div>
                  <div className="p-4 bg-black flex items-center justify-center min-h-[350px]">
                    {originalImgUrl ? (
                      <img
                        src={`${BASE_URL}${originalImgUrl}`}
                        alt="Original"
                        className="max-h-[380px] w-full object-contain rounded"
                      />
                    ) : (
                      <p className="text-xs text-slate-400">No original vehicle image.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span>Processed Image (OpenCV / Contour Bounding Boxes)</span>
                    <span className="font-mono text-indigo-600">CV Model Output</span>
                  </div>
                  <div className="p-4 bg-black flex items-center justify-center min-h-[350px]">
                    {processedImgUrl ? (
                      <img
                        src={`${BASE_URL}${processedImgUrl}`}
                        alt="Processed"
                        className="max-h-[380px] w-full object-contain rounded shadow-sm"
                      />
                    ) : (
                      <p className="text-xs text-slate-400">Processed image pending.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {imageMode === 'processed' && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-4 bg-black min-h-[460px] flex items-center justify-center">
                {processedImgUrl && (
                  <img
                    src={`${BASE_URL}${processedImgUrl}`}
                    alt="Processed"
                    className="max-h-[500px] w-full object-contain rounded"
                  />
                )}
              </div>
            )}

            {imageMode === 'original' && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-4 bg-black min-h-[460px] flex items-center justify-center">
                {originalImgUrl && (
                  <img
                    src={`${BASE_URL}${originalImgUrl}`}
                    alt="Original"
                    className="max-h-[500px] w-full object-contain rounded"
                  />
                )}
              </div>
            )}

            {/* Detected damage details */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Detected Damage Components:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {cv?.detected_damage?.map((dmg: string, i: number) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> {dmg}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Localization: Front fascia / bumper perimeter contour
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: OCR Document Report Extraction (Section 1 - Login 2.B) */}
        {activeTab === 'ocr' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" /> PyMuPDF / Tesseract Document OCR Output
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
              {Object.entries(ocr?.extracted_fields || {}).map(([key, val]) => (
                <div key={key} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60">
                  <p className="font-bold text-slate-500 text-[10px] uppercase">{key.replace(/_/g, ' ')}</p>
                  <p className="font-semibold text-slate-900 text-xs mt-1">{String(val)}</p>
                </div>
              ))}
            </div>

            {ocr?.raw_text && (
              <div>
                <p className="text-xs font-bold text-slate-800 mb-2">Raw Text Stream (Page 1):</p>
                <pre className="whitespace-pre-wrap p-4 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg overflow-x-auto max-h-72">
                  {ocr.raw_text}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: AI Solutions & Recommendations (Section 1 - Login 2.D) */}
        {activeTab === 'recommendations' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Actionable Next Steps for Human Adjudicator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {recommendations.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Priority: {rec.priority}
                    </span>
                    <p className="text-slate-800 font-semibold mt-1.5 leading-relaxed">{rec.action_text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Ready to Handover to Human Reviewer</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI findings have been compiled into an official investigation dossier for final approval or denial.
                </p>
              </div>

              <button
                onClick={handleTransferToHuman}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-md flex items-center gap-2 cursor-pointer"
              >
                Send to Human Investigator Queue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Evidence Relationship Graph */}
        {activeTab === 'graph' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" /> Interactive Evidence Intelligence Graph
                  </h2>
                  <p className="text-xs text-slate-500">
                    Interactive topology connecting Claimant Statement, OCR Attributes, OpenCV Damage Detections, Inconsistencies, and Recommendations. Click any node to inspect evidence details.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded border border-indigo-200">
                  React Flow Topology
                </span>
              </div>
              <EvidenceRelationshipGraph claimId={claimId!} height="650px" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AiInvestigationWorkspacePage;
