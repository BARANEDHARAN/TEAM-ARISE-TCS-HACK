import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, PlusCircle, History, Home, CheckCircle2 } from 'lucide-react';

export const FocusedNavbar: React.FC<{ activeAccidentId?: string }> = ({ activeAccidentId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getStepClass = (pathSnippet: string) => {
    return location.pathname.includes(pathSnippet)
      ? 'text-blue-600 border-b-2 border-blue-600 font-bold bg-blue-50/50'
      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-600 transition-colors">
            <ShieldCheck className="w-5 h-5 text-blue-400 group-hover:text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">CLAIMMIND AI</h1>
            <p className="text-[11px] text-slate-500 font-medium">Vehicle Accident Claims Investigator</p>
          </div>
        </div>

        {/* Global Nav Links */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Home className="w-3.5 h-3.5" /> Home
          </NavLink>

          <NavLink
            to="/new-investigation"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`
            }
          >
            <PlusCircle className="w-3.5 h-3.5" /> Start New Investigation
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <History className="w-3.5 h-3.5" /> Investigation History
          </NavLink>
        </div>
      </div>

      {/* Active Investigation Stepper (when inside an investigation) */}
      {activeAccidentId && (
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-medium">
            <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px] mr-2">
              {activeAccidentId}
            </span>

            <NavLink
              to={`/investigation/${activeAccidentId}/upload`}
              className={`px-3 py-1 rounded text-xs transition-colors ${getStepClass('upload')}`}
            >
              1. Evidence Upload
            </NavLink>

            <span className="text-slate-300">&rarr;</span>

            <NavLink
              to={`/investigation/${activeAccidentId}/image-analysis`}
              className={`px-3 py-1 rounded text-xs transition-colors ${getStepClass('image-analysis')}`}
            >
              2. Vehicle Damage CV
            </NavLink>

            <span className="text-slate-300">&rarr;</span>

            <NavLink
              to={`/investigation/${activeAccidentId}/ocr`}
              className={`px-3 py-1 rounded text-xs transition-colors ${getStepClass('ocr')}`}
            >
              3. OCR Document Review
            </NavLink>

            <span className="text-slate-300">&rarr;</span>

            <NavLink
              to={`/investigation/${activeAccidentId}/results`}
              className={`px-3 py-1 rounded text-xs transition-colors ${getStepClass('results')}`}
            >
              4. AI Findings & Solution
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
};
