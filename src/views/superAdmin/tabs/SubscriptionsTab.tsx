import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Calendar,
  X,
} from 'lucide-react';
import { TenantBusiness } from '../../../types/superAdmin';

interface SubscriptionsTabProps {
  businesses: TenantBusiness[];
  onExtendTrial?: (bizId: string, days: number) => void;
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({
  businesses,
  onExtendTrial,
}) => {
  const [search, setSearch] = useState('');
  const [extendModalBiz, setExtendModalBiz] = useState<TenantBusiness | null>(null);
  const [extendDays, setExtendDays] = useState(14);

  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmExtend = () => {
    if (extendModalBiz) {
      alert(`Trial for ${extendModalBiz.name} extended by ${extendDays} days.`);
      if (onExtendTrial) onExtendTrial(extendModalBiz.id, extendDays);
      setExtendModalBiz(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <span>SaaS Subscriptions & Mandates</span>
          </h1>
          <p className="text-xs text-slate-400">
            Track active SaaS billing cycles, trial extensions, and recurring payment mandates.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-400">
          Total Subscriptions: <span className="text-white">{businesses.length}</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by business name, ID, or owner..."
          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Subscriptions Table */}
      <div className="bg-[#16202A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#111822] text-slate-400 uppercase font-semibold tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Business</th>
                <th className="py-3 px-3.5">Tier Plan</th>
                <th className="py-3 px-3.5">Billing Cycle</th>
                <th className="py-3 px-3.5">Subscription Status</th>
                <th className="py-3 px-3.5">Renews / Expiry</th>
                <th className="py-3 px-3.5">Trial Status</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-white">{b.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{b.id}</div>
                  </td>

                  <td className="py-3 px-3.5">
                    <span className="font-bold uppercase text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-[10px]">
                      {b.plan}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 font-medium uppercase text-slate-300">
                    {b.billingCycle}
                  </td>

                  <td className="py-3 px-3.5">
                    {b.status === 'active' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    )}
                    {b.status === 'trial' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                        Trial
                      </span>
                    )}
                    {b.status === 'past_due' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400">
                        Past Due
                      </span>
                    )}
                    {b.status === 'suspended' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                        Suspended
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-slate-300">
                    {b.subscriptionRenewsAt
                      ? new Date(b.subscriptionRenewsAt).toLocaleDateString('en-IN')
                      : 'N/A'}
                  </td>

                  <td className="py-3 px-3.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {b.trialStatus}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 text-center">
                    <button
                      onClick={() => setExtendModalBiz(b)}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-sky-400 border border-blue-500/25 text-[10px] font-bold transition inline-flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Extend Trial</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extend Trial Modal */}
      {extendModalBiz && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18222D] border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Extend Business Trial</h3>
              <button
                onClick={() => setExtendModalBiz(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Extend free trial period for <span className="font-bold text-white">{extendModalBiz.name}</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Days to Extend:
              </label>
              <select
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value={7}>+7 Days</option>
                <option value={14}>+14 Days (Standard)</option>
                <option value={30}>+30 Days (VIP Extension)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setExtendModalBiz(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExtend}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
              >
                Apply Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
