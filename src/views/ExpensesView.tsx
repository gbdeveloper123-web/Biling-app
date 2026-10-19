import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  TrendingDown,
  Calendar,
  CreditCard,
  Building,
  Tag,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Expense, ExpenseCategory } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { celebrateTaskCompletion } from '../utils/motion';

const CATEGORIES: ExpenseCategory[] = [
  'Rent',
  'Electricity',
  'Internet',
  'Salary',
  'Transport',
  'Packaging',
  'Marketing',
  'Maintenance',
  'Purchases',
  'Other',
];

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'bank_transfer'>('upi');
  const [description, setDescription] = useState('');
  const [referenceNo, setReferenceNo] = useState('');

  // Filtered
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q || e.title.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q));
      const matchesCat = selectedCat === 'all' || e.category === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [expenses, searchTerm, selectedCat]);

  // Aggregate Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const curMonth = todayStr.substring(0, 7);

  const todayExpenseTotal = expenses
    .filter((e) => e.date.startsWith(todayStr))
    .reduce((s, e) => s + e.amount, 0);

  const monthExpenseTotal = expenses
    .filter((e) => e.date.startsWith(curMonth))
    .reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    addExpense({
      title,
      amount: Number(amount),
      category,
      date,
      paymentMethod,
      description,
      referenceNo,
    });

    celebrateTaskCompletion('Expense recorded successfully!');
    setTitle('');
    setAmount('');
    setDescription('');
    setReferenceNo('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600" />
            Expense Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track business operating costs, utility bills, rent, staff salaries, and petty cash.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 h-10 px-4 bg-[#0984E3] hover:bg-[#0770C2] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Record New Expense
        </button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Today's Outflow
          </span>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
            {formatCurrency(todayExpenseTotal)}
          </p>
          <p className="text-[10px] text-slate-400">Recorded today</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Monthly Expenses
          </span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(monthExpenseTotal)}
          </p>
          <p className="text-[10px] text-slate-400">Current calendar month</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Top Expense Category
          </span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {categoryBreakdown[0]?.[0] || 'Rent'}
          </p>
          <p className="text-[10px] text-slate-400">
            {categoryBreakdown[0] ? formatCurrency(categoryBreakdown[0][1]) : '₹0.00'}
          </p>
        </div>
      </div>

      {/* Main Grid: Expenses Table & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search expense description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Title & Details</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center">Payment</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 dark:text-white">{exp.title}</p>
                      {exp.description && (
                        <p className="text-[10px] text-slate-400">{exp.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(exp.date)}</td>
                    <td className="py-3 px-3 text-center uppercase font-mono text-[10px] text-slate-500">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown Card (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Expense Category Breakdown
            </h3>
            <p className="text-xs text-slate-400">Distribution by category</p>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.map(([cat, amt]) => {
              const totalExp = categoryBreakdown.reduce((s, i) => s + i[1], 0) || 1;
              const pct = Math.round((amt / totalExp) * 100);
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(amt)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-modal-pop">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Record Business Expense
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title / Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shop Electricity Bill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
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
                    placeholder="e.g. 3500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="upi">UPI / QR</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer / IMPS</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Receipt #
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid to Landlord via GPay"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
