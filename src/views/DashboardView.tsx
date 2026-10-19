import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  AlertTriangle,
  CreditCard,
  Building,
  Boxes,
  FilePlus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Printer,
  ChevronRight,
  Calendar,
  Share2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  DateRangeFilter,
  INITIAL_DATE_RANGE,
  DateRangeState,
  matchesDateRange,
} from '../components/DateRangeFilter';

export const DashboardView: React.FC = () => {
  const { business, analytics, invoices, setActiveView, setSelectedInvoiceForPrint } = useShop();

  const [dateFilter, setDateFilter] = useState<DateRangeState>(INITIAL_DATE_RANGE);

  // Filtered invoices for the selected period
  const periodInvoices = useMemo(() => {
    return invoices.filter((i) => matchesDateRange(i.invoiceDate, dateFilter));
  }, [invoices, dateFilter]);

  const periodSales = useMemo(() => {
    return periodInvoices
      .filter((i) => i.paymentStatus !== 'cancelled')
      .reduce((s, i) => s + i.grandTotal, 0);
  }, [periodInvoices]);

  const periodProfit = useMemo(() => {
    return Math.round(periodSales * 0.28);
  }, [periodSales]);

  const periodOrdersCount = useMemo(() => {
    return periodInvoices.filter((i) => i.paymentStatus !== 'cancelled').length;
  }, [periodInvoices]);

  // Dynamic label for Today, Week, Month, or Selective Date
  const periodLabel = useMemo(() => {
    if (dateFilter.isCustomActive || dateFilter.option === 'custom') {
      if (!dateFilter.fromDate) return 'Selective Date';
      if (dateFilter.fromDate === dateFilter.toDate || !dateFilter.toDate) {
        try {
          return new Date(dateFilter.fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        } catch {
          return dateFilter.fromDate;
        }
      }
      try {
        const d1 = new Date(dateFilter.fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const d2 = new Date(dateFilter.toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return `${d1} - ${d2}`;
      } catch {
        return `${dateFilter.fromDate} - ${dateFilter.toDate}`;
      }
    }
    if (dateFilter.option === 'today') return 'Today';
    if (dateFilter.option === 'this_week') return 'This Week';
    if (dateFilter.option === 'this_month') return 'This Month';
    return 'Period';
  }, [dateFilter]);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Sales Trend Max value for scaling
  const maxSales = Math.max(...analytics.salesTrend7D.map((d) => d.amount), 1000);

  return (
    <div className="vy-view-container space-y-5 sm:space-y-6 overflow-x-hidden">
      {/* Top Banner Greeting & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E272E] text-[#2D3436] dark:text-[#F5F6FA] p-4 sm:p-5 rounded-2xl shadow-xs border border-[#DFE6E9] dark:border-[#2A3642]">
        <div>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#0984E3] dark:text-[#00CEC9]">
            {formatDate(new Date().toISOString())} • Store Overview
          </span>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight mt-0.5 text-[#2D3436] dark:text-white">
            {greeting}, {business.name}!
          </h2>
          <p className="text-xs sm:text-sm text-[#636E72] dark:text-[#B2BEC3] mt-0.5 max-w-xl">
            Live overview: <span className="font-bold text-[#2D3436] dark:text-white">{periodOrdersCount} invoices</span> in <span className="font-bold text-[#0984E3] dark:text-[#00CEC9]">{periodLabel}</span> ({formatCurrency(periodSales)})
            and{' '}
            <span className="font-bold text-[#E1A73E] dark:text-[#FDCB6E]">
              {formatCurrency(analytics.pendingPayments)}
            </span>{' '}
            in customer udhaar dues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <DateRangeFilter value={dateFilter} onChange={setDateFilter} />
          <button
            onClick={() => setActiveView('billing')}
            className="flex items-center gap-1.5 h-10 px-3.5 bg-[#0984E3] hover:bg-[#0770C2] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs active:scale-95 transition whitespace-nowrap cursor-pointer"
          >
            <FilePlus className="w-4 h-4 text-white" />
            Make Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Compact and Professional */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Sales in Selected Period */}
        <div className="p-3.5 sm:p-4.5 rounded-2xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider truncate">
              {periodLabel} Sales
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#00B894]/10 text-[#00B894] shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-2xl font-bold text-[#2D3436] dark:text-white truncate">
              {formatCurrency(periodSales)}
            </p>
            <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-xs">
              <span className="text-[#0984E3] dark:text-[#00CEC9] font-medium truncate">
                {periodOrdersCount} invoices issued
              </span>
            </div>
          </div>
        </div>

        {/* Est Profit */}
        <div className="p-3.5 sm:p-4.5 rounded-2xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider truncate">
              {periodLabel} Profit
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#0984E3]/10 text-[#0984E3] dark:text-[#00CEC9] shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-2xl font-bold text-[#2D3436] dark:text-white truncate">
              {formatCurrency(periodProfit)}
            </p>
            <p className="text-[10px] sm:text-xs text-[#636E72] dark:text-[#B2BEC3] truncate">
              Est. ~28% margin ({formatCurrency(periodSales)} sales)
            </p>
          </div>
        </div>

        {/* Pending Customer Udhaar */}
        <div
          onClick={() => setActiveView('khata')}
          className="p-3.5 sm:p-4.5 rounded-2xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-xs space-y-1.5 cursor-pointer hover:border-[#FDCB6E] transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider truncate">
              Customer Dues (Khata)
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#FDCB6E]/15 text-[#E1A73E] group-hover:scale-105 transition shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-2xl font-bold text-[#E1A73E] dark:text-[#FDCB6E] truncate">
              {formatCurrency(analytics.pendingPayments)}
            </p>
            <p className="text-[10px] sm:text-xs text-[#0984E3] dark:text-[#00CEC9] font-medium flex items-center gap-0.5 truncate">
              Open Khata register <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
        </div>

        {/* Low Stock Alert Card */}
        <div
          onClick={() => setActiveView('inventory')}
          className="p-3.5 sm:p-4.5 rounded-2xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-xs space-y-1.5 cursor-pointer hover:border-[#D63031] transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider truncate">
              Stock Health
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#D63031]/10 text-[#D63031] group-hover:scale-105 transition shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-lg sm:text-2xl font-bold text-[#D63031] truncate">
              {analytics.lowStockCount} items low
            </p>
            <p className="text-[10px] sm:text-xs text-[#636E72] dark:text-[#B2BEC3] truncate">
              Total stock: <span className="font-semibold text-[#2D3436] dark:text-white">{formatCurrency(analytics.totalStockValue)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* AI Business Insights Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E272E] border border-[#00CEC9]/40 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#00CEC9] text-[#1E272E] shadow-xs shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0984E3] dark:text-[#00CEC9] uppercase tracking-wider flex items-center gap-1.5">
              Goldnifi AI Insights <span className="text-[10px] text-[#636E72] dark:text-[#B2BEC3] font-normal">• Powered by GOLDEN BAZAAR</span>
            </h4>
            <div className="text-xs sm:text-sm text-[#2D3436] dark:text-[#F5F6FA] space-y-1 mt-1">
              <p>
                • Your sales this month stand at{' '}
                <span className="font-bold text-[#2D3436] dark:text-white">
                  {formatCurrency(analytics.salesThisMonth)}
                </span>
                . Top product by revenue:{' '}
                <span className="font-bold text-[#0984E3] dark:text-[#00CEC9]">
                  {analytics.topProducts[0]?.name || 'N/A'}
                </span>
                .
              </p>
              {analytics.lowStockCount > 0 && (
                <p>
                  • <span className="font-bold text-[#D63031]">{analytics.lowStockCount} items</span> are
                  below minimum safety stock level. Fast restock recommended.
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveView('ai_assistant')}
          className="h-10 px-4 text-xs sm:text-sm font-semibold text-[#0984E3] dark:text-[#00CEC9] bg-[#F5F6FA] dark:bg-[#202B33] hover:bg-[#00CEC9]/15 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] transition shrink-0 active:scale-95 cursor-pointer"
        >
          Ask Goldnifi AI →
        </button>
      </div>

      {/* Analytics Charts & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Sales Trend Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#2F3E46] border border-[#DFE6E9] dark:border-[#485460] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#2D3436] dark:text-white">
                Sales Trend (Past 7 Days)
              </h3>
              <p className="text-xs text-[#636E72] dark:text-[#B2BEC3]">Daily gross revenue</p>
            </div>
            <span className="text-xs font-bold text-[#0984E3] dark:text-[#00CEC9]">
              Total: {formatCurrency(analytics.salesTrend7D.reduce((s, i) => s + i.amount, 0))}
            </span>
          </div>

          {/* Clean SVG/CSS Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-[#DFE6E9] dark:border-[#485460]">
            {analytics.salesTrend7D.map((item, idx) => {
              const heightPct = Math.max(8, Math.round((item.amount / maxSales) * 100));
              const isToday = idx === 6;
              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-[#636E72] opacity-0 group-hover:opacity-100 transition duration-150">
                    {formatCurrency(item.amount, false)}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                      isToday
                        ? 'bg-[#0984E3] shadow-md shadow-[#0984E3]/20'
                        : 'bg-[#74B9FF]/40 dark:bg-[#26343D] group-hover:bg-[#74B9FF]'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium ${
                      isToday ? 'font-bold text-[#0984E3] dark:text-[#00CEC9]' : 'text-[#636E72] dark:text-[#B2BEC3]'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#2F3E46] border border-[#DFE6E9] dark:border-[#485460] shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#2D3436] dark:text-white">
              Payment Methods
            </h3>
            <p className="text-xs text-[#636E72] dark:text-[#B2BEC3]">Breakdown of collections</p>
          </div>

          <div className="space-y-3">
            {analytics.paymentBreakdown.map((pm) => {
              const totalCol = analytics.paymentBreakdown.reduce((s, i) => s + i.amount, 0) || 1;
              const pct = Math.round((pm.amount / totalCol) * 100);
              return (
                <div key={pm.method} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#2D3436] dark:text-[#F5F6FA]">
                      {pm.label}
                    </span>
                    <span className="font-bold text-[#2D3436] dark:text-white">
                      {formatCurrency(pm.amount)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F5F6FA] dark:bg-[#26343D] h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${
                        pm.method === 'upi'
                          ? 'bg-[#00B894]'
                          : pm.method === 'cash'
                          ? 'bg-[#0984E3]'
                          : pm.method === 'credit'
                          ? 'bg-[#FDCB6E]'
                          : 'bg-[#74B9FF]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#2F3E46] border border-[#DFE6E9] dark:border-[#485460] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2D3436] dark:text-white">
              Recent Sales & Invoices
            </h3>
            <p className="text-xs text-[#636E72] dark:text-[#B2BEC3]">Click any invoice to view, print or share</p>
          </div>
          <button
            onClick={() => setActiveView('invoices')}
            className="text-xs font-semibold text-[#0984E3] dark:text-[#00CEC9] hover:underline flex items-center gap-1"
          >
            View All Sales ({invoices.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-xs text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-[#DFE6E9] dark:border-[#485460] bg-[#F5F6FA] dark:bg-[#26343D] text-[11px] font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider">
                <th className="py-2.5 px-3">Invoice No</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Payment</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE6E9] dark:divide-[#485460]">
              {(periodInvoices.length > 0 ? periodInvoices : invoices).slice(0, 6).map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setSelectedInvoiceForPrint(inv)}
                  className="hover:bg-[#F5F6FA] dark:hover:bg-[#26343D] cursor-pointer transition"
                >
                  <td className="py-3 px-3 font-mono font-bold text-[#0984E3] dark:text-[#00CEC9]">
                    {inv.invoiceNo}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-[#2D3436] dark:text-white">{inv.customerName}</p>
                    {inv.customerPhone && (
                      <p className="text-[10px] text-[#636E72] dark:text-[#B2BEC3]">{inv.customerPhone}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[#636E72] dark:text-[#B2BEC3]">{formatDate(inv.invoiceDate, true)}</td>
                  <td className="py-3 px-3 text-right font-black text-[#2D3436] dark:text-white">
                    {formatCurrency(inv.grandTotal)}
                  </td>
                  <td className="py-3 px-3 text-center uppercase font-mono text-[10px] text-[#636E72] dark:text-[#B2BEC3]">
                    {inv.paymentMethod}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        inv.paymentStatus === 'paid'
                          ? 'bg-[#00B894]/15 text-[#00B894]'
                          : inv.paymentStatus === 'partially_paid'
                          ? 'bg-[#FDCB6E]/20 text-[#E1A73E] dark:text-[#FDCB6E]'
                          : inv.paymentStatus === 'cancelled'
                          ? 'bg-[#D63031]/15 text-[#D63031]'
                          : 'bg-[#0984E3]/15 text-[#0984E3] dark:text-[#00CEC9]'
                      }`}
                    >
                      {inv.paymentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceForPrint(inv);
                      }}
                      className="p-1.5 text-[#636E72] hover:text-[#0984E3] hover:bg-[#F5F6FA] dark:hover:bg-[#26343D] rounded-lg transition"
                      title="Print / View"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
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
