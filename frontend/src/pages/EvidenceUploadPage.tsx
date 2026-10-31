import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Upload,
  ShieldCheck,
  FileText,
  Trash2,
  Download,
  AlertCircle,
  Hash,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { evidenceApi } from '../services/api';

export const EvidenceUploadPage: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>();
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('photo');
  const [error, setError] = useState<string | null>(null);

  const fetchEvidence = async () => {
    if (!claimId) return;
    try {
      setLoading(true);
      const data = await evidenceApi.getEvidence(claimId);
      setEvidenceList(data);
    } catch (err) {
      console.error('Failed to fetch evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [claimId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !claimId) return;
    setUploading(true);
    setError(null);
    try {
      const files = Array.from(e.target.files);
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        await evidenceApi.upload(claimId, formData);
      }
      await fetchEvidence();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (evidenceId: string) => {
    if (!confirm('Are you sure you want to delete this evidence record?')) return;
    try {
      await evidenceApi.deleteEvidence(evidenceId);
      await fetchEvidence();
    } catch (err) {
      console.error('Failed to delete evidence:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Evidence Upload & Custody Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Secure multimodal document repository with cryptographic SHA-256 and perceptual hash integrity verification for claim <span className="font-mono font-bold text-blue-700">{claimId}</span>.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Upload Evidentiary Material</h2>
            <p className="text-xs text-slate-400">Assign document classification and initiate forensic hash indexing</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-600">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="photo">Accident Photographs (JPG/PNG)</option>
              <option value="police_report">Police FIR / GD Report (PDF)</option>
              <option value="repair_estimate">Workshop Repair Estimate (PDF)</option>
              <option value="policy_doc">Policy Schedule / Wording (PDF)</option>
              <option value="telematics">IoT / Telematics CSV Log</option>
            </select>
          </div>
        </div>

        <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/20">
          <Upload className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-xs font-semibold text-slate-800">
            {uploading ? 'Calculating SHA-256 & Uploading...' : 'Select or drag files here to upload'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, PDF, MP4, and CSV (Max 50MB per file)</p>
          <input
            type="file"
            multiple
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Evidence Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Catalogued Evidence Files ({evidenceList.length})
          </h2>
          <span className="text-[11px] text-slate-400">Cryptographically Sealed Evidence Vault</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading evidence catalog...</div>
        ) : evidenceList.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No evidence files attached to this claim yet. Use the upload box above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">File ID</th>
                  <th className="px-5 py-3">Filename & Category</th>
                  <th className="px-5 py-3">Size</th>
                  <th className="px-5 py-3">SHA-256 Hash</th>
                  <th className="px-5 py-3">pHash (dHash)</th>
                  <th className="px-5 py-3">Uploaded</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {evidenceList.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-700">{ev.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{ev.original_filename}</p>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {ev.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {(ev.file_size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[10px] text-slate-600">
                      {ev.sha256_hash ? `${ev.sha256_hash.slice(0, 16)}...` : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[10px] text-indigo-600 font-semibold">
                      {ev.perceptual_hash ? `${ev.perceptual_hash.slice(0, 12)}...` : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(ev.upload_time).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <a
                        href={evidenceApi.downloadUrl(ev.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-500 hover:text-blue-600 inline-block"
                        title="Download / View"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 inline-block"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
