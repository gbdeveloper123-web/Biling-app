import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const { invoices, purchases, expenses, products, customers, suppliers } = useShop();

  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'month' | 'year'>('30d');
  const [reportType, setReportType] = useState<'pnl' | 'sales' | 'inventory' | 'dues'>('pnl');

  // Profit & Loss calculation
  const validInvoices = invoices.filter((i) => i.paymentStatus !== 'cancelled');

  let grossSales = 0;
  let costOfGoodsSold = 0;
  let totalDiscounts = 0;
  let taxCollected = 0;

  validInvoices.forEach((inv) => {
    grossSales += inv.subtotal;
    totalDiscounts += inv.discount;
    taxCollected += inv.cgstAmount + inv.sgstAmount + inv.igstAmount;

    inv.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const unitCost = prod ? prod.purchasePrice : item.price * 0.6;
      costOfGoodsSold += unitCost * item.quantity;
    });
  });

  const netSales = Math.max(0, grossSales - totalDiscounts);
  const grossProfit = Math.max(0, netSales - costOfGoodsSold);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const estimatedNetProfit = grossProfit - totalExpenses;
  const netMarginPct = netSales > 0 ? Math.round((estimatedNetProfit / netSales) * 100) : 0;

  // Export CSV Helper
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'sales') {
      csvContent += 'Invoice No,Date,Customer,Subtotal,Discount,Taxable,GST,Grand Total,Payment Method,Status\n';
      validInvoices.forEach((inv) => {
        csvContent += `"${inv.invoiceNo}","${formatDate(inv.invoiceDate)}","${inv.customerName}",${inv.subtotal},${inv.discount},${inv.taxableAmount},${inv.cgstAmount + inv.sgstAmount + inv.igstAmount},${inv.grandTotal},"${inv.paymentMethod}","${inv.paymentStatus}"\n`;
      });
    } else {
      csvContent += 'Metric,Amount (INR)\n';
      csvContent += `"Gross Sales",${grossSales}\n`;
      csvContent += `"Total Discounts",${totalDiscounts}\n`;
      csvContent += `"Net Sales",${netSales}\n`;
      csvContent += `"Cost of Goods Sold (COGS)",${costOfGoodsSold}\n`;
      csvContent += `"Estimated Gross Profit",${grossProfit}\n`;
      csvContent += `"Operating Expenses",${totalExpenses}\n`;
      csvContent += `"Estimated Net Profit",${estimatedNetProfit}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ShopMate_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 sm:w-6 h-5 sm:h-6 text-[#0984E3]" />
            Financial Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Profit & loss analysis, sales ledger, stock valuations, and audit spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 h-10 px-3.5 text-xs font-semibold text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-50 rounded-xl border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 h-10 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Report Types Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setReportType('pnl')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            reportType === 'pnl'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Profit & Loss Statement
        </button>
        <button
          onClick={() => setReportType('sales')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            reportType === 'sales'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Sales Breakdown Report
        </button>
      </div>

      {/* Main Content */}
      {reportType === 'pnl' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* P&L Statement Sheet (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Estimated Profit & Loss Summary
                </h3>
                <p className="text-xs text-slate-400">
                  Calculated using selling price minus purchase cost and recorded operating expenses.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                FY 2025-26
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 font-medium">
                <span className="text-slate-700 dark:text-slate-300">Gross Sales Revenue</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(grossSales)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-emerald-600">
                <span>Customer Discounts Given</span>
                <span>-{formatCurrency(totalDiscounts)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800/40 px-3 rounded-lg">
                <span className="text-slate-900 dark:text-white">Net Sales</span>
                <span className="text-slate-900 dark:text-white">{formatCurrency(netSales)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <span>Cost of Goods Sold (COGS)</span>
                <span>-{formatCurrency(costOfGoodsSold)}</span>
              </div>

              <div className="flex justify-between py-2.5 border-b-2 border-slate-300 dark:border-slate-700 font-black text-sm text-slate-900 dark:text-white">
                <span>Estimated Gross Profit</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(grossProfit)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-rose-600">
                <span>Operating Expenses (Rent, Bills, Staff)</span>
                <span>-{formatCurrency(totalExpenses)}</span>
              </div>

              {/* Net Profit Banner */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl flex items-center justify-between text-sm">
                <div>
                  <span className="font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider block">
                    Estimated Net Profit
                  </span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Net Margin: ~{netMarginPct}%
                  </span>
                </div>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(estimatedNetProfit)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              * Note: Estimated figures are computed from active inventory purchase costs and logged expenses. Exact tax adjustments depend on your CA audit.
            </p>
          </div>

          {/* Quick Metrics (1 col) */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total GST Collected
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(taxCollected)}
              </p>
              <p className="text-xs text-slate-500">Output tax on all sales bills</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Invoices
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {validInvoices.length} Bills
              </p>
              <p className="text-xs text-slate-500">Generated across the business</p>
            </div>
          </div>
        </div>
      ) : (
        /* Sales Register */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3 text-right">Gross</th>
                  <th className="py-3 px-3 text-right">Taxable</th>
                  <th className="py-3 px-3 text-right">GST</th>
                  <th className="py-3 px-3 text-right">Grand Total</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {validInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(inv.invoiceDate)}</td>
                    <td className="py-3 px-3 font-semibold">{inv.customerName}</td>
                    <td className="py-3 px-3 text-right font-medium">{formatCurrency(inv.subtotal)}</td>
                    <td className="py-3 px-3 text-right font-medium">{formatCurrency(inv.taxableAmount)}</td>
                    <td className="py-3 px-3 text-right text-emerald-600 font-mono">
                      {formatCurrency(inv.cgstAmount + inv.sgstAmount + inv.igstAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-black">{formatCurrency(inv.grandTotal)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                        {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
