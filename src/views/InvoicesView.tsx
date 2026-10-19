import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Printer,
  Share2,
  Trash2,
  Filter,
  DollarSign,
  Plus,
  RotateCcw,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Invoice, PaymentStatus } from '../types';
import { formatCurrency, formatDate, generateWhatsAppBillUrl } from '../utils/formatters';
import {
  DateRangeFilter,
  INITIAL_DATE_RANGE,
  DateRangeState,
  matchesDateRange,
} from '../components/DateRangeFilter';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    business,
    setActiveView,
    setSelectedInvoiceForPrint,
    cancelInvoice,
    createInvoice,
    recordKhataEntry,
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateRangeState>(INITIAL_DATE_RANGE);

  // Cancel dialog state
  const [cancelModalInvoice, setCancelModalInvoice] = useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer returned items');

  // Payment Recording state
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'bank_transfer'>('upi');

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        inv.invoiceNo.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        (inv.customerPhone && inv.customerPhone.includes(q));

      // Status
      const matchesStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;

      // Date filter
      const matchesDate = matchesDateRange(inv.invoiceDate, dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, searchTerm, statusFilter, dateFilter]);

  // Aggregate stats
  const totalBilled = filteredInvoices
    .filter((i) => i.paymentStatus !== 'cancelled')
    .reduce((s, i) => s + i.grandTotal, 0);

  const totalCollected = filteredInvoices
    .filter((i) => i.paymentStatus !== 'cancelled')
    .reduce((s, i) => s + i.amountPaid, 0);

  const totalOutstanding = filteredInvoices
    .filter((i) => i.paymentStatus !== 'cancelled')
    .reduce((s, i) => s + i.balanceDue, 0);

  // Duplicate Invoice
  const handleDuplicate = (inv: Invoice) => {
    const nextNumber = business.invoiceSettings.startingNumber + 1;
    const newInvoice = createInvoice({
      ...inv,
      invoiceNo: `${business.invoiceSettings.invoicePrefix}${nextNumber}`,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      paymentStatus: 'paid',
      amountPaid: inv.grandTotal,
      balanceDue: 0,
      notes: `Duplicated from ${inv.invoiceNo}`,
    });
    setSelectedInvoiceForPrint(newInvoice);
  };

  // Submit Cancel
  const handleConfirmCancel = () => {
    if (!cancelModalInvoice) return;
    cancelInvoice(cancelModalInvoice.id, cancelReason);
    setCancelModalInvoice(null);
  };

  // Submit Payment Record
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice || !paymentAmount) return;
    const pAmt = Number(paymentAmount);

    if (paymentModalInvoice.customerId) {
      recordKhataEntry({
        partyType: 'customer',
        partyId: paymentModalInvoice.customerId,
        partyName: paymentModalInvoice.customerName,
        partyPhone: paymentModalInvoice.customerPhone || '',
        date: new Date().toISOString(),
        type: 'payment_in',
        amount: pAmt,
        balanceAfter: Math.max(0, paymentModalInvoice.balanceDue - pAmt),
        referenceType: 'invoice',
        referenceId: paymentModalInvoice.invoiceNo,
        notes: `Payment of ₹${pAmt} received via ${paymentMethod.toUpperCase()}`,
      });
    }

    setPaymentModalInvoice(null);
    setPaymentAmount('');
    alert(`Payment of ₹${pAmt} recorded successfully!`);
  };

  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-[#0984E3]" />
            Invoices & Sales Register
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View, filter, print, and track all GST sales bills and quotations.
          </p>
        </div>

        <button
          onClick={() => setActiveView('billing')}
          className="flex items-center gap-1.5 h-10 px-4 bg-[#0984E3] hover:bg-[#0770C2] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Bill
        </button>
      </div>

      {/* Aggregate Mini-Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Sales
          </span>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(totalBilled)}
          </p>
          <p className="text-[11px] text-slate-400">{filteredInvoices.length} invoices</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Collected Amount
          </span>
          <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatCurrency(totalCollected)}
          </p>
          <p className="text-[11px] text-slate-400">Received payments</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Pending Udhaar
          </span>
          <p className="text-lg sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
            {formatCurrency(totalOutstanding)}
          </p>
          <p className="text-[11px] text-slate-400">Balance customer dues</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, customer name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Filter */}
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No Invoices Found
            </p>
            <p className="text-xs mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-xs text-left min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => {
                  const whatsAppUrl = generateWhatsAppBillUrl(
                    inv.customerPhone,
                    inv.customerName,
                    inv.invoiceNo,
                    inv.grandTotal,
                    business.name,
                    business.upiId
                  );

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoiceForPrint(inv)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {inv.invoiceNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {inv.customerName}
                        </p>
                        {inv.customerPhone && (
                          <p className="text-[10px] text-slate-400 font-mono">{inv.customerPhone}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(inv.invoiceDate, true)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600 dark:text-slate-300">
                        {formatCurrency(inv.taxableAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-center uppercase font-mono text-[10px] text-slate-500">
                        {inv.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            inv.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : inv.paymentStatus === 'partially_paid'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : inv.paymentStatus === 'cancelled'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                          }`}
                        >
                          {inv.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Print / Save PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <a
                            href={whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </a>

                          {inv.balanceDue > 0 && inv.paymentStatus !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setPaymentModalInvoice(inv);
                                setPaymentAmount(inv.balanceDue);
                              }}
                              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50 transition"
                              title="Record Payment"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDuplicate(inv)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                            title="Duplicate Bill"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {inv.paymentStatus !== 'cancelled' && (
                            <button
                              onClick={() => setCancelModalInvoice(inv)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                              title="Cancel / Revert Invoice"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Invoice Modal */}
      {cancelModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">
              Cancel Invoice #{cancelModalInvoice.invoiceNo}?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Cancelling this invoice will automatically restore product inventory stock and adjust
              customer khata dues without destroying the audit record.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for cancellation:
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalInvoice(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Active
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Record Due Payment: #{paymentModalInvoice.invoiceNo}
            </h3>
            <p className="text-xs text-slate-500">
              Customer: <span className="font-semibold">{paymentModalInvoice.customerName}</span> | Total Due:{' '}
              <span className="font-bold text-rose-600">{formatCurrency(paymentModalInvoice.balanceDue)}</span>
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentModalInvoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="upi">UPI / QR</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer / IMPS</option>
                  <option value="card">Card / POS</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
