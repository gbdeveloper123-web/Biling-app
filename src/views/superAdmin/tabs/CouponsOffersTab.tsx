import React, { useState } from 'react';
import {
  TicketPercent,
  Plus,
  X,
  CheckCircle,
  Clock,
  Sparkles,
  Percent,
} from 'lucide-react';
import { CouponOffer } from '../../../types/superAdmin';

interface CouponsOffersTabProps {
  coupons: CouponOffer[];
  onCreateCoupon: (coupon: any) => void;
}

export const CouponsOffersTab: React.FC<CouponsOffersTabProps> = ({
  coupons,
  onCreateCoupon,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [totalIssued, setTotalIssued] = useState(100);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    onCreateCoupon({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      totalIssued: Number(totalIssued),
      expiryDate,
    });
    setModalOpen(false);
    setCode('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <TicketPercent className="w-5 h-5 text-emerald-400" />
            <span>Promo Coupons & Discount Offers</span>
          </h1>
          <p className="text-xs text-slate-400">
            Create promotional discount codes for new Indian merchants and seasonal sales.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl bg-[#16202A] border border-slate-800 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-black text-emerald-400 tracking-wider">
                {c.code}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-xl font-black text-white">
                {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
              </p>
              <p className="text-slate-400 text-[11px]">Valid on all subscription renewals</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Redeemed:</span>
              <span className="font-bold text-white font-mono">
                {c.usedCount} / {c.totalIssued}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Expires:</span>
              <span className="font-mono text-slate-300">{c.expiryDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18222D] border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Promo Coupon</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="DIWALI50, STARTUP2026"
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Rupee (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Issue Quota</label>
                <input
                  type="number"
                  value={totalIssued}
                  onChange={(e) => setTotalIssued(Number(e.target.value))}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
