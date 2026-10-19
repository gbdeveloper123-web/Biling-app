import React, { useState } from 'react';
import {
  Layers,
  Edit3,
  CheckCircle,
  X,
  Sparkles,
  Zap,
  Shield,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { PlanPricingConfig } from '../../../types/superAdmin';

interface PlansPricingTabProps {
  plans: PlanPricingConfig[];
  onUpdatePlan: (planId: string, updates: Partial<PlanPricingConfig>) => void;
}

export const PlansPricingTab: React.FC<PlansPricingTabProps> = ({ plans, onUpdatePlan }) => {
  const [editingPlan, setEditingPlan] = useState<PlanPricingConfig | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [yearlyPrice, setYearlyPrice] = useState(0);
  const [invoiceLimit, setInvoiceLimit] = useState(0);
  const [userLimit, setUserLimit] = useState(1);
  const [aiLimit, setAiLimit] = useState(50);

  const openEditModal = (p: PlanPricingConfig) => {
    setEditingPlan(p);
    setMonthlyPrice(p.monthlyPrice);
    setYearlyPrice(p.yearlyPrice);
    setInvoiceLimit(p.invoiceLimitPerMonth);
    setUserLimit(p.userLimit);
    setAiLimit(p.aiRequestsLimitPerMonth);
  };

  const handleSave = () => {
    if (editingPlan) {
      onUpdatePlan(editingPlan.id, {
        monthlyPrice,
        yearlyPrice,
        invoiceLimitPerMonth: invoiceLimit,
        userLimit,
        aiRequestsLimitPerMonth: aiLimit,
      });
      setEditingPlan(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>SaaS Pricing Plans & Feature Limits</span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure subscription tiers, invoice quotas, staff seats, and Goldnifi AI token allowances.
          </p>
        </div>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition ${
              p.isPopular
                ? 'bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                : 'bg-[#16202A] border-slate-800'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-white">{p.name}</span>
                {p.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-400 border border-blue-500/30">
                    {p.badge}
                  </span>
                )}
              </div>

              <div>
                <p className="text-2xl font-black text-white">
                  {p.monthlyPrice === 0 ? 'Free' : `₹${p.monthlyPrice}`}
                  {p.monthlyPrice > 0 && (
                    <span className="text-xs text-slate-400 font-normal"> /mo</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400">
                  {p.yearlyPrice > 0 ? `₹${p.yearlyPrice} billed annually` : 'Zero subscription fee'}
                </p>
              </div>

              {/* Limits Summary */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Invoices/mo:</span>
                  <span className="font-bold text-white">
                    {p.invoiceLimitPerMonth === 0 ? 'Unlimited' : p.invoiceLimitPerMonth}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Staff Seats:</span>
                  <span className="font-bold text-white">{p.userLimit} Users</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Branches:</span>
                  <span className="font-bold text-white">{p.branchLimit} Branch</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">AI Queries:</span>
                  <span className="font-bold text-purple-400">{p.aiRequestsLimitPerMonth}/mo</span>
                </div>
              </div>

              {/* Feature bullets */}
              <ul className="space-y-1 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                {p.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => openEditModal(p)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Configure Plan</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18222D] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Edit {editingPlan.name}</h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Monthly Price (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Yearly Price (₹)
                  </label>
                  <input
                    type="number"
                    value={yearlyPrice}
                    onChange={(e) => setYearlyPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Invoice Limit / Month (0 = Unlimited)
                </label>
                <input
                  type="number"
                  value={invoiceLimit}
                  onChange={(e) => setInvoiceLimit(Number(e.target.value))}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Staff User Seats</label>
                  <input
                    type="number"
                    value={userLimit}
                    onChange={(e) => setUserLimit(Number(e.target.value))}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Goldnifi AI Queries/mo
                  </label>
                  <input
                    type="number"
                    value={aiLimit}
                    onChange={(e) => setAiLimit(Number(e.target.value))}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30"
              >
                Save Changes to Cloud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
