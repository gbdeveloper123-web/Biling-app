import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Share2,
  DollarSign,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Clock,
  ChevronRight,
  Filter,
  CreditCard,
  MessageSquare,
  ArrowLeft,
  Download,
  Printer,
  CheckCircle,
  AlertCircle,
  Phone,
  FileSpreadsheet,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Customer, KhataEntry } from '../types';
import {
  formatCurrency,
  formatDate,
  generateWhatsAppKhataReminderUrl,
} from '../utils/formatters';
import { celebrateTaskCompletion } from '../utils/motion';

export const KhataView: React.FC = () => {
  const { customers, khata, business, recordKhataEntry, t } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);
  
  // Page toggle: null = Main Customers List; string = Dedicated Customer Statement Page
  const [selectedCustomerIdForStatement, setSelectedCustomerIdForStatement] = useState<string | null>(null);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  // Forms
  const [actionAmount, setActionAmount] = useState<number | ''>('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionMethod, setActionMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('upi');

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
      const matchDue = !filterDueOnly || c.outstandingBalance > 0;
      return matchSearch && matchDue;
    });
  }, [customers, searchTerm, filterDueOnly]);

  // Active customer for statement page
  const activeCustomer = useMemo(() => {
    if (!selectedCustomerIdForStatement) return null;
    return customers.find((c) => c.id === selectedCustomerIdForStatement) || null;
  }, [customers, selectedCustomerIdForStatement]);

  // Active customer ledger sorted chronologically
  const customerEntries = useMemo(() => {
    if (!activeCustomer) return [];
    return khata
      .filter((k) => k.partyType === 'customer' && k.partyId === activeCustomer.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [khata, activeCustomer]);

  // Summary numbers
  const totalDuesAll = customers.reduce((s, c) => s + (c.outstandingBalance || 0), 0);
  const customersWithDues = customers.filter((c) => c.outstandingBalance > 0);

  // Statement totals for active customer
  const statementStats = useMemo(() => {
    if (!customerEntries.length) {
      return { totalGiven: 0, totalReceived: 0 };
    }
    let totalGiven = 0;
    let totalReceived = 0;

    customerEntries.forEach((entry) => {
      if (entry.type === 'credit') {
        totalGiven += entry.amount;
      } else {
        totalReceived += entry.amount;
      }
    });

    return { totalGiven, totalReceived };
  }, [customerEntries]);

  // Handle Receive Payment (Paisa Aaya)
  const handleReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || !actionAmount) return;
    const amt = Number(actionAmount);
    const newBal = Math.max(0, activeCustomer.outstandingBalance - amt);

    recordKhataEntry({
      partyType: 'customer',
      partyId: activeCustomer.id,
      partyName: activeCustomer.name,
      partyPhone: activeCustomer.phone,
      date: new Date().toISOString(),
      type: 'payment_in',
      amount: amt,
      balanceAfter: newBal,
      referenceType: 'manual_payment',
      notes: actionNotes || `Payment received via ${actionMethod.toUpperCase()}`,
    });

    celebrateTaskCompletion('Payment received and credited to Khata!');
    setActionAmount('');
    setActionNotes('');
    setIsPaymentModalOpen(false);
  };

  // Handle Give Udhaar (Paisa Gaya / Credit)
  const handleGiveCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || !actionAmount) return;
    const amt = Number(actionAmount);
    const newBal = activeCustomer.outstandingBalance + amt;

    recordKhataEntry({
      partyType: 'customer',
      partyId: activeCustomer.id,
      partyName: activeCustomer.name,
      partyPhone: activeCustomer.phone,
      date: new Date().toISOString(),
      type: 'credit',
      amount: amt,
      balanceAfter: newBal,
      referenceType: 'manual_credit',
      notes: actionNotes || 'Manual udhaar / credit entry',
    });

    celebrateTaskCompletion('Credit recorded in Khata ledger!');
    setActionAmount('');
    setActionNotes('');
    setIsCreditModalOpen(false);
  };

  const whatsAppReminderUrl = activeCustomer
    ? generateWhatsAppKhataReminderUrl(
        activeCustomer.phone,
        activeCustomer.name,
        activeCustomer.outstandingBalance,
        business.name,
        business.upiId
      )
    : '#';

  // Format accurate date & time
  const formatDateTime = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return formatDate(isoDate);
    }
  };

  // Download statement as CSV
  const handleDownloadCsvStatement = () => {
    if (!activeCustomer) return;
    let csv = `Customer Statement - ${activeCustomer.name}\n`;
    csv += `Phone: ${activeCustomer.phone}\n`;
    csv += `Business: ${business.name}\n`;
    csv += `Current Outstanding Balance: INR ${activeCustomer.outstandingBalance}\n\n`;
    csv += 'Date & Time,Type,Amount (INR),Balance After,Details / Notes\n';

    customerEntries.forEach((entry) => {
      const typeStr = entry.type === 'payment_in' ? 'Paisa Aaya (Payment In)' : 'Paisa Gaya (Udhaar Given)';
      csv += `"${formatDateTime(entry.date)}","${typeStr}",${entry.amount.toFixed(2)},${entry.balanceAfter.toFixed(2)},"${entry.notes || ''}"\n`;
    });

    csv += `\nGenerated by VYAPRIX and powered by GOLDEN BAZAAR\n`;

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Statement_${activeCustomer.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Statement
  const handlePrintStatement = () => {
    window.print();
  };

  // ==============================================================
  // VIEW 2: DEDICATED CUSTOMER STATEMENT PAGE ("DUSRA PAGE")
  // ==============================================================
  if (selectedCustomerIdForStatement && activeCustomer) {
    return (
      <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150">
        {/* Top Navigation & Back Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFE6E9] dark:border-[#2A3642] pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCustomerIdForStatement(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#202B33] dark:hover:bg-[#2A3642] text-slate-800 dark:text-white text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#0984E3] dark:text-[#00CEC9]" />
              <span>Back to Customers (वापस जाएं)</span>
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Customer Ledger Statement
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {activeCustomer.name} • {activeCustomer.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsvStatement}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" /> Download Statement
            </button>
            <button
              onClick={handlePrintStatement}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>

        {/* Customer Profile & Balance Overview Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#182026] border border-[#DFE6E9] dark:border-[#2A3642] shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DFE6E9] dark:border-[#2A3642] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0984E3]/10 dark:bg-[#00CEC9]/15 text-[#0984E3] dark:text-[#00CEC9] font-black text-xl flex items-center justify-center shrink-0">
                {activeCustomer.name.substring(0, 1).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {activeCustomer.name}
                  {activeCustomer.outstandingBalance > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                      Udhaar Due
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Phone: {activeCustomer.phone} {activeCustomer.gstin ? `| GSTIN: ${activeCustomer.gstin}` : ''}
                </p>
              </div>
            </div>

            {/* Current Net Balance */}
            <div className="text-left md:text-right bg-slate-50 dark:bg-[#202B33] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Net Outstanding Udhaar (कुल बकाया)
              </span>
              <p className={`text-2xl font-black font-mono ${
                activeCustomer.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {formatCurrency(activeCustomer.outstandingBalance)}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar: Total Given vs Total Received */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                Total Udhaar Given (पैसा गया / कुल उधार)
              </span>
              <p className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1 font-mono">
                {formatCurrency(statementStats.totalGiven || activeCustomer.totalPurchases)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Total Payment Received (पैसा आया / कुल भुगतान)
              </span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1 font-mono">
                {formatCurrency(statementStats.totalReceived)}
              </p>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 print:hidden">
            <button
              onClick={() => {
                setActionAmount('');
                setActionNotes('');
                setIsPaymentModalOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" /> Record Payment (रुपये प्राप्त हुए)
            </button>

            <button
              onClick={() => {
                setActionAmount('');
                setActionNotes('');
                setIsCreditModalOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" /> Give Udhaar (उधार दिया)
            </button>

            {activeCustomer.outstandingBalance > 0 && (
              <a
                href={whatsAppReminderUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Send WhatsApp Reminder
              </a>
            )}
          </div>
        </div>

        {/* Ledger Statement Timeline Table */}
        <div className="bg-white dark:bg-[#182026] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0984E3]" />
              Detailed Transaction History (लेखा-जोखा विवरण)
            </h4>
            <span className="text-xs font-mono text-slate-400">
              {customerEntries.length} Transactions
            </span>
          </div>

          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-xs text-left min-w-[620px]">
              <thead>
                <tr className="border-b border-[#DFE6E9] dark:border-[#2A3642] text-[11px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-[#202B33]">
                  <th className="py-2.5 px-3">Date & Time (तारीख व समय)</th>
                  <th className="py-2.5 px-3">Transaction Type</th>
                  <th className="py-2.5 px-3 text-right">Amount (रकम)</th>
                  <th className="py-2.5 px-3 text-right">Balance (बकाया)</th>
                  <th className="py-2.5 px-3">Details / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customerEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No khata entries recorded for this customer yet.
                    </td>
                  </tr>
                ) : (
                  customerEntries.map((entry) => {
                    const isCredit = entry.type === 'credit';
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        {/* Accurate Date & Time */}
                        <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {formatDateTime(entry.date)}
                        </td>

                        {/* Transaction Type Badge */}
                        <td className="py-3 px-3">
                          {isCredit ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                              Paisa Gaya / Udhaar Diya
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                              Paisa Aaya (Payment Received)
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className={`py-3 px-3 text-right font-black font-mono text-sm ${
                          isCredit ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {isCredit ? '+' : '-'}{formatCurrency(entry.amount)}
                        </td>

                        {/* Balance After */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(entry.balanceAfter)}
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-3 text-slate-500 max-w-[200px] truncate">
                          {entry.notes || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Statement Footer Branding */}
          <div className="pt-6 mt-6 border-t border-[#DFE6E9] dark:border-[#2A3642] text-center">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Generated by <span className="text-[#0984E3] dark:text-[#00CEC9]">VYAPRIX</span> and powered by <span className="text-[#E17055] font-black">GOLDEN BAZAAR</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Accurate verified business record • {business.name}
            </p>
          </div>
        </div>

        {/* Modal: Receive Payment */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#182026] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xl p-6 w-full max-w-md animate-modal-pop">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                Record Payment (रुपये प्राप्त हुए)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Record payment received from {activeCustomer.name}
              </p>

              <form onSubmit={handleReceivePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount Received (रकम ₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                    placeholder="Enter amount..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['upi', 'cash', 'bank_transfer'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setActionMethod(m)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition uppercase ${
                          actionMethod === m
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Remarks
                  </label>
                  <input
                    type="text"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. Cleared GPay #12938"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="w-1/2 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl"
                  >
                    Save Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Give Credit (Udhaar) */}
        {isCreditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#182026] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xl p-6 w-full max-w-md animate-modal-pop">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                Give Udhaar (उधार दिया / Paisa Gaya)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Add new credit entry for {activeCustomer.name}
              </p>

              <form onSubmit={handleGiveCredit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credit Amount (उधार रकम ₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                    placeholder="Enter amount..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason / Item Details
                  </label>
                  <input
                    type="text"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g. 2 Shirts and 1 Jeans on credit"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreditModalOpen(false)}
                    className="w-1/2 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-xl"
                  >
                    Save Udhaar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==============================================================
  // VIEW 1: MAIN CUSTOMER DIRECTORY (CUSTOMER LIST ONLY)
  // ==============================================================
  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600" />
            Digital Khata / Udhaar Register (ग्राहक खाता बुक)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click on any customer name to open their complete ledger statement with accurate timestamps.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60">
          <div>
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
              Total Customer Udhaar
            </span>
            <p className="text-base sm:text-lg font-bold text-amber-700 dark:text-amber-300 font-mono">
              {formatCurrency(totalDuesAll)}
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-xl font-bold">
            {customersWithDues.length} Parties Due
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#182026] p-3 rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer by name or mobile number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0984E3]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterDueOnly(!filterDueOnly)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              filterDueOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {filterDueOnly ? 'Showing Dues Only' : 'Show Only Dues'}
          </button>
        </div>
      </div>

      {/* Customer Grid Cards - Clean, modern, responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-[#182026] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642]">
            <User className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-60" />
            <p className="text-xs font-medium">No customers found matching your search.</p>
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const hasDue = c.outstandingBalance > 0;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCustomerIdForStatement(c.id)}
                className="p-4 rounded-2xl bg-white dark:bg-[#182026] border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs hover:shadow-md hover:border-[#0984E3] dark:hover:border-[#00CEC9] transition cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#0984E3]/10 text-[#0984E3] dark:bg-[#00CEC9]/15 dark:text-[#00CEC9] font-bold text-sm flex items-center justify-center shrink-0">
                        {c.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0984E3] dark:group-hover:text-[#00CEC9] transition">
                          {c.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                        </p>
                      </div>
                    </div>

                    {hasDue ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                        Due
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Clear
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#DFE6E9] dark:border-[#2A3642] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Balance Udhaar
                    </span>
                    <p className={`text-base font-black font-mono ${hasDue ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatCurrency(c.outstandingBalance)}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#0984E3] dark:text-[#00CEC9] flex items-center gap-1 group-hover:translate-x-1 transition">
                    View Statement <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Branding on Main page as well */}
      <div className="pt-6 border-t border-[#DFE6E9] dark:border-[#2A3642] text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Generated by <span className="text-[#0984E3] dark:text-[#00CEC9]">VYAPRIX</span> and powered by <span className="text-[#E17055] font-black">GOLDEN BAZAAR</span>
        </p>
      </div>
    </div>
  );
};
