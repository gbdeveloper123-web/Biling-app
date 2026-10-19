import React, { useState } from 'react';
import {
  Building,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  X,
  CreditCard,
  LifeBuoy,
  History,
  Archive,
} from 'lucide-react';
import { TenantBusiness, BusinessAccountStatus, SubscriptionPlanId } from '../../../types/superAdmin';

interface BusinessesTabProps {
  businesses: TenantBusiness[];
  onOpenBusiness360: (bizId: string) => void;
  onUpdateBusinessStatus: (bizId: string, status: BusinessAccountStatus, reason?: string) => void;
  onJumpToTicketsForBusiness?: (bizId: string) => void;
}

export const BusinessesTab: React.FC<BusinessesTabProps> = ({
  businesses,
  onOpenBusiness360,
  onUpdateBusinessStatus,
  onJumpToTicketsForBusiness,
}) => {
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [suspendModalBiz, setSuspendModalBiz] = useState<TenantBusiness | null>(null);
  const [suspendReason, setSuspendReason] = useState('Payment default or terms violation');

  const filteredBusinesses = businesses.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch =
      b.name.toLowerCase().includes(q) ||
      b.ownerName.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.gstin && b.gstin.toLowerCase().includes(q)) ||
      b.id.toLowerCase().includes(q);

    const matchesPlan = selectedPlan === 'all' || b.plan === selectedPlan;
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleConfirmSuspend = () => {
    if (suspendModalBiz) {
      onUpdateBusinessStatus(suspendModalBiz.id, 'suspended', suspendReason);
      setSuspendModalBiz(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            <span>Multi-Tenant Business Directory</span>
          </h1>
          <p className="text-xs text-slate-400">
            Platform-wide merchant directory across India with live telemetry and administrative controls.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-400">
          Showing <span className="text-white">{filteredBusinesses.length}</span> of {businesses.length} Tenants
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name, owner, phone, email, GSTIN, business ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Plan Filter */}
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Plans</option>
            <option value="free">Free Starter</option>
            <option value="starter">Starter Retail</option>
            <option value="business">Business Pro</option>
            <option value="pro">Enterprise Scale</option>
            <option value="enterprise">Custom Enterprise</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="past_due">Past Due</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-[#16202A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#111822] text-slate-400 uppercase font-semibold tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Business & GSTIN</th>
                <th className="py-3 px-3.5">Owner & Contact</th>
                <th className="py-3 px-3.5">Plan</th>
                <th className="py-3 px-3.5">Account Status</th>
                <th className="py-3 px-3.5">Registered</th>
                <th className="py-3 px-3.5">Last Active</th>
                <th className="py-3 px-3.5 text-right">Invoices</th>
                <th className="py-3 px-3.5 text-right">Staff</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    No businesses match your search filters.
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-800/40 transition group"
                  >
                    <td className="py-3.5 px-3.5">
                      <div className="font-bold text-white group-hover:text-sky-400 transition flex items-center gap-1.5">
                        <span>{b.name}</span>
                        {b.stats.branchesCount > 1 && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-sky-400 rounded">
                            {b.stats.branchesCount} Br
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {b.gstin || 'Unregistered'} • ID: {b.id}
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <div className="text-white font-medium">{b.ownerName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{b.phone}</div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <span className="font-bold uppercase text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-[10px]">
                        {b.plan}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Renews: {b.subscriptionRenewsAt ? new Date(b.subscriptionRenewsAt).toLocaleDateString('en-IN') : 'N/A'}
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      {b.status === 'active' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                      {b.status === 'trial' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Trial
                        </span>
                      )}
                      {b.status === 'suspended' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" /> Suspended
                        </span>
                      )}
                      {b.status === 'past_due' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          Past Due
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-400">
                      {b.registeredAt ? new Date(b.registeredAt).toLocaleDateString('en-IN') : 'N/A'}
                    </td>

                    <td className="py-3.5 px-3.5 font-mono text-[11px] text-slate-400">
                      {b.lastActiveAt ? new Date(b.lastActiveAt).toLocaleDateString('en-IN') : 'N/A'}
                    </td>

                    <td className="py-3.5 px-3.5 text-right font-mono font-bold text-white">
                      {b.stats.invoicesCount}
                    </td>

                    <td className="py-3.5 px-3.5 text-right font-mono font-bold text-slate-300">
                      {b.stats.staffCount}
                    </td>

                    <td className="py-3.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenBusiness360(b.id)}
                          title="Open Business 360°"
                          className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {b.status === 'suspended' ? (
                          <button
                            onClick={() => onUpdateBusinessStatus(b.id, 'active', 'Reactivated by Super Admin')}
                            title="Reactivate Account"
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendModalBiz(b)}
                            title="Suspend Account"
                            className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white transition"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Account Confirmation Modal */}
      {suspendModalBiz && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18222D] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-rose-400">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">Suspend Business Account</h3>
              </div>
              <button
                onClick={() => setSuspendModalBiz(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to suspend <span className="font-bold text-white">{suspendModalBiz.name}</span> ({suspendModalBiz.id})?
              All staff logins and invoice creation for this tenant will be immediately blocked.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Suspension Reason (Will be logged in Audit Trail)
              </label>
              <textarea
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                placeholder="Specify exact reason for security or billing compliance..."
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setSuspendModalBiz(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30"
              >
                Confirm Account Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
