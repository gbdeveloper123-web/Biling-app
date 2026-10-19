import React, { useState } from 'react';
import {
  BellRing,
  ToggleLeft,
  ToggleRight,
  Server,
  ShieldAlert,
  History,
  Database,
  Plus,
  CheckCircle,
  AlertTriangle,
  Download,
  Zap,
  Lock,
  X,
} from 'lucide-react';
import {
  PlatformAnnouncement,
  FeatureFlag,
  ServiceHealth,
  FraudRiskAlert,
  AdminAuditLog,
  PlatformBackup,
} from '../../../types/superAdmin';

interface SystemTabsProps {
  viewType:
    | 'announcements'
    | 'feature_flags'
    | 'system_health'
    | 'fraud_risk'
    | 'audit_logs'
    | 'data_backup';
  announcements: PlatformAnnouncement[];
  featureFlags: FeatureFlag[];
  systemHealth: ServiceHealth[];
  fraudAlerts: FraudRiskAlert[];
  auditLogs: AdminAuditLog[];
  backups: PlatformBackup[];
  onToggleFeatureFlag: (flagId: string, enabled: boolean) => void;
  onCreateAnnouncement: (data: any) => void;
  onCreateBackup: () => void;
}

export const SystemTabs: React.FC<SystemTabsProps> = ({
  viewType,
  announcements,
  featureFlags,
  systemHealth,
  fraudAlerts,
  auditLogs,
  backups,
  onToggleFeatureFlag,
  onCreateAnnouncement,
  onCreateBackup,
}) => {
  const [newAncOpen, setNewAncOpen] = useState(false);
  const [ancTitle, setAncTitle] = useState('');
  const [ancMsg, setAncMsg] = useState('');
  const [ancPriority, setAncPriority] = useState('info');
  const [backupLoading, setBackupLoading] = useState(false);

  // 15. ANNOUNCEMENTS
  if (viewType === 'announcements') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-sky-400" />
              <span>Platform Announcements & In-App Banners</span>
            </h1>
            <p className="text-xs text-slate-400">
              Broadcast high-priority notices, GST regulatory updates, or maintenance schedules to all merchants.
            </p>
          </div>

          <button
            onClick={() => setNewAncOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        </div>

        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-2xl bg-[#16202A] border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{a.title}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      a.priority === 'critical'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-blue-500/10 text-sky-400 border-blue-500/20'
                    }`}
                  >
                    {a.priority}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{a.date}</span>
              </div>
              <p className="text-xs text-slate-300">{a.message}</p>
              <div className="text-[10px] text-slate-500">
                Audience: <span className="text-slate-400 capitalize">{a.target}</span> • Channel:{' '}
                <span className="text-slate-400 uppercase">{a.channel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {newAncOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#18222D] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Broadcast Announcement</h3>
                <button onClick={() => setNewAncOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Banner Title</label>
                  <input
                    type="text"
                    value={ancTitle}
                    onChange={(e) => setAncTitle(e.target.value)}
                    placeholder="e.g. Scheduled GST Portal Maintenance"
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Message Content</label>
                  <textarea
                    rows={3}
                    value={ancMsg}
                    onChange={(e) => setAncMsg(e.target.value)}
                    placeholder="Full announcement text..."
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={ancPriority}
                    onChange={(e) => setAncPriority(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="info">Info (Standard Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="critical">Critical (Red Alert)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setNewAncOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (ancTitle && ancMsg) {
                      onCreateAnnouncement({
                        title: ancTitle,
                        message: ancMsg,
                        priority: ancPriority,
                        target: 'all',
                        channel: 'in_app',
                      });
                      setNewAncOpen(false);
                      setAncTitle('');
                      setAncMsg('');
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
                >
                  Broadcast
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 16. BETA FEATURES / FEATURE FLAGS
  if (viewType === 'feature_flags') {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ToggleLeft className="w-5 h-5 text-indigo-400" />
            <span>Beta Feature Flags & Switchboard</span>
          </h1>
          <p className="text-xs text-slate-400">
            Control progressive rollouts of advanced enterprise capabilities with instant live toggles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureFlags.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-2xl bg-[#16202A] border border-slate-800 flex items-center justify-between"
            >
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{f.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{f.key}</span>
                </div>
                <p className="text-xs text-slate-400">{f.description}</p>
                <div className="text-[10px] text-sky-400">
                  Rollout: {f.rolloutPercentage}% • Scope: {f.targetScope}
                </div>
              </div>

              <button
                onClick={() => onToggleFeatureFlag(f.id, !f.enabled)}
                className={`p-1.5 rounded-xl transition ${
                  f.enabled ? 'text-blue-500 hover:text-blue-400' : 'text-slate-600 hover:text-slate-400'
                }`}
                title={f.enabled ? 'Disable Feature' : 'Enable Feature'}
              >
                {f.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 17. SYSTEM HEALTH
  if (viewType === 'system_health') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <span>Infrastructure Health & Services</span>
            </h1>
            <p className="text-xs text-slate-400">
              Live uptime monitoring of Cloud SQL, Firebase Auth, Gemini AI, and Razorpay endpoints.
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Systems Normal</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemHealth.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-[#16202A] border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{s.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {s.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Response Latency:</span>
                <span className="font-mono font-bold text-white">{s.responseTimeMs} ms</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Uptime:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {s.uptimePercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 18. FRAUD & RISK
  if (viewType === 'fraud_risk') {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Fraud & Risk Monitoring Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Automated compliance tripwires: suspicious invoice bursts, rapid account generation, and gateway abuse.
          </p>
        </div>

        <div className="space-y-3">
          {fraudAlerts.map((fa) => (
            <div
              key={fa.id}
              className="p-4 rounded-2xl bg-[#16202A] border border-slate-800 flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{fa.businessName}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {fa.severity} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-300">{fa.description}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Reported: {new Date(fa.timestamp).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Reviewing security case for ${fa.businessName}...`)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                >
                  Investigate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 19. AUDIT LOGS
  if (viewType === 'audit_logs') {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Platform Administrative Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400">
            Immutable log of all super admin interventions, status overrides, and pricing modifications.
          </p>
        </div>

        <div className="bg-[#16202A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#111822] text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Timestamp</th>
                  <th className="py-3 px-3.5">Admin</th>
                  <th className="py-3 px-3.5">Action</th>
                  <th className="py-3 px-3.5">Target</th>
                  <th className="py-3 px-3.5">Details</th>
                  <th className="py-3 px-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-white">{log.adminName}</td>
                    <td className="py-3 px-3.5 font-mono text-sky-400 text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-200">
                      {log.targetName}
                    </td>
                    <td className="py-3 px-3.5 text-slate-300">
                      <div>{log.newValue}</div>
                      {log.reason && (
                        <div className="text-[10px] text-slate-500 italic">
                          Reason: {log.reason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 20. DATA & BACKUP
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Platform Backups & Tenant Data Export</span>
          </h1>
          <p className="text-xs text-slate-400">
            Encrypted automated snapshots and Indian Data Protection compliance archives.
          </p>
        </div>

        <button
          onClick={() => {
            setBackupLoading(true);
            onCreateBackup();
            setTimeout(() => setBackupLoading(false), 800);
          }}
          disabled={backupLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition self-start sm:self-auto disabled:opacity-50"
        >
          {backupLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          <span>Generate Encrypted Snapshot</span>
        </button>
      </div>

      <div className="space-y-3">
        {backups.map((b) => (
          <div
            key={b.id}
            className="p-4 rounded-2xl bg-[#16202A] border border-slate-800 flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white">{b.filename}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {b.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Size: <span className="text-white font-mono">{b.sizeMb} MB</span> • Businesses Covered:{' '}
                <span className="text-white font-bold">{b.totalBusinessesCount}</span> • Records:{' '}
                <span className="text-white font-mono">{b.totalRecordsCount.toLocaleString()}</span>
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Created: {new Date(b.createdAt).toLocaleString('en-IN')}
              </p>
            </div>

            <button
              onClick={() => alert(`Initiating secure download of ${b.filename}...`)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
