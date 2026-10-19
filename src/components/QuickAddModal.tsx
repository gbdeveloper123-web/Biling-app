import React, { useState } from 'react';
import {
  X,
  FilePlus,
  PackagePlus,
  UserPlus,
  Truck,
  Receipt,
  Wallet,
  ShoppingCart,
  Boxes,
} from 'lucide-react';
import { useShop, AppView } from '../context/ShopContext';
import { INDIAN_STATES } from '../utils/formatters';
import { celebrateTaskCompletion, playClickSound } from '../utils/motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddProduct?: () => void;
}

export const QuickAddModal: React.FC<Props> = ({ isOpen, onClose, onOpenAddProduct }) => {
  const { setActiveView, addCustomer, addSupplier, addExpense, adjustStock, products } = useShop();

  // Sub-modal states
  const [modalType, setModalType] = useState<
    'menu' | 'customer' | 'supplier' | 'expense' | 'stock_adj'
  >('menu');

  // Customer form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custGstin, setCustGstin] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custCreditLimit, setCustCreditLimit] = useState(10000);

  // Supplier form
  const [supBizName, setSupBizName] = useState('');
  const [supOwnerName, setSupOwnerName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supGstin, setSupGstin] = useState('');
  const [supCity, setSupCity] = useState('');

  // Expense form
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState<number | ''>('');
  const [expCategory, setExpCategory] = useState<any>('Other');
  const [expMethod, setExpMethod] = useState<any>('upi');

  // Stock Adjustment form
  const [adjProductId, setAdjProductId] = useState('');
  const [adjQty, setAdjQty] = useState<number | ''>('');
  const [adjType, setAdjType] = useState<any>('adjustment');
  const [adjReason, setAdjReason] = useState('');

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setModalType('menu');
    onClose();
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;
    addCustomer({
      name: custName,
      phone: custPhone,
      gstin: custGstin,
      address: custAddress,
      creditLimit: Number(custCreditLimit) || 10000,
      outstandingBalance: 0,
      totalPurchases: 0,
      totalOrdersCount: 0,
    });
    celebrateTaskCompletion('Customer added successfully!');
    setCustName('');
    setCustPhone('');
    setCustGstin('');
    handleResetAndClose();
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supBizName || !supPhone) return;
    addSupplier({
      businessName: supBizName,
      ownerName: supOwnerName,
      phone: supPhone,
      gstin: supGstin,
      city: supCity,
      outstandingBalance: 0,
      totalPurchases: 0,
    });
    celebrateTaskCompletion('Supplier registered!');
    setSupBizName('');
    setSupPhone('');
    handleResetAndClose();
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    addExpense({
      title: expTitle,
      amount: Number(expAmount),
      category: expCategory,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: expMethod,
    });
    celebrateTaskCompletion('Expense recorded!');
    setExpTitle('');
    setExpAmount('');
    handleResetAndClose();
  };

  const handleStockAdj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjProductId || !adjQty) return;
    const qtyNum = Number(adjQty);
    const multiplier = adjType === 'damaged' || adjType === 'expired' ? -1 : 1;
    adjustStock(adjProductId, qtyNum * multiplier, adjType, adjReason || 'Quick Adjustment');
    celebrateTaskCompletion('Stock updated!');
    setAdjProductId('');
    setAdjQty('');
    setAdjReason('');
    handleResetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-modal-pop">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {modalType === 'menu' && 'Quick Add / Action'}
            {modalType === 'customer' && 'Add New Customer'}
            {modalType === 'supplier' && 'Add New Supplier'}
            {modalType === 'expense' && 'Record Business Expense'}
            {modalType === 'stock_adj' && 'Quick Stock Adjustment'}
          </h3>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {modalType === 'menu' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setActiveView('billing');
                  onClose();
                }}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 text-left transition group active:scale-95"
              >
                <div className="p-2.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                  <FilePlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                    New Invoice
                  </p>
                  <p className="text-[11px] text-slate-500">GST or Retail bill</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (onOpenAddProduct) onOpenAddProduct();
                  else setActiveView('inventory');
                  onClose();
                }}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/30 text-left transition group active:scale-95"
              >
                <div className="p-2.5 rounded-lg bg-emerald-600 text-white shadow-sm">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                    Add Product
                  </p>
                  <p className="text-[11px] text-slate-500">With AI suggestions</p>
                </div>
              </button>

              <button
                onClick={() => setModalType('customer')}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/30 text-left transition group active:scale-95"
              >
                <div className="p-2.5 rounded-lg bg-blue-600 text-white shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                    Add Customer
                  </p>
                  <p className="text-[11px] text-slate-500">Party directory</p>
                </div>
              </button>

              <button
                onClick={() => setModalType('supplier')}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/30 text-left transition group active:scale-95"
              >
                <div className="p-2.5 rounded-lg bg-violet-600 text-white shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600">
                    Add Supplier
                  </p>
                  <p className="text-[11px] text-slate-500">Wholesale vendor</p>
                </div>
              </button>

              <button
                onClick={() => setModalType('expense')}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/30 text-left transition group active:scale-95"
              >
                <div className="p-2.5 rounded-lg bg-amber-600 text-white shadow-sm">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600">
                    Record Expense
                  </p>
                  <p className="text-[11px] text-slate-500">Rent, bills & petty</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveView('purchases');
                  onClose();
                }}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/30 text-left transition group active:scale-95"
              >
                <div className="p-2.5 rounded-lg bg-rose-600 text-white shadow-sm">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600">
                    Add Purchase
                  </p>
                  <p className="text-[11px] text-slate-500">Supplier inventory</p>
                </div>
              </button>

              <button
                onClick={() => setModalType('stock_adj')}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/30 text-left transition group active:scale-95 col-span-2"
              >
                <div className="p-2.5 rounded-lg bg-teal-600 text-white shadow-sm">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600">
                    Stock Adjustment
                  </p>
                  <p className="text-[11px] text-slate-500">Add or remove damaged/expired stock</p>
                </div>
              </button>
            </div>
          )}

          {/* Customer Sub-form */}
          {modalType === 'customer' && (
            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil or Ramesh Enterprises"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="27ABCDE1234F1Z5"
                    value={custGstin}
                    onChange={(e) => setCustGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs uppercase font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Shop or Residence address, City"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType('menu')}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          )}

          {/* Supplier Sub-form */}
          {modalType === 'supplier' && (
            <form onSubmit={handleCreateSupplier} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Wholesalers"
                  value={supBizName}
                  onChange={(e) => setSupBizName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    placeholder="27AABCS1234D1Z2"
                    value={supGstin}
                    onChange={(e) => setSupGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs uppercase font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType('menu')}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          )}

          {/* Expense Sub-form */}
          {modalType === 'expense' && (
            <form onSubmit={handleCreateExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shop Cleaning & Tea Snacks"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {[
                      'Rent',
                      'Electricity',
                      'Internet',
                      'Salary',
                      'Transport',
                      'Packaging',
                      'Marketing',
                      'Maintenance',
                      'Other',
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={expMethod}
                  onChange={(e) => setExpMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="upi">UPI / QR</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType('menu')}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Record Expense
                </button>
              </div>
            </form>
          )}

          {/* Stock Adjustment Sub-form */}
          {modalType === 'stock_adj' && (
            <form onSubmit={handleStockAdj} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Product *
                </label>
                <select
                  required
                  value={adjProductId}
                  onChange={(e) => setAdjProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose item --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5"
                    value={adjQty}
                    onChange={(e) => setAdjQty(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Action Type
                  </label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="adjustment">Stock In (Add)</option>
                    <option value="damaged">Damaged / Broken (Reduce)</option>
                    <option value="expired">Expired Stock (Reduce)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physical inventory count correction"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType('menu')}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
