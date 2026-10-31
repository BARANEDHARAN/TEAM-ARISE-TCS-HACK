import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type PortalRole } from '../../context/AuthContext';
import {
  ShieldCheck,
  User,
  Bot,
  Scale,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  CheckCircle,
  Sparkles,
  Layers,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const PortalLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { quickLogin, login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<'portals' | 'login' | 'register'>('portals');
  const [selectedRole, setSelectedRole] = useState<PortalRole>('claimant');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle1ClickLogin = async (role: PortalRole) => {
    try {
      setLoading(true);
      setError(null);
      await quickLogin(role);
      if (role === 'claimant') navigate('/claimant/dashboard');
      else if (role === 'ai_investigator') navigate('/ai-investigator/dashboard');
      else navigate('/human-investigator/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const user = await login(email, password);
      if (user.role === 'claimant') navigate('/claimant/dashboard');
      else if (user.role === 'ai_investigator') navigate('/ai-investigator/dashboard');
      else navigate('/human-investigator/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Full Name, Email, and Password are required.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const user = await register({
        name: fullName,
        email,
        mobile,
        password,
        role: selectedRole,
      });
      if (user.role === 'claimant') navigate('/claimant/dashboard');
      else if (user.role === 'ai_investigator') navigate('/ai-investigator/dashboard');
      else navigate('/human-investigator/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">CLAIMMIND AI</h1>
              <p className="text-xs text-slate-400">Three-Portal Multimodal Insurance Claim Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All 3 Portals Connected & Live
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Select Your Insurance Portal
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Choose a portal to experience the complete end-to-end claim investigation workflow.
            All three logins communicate seamlessly with the unified backend database.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
            <button
              onClick={() => {
                setActiveTab('portals');
                setError(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'portals' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              1-Click Portal Gateway
            </button>
            <button
              onClick={() => {
                setActiveTab('login');
                setError(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard Login
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Claimant Register
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-xl mx-auto mb-6 bg-red-950/60 border border-red-800 text-red-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* View 1: 3-Portal Gateway Cards */}
        {activeTab === 'portals' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PORTAL 1: CLAIMANT / CUSTOMER */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 hover:border-emerald-500/60 transition-all flex flex-col justify-between group shadow-lg hover:shadow-emerald-950/30">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                    LOGIN 1
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Claimant / Customer
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                  Submit vehicle accident claims, upload photos and FIR reports, track real-time investigation stages,
                  reply to investigator queries, and download final settlement reports.
                </p>

                <div className="space-y-2 border-t border-slate-700/60 pt-3 text-xs text-slate-300">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Vehicle & Accident Submission
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Real-Time Investigation Tracking
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Additional Evidence Upload
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Settlement PDF Report Download
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/80">
                <button
                  onClick={() => handle1ClickLogin('claimant')}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Enter Claimant Portal <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2 font-mono">
                  Demo User: Rajesh Sharma
                </p>
              </div>
            </div>

            {/* PORTAL 2: AI INSURANCE INVESTIGATOR */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 hover:border-indigo-500/60 transition-all flex flex-col justify-between group shadow-lg hover:shadow-indigo-950/30">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-800 px-2.5 py-0.5 rounded-full">
                    LOGIN 2
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                  AI Insurance Investigator
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                  Autonomous AI analysis pipeline: OpenCV vehicle damage detection with bounding boxes, PyMuPDF report
                  OCR, cross-evidence inconsistency detection, and automated AI PDF reports.
                </p>

                <div className="space-y-2 border-t border-slate-700/60 pt-3 text-xs text-slate-300">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> OpenCV Damage Bounding Boxes
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> PyMuPDF / Tesseract Report OCR
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> Inconsistency Reasoning
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> Automatic AI Dossier PDF
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/80">
                <button
                  onClick={() => handle1ClickLogin('ai_investigator')}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Enter AI Investigator Portal <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2 font-mono">
                  Autonomous Engine Queue
                </p>
              </div>
            </div>

            {/* PORTAL 3: HUMAN INSURANCE INVESTIGATOR */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 hover:border-amber-500/60 transition-all flex flex-col justify-between group shadow-lg hover:shadow-amber-950/30">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Scale className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/50 border border-amber-800 px-2.5 py-0.5 rounded-full">
                    LOGIN 3
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Human Claims Investigator
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                  Final adjudication workspace: Review AI findings, accept or reject deductions, add investigator
                  remarks, execute decisions (Approve / Reject / Request Evidence), and sign final PDF reports.
                </p>

                <div className="space-y-2 border-t border-slate-700/60 pt-3 text-xs text-slate-300">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Review & Flag AI Findings
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Direct Messaging with Customer
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Approve / Reject Decision Desk
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Final Adjudication PDF Artifact
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/80">
                <button
                  onClick={() => handle1ClickLogin('human_investigator')}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Enter Human Review Portal <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2 font-mono">
                  Demo User: Priya Nair (Senior Adjudicator)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Standard Login Form */}
        {activeTab === 'login' && (
          <div className="max-w-md mx-auto w-full bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Sign In to Your Account</h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter your registered credentials to access your designated portal.
            </p>

            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-md mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        {/* View 3: Claimant Registration */}
        {activeTab === 'register' && (
          <div className="max-w-md mx-auto w-full bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Claimant Registration</h3>
            <p className="text-xs text-slate-400 mb-6">
              Register as a customer to submit and manage your vehicle insurance claims.
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Patil"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-md mt-2"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/40 px-6 py-4 text-center text-xs text-slate-500">
        CLAIMMIND AI • Multimodal Autonomous Insurance Claims Platform • Human-in-the-Loop Governance
      </footer>
    </div>
  );
};
