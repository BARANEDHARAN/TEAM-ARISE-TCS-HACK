import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FocusedNavbar } from '../../components/focused/FocusedNavbar';
import { focusedApi, API_BASE_URL } from '../../services/api';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Car,
  User,
  RefreshCw,
  Eye,
  FileCheck,
} from 'lucide-react';

interface UploadedItem {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  size?: string;
  status: 'READY' | 'UPLOADING' | 'UPLOADED' | 'ERROR';
  rawFile?: File;
  previewUrl?: string;
}

export const EvidenceUploadPage: React.FC = () => {
  const { accidentId } = useParams<{ accidentId: string }>();
  const navigate = useNavigate();

  const [investigation, setInvestigation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Files state
  const [imageFiles, setImageFiles] = useState<UploadedItem[]>([]);
  const [reportFiles, setReportFiles] = useState<UploadedItem[]>([]);

  // Drag state
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingReport, setIsDraggingReport] = useState(false);

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!accidentId) return;
    loadInvestigation();
  }, [accidentId]);

  const loadInvestigation = async () => {
    try {
      setLoading(true);
      const data = await focusedApi.getInvestigation(accidentId!);
      setInvestigation(data);

      // Prepopulate files if they already exist in database
      if (data.evidence_files && data.evidence_files.length > 0) {
        const existingImages: UploadedItem[] = [];
        const existingReports: UploadedItem[] = [];

        data.evidence_files.forEach((ef: any) => {
          const item: UploadedItem = {
            id: ef.id,
            fileName: ef.file_name,
            fileType: ef.file_type,
            fileUrl: ef.file_url.startsWith('http') ? ef.file_url : `${API_BASE_URL.replace('/api', '')}${ef.file_url}`,
            status: 'UPLOADED',
          };
          if (ef.file_type === 'image') {
            existingImages.push(item);
          } else {
            existingReports.push(item);
          }
        });

        setImageFiles(existingImages);
        setReportFiles(existingReports);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to load accident investigation dossier.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null, category: 'image' | 'report') => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // File validation
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const validReportTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (category === 'image' && !validImageTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, JPEG, or PNG).');
      return;
    }

    if (category === 'report' && !validReportTypes.includes(file.type)) {
      alert('Please upload a valid accident report (PDF or Image).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds the 20MB limit.');
      return;
    }

    // Preview URL
    const previewUrl = category === 'image' || file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : undefined;

    const formattedSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const newItem: UploadedItem = {
      id: `LOCAL-${Date.now()}`,
      fileName: file.name,
      fileType: category === 'image' ? 'image' : 'pdf',
      fileUrl: previewUrl || '',
      size: formattedSize,
      status: 'UPLOADING',
      rawFile: file,
      previewUrl,
    };

    if (category === 'image') {
      setImageFiles([newItem]);
    } else {
      setReportFiles([newItem]);
    }

    // Trigger upload immediately to backend
    await uploadFileToBackend(file, category, newItem.id);
  };

  const uploadFileToBackend = async (file: File, category: 'image' | 'report', localId: string) => {
    if (!accidentId) return;
    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', category);

      const res = await focusedApi.uploadEvidence(accidentId, formData);

      const serverUrl = res.file_url.startsWith('http')
        ? res.file_url
        : `${API_BASE_URL.replace('/api', '')}${res.file_url}`;

      const updateList = (list: UploadedItem[]) =>
        list.map((item) =>
          item.id === localId
            ? {
                ...item,
                id: res.evidence_id,
                status: 'UPLOADED' as const,
                fileUrl: serverUrl,
                fileName: res.file_name,
              }
            : item
        );

      if (category === 'image') {
        setImageFiles(updateList);
      } else {
        setReportFiles(updateList);
      }

      setUploadSuccess(`Successfully uploaded ${file.name}`);
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || `Failed to upload ${file.name}`);
      const markError = (list: UploadedItem[]) =>
        list.map((item) => (item.id === localId ? { ...item, status: 'ERROR' as const } : item));
      if (category === 'image') setImageFiles(markError);
      else setReportFiles(markError);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id: string, category: 'image' | 'report') => {
    if (category === 'image') {
      setImageFiles((prev) => prev.filter((f) => f.id !== id));
      if (imageInputRef.current) imageInputRef.current.value = '';
    } else {
      setReportFiles((prev) => prev.filter((f) => f.id !== id));
      if (reportInputRef.current) reportInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <FocusedNavbar activeAccidentId={accidentId} />
        <div className="max-w-4xl mx-auto py-24 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading accident dossier...</p>
        </div>
      </div>
    );
  }

  const hasVehicleImage = imageFiles.some((f) => f.status === 'UPLOADED');
  const hasReport = reportFiles.some((f) => f.status === 'UPLOADED');

  return (
    <div className="min-h-screen bg-slate-50">
      <FocusedNavbar activeAccidentId={accidentId} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Top Case Context Banner */}
        {investigation && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {accidentId}
                  </span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {investigation.accident?.accident_type}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {investigation.accident?.manufacturer} {investigation.accident?.model} •{' '}
                  <span className="font-mono font-medium">{investigation.accident?.vehicle_registration}</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-600 border-l border-slate-200 pl-6">
              <div>
                <p className="text-slate-400 font-medium">Claimant</p>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> {investigation.claimant?.name}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Policy No</p>
                <p className="font-mono font-semibold text-slate-800">{investigation.claimant?.policy_number}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Claimed Amount</p>
                <p className="font-bold text-emerald-600">
                  ₹{Number(investigation.accident?.claimed_amount || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Step 2: Upload Accident Evidence</h1>
          <p className="text-sm text-slate-600">
            Upload the actual accident vehicle photograph and accident report. Both documents will be processed by our
            dedicated Computer Vision and OCR pipelines.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Upload Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="font-semibold">{uploadSuccess}</p>
          </div>
        )}

        {/* Upload Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 1. Accident Vehicle Image Upload */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Vehicle Accident Image</h3>
                    <p className="text-xs text-slate-500">JPG, JPEG, PNG (Max 20MB)</p>
                  </div>
                </div>
                {hasVehicleImage && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready for CV
                  </span>
                )}
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingImage(true);
                }}
                onDragLeave={() => setIsDraggingImage(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingImage(false);
                  handleFileSelect(e.dataTransfer.files, 'image');
                }}
                onClick={() => imageInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDraggingImage
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={imageInputRef}
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files, 'image')}
                />
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Click or drag & drop accident image</p>
                <p className="text-[11px] text-slate-400 mt-1">Clear photo showing damaged area or bumper</p>
              </div>

              {/* Uploaded Image Cards */}
              {imageFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  {imageFiles.map((file) => (
                    <div
                      key={file.id}
                      className="border border-slate-200 rounded-lg p-3 bg-white flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {(file.previewUrl || file.fileUrl) && (
                          <img
                            src={file.previewUrl || file.fileUrl}
                            alt="Vehicle Preview"
                            className="w-14 h-14 object-cover rounded-md border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">{file.fileName}</p>
                          <p className="text-[11px] text-slate-400">{file.size || 'Saved on server'}</p>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${
                              file.status === 'UPLOADED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : file.status === 'UPLOADING'
                                ? 'bg-blue-50 text-blue-700 animate-pulse'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {file.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => removeFile(file.id, 'image')}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasVehicleImage && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/investigation/${accidentId}/image-analysis`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  <Eye className="w-4 h-4" /> Run Vehicle Damage CV &rarr;
                </button>
              </div>
            )}
          </div>

          {/* 2. Accident Report / Document Upload */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Accident Report / FIR</h3>
                    <p className="text-xs text-slate-500">PDF, JPG, PNG (Max 20MB)</p>
                  </div>
                </div>
                {hasReport && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready for OCR
                  </span>
                )}
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingReport(true);
                }}
                onDragLeave={() => setIsDraggingReport(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingReport(false);
                  handleFileSelect(e.dataTransfer.files, 'report');
                }}
                onClick={() => reportInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDraggingReport
                    ? 'border-amber-500 bg-amber-50/50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={reportInputRef}
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files, 'report')}
                />
                <FileCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Click or drag & drop accident report</p>
                <p className="text-[11px] text-slate-400 mt-1">Police report, incident form, or claim assessment</p>
              </div>

              {/* Uploaded Report Cards */}
              {reportFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  {reportFiles.map((file) => (
                    <div
                      key={file.id}
                      className="border border-slate-200 rounded-lg p-3 bg-white flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 font-bold text-xs uppercase">
                          {file.fileName.split('.').pop() || 'DOC'}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">{file.fileName}</p>
                          <p className="text-[11px] text-slate-400">{file.size || 'Saved on server'}</p>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${
                              file.status === 'UPLOADED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : file.status === 'UPLOADING'
                                ? 'bg-amber-50 text-amber-700 animate-pulse'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {file.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => removeFile(file.id, 'report')}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasReport && (
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/investigation/${accidentId}/ocr`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 shadow-xs transition-colors"
                >
                  <FileText className="w-4 h-4" /> Run Document OCR &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Next Step Action Panel */}
        <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" /> Continuous Investigation Workflow
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Proceed to analyze the vehicle damage with Computer Vision first, then review the OCR text extraction.
              Both results will feed directly into the final AI reasoning engine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!hasVehicleImage}
              onClick={() => navigate(`/investigation/${accidentId}/image-analysis`)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                hasVehicleImage
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              Next: Damage CV Analysis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
export default EvidenceUploadPage;
