import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  FileText,
  Package,
  Users,
  Building2,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { useShop, AppView } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { products, customers, suppliers, invoices, setActiveView, setSelectedInvoiceForPrint } =
    useShop();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search results
  const matchedProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : [];

  const matchedCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.gstin && c.gstin.toLowerCase().includes(q))
      )
    : [];

  const matchedSuppliers = q
    ? suppliers.filter(
        (s) =>
          s.businessName.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          (s.gstin && s.gstin.toLowerCase().includes(q))
      )
    : [];

  const matchedInvoices = q
    ? invoices.filter(
        (i) =>
          i.invoiceNo.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          (i.customerPhone && i.customerPhone.includes(q))
      )
    : [];

  const hasResults =
    matchedProducts.length > 0 ||
    matchedCustomers.length > 0 ||
    matchedSuppliers.length > 0 ||
    matchedInvoices.length > 0;

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 bg-[#1E272E]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E272E] rounded-2xl shadow-2xl border border-[#DFE6E9] dark:border-[#485460] overflow-hidden flex flex-col max-h-[80vh] animate-modal-pop">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#DFE6E9] dark:border-[#485460] bg-[#F5F6FA] dark:bg-[#26343D]">
          <Search className="w-5 h-5 text-[#0984E3] dark:text-[#00CEC9] mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search products, invoices, customers, suppliers... (e.g. Rahul, T-Shirt, 1041)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#2D3436] dark:text-[#F5F6FA] placeholder:text-[#636E72] dark:placeholder:text-[#B2BEC3] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#636E72] hover:text-[#2D3436] dark:hover:text-[#F5F6FA] mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono text-[#636E72] dark:text-[#B2BEC3] border border-[#DFE6E9] dark:border-[#485460] px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="py-8 text-center text-[#636E72] dark:text-[#B2BEC3]">
              <Sparkles className="w-8 h-8 mx-auto text-[#00CEC9] mb-2" />
              <p className="text-xs font-medium">Type any keyword to search across your whole business</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-[11px]">
                {['Rahul', 'Fast Charger', 'INV-1041', 'Electronics', 'Clothing'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setQuery(sug)}
                    className="px-2.5 py-1 bg-[#F5F6FA] dark:bg-[#26343D] text-[#2D3436] dark:text-[#F5F6FA] border border-[#DFE6E9] dark:border-[#485460] rounded-lg hover:border-[#0984E3] hover:text-[#0984E3] transition"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-10 text-center text-[#636E72] dark:text-[#B2BEC3]">
              <p className="text-sm font-semibold text-[#2D3436] dark:text-[#F5F6FA]">No records found</p>
              <p className="text-xs mt-1">No matching products, invoices, or customers for "{query}"</p>
            </div>
          ) : (
            <>
              {/* Invoices */}
              {matchedInvoices.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#0984E3]" /> Invoices ({matchedInvoices.length})
                    </span>
                    <button
                      onClick={() => handleNavigate('invoices')}
                      className="text-[#0984E3] dark:text-[#00CEC9] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      View All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {matchedInvoices.slice(0, 4).map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          setSelectedInvoiceForPrint(inv);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#26343D] hover:bg-[#F5F6FA] dark:hover:bg-[#2F3E46] border border-[#DFE6E9] dark:border-[#485460] flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                            #{inv.invoiceNo} — {inv.customerName}
                          </p>
                          <p className="text-[11px] text-[#636E72] dark:text-[#B2BEC3]">
                            {formatDate(inv.invoiceDate)} • {inv.items.length} items • {inv.paymentMethod.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                            {formatCurrency(inv.grandTotal)}
                          </p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#F5F6FA] dark:bg-[#2F3E46] text-[#2D3436] dark:text-[#F5F6FA] border border-[#DFE6E9] dark:border-[#485460]">
                            {inv.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#0984E3]" /> Products ({matchedProducts.length})
                    </span>
                    <button
                      onClick={() => handleNavigate('inventory')}
                      className="text-[#0984E3] dark:text-[#00CEC9] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Inventory <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {matchedProducts.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleNavigate('inventory')}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#26343D] hover:bg-[#F5F6FA] dark:hover:bg-[#2F3E46] border border-[#DFE6E9] dark:border-[#485460] flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">{p.name}</p>
                          <p className="text-[11px] text-[#636E72] dark:text-[#B2BEC3]">
                            SKU: {p.sku} | Barcode: {p.barcode} | Category: {p.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#0984E3] dark:text-[#00CEC9]">
                            {formatCurrency(p.sellingPrice)}
                          </p>
                          <p className="text-[10px] text-[#636E72] dark:text-[#B2BEC3]">Stock: {p.stock} units</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#636E72] dark:text-[#B2BEC3] uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#0984E3]" /> Customers ({matchedCustomers.length})
                    </span>
                    <button
                      onClick={() => handleNavigate('customers')}
                      className="text-[#0984E3] dark:text-[#00CEC9] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Customers <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {matchedCustomers.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleNavigate('khata')}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#26343D] hover:bg-[#F5F6FA] dark:hover:bg-[#2F3E46] border border-[#DFE6E9] dark:border-[#485460] flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">{c.name}</p>
                          <p className="text-[11px] text-[#636E72] dark:text-[#B2BEC3]">
                            Phone: {c.phone} {c.city ? `• ${c.city}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          {c.outstandingBalance > 0 ? (
                            <p className="text-xs font-bold text-[#D63031]">
                              Owes {formatCurrency(c.outstandingBalance)}
                            </p>
                          ) : (
                            <p className="text-xs font-medium text-[#00B894]">Clear</p>
                          )}
                          <p className="text-[10px] text-[#636E72] dark:text-[#B2BEC3]">
                            Total: {formatCurrency(c.totalPurchases)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
