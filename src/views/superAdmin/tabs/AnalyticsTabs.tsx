import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Megaphone,
  Share2,
  Database,
  Server,
  Zap,
  CheckCircle,
  Users,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Plus,
} from 'lucide-react';
import {
  TenantBusiness,
  MarketingCampaign,
  ReferralRecord,
} from '../../../types/superAdmin';
import { formatCurrency } from '../../../utils/formatters';

interface AnalyticsTabsProps {
  viewType: 'usage' | 'growth' | 'marketing' | 'referrals';
  businesses: TenantBusiness[];
  campaigns: MarketingCampaign[];
  referrals: ReferralRecord[];
}

export const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
  viewType,
  businesses,
  campaigns,
  referrals,
}) => {
  // 11. USAGE & ANALYTICS
  if (viewType === 'usage') {
    const totalInvoicesAcrossAll = businesses.reduce((acc, b) => acc + b.stats.invoicesCount, 0);
    const totalStorageMb = businesses.reduce((acc, b) => acc + b.stats.storageUsageMb, 0);

    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Platform Usage & Operational Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time infrastructure metrics, Cloud database throughput, and storage capacity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">Invoices Generated Today</span>
            <p className="text-2xl font-black text-white mt-1">2,842</p>
            <p className="text-[10px] text-emerald-400">↑ 18.4% vs last Thursday</p>
          </div>

          <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">Total Invoices Lifetime</span>
            <p className="text-2xl font-black text-sky-400 mt-1">
              {totalInvoicesAcrossAll.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">Across all tenant databases</p>
          </div>

          <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">Total Storage Consumed</span>
            <p className="text-2xl font-black text-purple-400 mt-1">
              {(totalStorageMb / 1024).toFixed(2)} GB
            </p>
            <p className="text-[10px] text-slate-400">PDF invoices, logos & barcodes</p>
          </div>

          <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">API Response Latency</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">42 ms</p>
            <p className="text-[10px] text-slate-400">Cloud Run Mumbai region</p>
          </div>
        </div>

        {/* Telemetry Chart Representation */}
        <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Peak Invoicing Hours (India Standard Time)
          </h3>
          <div className="grid grid-cols-12 gap-1.5 h-32 items-end pt-6">
            {[20, 15, 10, 8, 12, 35, 65, 88, 95, 80, 70, 45].map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  style={{ height: `${val}%` }}
                  className="w-full bg-blue-600/80 hover:bg-blue-500 rounded-t transition"
                />
                <span className="text-[9px] text-slate-500 font-mono">
                  {idx * 2}h
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            Highest transaction concurrency occurs during Indian retail evening peak (18:00 – 21:00 IST).
          </p>
        </div>
      </div>
    );
  }

  // 12. GROWTH ANALYTICS
  if (viewType === 'growth') {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>SaaS Growth & Cohort Retention</span>
          </h1>
          <p className="text-xs text-slate-400">
            Funnel conversion rates, cohort retention curves, churn rate, and Average Revenue Per User.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">Free-to-Paid Conversion</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">16.8%</p>
            <p className="text-[10px] text-slate-400">Industry benchmark: 8-12%</p>
          </div>

          <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">Monthly Churn Rate</span>
            <p className="text-2xl font-black text-sky-400 mt-1">1.4%</p>
            <p className="text-[10px] text-emerald-400">Very high sticky factor</p>
          </div>

          <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">Average Revenue/User (ARPU)</span>
            <p className="text-2xl font-black text-white mt-1">₹348 / mo</p>
            <p className="text-[10px] text-slate-400">Weighted average tier</p>
          </div>

          <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">30-Day Cohort Retention</span>
            <p className="text-2xl font-black text-purple-400 mt-1">92.4%</p>
            <p className="text-[10px] text-slate-400">Active billing merchants</p>
          </div>
        </div>
      </div>
    );
  }

  // 13. MARKETING CAMPAIGNS
  if (viewType === 'marketing') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <span>Broadcast Marketing & Merchant Campaigns</span>
            </h1>
            <p className="text-xs text-slate-400">
              In-app announcements, email digests, and WhatsApp promo notifications to merchants.
            </p>
          </div>

          <button
            onClick={() => alert('Broadcast Campaign Creator opened.')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Campaign</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-[#16202A] border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{c.title}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {c.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px]">Target Audience</span>
                  <p className="font-bold text-white capitalize">{c.targetAudience}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Channel</span>
                  <p className="font-bold text-sky-400 uppercase">{c.channel}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Sent Count</span>
                  <p className="font-bold text-white font-mono">{c.sentCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Conversions: {c.convertedCount}</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {formatCurrency(c.conversionRevenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 14. REFERRALS
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-sky-400" />
          <span>Merchant Referral Network</span>
        </h1>
        <p className="text-xs text-slate-400">
          Peer-to-peer shopkeeper invitations and subscription reward credits ledger.
        </p>
      </div>

      <div className="bg-[#16202A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#111822] text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Referrer Store</th>
                <th className="py-3 px-3.5">Referred Store</th>
                <th className="py-3 px-3.5">Registered Date</th>
                <th className="py-3 px-3.5">Plan</th>
                <th className="py-3 px-3.5">Reward Status</th>
                <th className="py-3 px-3.5 text-right">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3.5 font-bold text-white">{r.referrerBusinessName}</td>
                  <td className="py-3 px-3.5">
                    <span className="font-semibold text-slate-200">{r.referredBusinessName}</span>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {r.referredOwnerPhone}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-400">{r.registeredDate}</td>
                  <td className="py-3 px-3.5 uppercase font-bold text-sky-400">{r.plan}</td>
                  <td className="py-3 px-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {r.rewardStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400">
                    ₹{r.rewardAmount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
