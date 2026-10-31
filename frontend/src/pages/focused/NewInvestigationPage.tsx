import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  CarFront,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { focusedApi } from '../../services/api';
import { FocusedNavbar } from '../../components/focused/FocusedNavbar';

export const NewInvestigationPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [claimant, setClaimant] = useState({
    name: 'Vikramaditya Verma',
    contact: '+91 98450 11234',
    email: 'vikram.verma@example.com',
    policy_number: 'POL-2025-IND-8849',
  });

  const [accident, setAccident] = useState({
    vehicle_registration: 'KA-01-MJ-4092',
    manufacturer: 'Hyundai',
    model: 'Creta SX(O)',
    vehicle_type: 'SUV',
    accident_date: '2026-03-15',
    accident_location: 'MG Road & Brigade Rd Intersection, Bengaluru',
    accident_type: 'Rear-End Collision',
    accident_description:
      'My vehicle was stationary at the red traffic signal on MG Road when another speeding vehicle abruptly struck my car from behind with heavy force.',
    claimed_amount: 48500,
  });

  const handleClaimantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClaimant({ ...claimant, [e.target.name]: e.target.value });
  };

  const handleAccidentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAccident({
      ...accident,
      [name]: name === 'claimed_amount' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!claimant.name || !claimant.policy_number) {
      setError('Please fill in Claimant Name and Policy Number.');
      return;
    }
    if (!accident.vehicle_registration || !accident.accident_description) {
      setError('Please fill in Vehicle Registration and Accident Description.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await focusedApi.createInvestigation({
        claimant,
        accident,
      });

      // Proceed to Step 2: Evidence Upload
      navigate(`/investigation/${res.accident_id}/upload`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit accident details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      <FocusedNavbar />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Step 1 of 4
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Accident & Claimant Intake Form</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter policyholder information, vehicle specifications, and incident description.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Claimant Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Claimant Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Claimant Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={claimant.name}
                  onChange={handleClaimantChange}
                  required
                  placeholder="e.g. Vikramaditya Verma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Insurance Policy Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="policy_number"
                  value={claimant.policy_number}
                  onChange={handleClaimantChange}
                  required
                  placeholder="e.g. POL-2025-IND-8849"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contact"
                  value={claimant.contact}
                  onChange={handleClaimantChange}
                  placeholder="e.g. +91 98450 11234"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={claimant.email}
                  onChange={handleClaimantChange}
                  placeholder="e.g. claimant@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Vehicle Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CarFront className="w-4 h-4 text-blue-600" /> Vehicle Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Registration Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="vehicle_registration"
                  value={accident.vehicle_registration}
                  onChange={handleAccidentChange}
                  required
                  placeholder="e.g. KA-01-MJ-4092"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={accident.manufacturer}
                  onChange={handleAccidentChange}
                  placeholder="e.g. Hyundai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Model</label>
                <input
                  type="text"
                  name="model"
                  value={accident.model}
                  onChange={handleAccidentChange}
                  placeholder="e.g. Creta SX(O)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vehicle Type</label>
                <select
                  name="vehicle_type"
                  value={accident.vehicle_type}
                  onChange={handleAccidentChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Commercial">Commercial / Light Truck</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Accident Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Accident Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Accident Date</label>
                <input
                  type="date"
                  name="accident_date"
                  value={accident.accident_date}
                  onChange={handleAccidentChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Accident Location</label>
                <input
                  type="text"
                  name="accident_location"
                  value={accident.accident_location}
                  onChange={handleAccidentChange}
                  required
                  placeholder="e.g. MG Road Junction, Bengaluru"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Accident Type</label>
                <select
                  name="accident_type"
                  value={accident.accident_type}
                  onChange={handleAccidentChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Rear-End Collision">Rear-End Collision</option>
                  <option value="Frontal Collision">Frontal Collision</option>
                  <option value="Side Impact (T-Bone)">Side Impact (T-Bone)</option>
                  <option value="Single Vehicle Road Contact">Single Vehicle Road Contact</option>
                  <option value="Stationary Parking Incident">Stationary Parking Incident</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Accident Description (Claimant Statement) <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="accident_description"
                rows={4}
                value={accident.accident_description}
                onChange={handleAccidentChange}
                required
                placeholder="Describe the sequence of events, collision direction, and observed damage..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                This statement will be compared directly with the damage detected in uploaded accident photos and the OCR report.
              </p>
            </div>

            <div className="text-xs">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Claimed Repair Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="claimed_amount"
                value={accident.claimed_amount}
                onChange={handleAccidentChange}
                required
                className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Submitting Details...' : 'Submit Accident Details & Proceed to Evidence'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
