import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalNavbar } from '../../components/portal/PortalNavbar';
import { useAuth } from '../../context/AuthContext';
import { portalApi } from '../../services/api';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Car,
  User,
  ShieldCheck,
  Trash2,
  Receipt,
  FileCheck,
} from 'lucide-react';

interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl?: string;
  category: 'accident_photo' | 'accident_report' | 'damage_photo' | 'repair_estimate' | 'other';
  uploaded: boolean;
}

export const ClaimantNewClaimPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Personal Details
  const [name, setName] = useState(user?.name || 'Rajesh Sharma');
  const [contact, setContact] = useState(user?.mobile || '+91 98201 44321');
  const [email, setEmail] = useState(user?.email || 'customer@claimmind.com');
  const [address, setAddress] = useState('Flat 402, Sea Breeze Apts, Bandra West, Mumbai');

  // Vehicle Details
  const [policyNumber, setPolicyNumber] = useState('POL-MUM-892147');
  const [registrationNumber, setRegistrationNumber] = useState('MH 02 EE 4519');
  const [manufacturer, setManufacturer] = useState('Honda');
  const [model, setModel] = useState('City');
  const [vehicleType, setVehicleType] = useState('Sedan');

  // Accident Details
  const [accidentDate, setAccidentDate] = useState('2026-10-24');
  const [accidentTime, setAccidentTime] = useState('18:45');
  const [accidentLocation, setAccidentLocation] = useState('Western Express Highway, Goregaon flyover junction, Mumbai');
  const [accidentType, setAccidentType] = useState('Rear-End Collision');
  const [accidentDescription, setAccidentDescription] = useState(
    'My vehicle was completely stationary at a red signal when another vehicle approached from behind and rammed into our rear bumper with significant impact.'
  );
  const [claimedAmount, setClaimedAmount] = useState('48500');

  // Uploaded files
  const [files, setFiles] = useState<UploadQueueItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'accident_photo' | 'accident_report' | 'damage_photo' | 'repair_estimate' | 'other'>('accident_photo');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newItems: UploadQueueItem[] = [];

    Array.from(fileList).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const preview = isImg ? URL.createObjectURL(file) : undefined;
      newItems.push({
        id: `LOCAL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file,
        previewUrl: preview,
        category: selectedCategory,
        uploaded: false,
      });
    });

    setFiles((prev) => [...prev, ...newItems]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !policyNumber || !registrationNumber || !accidentDescription) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // 1. Submit Claim Data
      const claimRes = await portalApi.submitClaim({
        personal: { name, contact, email, address },
        vehicle: {
          policy_number: policyNumber,
          registration_number: registrationNumber,
          manufacturer,
          model,
          vehicle_type: vehicleType,
        },
        accident: {
          accident_date: accidentDate,
          accident_time: accidentTime,
          accident_location: accidentLocation,
          accident_type: accidentType,
          accident_description: accidentDescription,
          claimed_amount: parseFloat(claimedAmount || '0'),
        },
        user_id: user?.id,
      });

      const claimId = claimRes.claim_id;

      // 2. Upload Evidence files if any
      for (const item of files) {
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('category', item.category);
        await portalApi.uploadCustomerEvidence(claimId, formData);
      }

      // Navigate to claim detail tracker
      navigate(`/claimant/claim/${claimId}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to submit claim. Please verify all inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <PortalNavbar />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Customer Portal
              </span>
              <span>&rsaquo;</span>
              <span>New Claim Submission</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Submit Vehicle Accident Insurance Claim
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Please provide complete accident details and upload corresponding photographs and police report.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/claimant/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-emerald-600" /> 1. Claimant Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <Car className="w-4 h-4 text-emerald-600" /> 2. Insured Vehicle Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Insurance Policy Number *</label>
                <input
                  type="text"
                  required
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vehicle Registration Number *</label>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Manufacturer (Make)</label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Commercial">Commercial / Van</option>
                  <option value="Two-Wheeler">Two-Wheeler</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Accident Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-emerald-600" /> 3. Accident Details & Description
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mb-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Accident Date *</label>
                <input
                  type="date"
                  required
                  value={accidentDate}
                  onChange={(e) => setAccidentDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Accident Time</label>
                <input
                  type="text"
                  value={accidentTime}
                  onChange={(e) => setAccidentTime(e.target.value)}
                  placeholder="e.g. 18:45"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Collision Type</label>
                <select
                  value={accidentType}
                  onChange={(e) => setAccidentType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Rear-End Collision">Rear-End Collision</option>
                  <option value="Frontal Impact">Frontal Impact</option>
                  <option value="Side Impact / T-Bone">Side Impact / T-Bone</option>
                  <option value="Single Vehicle Rollover">Single Vehicle Rollover</option>
                  <option value="Stationary Parking Damage">Stationary Parking Damage</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Accident Location *</label>
                <input
                  type="text"
                  required
                  value={accidentLocation}
                  onChange={(e) => setAccidentLocation(e.target.value)}
                  placeholder="Road name, landmark, or intersection"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Claimed Repair Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={claimedAmount}
                  onChange={(e) => setClaimedAmount(e.target.value)}
                  className="w-full font-bold text-emerald-700 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-semibold text-slate-700 block mb-1">
                Detailed Accident Description (Your Narrative) *
              </label>
              <textarea
                required
                rows={3}
                value={accidentDescription}
                onChange={(e) => setAccidentDescription(e.target.value)}
                placeholder="Describe how the accident took place, impact direction, speed, and other vehicles involved..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Evidence Upload */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <UploadCloud className="w-4 h-4 text-emerald-600" /> 4. Physical Evidence Upload (Photos & Report)
            </h2>

            {/* Category Selector */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
              <span className="font-semibold text-slate-600">Document Type:</span>
              {[
                { id: 'accident_photo', label: 'Accident Vehicle Photo' },
                { id: 'accident_report', label: 'Accident Report / FIR (PDF)' },
                { id: 'damage_photo', label: 'Close-up Damage Photo' },
                { id: 'repair_estimate', label: 'Bodyshop Repair Estimate' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id as any)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFilesAdded(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Click or drag & drop files here</p>
              <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, or PDF format (Max 20MB)</p>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-slate-800">Files ready for submission ({files.length}):</p>
                {files.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50/60 text-xs"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt="preview"
                          className="w-10 h-10 object-cover rounded border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-amber-50 text-amber-700 font-bold flex items-center justify-center">
                          PDF
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{item.file.name}</p>
                        <p className="text-[11px] text-slate-500 capitalize">{item.category.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/claimant/dashboard')}
              className="px-5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {submitting ? 'Submitting & Scheduling AI...' : 'Submit Claim & Start AI Investigation'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
export default ClaimantNewClaimPage;
