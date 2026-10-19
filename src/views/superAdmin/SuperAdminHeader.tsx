import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Store,
  Lock,
  LogOut,
  User,
  Activity,
  Menu,
  ChevronDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SuperAdminProfile } from '../../types/superAdmin';

interface SuperAdminHeaderProps {
  profile: SuperAdminProfile | null;
  onLogout: () => void;
  onLogoutAll: () => void;
  onLockSession: () => void;
  onExitToStore: () => void;
  onToggleSidebarMobile: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({
  profile,
  onLogout,
  onLogoutAll,
  onLockSession,
  onExitToStore,
  onToggleSidebarMobile,
  searchQuery,
  onSearchChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState(1800); // 30 minutes session timeout

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="h-16 bg-[#151D26] border-b border-slate-800 text-white flex items-center justify-between px-3 sm:px-6 shrink-0 relative z-30 font-sans shadow-md">
      {/* Left: Mobile Menu & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-wide text-white">VYAPRIX</span>
              <span className="text-[10px] font-bold text-sky-400 px-1.5 py-0.2 bg-sky-500/10 rounded border border-sky-500/20">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              Powered by <span className="font-semibold text-amber-400">GOLDEN BAZAAR</span>
            </p>
          </div>
        </div>
      </div>

      {/* Center: Global Multi-Tenant Omni-Search */}
      <div className="flex-1 max-w-md mx-3 sm:mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search businesses, users, tickets, GSTIN..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Operational Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>99.98% Operational</span>
        </div>

        {/* 2FA Badge */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sky-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>2FA Protected</span>
        </div>

        {/* Session Auto-Lock Countdown */}
        <button
          onClick={onLockSession}
          title="Session auto-locks after inactivity. Click to lock now."
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-mono transition"
        >
          <Lock className="w-3 h-3 text-amber-400" />
          <span>{formatTimer(timeLeftSec)}</span>
        </button>

        {/* Return to Merchant Store Button */}
        <button
          onClick={onExitToStore}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 border border-emerald-500/30 transition"
          title="Switch to customer POS and store view"
        >
          <Store className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Merchant Store</span>
        </button>

        {/* Super Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'SA'}
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <p className="font-bold text-slate-200 truncate max-w-[110px]">
                {profile?.name || 'Platform Owner'}
              </p>
              <p className="text-[10px] text-sky-400 uppercase font-semibold">Super Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#1A232D] border border-slate-700 shadow-2xl p-2 z-50 text-xs">
                <div className="p-2.5 border-b border-slate-700/80 mb-1">
                  <p className="font-bold text-white">{profile?.name || 'Platform Owner'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{profile?.email || 'admin@vyaprix.com'}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                    Platform Owner • Master Clearance
                  </span>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLockSession();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Lock Control Center</span>
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogoutAll();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Zap className="w-4 h-4 text-rose-400" />
                  <span>Terminate All Sessions</span>
                </button>

                <div className="my-1 border-t border-slate-700/80" />

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Super Admin</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
