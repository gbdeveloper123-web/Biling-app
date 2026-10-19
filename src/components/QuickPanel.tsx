import React from 'react';
import {
  Plus,
  AlertTriangle,
  CreditCard,
  History,
  FilePlus,
  PackagePlus,
  UserPlus,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Share2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate, generateWhatsAppKhataReminderUrl } from '../utils/formatters';

interface Props {
  onOpenQuickAdd: () => void;
  onOpenAddProduct: () => void;
}

export const QuickPanel: React.FC<Props> = ({ onOpenQuickAdd, onOpenAddProduct }) => {
  const { analytics, activityLogs, setActiveView, business, customers } = useShop();

  // Top pending debtor for 1-click WhatsApp reminder
  const topDebtor = customers
    .filter((c) => c.outstandingBalance > 0)
    .sort((a, b) => b.outstandingBalance - a.outstandingBalance)[0];

  const reminderUrl = topDebtor
    ? generateWhatsAppKhataReminderUrl(
        topDebtor.phone,
        topDebtor.name,
        topDebtor.outstandingBalance,
        business.name,
        business.upiId
      )
    : null;

  return (
    <aside className="w-80 shrink-0 border-l border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-[#F5F6FA] hidden xl:flex flex-col h-full overflow-y-auto p-4 space-y-5 print:hidden">
      {/* 1. Quick Actions Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#636E72] dark:text-[#B2BEC3] mb-2.5">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveView('billing')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0984E3]/10 hover:bg-[#0984E3]/20 border border-[#0984E3]/30 text-left transition group active:scale-95"
          >
            <div className="p-1.5 rounded-lg bg-[#0984E3] text-white shadow-2xs">
              <FilePlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#2D3436] dark:text-white group-hover:text-[#0984E3]">
                New Invoice
              </p>
              <p className="text-[9px] text-[#636E72] dark:text-[#B2BEC3]">Fast POS bill</p>
            </div>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#00CEC9]/10 hover:bg-[#00CEC9]/20 border border-[#00CEC9]/30 text-left transition group active:scale-95"
          >
            <div className="p-1.5 rounded-lg bg-[#00CEC9] text-[#1E272E] shadow-2xs">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#2D3436] dark:text-white group-hover:text-[#00CEC9]">
                Add Product
              </p>
              <p className="text-[9px] text-[#636E72] dark:text-[#B2BEC3]">With AI</p>
            </div>
          </button>

          <button
            onClick={() => setActiveView('khata')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FDCB6E]/15 hover:bg-[#FDCB6E]/25 border border-[#FDCB6E]/40 text-left transition group active:scale-95"
          >
            <div className="p-1.5 rounded-lg bg-[#FDCB6E] text-[#1E272E] shadow-2xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#2D3436] dark:text-white group-hover:text-[#E1A73E]">
                Receive Due
              </p>
              <p className="text-[9px] text-[#636E72] dark:text-[#B2BEC3]">Khata payment</p>
            </div>
          </button>

          <button
            onClick={() => setActiveView('purchases')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-[#74B9FF]/15 hover:bg-[#74B9FF]/25 border border-[#74B9FF]/40 text-left transition group active:scale-95"
          >
            <div className="p-1.5 rounded-lg bg-[#74B9FF] text-[#1E272E] shadow-2xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#2D3436] dark:text-white group-hover:text-[#0984E3]">
                Add Purchase
              </p>
              <p className="text-[9px] text-[#636E72] dark:text-[#B2BEC3]">Stock in</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Low Stock Alerts Card */}
      <div className="p-3.5 rounded-2xl bg-[#D63031]/10 border border-[#D63031]/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#D63031] text-white">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-[#D63031] dark:text-[#D63031]">
              Low Stock Alert
            </h4>
          </div>
          <span className="text-xs font-black text-[#D63031]">
            {analytics.lowStockCount} items
          </span>
        </div>

        {analytics.lowStockCount > 0 ? (
          <div className="space-y-1.5 mb-3">
            {analytics.lowStockProducts.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-[11px] bg-white dark:bg-[#2F3E46] p-2 rounded-lg border border-[#D63031]/20"
              >
                <span className="font-semibold text-[#2D3436] dark:text-[#F5F6FA] truncate max-w-[130px]">
                  {item.name}
                </span>
                <span className="font-mono text-[#D63031] font-bold">
                  {item.stock} left (min {item.minStockLevel})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-[#D63031] mb-2">
            All inventory units are above minimum threshold.
          </p>
        )}

        <button
          onClick={() => setActiveView('inventory')}
          className="w-full py-1.5 px-2.5 text-[11px] font-bold text-[#D63031] hover:bg-[#D63031]/15 rounded-lg flex items-center justify-center gap-1 transition"
        >
          View Inventory & Reorder <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. Pending Payments (Khata Dues) */}
      <div className="p-3.5 rounded-2xl bg-[#FDCB6E]/15 border border-[#FDCB6E]/40">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-xs font-bold text-[#2D3436] dark:text-[#FDCB6E]">
            Pending Customer Udhaar
          </h4>
          <span className="text-xs font-black text-[#E1A73E] dark:text-[#FDCB6E]">
            {formatCurrency(analytics.pendingPayments)}
          </span>
        </div>
        <p className="text-[11px] text-[#636E72] dark:text-[#B2BEC3] mb-3">
          Outstanding ledger balance across customers.
        </p>

        {topDebtor && reminderUrl && (
          <div className="p-2.5 bg-white dark:bg-[#2F3E46] rounded-xl border border-[#FDCB6E]/40 mb-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-[#2D3436] dark:text-[#F5F6FA] truncate">
                {topDebtor.name}
              </span>
              <span className="font-bold text-[#D63031] font-mono">
                {formatCurrency(topDebtor.outstandingBalance)}
              </span>
            </div>
            <a
              href={reminderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-1 text-[10px] font-bold text-white bg-[#00B894] hover:bg-[#009879] rounded-lg transition"
            >
              <Share2 className="w-3 h-3" /> Send WhatsApp Reminder
            </a>
          </div>
        )}

        <button
          onClick={() => setActiveView('khata')}
          className="w-full py-1.5 px-2.5 text-[11px] font-bold text-[#2D3436] dark:text-[#FDCB6E] hover:bg-[#FDCB6E]/20 rounded-lg flex items-center justify-center gap-1 transition"
        >
          View Full Digital Khata <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 4. Recent Activity Feed */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#636E72] dark:text-[#B2BEC3] flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Recent Activity
          </h3>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
          {activityLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="p-2 rounded-xl bg-[#F5F6FA] dark:bg-[#26343D] border border-[#DFE6E9] dark:border-[#485460] text-[11px] space-y-0.5"
            >
              <div className="flex items-center justify-between text-[#636E72] dark:text-[#B2BEC3] text-[9px]">
                <span className="font-semibold text-[#0984E3] dark:text-[#00CEC9]">
                  {log.staffName} ({log.role})
                </span>
                <span>{formatDate(log.timestamp, true)}</span>
              </div>
              <p className="font-bold text-[#2D3436] dark:text-[#F5F6FA] leading-tight">
                {log.action}
              </p>
              <p className="text-[#636E72] dark:text-[#B2BEC3] text-[10px] truncate">
                {log.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
