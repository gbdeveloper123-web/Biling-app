import React, { useState } from 'react';
import {
  Eye,
  Building,
  CreditCard,
  BarChart3,
  History,
  LifeBuoy,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Boxes,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { TenantBusiness, SupportTicket } from '../../../types/superAdmin';
import { formatCurrency } from '../../../utils/formatters';

interface Business360TabProps {
  businesses: TenantBusiness[];
  selectedBusinessId: string | null;
  onSelectBusiness: (bizId: string) => void;
  tickets: SupportTicket[];
}

export const Business360Tab: React.FC<Business360TabProps> = ({
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  tickets,
}) => {
  const currentBiz =
    businesses.find((b) => b.id === selectedBusinessId) || businesses[0];

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'subscription' | 'usage' | 'activity' | 'support' | 'goldnifi'
  >('overview');

  if (!currentBiz) {
    return (
      <div className="p-8 text-center text-slate-500">
        No businesses registered on the platform.
      </div>
    );
  }

  const bizTickets = tickets.filter((t) => t.businessId === currentBiz.id);

  return (
    <div className="space-y-5">
      {/* Top Selector Bar */}
      <div className="p-4 rounded-2xl bg-[#16202A] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <span>{currentBiz.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400">
                {currentBiz.id}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              360° Comprehensive Tenant Inspection • {currentBiz.city}, {currentBiz.state}
            </p>
          </div>
        </div>

        {/* Business Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold">Select Business:</label>
          <select
            value={currentBiz.id}
            onChange={(e) => onSelectBusiness(e.target.value)}
            className="py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.id}) - {b.plan.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition border-b-2 ${
            activeSubTab === 'overview'
              ? 'border-blue-500 text-white bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-4 h-4 text-blue-400" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subscription')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition border-b-2 ${
            activeSubTab === 'subscription'
              ? 'border-blue-500 text-white bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 text-purple-400" />
          <span>Subscription & Billing</span>
        </button>

        <button
          onClick={() => setActiveSubTab('usage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition border-b-2 ${
            activeSubTab === 'usage'
              ? 'border-blue-500 text-white bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Platform Usage</span>
        </button>

        <button
          onClick={() => setActiveSubTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition border-b-2 ${
            activeSubTab === 'activity'
              ? 'border-blue-500 text-white bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4 text-amber-400" />
          <span>Activity & Audit</span>
        </button>

        <button
          onClick={() => setActiveSubTab('support')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition border-b-2 ${
            activeSubTab === 'support'
              ? 'border-blue-500 text-white bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <LifeBuoy className="w-4 h-4 text-rose-400" />
          <span>Support Tickets ({bizTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('goldnifi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition border-b-2 ${
            activeSubTab === 'goldnifi'
              ? 'border-blue-500 text-white bg-blue-500/10'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Goldnifi AI</span>
        </button>
      </div>

      {/* 1. OVERVIEW SUB-TAB */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Business Profile</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Business Name:</span>
                <span className="font-bold text-white">{currentBiz.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Owner Name:</span>
                <span className="font-bold text-white">{currentBiz.ownerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Business ID:</span>
                <span className="font-mono text-sky-400">{currentBiz.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-white">{currentBiz.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-white">{currentBiz.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Business Category:</span>
                <span className="font-semibold text-white">{currentBiz.businessType}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Account Status:</span>
                <span className="font-bold uppercase text-emerald-400">{currentBiz.status}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Tax & Location Compliance</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">GSTIN:</span>
                <span className="font-mono font-bold text-sky-400">
                  {currentBiz.gstin || 'Unregistered Composition'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">PAN:</span>
                <span className="font-mono text-white">{currentBiz.pan || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Registered Address:</span>
                <span className="text-white text-right max-w-[220px]">{currentBiz.address}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">City / State:</span>
                <span className="font-semibold text-white">
                  {currentBiz.city}, {currentBiz.state} ({currentBiz.stateCode})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">PIN Code:</span>
                <span className="font-mono text-white">{currentBiz.pinCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Platform Joined:</span>
                <span className="font-mono text-slate-300">
                  {new Date(currentBiz.registeredAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Last Active:</span>
                <span className="font-mono text-emerald-400">
                  {new Date(currentBiz.lastActiveAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBSCRIPTION SUB-TAB */}
      {activeSubTab === 'subscription' && (
        <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span>Active SaaS Subscription & Billing</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Current Plan</span>
              <p className="text-xl font-black text-sky-400 uppercase mt-0.5">{currentBiz.plan}</p>
              <p className="text-[10px] text-slate-400">Billing: {currentBiz.billingCycle}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Trial Status</span>
              <p className="text-xl font-black text-amber-400 uppercase mt-0.5">
                {currentBiz.trialStatus}
              </p>
              <p className="text-[10px] text-slate-400">14-day trial period</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Renewal Date</span>
              <p className="text-xl font-black text-white mt-0.5">
                {currentBiz.subscriptionRenewsAt
                  ? new Date(currentBiz.subscriptionRenewsAt).toLocaleDateString('en-IN')
                  : 'N/A'}
              </p>
              <p className="text-[10px] text-slate-400">Auto-debit mandate active</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Status</span>
              <p className="text-xl font-black text-emerald-400 uppercase mt-0.5">
                {currentBiz.status}
              </p>
              <p className="text-[10px] text-slate-400">Fully compliant</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. USAGE SUB-TAB */}
      {activeSubTab === 'usage' && (
        <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Tenant Volume & Telemetry Metrics</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Total Invoices</span>
              <p className="text-xl font-black text-white mt-0.5">
                {currentBiz.stats.invoicesCount}
              </p>
              <p className="text-[10px] text-emerald-400">
                {formatCurrency(currentBiz.stats.totalRevenue)} Billed
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Product Catalog</span>
              <p className="text-xl font-black text-white mt-0.5">
                {currentBiz.stats.productsCount}
              </p>
              <p className="text-[10px] text-slate-400">Active SKUs</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Customers Ledger</span>
              <p className="text-xl font-black text-white mt-0.5">
                {currentBiz.stats.customersCount}
              </p>
              <p className="text-[10px] text-slate-400">Khata accounts</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Staff Accounts</span>
              <p className="text-xl font-black text-white mt-0.5">
                {currentBiz.stats.staffCount} Users
              </p>
              <p className="text-[10px] text-slate-400">{currentBiz.stats.branchesCount} Branches</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVITY & AUDIT */}
      {activeSubTab === 'activity' && (
        <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <span>Recent Activity Trail for {currentBiz.name}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Invoice Batch Created</p>
                <p className="text-[11px] text-slate-400">Created 4 invoices via Quick POS</p>
              </div>
              <span className="font-mono text-[10px] text-slate-500">2 hours ago</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Khata Payment Recorded</p>
                <p className="text-[11px] text-slate-400">Received ₹2,400 from customer via UPI</p>
              </div>
              <span className="font-mono text-[10px] text-slate-500">5 hours ago</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Staff Login Verified</p>
                <p className="text-[11px] text-slate-400">Cashier terminal active from Mumbai IP</p>
              </div>
              <span className="font-mono text-[10px] text-slate-500">Today, 09:15 AM</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUPPORT TICKETS */}
      {activeSubTab === 'support' && (
        <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-rose-400" />
            <span>Support Tickets for {currentBiz.name}</span>
          </h3>

          {bizTickets.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No support tickets filed by this business.
            </p>
          ) : (
            <div className="space-y-2.5">
              {bizTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">#{t.ticketNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-sky-400">
                        {t.category}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-400">
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{t.subject}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      {t.status.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      {new Date(t.createdDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. GOLDNIFI AI */}
      {activeSubTab === 'goldnifi' && (
        <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Goldnifi AI Usage & Quotas</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Total Queries Run</span>
              <p className="text-xl font-black text-purple-400 mt-0.5">
                {currentBiz.stats.aiRequestsCount}
              </p>
              <p className="text-[10px] text-slate-400">Gemini 2.5 Flash grounded</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Monthly Quota Limit</span>
              <p className="text-xl font-black text-white mt-0.5">250 Queries</p>
              <p className="text-[10px] text-emerald-400">Under quota threshold</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400">Safety & Moderation</span>
              <p className="text-xl font-black text-emerald-400 mt-0.5">100% Clean</p>
              <p className="text-[10px] text-slate-400">Zero safety flags</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
