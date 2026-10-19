import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  Edit2,
  DollarSign,
  ShoppingCart,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Supplier } from '../types';
import { formatCurrency } from '../utils/formatters';
import { celebrateTaskCompletion } from '../utils/motion';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, setActiveView, recordKhataEntry } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Payment Recording
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<'bank_transfer' | 'upi' | 'cash'>('bank_transfer');

  // Form State
  const [bizName, setBizName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('15 Days');

  const filteredSuppliers = suppliers.filter(
    (s) =>
      !searchTerm ||
      s.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      (s.gstin && s.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setBizName('');
    setOwnerName('');
    setPhone('');
    setEmail('');
    setGstin('');
    setAddress('');
    setPaymentTerms('15 Days');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setBizName(s.businessName);
    setOwnerName(s.ownerName || '');
    setPhone(s.phone);
    setEmail(s.email || '');
    setGstin(s.gstin || '');
    setAddress(s.address || '');
    setPaymentTerms(s.paymentTerms || '15 Days');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName || !phone) return;

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        businessName: bizName,
        ownerName,
        phone,
        email,
        gstin,
        address,
        paymentTerms,
      });
    } else {
      addSupplier({
        businessName: bizName,
        ownerName,
        phone,
        email,
        gstin,
        address,
        paymentTerms,
        outstandingBalance: 0,
        totalPurchases: 0,
      });
    }

    celebrateTaskCompletion(editingSupplier ? 'Supplier updated!' : 'New supplier added!');
    setIsAddModalOpen(false);
  };

  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier || !payAmount) return;
    const amt = Number(payAmount);

    recordKhataEntry({
      partyType: 'supplier',
      partyId: payingSupplier.id,
      partyName: payingSupplier.businessName,
      partyPhone: payingSupplier.phone,
      date: new Date().toISOString(),
      type: 'payment_out',
      amount: amt,
      balanceAfter: Math.max(0, payingSupplier.outstandingBalance - amt),
      referenceType: 'manual_payment',
      notes: `Supplier payment of ₹${amt} made via ${payMethod.toUpperCase()}`,
    });

    celebrateTaskCompletion(`Payment of ₹${amt} to supplier recorded!`);
    setPayingSupplier(null);
    setPayAmount('');
  };

  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 sm:w-6 h-5 sm:h-6 text-[#0984E3]" />
            Supplier Directory & Vendors
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Wholesale distributors, vendor GSTINs, purchases, and outstanding payables.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 h-10 px-4 bg-[#0984E3] hover:bg-[#0770C2] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search supplier business name, contact, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          {filteredSuppliers.length} active suppliers
        </span>
      </div>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 flex flex-col justify-between hover:border-violet-300 dark:hover:border-violet-800 transition"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {s.businessName}
                  </h4>
                  {s.ownerName && (
                    <p className="text-[11px] text-slate-500">Contact: {s.ownerName}</p>
                  )}
                  <p className="text-[11px] text-slate-500 font-mono">{s.phone}</p>
                </div>

                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                {s.gstin && (
                  <p className="font-mono">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">GSTIN:</span>{' '}
                    {s.gstin}
                  </p>
                )}
                {s.paymentTerms && (
                  <p className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Terms: {s.paymentTerms}
                  </p>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Total Purchases
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(s.totalPurchases)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    We Owe Supplier
                  </span>
                  <p
                    className={`font-black font-mono ${
                      s.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(s.outstandingBalance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveView('purchases')}
                className="flex-1 py-1.5 px-2 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 text-violet-700 dark:text-violet-300 text-[11px] font-bold rounded-lg transition text-center"
              >
                Inward Purchase
              </button>

              {s.outstandingBalance > 0 && (
                <button
                  onClick={() => {
                    setPayingSupplier(s);
                    setPayAmount(s.outstandingBalance);
                  }}
                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition text-center"
                >
                  Pay Due
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-modal-pop">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business / Trading Name *
                </label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 Days / Immediate"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {payingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-modal-pop">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Record Payment to {payingSupplier.businessName}
            </h3>
            <p className="text-xs text-slate-500">
              Outstanding Payable: <span className="font-bold text-rose-600">{formatCurrency(payingSupplier.outstandingBalance)}</span>
            </p>

            <form onSubmit={handlePaySupplier} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Paid (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="bank_transfer">Net Banking / NEFT / IMPS</option>
                  <option value="upi">UPI / QR</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingSupplier(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                >
                  Confirm Supplier Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
