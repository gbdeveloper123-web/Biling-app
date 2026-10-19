import React, { useState } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
  Boxes,
  Truck,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { roundMoney } from '../utils/billingCalculator';

export const ReturnsView: React.FC = () => {
  const { invoices, purchases, salesReturns, processSalesReturn } = useShop();

  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

  // Sales Return Form
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || '');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('Size mismatch / Defective');
  const [refundMethod, setRefundMethod] = useState<'cash' | 'upi' | 'store_credit'>('upi');

  const activeInvoice = invoices.find((i) => i.id === selectedInvoiceId) || invoices[0];
  const firstItem = activeInvoice?.items[0];

  // Net price actually paid per unit including proportional discounts and taxes
  const effectiveUnitPrice = firstItem && firstItem.quantity > 0
    ? roundMoney(firstItem.total / firstItem.quantity)
    : (firstItem?.price || 0);

  const handleProcessSalesReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice || !firstItem) return;

    const unitPrice = effectiveUnitPrice;
    const totalRefund = roundMoney(unitPrice * returnQty);

    processSalesReturn({
      invoiceId: activeInvoice.id,
      invoiceNo: activeInvoice.invoiceNo,
      customerId: activeInvoice.customerId,
      customerName: activeInvoice.customerName,
      date: new Date().toISOString(),
      items: [
        {
          productId: firstItem.productId,
          productName: firstItem.productName,
          returnQty,
          unitPrice,
          taxRate: firstItem.gstRate,
          total: totalRefund,
        },
      ],
      totalRefund,
      refundMethod,
      reason: returnReason,
    });

    setIsSalesModalOpen(false);
  };

  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-5 sm:w-6 h-5 sm:h-6 text-[#0984E3]" />
            Returns & Credit Notes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Process sales returns from customers (restores inventory) and outward supplier returns.
          </p>
        </div>

        <button
          onClick={() => setIsSalesModalOpen(true)}
          className="flex items-center gap-1.5 h-10 px-4 bg-[#0984E3] hover:bg-[#0770C2] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Sales Return
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'sales'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Customer Sales Returns ({salesReturns.length})
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'purchases'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Supplier Purchase Returns
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden p-5">
        {activeTab === 'sales' ? (
          salesReturns.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <RotateCcw className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No Sales Returns Recorded
              </p>
              <p className="text-xs mt-1">
                Returns automatically restore inventory stock and generate credit notes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Returned Item</th>
                    <th className="py-3 px-4 text-center">Qty Restored</th>
                    <th className="py-3 px-4 text-right">Refund Amount</th>
                    <th className="py-3 px-4 text-center">Refund Mode</th>
                    <th className="py-3 px-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {salesReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {ret.invoiceNo}
                      </td>
                      <td className="py-3 px-4 font-semibold">{ret.customerName}</td>
                      <td className="py-3 px-4">{ret.items[0]?.productName}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        +{ret.items[0]?.returnQty} units
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-600">
                        {formatCurrency(ret.totalRefund)}
                      </td>
                      <td className="py-3 px-4 text-center uppercase font-mono text-[10px]">
                        {ret.refundMethod}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{ret.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="py-16 text-center text-slate-400">
            <Truck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No Supplier Purchase Returns
            </p>
            <p className="text-xs mt-1">Select a supplier purchase invoice to return defective stock.</p>
          </div>
        )}
      </div>

      {/* New Sales Return Modal */}
      {isSalesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Process Sales Return
            </h3>

            <form onSubmit={handleProcessSalesReturn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Original Invoice *
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNo} - {inv.customerName} (₹{inv.grandTotal})
                    </option>
                  ))}
                </select>
              </div>

              {firstItem && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Item: {firstItem.productName}
                  </p>
                  <p className="text-slate-500">
                    Billed Qty: {firstItem.quantity} | Original Rate: {formatCurrency(firstItem.price)} | Net Price: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(effectiveUnitPrice)}</span>
                  </p>
                  <div className="pt-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    Total Refund: {formatCurrency(roundMoney(effectiveUnitPrice * returnQty))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Return Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={firstItem?.quantity || 1}
                    value={returnQty}
                    onChange={(e) => setReturnQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Refund Mode
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="upi">UPI / Cash</option>
                    <option value="store_credit">Store Credit / Khata</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Return
                </label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSalesModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                >
                  Confirm Return & Restore Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
