import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  UserCheck,
  Save,
  Lock,
  Smartphone,
  Globe,
  LogOut,
  AlertTriangle,
  KeyRound,
  CheckCircle,
  Zap,
} from 'lucide-react';
import {
  PlatformSettings,
  SuperAdminProfile,
  AdminSession,
} from '../../../types/superAdmin';

interface SettingsSecurityTabsProps {
  viewType: 'settings' | 'security' | 'profile';
  settings: PlatformSettings;
  profile: SuperAdminProfile | null;
  activeSessions: AdminSession[];
  onUpdateSettings: (newSettings: Partial<PlatformSettings>) => void;
  onUpdatePassword: (curr: string, next: string) => Promise<boolean>;
  onToggle2FA: (enabled: boolean) => void;
  onLogoutAllSessions: () => void;
  onLockSession: () => void;
}

export const SettingsSecurityTabs: React.FC<SettingsSecurityTabsProps> = ({
  viewType,
  settings,
  profile,
  activeSessions,
  onUpdateSettings,
  onUpdatePassword,
  onToggle2FA,
  onLogoutAllSessions,
  onLockSession,
}) => {
  // 21. PLATFORM SETTINGS
  const [platformName, setPlatformName] = useState(settings.platformName || 'VYAPRIX');
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'support@vyaprix.com');
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || '+91 80000 12345');
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode || false);
  const [maintenanceNotice, setMaintenanceNotice] = useState(
    settings.maintenanceNotice || 'Scheduled maintenance is underway.'
  );
  const [defaultTrialDays, setDefaultTrialDays] = useState(settings.defaultTrialDays || 14);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // 22. SECURITY: Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      platformName,
      supportEmail,
      supportPhone,
      maintenanceMode,
      maintenanceNotice,
      defaultTrialDays: Number(defaultTrialDays),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPass.length < 8) {
      setPassMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    const success = await onUpdatePassword(currentPass, newPass);
    if (success) {
      setPassMsg({ type: 'success', text: 'Super Admin password updated successfully!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassMsg({ type: 'error', text: 'Current password incorrect. Please verify.' });
    }
  };

  // 21. PLATFORM SETTINGS TAB
  if (viewType === 'settings') {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Platform-Wide Global Settings</span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure platform branding, official support contact details, and emergency maintenance mode.
          </p>
        </div>

        <form
          onSubmit={handleSaveSettings}
          className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-4 max-w-2xl"
        >
          {settingsSaved && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Platform settings updated and broadcasted successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Default Evaluation Trial (Days)
              </label>
              <input
                type="number"
                value={defaultTrialDays}
                onChange={(e) => setDefaultTrialDays(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Merchant Helpline Phone
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          {/* Maintenance Mode Switch */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Platform Maintenance Mode</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  When active, non-admin merchants see a maintenance banner.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  maintenanceMode ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {maintenanceMode ? 'Active (Locked)' : 'Inactive'}
              </button>
            </div>

            {maintenanceMode && (
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  Public Maintenance Banner Text
                </label>
                <input
                  type="text"
                  value={maintenanceNotice}
                  onChange={(e) => setMaintenanceNotice(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Platform Settings</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 22. ADMIN SECURITY TAB
  if (viewType === 'security') {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Super Admin Security & Session Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Private owner credentials, two-factor authentication, active login devices, and session controls.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Two-Factor Authentication Box */}
          <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  profile?.twoFactorEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {profile?.twoFactorEnabled ? '2FA ACTIVE' : '2FA DISABLED'}
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Require a 6-digit Authenticator verification code for all future platform owner logins.
            </p>

            <button
              onClick={() => onToggle2FA(!profile?.twoFactorEnabled)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                profile?.twoFactorEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{profile?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA Protection'}</span>
            </button>
          </div>

          {/* Change Master Password */}
          <form
            onSubmit={handlePasswordSubmit}
            className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-3"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Update Master Admin Password</h3>
            </div>

            {passMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs ${
                  passMsg.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                }`}
              >
                {passMsg.text}
              </div>
            )}

            <div className="space-y-2 text-xs">
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Current master password..."
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="New password (min 8 chars)..."
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm new password..."
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Active Admin Sessions */}
        <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Active Super Admin Device Sessions</h3>
              <p className="text-xs text-slate-400">
                Authorized browsers logged into the platform owner account.
              </p>
            </div>

            <button
              onClick={onLogoutAllSessions}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Terminate All Remote Sessions</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {activeSessions.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{s.device}</span>
                      {s.isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {s.location} • <span className="font-mono">{s.ipAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Logged in: {new Date(s.loginTime).toLocaleTimeString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 23. SUPER ADMIN PROFILE TAB
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-amber-400" />
          <span>Super Admin Identity & Governance</span>
        </h1>
        <p className="text-xs text-slate-400">
          Root platform owner credentials, clearance level, and immediate security lock.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#16202A] border border-slate-800 space-y-5 max-w-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-600/30">
            {profile?.name?.slice(0, 2).toUpperCase() || 'SA'}
          </div>

          <div>
            <h2 className="text-lg font-black text-white">{profile?.name || 'Platform Owner'}</h2>
            <p className="text-xs text-sky-400 font-mono">{profile?.email || 'admin@vyaprix.com'}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                Role: Platform Owner
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-sky-400 border border-blue-500/25">
                Clearance: Level 0 (Master)
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Brand License:</span>
            <span className="font-bold text-amber-400">GOLDEN BAZAAR Infrastructure</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Two-Factor Authentication:</span>
            <span className="font-bold text-emerald-400">
              {profile?.twoFactorEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Active Admin Sessions:</span>
            <span className="font-mono text-white">{profile?.activeSessionsCount || 1} Device</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Last Successful Login:</span>
            <span className="font-mono text-slate-300">
              {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString('en-IN') : 'Just now'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex gap-2">
          <button
            onClick={onLockSession}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Portal Immediately</span>
          </button>
        </div>
      </div>
    </div>
  );
};
