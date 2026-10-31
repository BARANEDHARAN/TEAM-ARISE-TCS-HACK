import React from 'react';
import { Search, ShieldAlert, LogOut, User as UserIcon, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const TopNavbar: React.FC = () => {
  const { user, logout, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = async (role: string) => {
    await loginDemo(role);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search claims by ID, registration (KA-01-MJ-4092), or claimant..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate('/claims');
              }
            }}
          />
        </div>
      </div>

      {/* Center AI Engine Status Badge */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-medium">
        <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <span>ClaimMind Vision & Reasoning Engine</span>
        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono font-semibold">
          DEMO MODE ACTIVE
        </span>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Demo Role Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] text-slate-500 font-semibold px-2">ROLE:</span>
          <button
            onClick={() => handleRoleSwitch('investigator')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              user?.role === 'investigator' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Investigator
          </button>
          <button
            onClick={() => handleRoleSwitch('reviewer')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              user?.role === 'reviewer' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reviewer
          </button>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              user?.role === 'admin' ? 'bg-white shadow-xs text-purple-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-slate-800 leading-tight">{user?.full_name || 'Rajesh Sharma'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'investigator'}</p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
