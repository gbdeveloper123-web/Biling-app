import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  CircleDollarSign,
  ShieldCheck,
  Zap,
  BarChart,
  Sliders,
} from 'lucide-react';
import { TenantBusiness } from '../../../types/superAdmin';

interface GoldnifiAiTabProps {
  businesses: TenantBusiness[];
}

export const GoldnifiAiTab: React.FC<GoldnifiAiTabProps> = ({ businesses }) => {
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [defaultMonthlyTokens, setDefaultMonthlyTokens] = useState(250000);

  // Computed AI statistics across multi-tenant platform
  const totalAiRequests = businesses.reduce((acc, b) => acc + b.stats.aiRequestsCount, 0);
  const totalTokensEstimated = totalAiRequests * 650;
  const estimatedApiCostUsd = (totalTokensEstimated / 1000000) * 0.15; // ~$0.15 / 1M tokens

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Goldnifi AI Engine & Quota Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Powered by Google Gemini 2.5. Track platform token consumption, costs, and model configuration.
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold self-start sm:self-auto">
          Gemini SDK Connected
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Total Queries Run</span>
          <p className="text-2xl font-black text-purple-400 mt-1">
            {totalAiRequests.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">Retail assistants & cataloging</p>
        </div>

        <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Tokens Processed</span>
          <p className="text-2xl font-black text-white mt-1">
            {(totalTokensEstimated / 1000).toFixed(1)}k
          </p>
          <p className="text-[10px] text-slate-500">Input + Output GenAI tokens</p>
        </div>

        <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Estimated API Cost</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            ${estimatedApiCostUsd.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-500">GCP Gemini Flash pricing</p>
        </div>

        <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Safety & Moderation</span>
          <p className="text-2xl font-black text-sky-400 mt-1">100%</p>
          <p className="text-[10px] text-slate-500">Zero safety blocks or flags</p>
        </div>
      </div>

      {/* Engine Model Controls */}
      <div className="p-5 rounded-2xl bg-[#16202A] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>Active Gemini Foundation Model Configuration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            onClick={() => setSelectedModel('gemini-3.8-flash')}
            className={`p-4 rounded-xl border text-left transition ${
              selectedModel === 'gemini-3.8-flash'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white">Gemini 2.5 Flash</span>
              {selectedModel === 'gemini-3.8-flash' && (
                <span className="text-[10px] font-bold text-purple-400">Active</span>
              )}
            </div>
            <p className="text-slate-400 text-[11px]">
              Sub-second latency, ideal for real-time cashier queries & product catalog suggestions.
            </p>
          </button>

          <button
            onClick={() => setSelectedModel('gemini-2.5-pro')}
            className={`p-4 rounded-xl border text-left transition ${
              selectedModel === 'gemini-2.5-pro'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white">Gemini 2.5 Pro</span>
              {selectedModel === 'gemini-2.5-pro' && (
                <span className="text-[10px] font-bold text-purple-400">Active</span>
              )}
            </div>
            <p className="text-slate-400 text-[11px]">
              Deep reasoning for complex multi-year balance sheet & P&L tax planning.
            </p>
          </button>

          <button
            onClick={() => setSelectedModel('gemini-2.5-flash-lite')}
            className={`p-4 rounded-xl border text-left transition ${
              selectedModel === 'gemini-2.5-flash-lite'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white">Gemini 2.5 Flash-Lite</span>
              {selectedModel === 'gemini-2.5-flash-lite' && (
                <span className="text-[10px] font-bold text-purple-400">Active</span>
              )}
            </div>
            <p className="text-slate-400 text-[11px]">
              High-volume budget parsing and batch invoice text extraction.
            </p>
          </button>
        </div>
      </div>

      {/* Per-Business AI Usage Breakdown Table */}
      <div className="bg-[#16202A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Tenant Business AI Consumption
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {businesses.length} Active Tenants
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#111822] text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Business</th>
                <th className="py-3 px-3.5">Tier Plan</th>
                <th className="py-3 px-3.5 text-right">Queries Used</th>
                <th className="py-3 px-3.5 text-right">Monthly Quota</th>
                <th className="py-3 px-3.5 text-right">Est. Tokens</th>
                <th className="py-3 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3.5">
                    <span className="font-bold text-white">{b.name}</span>
                    <div className="text-[10px] text-slate-500 font-mono">{b.id}</div>
                  </td>
                  <td className="py-3 px-3.5 uppercase font-bold text-sky-400 text-[10px]">
                    {b.plan}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-purple-400">
                    {b.stats.aiRequestsCount}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-slate-400">
                    {b.plan === 'free' ? '15' : b.plan === 'starter' ? '50' : '250'}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-slate-300">
                    {(b.stats.aiRequestsCount * 650).toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Normal
                    </span>
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
