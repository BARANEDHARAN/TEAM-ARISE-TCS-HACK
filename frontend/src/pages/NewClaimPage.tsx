import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus,
  Upload,
  X,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { claimsApi, evidenceApi } from '../services/api';

export const NewClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    claimant_name: 'Ananya Deshmukh',
    claimant_phone: '+91 98200 45199',
    claimant_email: 'ananya.deshmukh@example.com',
    policy_number: 'POL-2026-IND-10492',
    vehicle_reg: 'MH-12-PQ-9082',
    vehicle_make: 'Kia',
    vehicle_model: 'Seltos GTX+',
    vehicle_year: 2024,
    accident_date: '2026-03-24',
    accident_time: '11:15 AM',
    accident_location: 'Viman Nagar Junction, Pune',
    accident_type: 'Rear-End Collision',
    description:
      'My car was stationary at the traffic light on Pune-Nagar highway when a commercial vehicle struck my vehicle from behind, shoving my car forward into the road divider.',
    requested_amount: 52000,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [fileCategory, setFileCategory] = useState('photo');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'vehicle_year' || name === 'requested_amount' ? Number(value) : value,
    }));
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const added = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...added]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Create Claim
      const created = await claimsApi.createClaim(formData);

      // 2. Upload any selected initial evidence files
      if (files.length > 0) {
        for (const file of files) {
          const form = new FormData();
          form.append('file', file);
          form.append('category', fileCategory);
          await evidenceApi.upload(created.id, form);
        }
      }

      // Navigate to investigation workspace
      navigate(`/workspace/${created.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to register claim');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Claim Intake & Registration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Register policyholder incident details and upload multimodal evidentiary records into the investigation pipeline.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Claimant & Policy */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            1. Claimant & Insurance Policy Identification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Claimant Full Name</label>
              <input
                type="text"
                name="claimant_name"
                value={formData.claimant_name}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Insurance Policy Number</label>
              <input
                type="text"
                name="policy_number"
                value={formData.policy_number}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Phone</label>
              <input
                type="text"
                name="claimant_phone"
                value={formData.claimant_phone}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                name="claimant_email"
                value={formData.claimant_email}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Vehicle Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            2. Insured Vehicle Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vehicle Registration Number</label>
              <input
                type="text"
                name="vehicle_reg"
                value={formData.vehicle_reg}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Manufacturer (Make)</label>
              <input
                type="text"
                name="vehicle_make"
                value={formData.vehicle_make}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Model Variant</label>
              <input
                type="text"
                name="vehicle_model"
                value={formData.vehicle_model}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Manufacture Year</label>
              <input
                type="number"
                name="vehicle_year"
                value={formData.vehicle_year}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Incident Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            3. Incident Timeline & Claimant Statement
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Accident Date</label>
              <input
                type="date"
                name="accident_date"
                value={formData.accident_date}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Accident Time</label>
              <input
                type="text"
                name="accident_time"
                value={formData.accident_time}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Accident Classification</label>
              <select
                name="accident_type"
                value={formData.accident_type}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Rear-End Collision">Rear-End Collision</option>
                <option value="Frontal Collision">Frontal Collision</option>
                <option value="Side Impact (T-Bone)">Side Impact (T-Bone)</option>
                <option value="Single Vehicle Road Contact">Single Vehicle Road Contact</option>
                <option value="Stationary Parking Incident">Stationary Parking Incident</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Incident Location</label>
            <input
              type="text"
              name="accident_location"
              value={formData.accident_location}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Claimant Narrative / Description of Incident
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              This statement will be cross-examined against uploaded photographs, police FIRs, and repair estimates by the Cross-Modal Contradiction engine.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Estimated Total Claim Amount (₹)
            </label>
            <input
              type="number"
              name="requested_amount"
              value={formData.requested_amount}
              onChange={handleInputChange}
              required
              className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Section 4: Initial Evidence Upload Dropzone */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              4. Initial Evidence Package (Optional at Registration)
            </h2>
            <select
              value={fileCategory}
              onChange={(e) => setFileCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 text-slate-700"
            >
              <option value="photo">Accident Photos</option>
              <option value="police_report">Police FIR Report</option>
              <option value="repair_estimate">Workshop Repair Estimate</option>
              <option value="policy_doc">Policy PDF Document</option>
              <option value="telematics">Telematics CSV Data</option>
            </select>
          </div>

          <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-xs font-semibold text-slate-700">Click or drag files here to attach evidence</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, PDF, MP4, and CSV (Up to 50MB)</p>
            <input type="file" multiple onChange={handleFileDrop} className="hidden" />
          </label>

          {files.length > 0 && (
            <div className="space-y-2 mt-3">
              <p className="text-xs font-semibold text-slate-700">Pending Uploads ({files.length}):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-2">
                      <p className="font-medium text-slate-800 truncate">{f.name}</p>
                      <p className="text-[10px] text-slate-400">{(f.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/claims')}
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Creating Investigation Workspace...' : 'Create Claim & Launch Workspace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
