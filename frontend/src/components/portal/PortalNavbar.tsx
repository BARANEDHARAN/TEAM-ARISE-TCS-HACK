import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, type PortalRole } from '../../context/AuthContext';
import { portalApi } from '../../services/api';
import {
  ShieldCheck,
  User,
  Bot,
  Scale,
  Bell,
  LogOut,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  ArrowRight,
  PlusCircle,
  Eye,
  Home,
} from 'lucide-react';

export const PortalNavbar: React.FC = () => {
  const { user, role, switchPortal, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [role, user?.id]);

  const loadNotifications = async () => {
    try {
      if (user?.id) {
        const notifs = await portalApi.getCustomerNotifications(user.id);
        setNotifications(notifs || []);
      }
    } catch (e) {
      // ignore in navbar
    }
  };

  const handleSwitchPortal = async (targetRole: PortalRole) => {
    setShowPortalMenu(false);
    await switchPortal(targetRole);
    if (targetRole === 'claimant') {
      navigate('/claimant/dashboard');
    } else if (targetRole === 'ai_investigator') {
      navigate('/ai-investigator/dashboard');
    } else {
      navigate('/human-investigator/dashboard');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getPortalBadge = () => {
    switch (role) {
      case 'claimant':
        return {
          label: 'Customer / Claimant Portal',
          sub: 'Login 1',
          icon: <User className="w-3.5 h-3.5" />,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'ai_investigator':
        return {
          label: 'AI Autonomous Investigator',
          sub: 'Login 2',
          icon: <Bot className="w-3.5 h-3.5" />,
          color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'human_investigator':
        return {
          label: 'Human Claims Investigator',
          sub: 'Login 3',
          icon: <Scale className="w-3.5 h-3.5" />,
          color: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      default:
        return {
          label: 'Customer / Claimant Portal',
          sub: 'Login 1',
          icon: <User className="w-3.5 h-3.5" />,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
    }
  };

  const badge = getPortalBadge();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-600 transition-colors">
              <ShieldCheck className="w-5 h-5 text-blue-400 group-hover:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">CLAIMMIND AI</h1>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                  v3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Three-Portal Investigation Platform</p>
            </div>
          </div>

          {/* Active Portal Badge */}
          <div className="hidden md:flex items-center ml-4">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}
            >
              <span className="font-mono text-[10px] opacity-75">{badge.sub}:</span>
              {badge.icon}
              {badge.label}
            </span>
          </div>
        </div>

        {/* Center / Portal Quick-Switcher */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => handleSwitchPortal('claimant')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              role === 'claimant' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-600" /> Claimant
          </button>

          <button
            onClick={() => handleSwitchPortal('ai_investigator')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              role === 'ai_investigator' ? 'bg-white text-indigo-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600" /> AI Engine
          </button>

          <button
            onClick={() => handleSwitchPortal('human_investigator')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              role === 'human_investigator' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-600" /> Human Reviewer
          </button>
        </div>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown (Active for Claimant) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-800">Claim Notifications</span>
                  <span className="text-[10px] text-slate-400 font-mono">{notifications.length} alerts</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2 rounded-lg border text-[11px] ${
                          n.type === 'APPROVED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : n.type === 'REJECTED'
                            ? 'bg-red-50 border-red-200 text-red-900'
                            : n.type === 'EVIDENCE_REQUIRED'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <p className="font-bold">{n.title}</p>
                        <p className="mt-0.5 leading-tight">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.slice(0, 2) || 'CM'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{role.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Portal Switch Dropdown (Mobile) */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setShowPortalMenu(!showPortalMenu)}
              className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1"
            >
              Switch Portal <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showPortalMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs">
                <button
                  onClick={() => handleSwitchPortal('claimant')}
                  className="w-full text-left p-2 rounded-md hover:bg-slate-50 font-medium"
                >
                  🚗 Login 1: Claimant
                </button>
                <button
                  onClick={() => handleSwitchPortal('ai_investigator')}
                  className="w-full text-left p-2 rounded-md hover:bg-slate-50 font-medium"
                >
                  🤖 Login 2: AI Engine
                </button>
                <button
                  onClick={() => handleSwitchPortal('human_investigator')}
                  className="w-full text-left p-2 rounded-md hover:bg-slate-50 font-medium"
                >
                  ⚖️ Login 3: Human Reviewer
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/login')}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Switch User / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
