import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FocusedNavbar } from '../../components/focused/FocusedNavbar';
import { focusedApi } from '../../services/api';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Edit3,
  Save,
  BookOpen,
  HelpCircle,
  Sparkles,
  Layers,
} from 'lucide-react';

export const OCRResultsPage: React.FC = () => {
  const { accidentId } = useParams<{ accidentId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted data state
  const [ocrData, setOcrData] = useState<any>(null);
  const [editableFields, setEditableFields] = useState<Record<string, string>>({
    accident_date_time: 'Not found',
    accident_location: 'Not found',
    vehicle_information: 'Not found',
    accident_description: 'Not found',
    impact_direction: 'Not found',
    parties_involved: 'Not found',
    reported_damage: 'Not found',
    other_details: 'Not found',
  });

  const [activeTab, setActiveTab] = useState<'structured' | 'raw'>('structured');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!accidentId) return;
    loadOcr();
  }, [accidentId]);

  const loadOcr = async () => {
    try {
      setLoading(true);
      setError(null);
      // Run or fetch OCR extraction
      const res = await focusedApi.processOCR(accidentId!);
      setOcrData(res);
      if (res.extracted_fields) {
        setEditableFields({
          accident_date_time: res.extracted_fields.accident_date_time || 'Not found',
          accident_location: res.extracted_fields.accident_location || 'Not found',
          vehicle_information: res.extracted_fields.vehicle_information || 'Not found',
          accident_description: res.extracted_fields.accident_description || 'Not found',
          impact_direction: res.extracted_fields.impact_direction || 'Not found',
          parties_involved: res.extracted_fields.parties_involved || 'Not found',
          reported_damage: res.extracted_fields.reported_damage || 'Not found',
          other_details: res.extracted_fields.other_details || 'Not found',
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to extract text from accident report.');
    } finally {
      setLoading(false);
    }
  };

  const handleReRunOcr = async () => {
    try {
      setExtracting(true);
      setError(null);
      const res = await focusedApi.processOCR(accidentId!);
      setOcrData(res);
      if (res.extracted_fields) {
        setEditableFields(res.extracted_fields);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to re-run OCR extraction.');
    } finally {
      setExtracting(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditableFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveFields = () => {
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleProceedToAI = async () => {
    if (!accidentId) return;
    try {
      setAnalyzingAi(true);
      setError(null);
      // Run AI Investigation Engine with the verified/edited OCR fields
      await focusedApi.runAnalysis(accidentId, editableFields);
      navigate(`/investigation/${accidentId}/results`);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'AI Investigation Engine execution failed.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const fieldLabels: Record<string, { label: string; desc: string }> = {
    accident_date_time: {
      label: 'Accident Date & Time',
      desc: 'Extracted timestamp of the collision event',
    },
    accident_location: {
      label: 'Accident Location',
      desc: 'Roadway, intersection, or GPS coordinates recorded in report',
    },
    vehicle_information: {
      label: 'Vehicle Information',
      desc: 'Registration plate, make, model, or VIN mentioned in report',
    },
    accident_description: {
      label: 'Accident Description',
      desc: 'Official statement or officer summary of what occurred',
    },
    impact_direction: {
      label: 'Reported Impact Direction',
      desc: 'Stated collision vector (e.g., rear-end, head-on, T-bone side)',
    },
    parties_involved: {
      label: 'Parties Involved',
      desc: 'Drivers, passengers, or third-party vehicle registrations',
    },
    reported_damage: {
      label: 'Reported Damage & Parts',
      desc: 'Physical damage catalogued in official report',
    },
    other_details: {
      label: 'Other Relevant Details',
      desc: 'Weather, road conditions, witnesses, or citation notes',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <FocusedNavbar activeAccidentId={accidentId} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <span>Investigation</span>
              <span>&rsaquo;</span>
              <span className="font-mono text-slate-800 font-bold">{accidentId}</span>
              <span>&rsaquo;</span>
              <span className="text-amber-600 font-semibold">Step 4: OCR Document Review</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              OCR – Accident Report Extraction & Verification
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Extracted via PyMuPDF / Tesseract OCR. Review and correct extracted fields before AI reasoning synthesis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReRunOcr}
              disabled={extracting}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${extracting ? 'animate-spin text-amber-600' : ''}`} />
              {extracting ? 'Extracting...' : 'Re-extract OCR'}
            </button>

            <button
              onClick={handleProceedToAI}
              disabled={analyzingAi}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              {analyzingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating AI Findings...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Run AI Investigation Engine &rarr;
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">OCR Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="font-semibold">Extracted fields saved for AI comparison.</p>
          </div>
        )}

        {/* Document Metadata Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Source Document: <span className="font-mono">{ocrData?.document_path?.split('\\').pop() || 'Accident_Report.pdf'}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Pages Analyzed: <span className="font-bold text-slate-700">{ocrData?.page_count || 1}</span> • Extraction Confidence: <span className="font-bold text-emerald-700">High (100% Text Layer)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('structured')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  activeTab === 'structured' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Structured Review
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  activeTab === 'raw' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Raw OCR Text
              </button>
            </div>

            {activeTab === 'structured' && (
              <button
                type="button"
                onClick={() => (isEditing ? handleSaveFields() : setIsEditing(true))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isEditing
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isEditing ? (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" /> Edit Fields
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Structured Editable Form */}
        {activeTab === 'structured' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Extracted Accident Attributes</h2>
                <p className="text-xs text-slate-500">
                  Values not found in the original document are explicitly labeled as <span className="font-mono text-amber-700 bg-amber-50 px-1 py-0.5 rounded">Not found</span>.
                </p>
              </div>
              {isEditing && (
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Edit Mode Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(fieldLabels).map(([key, meta]) => {
                const val = editableFields[key] || 'Not found';
                const isNotFound = val === 'Not found';

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border transition-all ${
                      isEditing
                        ? 'border-blue-300 bg-blue-50/20'
                        : isNotFound
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800">{meta.label}</label>
                      {isNotFound && !isEditing && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded">
                          Not found
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">{meta.desc}</p>

                    {isEditing ? (
                      <textarea
                        rows={key === 'accident_description' || key === 'reported_damage' ? 3 : 2}
                        value={val}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p
                        className={`text-xs leading-relaxed ${
                          isNotFound ? 'font-mono text-amber-700 italic' : 'font-semibold text-slate-800'
                        }`}
                      >
                        {val}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(`/investigation/${accidentId}/image-analysis`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Damage CV
              </button>

              <button
                type="button"
                onClick={handleProceedToAI}
                disabled={analyzingAi}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
              >
                {analyzingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running AI Analysis...
                  </>
                ) : (
                  <>
                    Proceed to AI Investigation &rarr;
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Raw Document Text */}
        {activeTab === 'raw' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Raw Document Extraction Output</h2>
                <p className="text-xs text-slate-500">
                  Preserving physical page boundaries from PyMuPDF text reader.
                </p>
              </div>
            </div>

            {ocrData?.pages && ocrData.pages.length > 0 ? (
              <div className="space-y-4">
                {ocrData.pages.map((p: any, idx: number) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50 font-mono text-xs text-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 font-bold text-slate-500">
                      <span>PAGE {p.page_number}</span>
                      <span>Length: {p.text?.length || 0} characters</span>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800">
                      {p.text || '(Empty page content)'}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap bg-slate-50 p-4 rounded-lg font-mono text-xs text-slate-800 border border-slate-200">
                {ocrData?.raw_text || 'No text extracted from document.'}
              </pre>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default OCRResultsPage;
