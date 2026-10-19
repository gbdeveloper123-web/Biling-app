import React, { useState } from 'react';
import {
  CircleDollarSign,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  Calendar,
} from 'lucide-react';
import { PaymentRecord } from '../../../types/superAdmin';
import { formatCurrency } from '../../../utils/formatters';

interface PaymentsRevenueTabProps {
  payments: PaymentRecord[];
  onRefundPayment?: (paymentId: string) => void;
}

export const PaymentsRevenueTab: React.FC<PaymentsRevenueTabProps> = ({
  payments,
  onRefundPayment,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.businessName.toLowerCase().includes(q) ||
      p.gatewayTransactionId.toLowerCase().includes(q) ||
      p.invoiceNumber.toLowerCase().includes(q) ||
      p.userEmail.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-emerald-400" />
            <span>SaaS Payments & Gateway Ledger</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time incoming subscription transactions via Razorpay, UPI AutoPay, and Card mandates.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-400">
          Transactions: <span className="text-white">{filtered.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#16202A] border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name, transaction ID, invoice number, or email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Payment Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#16202A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#111822] text-slate-400 uppercase font-semibold tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Txn ID & Invoice</th>
                <th className="py-3 px-3.5">Business</th>
                <th className="py-3 px-3.5">Plan</th>
                <th className="py-3 px-3.5">Amount</th>
                <th className="py-3 px-3.5">Gateway</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3.5">
                    <div className="font-mono font-bold text-white text-[11px]">
                      {p.gatewayTransactionId}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.invoiceNumber}</div>
                  </td>

                  <td className="py-3 px-3.5">
                    <div className="font-bold text-white">{p.businessName}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                      {p.userEmail}
                    </div>
                  </td>

                  <td className="py-3 px-3.5 font-bold uppercase text-sky-400">{p.plan}</td>

                  <td className="py-3 px-3.5 font-mono font-bold text-emerald-400 text-sm">
                    {formatCurrency(p.amount)}
                  </td>

                  <td className="py-3 px-3.5 font-medium text-slate-300">{p.gateway}</td>

                  <td className="py-3 px-3.5">
                    {p.status === 'success' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Paid
                      </span>
                    )}
                    {p.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
                        <AlertTriangle className="w-3 h-3" /> Failed
                      </span>
                    )}
                    {p.status === 'refunded' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                        Refunded
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
                    {new Date(p.date).toLocaleDateString('en-IN')}
                  </td>

                  <td className="py-3 px-3.5 text-center">
                    <button
                      onClick={() => alert(`Downloading official tax receipt ${p.invoiceNumber}...`)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Download Tax Invoice"
                    >
                      <Download className="w-3.5 h-3.5" />
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
