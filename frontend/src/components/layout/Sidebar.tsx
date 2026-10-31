import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  FolderGit2,
  FilePlus2,
  CarFront,
  Scale,
  ScrollText,
  Wrench,
  SearchCode,
  History,
  Network,
  HelpCircle,
  Calculator,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Users,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentClaimId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentClaimId = 'CLM-2026-001' }) => {
  const { user, isAdmin } = useAuth();

  const mainNav = [
    { name: 'Executive Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Claims Management', path: '/claims', icon: FolderGit2 },
    { name: 'New Claim Intake', path: '/claims/new', icon: FilePlus2 },
    { name: 'Review Queue', path: '/review-queue', icon: CheckCircle2 },
  ];

  const claimWorkspaceNav = [
    { name: 'Claim Workspace', path: `/workspace/${currentClaimId}`, icon: CarFront },
    { name: 'Evidence Upload', path: `/workspace/${currentClaimId}/evidence`, icon: ShieldCheck },
    { name: 'M01: Damage AI', path: `/workspace/${currentClaimId}/damage`, icon: Sparkles },
    { name: 'M02: Contradictions', path: `/workspace/${currentClaimId}/contradictions`, icon: Scale },
    { name: 'M03: Policy Intelligence', path: `/workspace/${currentClaimId}/policy`, icon: ScrollText },
    { name: 'M04: Repair Verification', path: `/workspace/${currentClaimId}/repair`, icon: Wrench },
    { name: 'M05: Digital Forensics', path: `/workspace/${currentClaimId}/forensics`, icon: SearchCode },
    { name: 'M06: Reconstruction', path: `/workspace/${currentClaimId}/reconstruction`, icon: History },
    { name: 'M07: Historical Patterns', path: `/workspace/${currentClaimId}/patterns`, icon: Network },
    { name: 'M08: Evidence Gaps', path: `/workspace/${currentClaimId}/gaps`, icon: HelpCircle },
    { name: 'M09: Settlement AI', path: `/workspace/${currentClaimId}/settlement`, icon: Calculator },
    { name: 'Innovation: Evidence Graph', path: `/workspace/${currentClaimId}/graph`, icon: Network },
    { name: 'Investigation Report', path: `/workspace/${currentClaimId}/report`, icon: FileSpreadsheet },
    { name: 'Human Review Decision', path: `/workspace/${currentClaimId}/review`, icon: CheckCircle2 },
  ];

  const systemNav = [
    { name: 'Investigation History', path: '/history', icon: Clock },
    ...(isAdmin ? [{ name: 'User Management', path: '/users', icon: Users }] : []),
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">CLAIMMIND AI</h1>
          <p className="text-[11px] text-blue-400 font-medium">Autonomous Claims Investigator</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core Management */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Operations
          </p>
          <nav className="space-y-1">
            {mainNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Claim Intelligence Workspace */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Investigation
            </p>
            <span className="text-[10px] bg-blue-950 border border-blue-800 text-blue-300 px-1.5 py-0.5 rounded font-mono">
              {currentClaimId}
            </span>
          </div>
          <nav className="space-y-0.5">
            {claimWorkspaceNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`
                }
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Governance & Admin */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Governance & Settings
          </p>
          <nav className="space-y-1">
            {systemNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Role Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <p className="text-white font-medium truncate">{user?.full_name || 'Investigator'}</p>
            <p className="text-slate-400 text-[11px] capitalize">{user?.role || 'Guest'} Role</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
        </div>
      </div>
    </aside>
  );
};
