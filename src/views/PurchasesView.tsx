import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Building,
  CheckCircle,
  Search,
  DollarSign,
  Package,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Check,
  CreditCard,
  FileText,
  Printer,
  X,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { Purchase, PurchaseItem, Supplier, Product, DiscountMode } from '../types';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { DateRangeFilter, INITIAL_DATE_RANGE, DateRangeState, matchesDateRange } from '../components/DateRangeFilter';
import { DiscountModeSelector } from '../components/DiscountModeSelector';
import { roundMoney } from '../utils/billingCalculator';

type PurchaseStep = 1 | 2 | 3 | 4;

export const PurchasesView: React.FC = () => {
  const {
    purchases,
    suppliers,
    products,
    addPurchase,
    addSupplier,
    addProduct,
    business,
  } = useShop();

  // Mode: 'history' (Default list) | 'create_workflow' (4-step entry)
  const [viewMode, setViewMode] = useState<'history' | 'create_workflow'>('history');
  const [currentStep, setCurrentStep] = useState<PurchaseStep>(1);

  // Filters for History Page
  const [dateFilter, setDateFilter] = useState<DateRangeState>(INITIAL_DATE_RANGE);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Purchase Form State
  const [purchaseNo, setPurchaseNo] = useState(() => `PUR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partially_paid'>('paid');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash' | 'upi' | 'credit'>('bank_transfer');
  const [notes, setNotes] = useState('');

  // Step 1: Supplier Selection State
  const [supplierMode, setSupplierMode] = useState<'existing' | 'new'>('existing');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  
  // New Supplier form fields
  const [newSupName, setNewSupName] = useState('');
  const [newSupOwner, setNewSupOwner] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupGstin, setNewSupGstin] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('');
  const [newSupTerms, setNewSupTerms] = useState('15 Days');

  // Step 2: Purchase Line Items
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [productCatalogSearch, setProductCatalogSearch] = useState('');

  // Inline "Create New Product from Purchase" modal state
  const [isNewProdModalOpen, setIsNewProdModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('General');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('PCS');
  const [newProdPurchasePrice, setNewProdPurchasePrice] = useState<number | ''>('');
  const [newProdSellingPrice, setNewProdSellingPrice] = useState<number | ''>('');
  const [newProdMrp, setNewProdMrp] = useState<number | ''>('');
  const [newProdGstRate, setNewProdGstRate] = useState<number>(18);
  const [newProdHsn, setNewProdHsn] = useState('9983');

  // Success State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastSavedPurchase, setLastSavedPurchase] = useState<any>(null);

  // Active Supplier
  const activeSupplier = useMemo(() => {
    if (supplierMode === 'existing') {
      return suppliers.find((s: Supplier) => s.id === selectedSupplierId) || suppliers[0];
    }
    return {
      id: 'temp_sup',
      businessName: newSupName || 'New Supplier',
      ownerName: newSupOwner,
      phone: newSupPhone,
      email: newSupEmail,
      gstin: newSupGstin,
      address: newSupAddress,
      paymentTerms: newSupTerms,
      outstandingBalance: 0,
      totalPurchases: 0,
    };
  }, [supplierMode, selectedSupplierId, suppliers, newSupName, newSupOwner, newSupPhone, newSupEmail, newSupGstin, newSupAddress, newSupTerms]);

  // Step 3: Purchase Discounts & Additional Charges (Section 3.C)
  const [purchaseDiscountMode, setPurchaseDiscountMode] = useState<DiscountMode>('percentage');
  const [purchaseDiscountValue, setPurchaseDiscountValue] = useState<number | ''>(0);
  const [tradeDiscount, setTradeDiscount] = useState<number | ''>(0); // Supplier provided trade discount
  const [freightCharges, setFreightCharges] = useState<number | ''>(0);

  // Accurate, Decimal-Safe Purchase Calculation Engine (Section 3.C & Section 1)
  const purchaseCalc = useMemo(() => {
    // 1. Line items with item-level discount (Fixed ₹ or Percentage %)
    const computedItems = purchaseItems.map((item) => {
      const gross = roundMoney(item.purchasePrice * item.quantity);
      const discMode = item.discountMode || 'percentage';
      const discVal = Math.max(0, item.discountValue || 0);

      let discAmt = 0;
      if (discMode === 'percentage') {
        discAmt = roundMoney((gross * Math.min(100, discVal)) / 100);
      } else {
        discAmt = Math.min(gross, roundMoney(discVal));
      }

      const taxable = Math.max(0, roundMoney(gross - discAmt));
      const gstRate = Math.max(0, item.gstRate || 0);
      const tax = roundMoney((taxable * gstRate) / 100);
      const total = roundMoney(taxable + tax);

      return {
        ...item,
        grossAmount: gross,
        discountMode: discMode,
        discountValue: discVal,
        discountAmount: discAmt,
        taxableAmount: taxable,
        total,
      };
    });

    const grossSubtotal = roundMoney(computedItems.reduce((acc, i) => acc + (i.grossAmount || 0), 0));
    const itemDiscountsTotal = roundMoney(computedItems.reduce((acc, i) => acc + (i.discountAmount || 0), 0));
    const eligibleBaseForBillDisc = Math.max(0, roundMoney(grossSubtotal - itemDiscountsTotal));

    // 2. Additional Purchase Bill Discount
    const rawBillDiscVal = Math.max(0, Number(purchaseDiscountValue) || 0);
    let billDiscAmount = 0;
    if (purchaseDiscountMode === 'percentage') {
      billDiscAmount = roundMoney((eligibleBaseForBillDisc * Math.min(100, rawBillDiscVal)) / 100);
    } else {
      billDiscAmount = Math.min(eligibleBaseForBillDisc, roundMoney(rawBillDiscVal));
    }

    // 3. Trade discount (supplier trade deduction)
    const rawTradeDisc = Math.max(0, Number(tradeDiscount) || 0);
    const tradeDiscAmount = Math.min(Math.max(0, eligibleBaseForBillDisc - billDiscAmount), roundMoney(rawTradeDisc));

    const totalDiscount = roundMoney(itemDiscountsTotal + billDiscAmount + tradeDiscAmount);
    const taxableAmount = Math.max(0, roundMoney(grossSubtotal - totalDiscount));

    // 4. Inward GST (ITC)
    const taxAmount = roundMoney(
      computedItems.reduce((acc, i) => {
        const ratio = eligibleBaseForBillDisc > 0 ? (i.taxableAmount || 0) / eligibleBaseForBillDisc : 0;
        const netLine = Math.max(0, (i.taxableAmount || 0) - (billDiscAmount + tradeDiscAmount) * ratio);
        return acc + (netLine * (i.gstRate || 0)) / 100;
      }, 0)
    );

    const extraCharges = Math.max(0, roundMoney(Number(freightCharges) || 0));
    const exactGrandTotal = roundMoney(taxableAmount + taxAmount + extraCharges);
    const grandTotal = Math.round(exactGrandTotal);
    const roundOff = roundMoney(grandTotal - exactGrandTotal);

    const effectivePaid =
      paymentStatus === 'paid'
        ? grandTotal
        : paymentStatus === 'pending'
        ? 0
        : amountPaid !== ''
        ? Math.min(grandTotal, Number(amountPaid))
        : 0;

    const balanceDue = Math.max(0, roundMoney(grandTotal - effectivePaid));

    return {
      computedItems,
      grossSubtotal,
      itemDiscountsTotal,
      eligibleBaseForBillDisc,
      billDiscAmount,
      tradeDiscAmount,
      totalDiscount,
      taxableAmount,
      taxAmount,
      freightCharges: extraCharges,
      roundOff,
      grandTotal,
      effectivePaid,
      balanceDue,
    };
  }, [purchaseItems, purchaseDiscountMode, purchaseDiscountValue, tradeDiscount, freightCharges, paymentStatus, amountPaid]);

  const subtotal = purchaseCalc.grossSubtotal;
  const taxAmount = purchaseCalc.taxAmount;
  const grandTotal = purchaseCalc.grandTotal;
  const effectivePaid = purchaseCalc.effectivePaid;
  const balanceDue = purchaseCalc.balanceDue;

  // Filtered History
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p: Purchase) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        p.purchaseNo.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q) ||
        (p.supplierGstin && p.supplierGstin.toLowerCase().includes(q));

      const matchesDate = matchesDateRange(p.date, dateFilter);
      const matchesSupplier = supplierFilter === 'all' || p.supplierId === supplierFilter;
      const matchesStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;

      return matchesSearch && matchesDate && matchesSupplier && matchesStatus;
    });
  }, [purchases, searchTerm, dateFilter, supplierFilter, statusFilter]);

  // History KPIs
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const todayPurchasesTotal = purchases
    .filter((p: Purchase) => p.date.startsWith(todayStr))
    .reduce((s: number, p: Purchase) => s + p.grandTotal, 0);

  const monthPurchasesTotal = purchases
    .filter((p: Purchase) => p.date.startsWith(currentMonthStr))
    .reduce((s: number, p: Purchase) => s + p.grandTotal, 0);

  const pendingSupplierPayments = suppliers.reduce((s: number, sup: Supplier) => s + (sup.outstandingBalance || 0), 0);
  const totalPurchaseValueAllTime = purchases.reduce((s: number, p: Purchase) => s + p.grandTotal, 0);

  // Cart operations
  const addExistingProductToPurchase = (prod: Product) => {
    const existingIndex = purchaseItems.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      updatePurchaseItemQty(existingIndex, purchaseItems[existingIndex].quantity + 1);
    } else {
      const pPrice = prod.purchasePrice || Math.round(prod.sellingPrice * 0.7);
      const gst = prod.gstRate || 18;
      const raw = roundMoney(pPrice * 1);
      const tax = roundMoney((raw * gst) / 100);
      const newItem: PurchaseItem = {
        id: 'pitem_' + Date.now() + Math.random(),
        productId: prod.id,
        productName: prod.name,
        quantity: 1,
        unit: prod.unit,
        purchasePrice: pPrice,
        grossAmount: raw,
        discountMode: 'percentage',
        discountValue: 0,
        discountAmount: 0,
        taxableAmount: raw,
        gstRate: gst,
        total: roundMoney(raw + tax),
      };
      setPurchaseItems((prev) => [...prev, newItem]);
    }
  };

  const updatePurchaseItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removePurchaseItem(index);
      return;
    }
    setPurchaseItems((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      const raw = roundMoney(cur.purchasePrice * newQty);
      const discMode = cur.discountMode || 'percentage';
      const discVal = cur.discountValue || 0;
      const discAmt = discMode === 'percentage' ? roundMoney((raw * Math.min(100, discVal)) / 100) : Math.min(raw, roundMoney(discVal));
      const taxable = Math.max(0, roundMoney(raw - discAmt));
      const tax = roundMoney((taxable * cur.gstRate) / 100);
      copy[index] = {
        ...cur,
        quantity: newQty,
        grossAmount: raw,
        discountAmount: discAmt,
        taxableAmount: taxable,
        total: roundMoney(taxable + tax),
      };
      return copy;
    });
  };

  const updatePurchaseItemRate = (index: number, newPrice: number) => {
    setPurchaseItems((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      const cleanPrice = Math.max(0, newPrice);
      const raw = roundMoney(cleanPrice * cur.quantity);
      const discMode = cur.discountMode || 'percentage';
      const discVal = cur.discountValue || 0;
      const discAmt = discMode === 'percentage' ? roundMoney((raw * Math.min(100, discVal)) / 100) : Math.min(raw, roundMoney(discVal));
      const taxable = Math.max(0, roundMoney(raw - discAmt));
      const tax = roundMoney((taxable * cur.gstRate) / 100);
      copy[index] = {
        ...cur,
        purchasePrice: cleanPrice,
        grossAmount: raw,
        discountAmount: discAmt,
        taxableAmount: taxable,
        total: roundMoney(taxable + tax),
      };
      return copy;
    });
  };

  const updatePurchaseItemDiscountMode = (index: number, newMode: DiscountMode) => {
    setPurchaseItems((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      const lineGross = cur.purchasePrice * cur.quantity;
      let newVal = cur.discountValue ?? 0;
      if (newMode === 'percentage' && newVal > 100) newVal = 10;
      if (newMode === 'fixed' && newVal > lineGross) newVal = lineGross;
      copy[index] = {
        ...cur,
        discountMode: newMode,
        discountValue: newVal,
      };
      return copy;
    });
  };

  const updatePurchaseItemDiscountValue = (index: number, val: number) => {
    setPurchaseItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        discountValue: Math.max(0, val),
      };
      return copy;
    });
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Add New Supplier
  const handleCreateSupplierInline = () => {
    if (!newSupName.trim() || !newSupPhone.trim()) {
      alert('Please enter supplier name and phone.');
      return;
    }
    const created = addSupplier({
      businessName: newSupName.trim(),
      ownerName: newSupOwner.trim() || undefined,
      phone: newSupPhone.trim(),
      email: newSupEmail.trim() || undefined,
      gstin: newSupGstin.trim().toUpperCase() || undefined,
      address: newSupAddress.trim() || undefined,
      paymentTerms: newSupTerms || '15 Days',
      outstandingBalance: 0,
      totalPurchases: 0,
    });
    setSelectedSupplierId(created.id);
    setSupplierMode('existing');
  };

  // Create New Product from Purchase
  const handleCreateProductFromPurchase = () => {
    if (!newProdName.trim() || !newProdPurchasePrice || !newProdSellingPrice) {
      alert('Please provide product name, purchase price, and selling price.');
      return;
    }

    const pPrice = Number(newProdPurchasePrice);
    const sPrice = Number(newProdSellingPrice);
    const mrp = newProdMrp ? Number(newProdMrp) : Math.round(sPrice * 1.2);

    const createdProd = addProduct({
      name: newProdName.trim(),
      sku: newProdSku.trim() || 'SKU-' + Date.now().toString().slice(-4),
      barcode: newProdBarcode.trim() || '890' + Date.now().toString().slice(-9),
      category: newProdCategory || 'General',
      brand: newProdBrand.trim() || undefined,
      unit: newProdUnit,
      purchasePrice: pPrice,
      sellingPrice: sPrice,
      mrp,
      stock: 0, // will be increased when purchase is finalized
      openingStock: 0,
      minStockLevel: 5,
      gstRate: newProdGstRate,
      hsnCode: newProdHsn || '9983',
      supplierId: activeSupplier?.id,
      supplierName: activeSupplier?.businessName,
      supplierHistory: activeSupplier?.id
        ? [
            {
              supplierId: activeSupplier.id,
              supplierName: activeSupplier.businessName,
              purchasePrice: pPrice,
              lastPurchaseDate: new Date().toISOString(),
              isPrimary: true,
            },
          ]
        : [],
      images: [],
      status: 'in_stock',
    });

    addExistingProductToPurchase(createdProd);
    setIsNewProdModalOpen(false);
    setNewProdName('');
    setNewProdPurchasePrice('');
    setNewProdSellingPrice('');
  };

  // Save Purchase Final Process
  const handleSaveFinalPurchase = () => {
    if (purchaseItems.length === 0) {
      alert('Please add at least one purchased product.');
      return;
    }

    let supId = selectedSupplierId;
    let supName = activeSupplier?.businessName || 'Supplier';
    let supGstin = activeSupplier?.gstin || '';

    if (supplierMode === 'new') {
      if (!newSupName.trim() || !newSupPhone.trim()) {
        alert('Please complete supplier information.');
        return;
      }
      const createdSup = addSupplier({
        businessName: newSupName.trim(),
        ownerName: newSupOwner.trim() || undefined,
        phone: newSupPhone.trim(),
        email: newSupEmail.trim() || undefined,
        gstin: newSupGstin.trim().toUpperCase() || undefined,
        address: newSupAddress.trim() || undefined,
        paymentTerms: newSupTerms || '15 Days',
        outstandingBalance: 0,
        totalPurchases: 0,
      });
      supId = createdSup.id;
      supName = createdSup.businessName;
      supGstin = createdSup.gstin || '';
    }

    try {
      const saved = addPurchase({
        purchaseNo,
        supplierId: supId,
        supplierName: supName,
        supplierGstin: supGstin,
        date: new Date(purchaseDate).toISOString(),
        items: purchaseCalc.computedItems,
        subtotal: purchaseCalc.grossSubtotal,
        itemDiscountTotal: purchaseCalc.itemDiscountsTotal,
        billDiscountMode: purchaseDiscountMode,
        billDiscountValue: Number(purchaseDiscountValue) || 0,
        billDiscountAmount: purchaseCalc.billDiscAmount,
        discount: purchaseCalc.totalDiscount,
        taxableAmount: purchaseCalc.taxableAmount,
        taxAmount: purchaseCalc.taxAmount,
        otherCharges: purchaseCalc.freightCharges,
        roundOff: purchaseCalc.roundOff,
        grandTotal: purchaseCalc.grandTotal,
        paymentStatus,
        paymentMethod,
        amountPaid: purchaseCalc.effectivePaid,
        balanceDue: purchaseCalc.balanceDue,
        notes,
      });

      setLastSavedPurchase(saved);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      alert('Failed to save purchase bill: ' + (err.message || 'Unknown error'));
    }
  };

  const handleResetForNewPurchase = () => {
    setPurchaseItems([]);
    setPurchaseDiscountMode('percentage');
    setPurchaseDiscountValue(0);
    setTradeDiscount(0);
    setFreightCharges(0);
    setSupplierMode('existing');
    setPaymentStatus('paid');
    setAmountPaid('');
    setNotes('');
    setPurchaseNo(`PUR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);
    setCurrentStep(1);
    setIsSuccessModalOpen(false);
    setLastSavedPurchase(null);
  };

  // Steps configuration
  const stepsConfig = [
    { num: 1, label: 'Supplier', icon: Building },
    { num: 2, label: 'Products', icon: Package },
    { num: 3, label: 'Purchase Summary', icon: CreditCard },
    { num: 4, label: 'Review & Save', icon: CheckCircle },
  ];

  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* ========================================================================= */}
      {/* 1. PURCHASE BILLS MAIN PAGE (HISTORY & TELEMETRY) */}
      {/* ========================================================================= */}
      {viewMode === 'history' && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E272E] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 dark:text-blue-400" />
                <span>Purchases & Vendor Bills</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage inward inventory procurement, supplier ledger payables, and GSTR-2B purchase input tax.
              </p>
            </div>

            <button
              onClick={() => {
                setViewMode('create_workflow');
                setCurrentStep(1);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Purchase Bill</span>
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Today's Purchases
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(todayPurchasesTotal)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Inward stock value today</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                This Month's Inward
              </span>
              <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {formatCurrency(monthPurchasesTotal)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Current fiscal cycle</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] shadow-xs">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Pending Supplier Dues
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(pendingSupplierPayments)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Accounts payable balance</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Purchase Value
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(totalPurchaseValueAllTime)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">All-time procurement</p>
            </div>
          </div>

          {/* Filter Bar with DateRangeFilter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <DateRangeFilter value={dateFilter} onChange={setDateFilter} />

              <div className="flex items-center gap-2">
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="py-1.5 px-3 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-[#2A3642] rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="all">All Suppliers</option>
                  {suppliers.map((s: Supplier) => (
                    <option key={s.id} value={s.id}>
                      {s.businessName}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1.5 px-3 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-[#2A3642] rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="partially_paid">Partial</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search purchase bills by bill number, vendor name, or GSTIN..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-[#2A3642] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Purchases History Table */}
          <div className="bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-[#12181F] text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-[#2A3642]">
                  <tr>
                    <th className="py-3 px-3.5">Bill No. & Date</th>
                    <th className="py-3 px-3.5">Supplier & GSTIN</th>
                    <th className="py-3 px-3.5 text-center">Items Count</th>
                    <th className="py-3 px-3.5 text-right">Taxable</th>
                    <th className="py-3 px-3.5 text-right">Grand Total</th>
                    <th className="py-3 px-3.5">Payment Status</th>
                    <th className="py-3 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No purchase bills found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((pur: Purchase) => (
                      <tr key={pur.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3.5">
                          <span className="font-bold font-mono text-slate-900 dark:text-white">
                            {pur.purchaseNo}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {formatDate(pur.date)}
                          </div>
                        </td>

                        <td className="py-3 px-3.5">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {pur.supplierName}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {pur.supplierGstin || 'Unregistered'}
                          </div>
                        </td>

                        <td className="py-3 px-3.5 text-center font-bold font-mono text-slate-600 dark:text-slate-400">
                          {pur.items.length} Items
                        </td>

                        <td className="py-3 px-3.5 text-right font-mono text-slate-600 dark:text-slate-400">
                          {formatCurrency(pur.subtotal)}
                        </td>

                        <td className="py-3 px-3.5 text-right font-mono font-black text-slate-900 dark:text-white">
                          {formatCurrency(pur.grandTotal)}
                        </td>

                        <td className="py-3 px-3.5">
                          {pur.paymentStatus === 'paid' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-3 h-3" /> Paid
                            </span>
                          )}
                          {pur.paymentStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                              Pending (₹{pur.balanceDue})
                            </span>
                          )}
                          {pur.paymentStatus === 'partially_paid' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              Partial (Due: ₹{pur.balanceDue})
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3.5 text-center">
                          <button
                            onClick={() => alert(`Viewing purchase bill ${pur.purchaseNo}`)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            title="View Inward Bill"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DEDICATED 4-STEP PURCHASE WORKFLOW */}
      {/* ========================================================================= */}
      {viewMode === 'create_workflow' && (
        <div className="space-y-5">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E272E] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 dark:text-blue-400" />
                <span>New Purchase Bill Entry</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Inward procurement workflow with automated inventory stock addition and vendor dues tracking.
              </p>
            </div>

            <button
              onClick={() => setViewMode('history')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer self-start sm:self-auto"
            >
              Exit to Purchase History
            </button>
          </div>

          {/* HORIZONTAL STEPPER */}
          <div className="bg-white dark:bg-[#1E272E] p-4 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs">
            <div className="grid grid-cols-4 items-center relative">
              <div className="absolute left-[12.5%] right-[12.5%] top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
              <div
                className="absolute left-[12.5%] top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-300 ease-in-out -z-0"
                style={{
                  width:
                    currentStep === 1
                      ? '0%'
                      : currentStep === 2
                      ? '25%'
                      : currentStep === 3
                      ? '50%'
                      : '75%',
                }}
              />

              {stepsConfig.map((s) => {
                const isCompleted = currentStep > s.num;
                const isCurrent = currentStep === s.num;
                const Icon = s.icon;

                return (
                  <div
                    key={s.num}
                    onClick={() => {
                      if (s.num < currentStep) setCurrentStep(s.num as PurchaseStep);
                    }}
                    className={`flex flex-col items-center relative z-10 ${
                      s.num < currentStep ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-md shadow-blue-500/20 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                    </div>

                    <span
                      className={`text-[11px] sm:text-xs font-bold mt-1.5 text-center ${
                        isCurrent
                          ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                          : isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 1: SELECT SUPPLIER */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-[#1E272E] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span>Step 1: Select Supplier / Distributor</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Select an existing registered vendor or add a new supplier profile.
                </p>
              </div>

              {/* Mode Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSupplierMode('existing')}
                  className={`p-4 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    supplierMode === 'existing'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      Existing Registered Supplier
                    </span>
                    <span className="text-xs text-slate-500">
                      Choose from {suppliers.length} saved vendors and distributors.
                    </span>
                  </div>
                  {supplierMode === 'existing' && <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSupplierMode('new')}
                  className={`p-4 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    supplierMode === 'new'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-blue-600'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      Add New Supplier Profile
                    </span>
                    <span className="text-xs text-slate-500">
                      Record new vendor with GSTIN, address, and credit terms.
                    </span>
                  </div>
                  {supplierMode === 'new' && <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />}
                </button>
              </div>

              {/* Existing Suppliers List */}
              {supplierMode === 'existing' && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={supplierSearchQuery}
                      onChange={(e) => setSupplierSearchQuery(e.target.value)}
                      placeholder="Search supplier by company name, phone, or GSTIN..."
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto">
                    {suppliers
                      .filter((s: Supplier) => {
                        const q = supplierSearchQuery.toLowerCase();
                        return (
                          !q ||
                          s.businessName.toLowerCase().includes(q) ||
                          s.phone.includes(q) ||
                          (s.gstin && s.gstin.toLowerCase().includes(q))
                        );
                      })
                      .map((sup: Supplier) => {
                        const isSelected = selectedSupplierId === sup.id;
                        return (
                          <div
                            key={sup.id}
                            onClick={() => setSelectedSupplierId(sup.id)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-white font-medium ring-1 ring-blue-600'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E272E]'
                            }`}
                          >
                            <div className="font-bold text-sm truncate">{sup.businessName}</div>
                            <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                              {sup.phone} • {sup.gstin || 'No GSTIN'}
                            </div>
                            {sup.outstandingBalance > 0 && (
                              <div className="mt-1 text-[10px] text-amber-600 font-semibold">
                                Outstanding Due: ₹{sup.outstandingBalance}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Add New Supplier Inline Form */}
              {supplierMode === 'new' && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Supplier / Firm Name *
                      </label>
                      <input
                        type="text"
                        value={newSupName}
                        onChange={(e) => setNewSupName(e.target.value)}
                        placeholder="e.g. ABC Electronics Wholesale"
                        className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={newSupOwner}
                        onChange={(e) => setNewSupOwner(e.target.value)}
                        placeholder="e.g. Anand Kumar"
                        className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={newSupPhone}
                        onChange={(e) => setNewSupPhone(e.target.value)}
                        placeholder="Mobile / Office phone"
                        className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        GSTIN (Optional)
                      </label>
                      <input
                        type="text"
                        value={newSupGstin}
                        onChange={(e) => setNewSupGstin(e.target.value.toUpperCase())}
                        placeholder="15-digit GSTIN"
                        className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Payment Terms
                      </label>
                      <select
                        value={newSupTerms}
                        onChange={(e) => setNewSupTerms(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        <option value="Immediate">Immediate Payment</option>
                        <option value="7 Days">7 Days Credit</option>
                        <option value="15 Days">15 Days Credit</option>
                        <option value="30 Days">30 Days Credit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Address / City
                      </label>
                      <input
                        type="text"
                        value={newSupAddress}
                        onChange={(e) => setNewSupAddress(e.target.value)}
                        placeholder="Warehouse / Depot Address"
                        className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (supplierMode === 'new') {
                      if (!newSupName.trim() || !newSupPhone.trim()) {
                        alert('Please fill supplier name and phone.');
                        return;
                      }
                      handleCreateSupplierInline();
                    }
                    setCurrentStep(2);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <span>Continue to Add Products</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ADD PURCHASED PRODUCTS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#1E272E] p-4 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productCatalogSearch}
                    onChange={(e) => setProductCatalogSearch(e.target.value)}
                    placeholder="Search inventory items to add to purchase..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  onClick={() => setIsNewProdModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Product from Purchase</span>
                </button>
              </div>

              {/* 2-Column Split: Product Catalog and Inward Purchase Table */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Catalog (Left 6 cols) */}
                <div className="lg:col-span-6 bg-white dark:bg-[#1E272E] p-4 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-3">
                  <span className="font-bold text-xs text-slate-500">
                    Existing Inventory Catalog (Click to add to purchase bill)
                  </span>

                  <div className="grid grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {products
                      .filter((p: Product) => {
                        const q = productCatalogSearch.toLowerCase();
                        return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
                      })
                      .map((p: Product) => (
                        <div
                          key={p.id}
                          onClick={() => addExistingProductToPurchase(p)}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-[#12181F] hover:border-blue-500 transition cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.sku}</p>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-black text-slate-900 dark:text-white">
                              Cost: ₹{p.purchasePrice}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              Stock: {p.stock}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Purchase Bill Items (Right 6 cols) */}
                <div className="lg:col-span-6 bg-white dark:bg-[#1E272E] p-4 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Purchased Items ({purchaseItems.length})
                      </span>
                      {purchaseItems.length > 0 && (
                        <button
                          onClick={() => setPurchaseItems([])}
                          className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                        >
                          Clear Items
                        </button>
                      )}
                    </div>

                    {purchaseItems.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>No products added to this purchase bill yet.</p>
                        <p className="text-[11px] text-slate-500 mt-1">Select from catalog or create a new product above.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {purchaseItems.map((item, idx) => {
                          const lineGross = roundMoney(item.purchasePrice * item.quantity);
                          const discMode = item.discountMode || 'percentage';
                          const discVal = item.discountValue || 0;
                          const discAmt =
                            discMode === 'percentage'
                              ? roundMoney((lineGross * Math.min(100, discVal)) / 100)
                              : Math.min(lineGross, roundMoney(discVal));
                          const taxable = Math.max(0, roundMoney(lineGross - discAmt));
                          const tax = roundMoney((taxable * item.gstRate) / 100);
                          const total = roundMoney(taxable + tax);

                          return (
                            <div
                              key={item.id}
                              className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 text-xs space-y-2.5"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white leading-tight">{item.productName}</p>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    Base Cost: {formatCurrency(item.purchasePrice)} • GST: {item.gstRate}%
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-sm text-slate-900 dark:text-white font-mono block">
                                    {formatCurrency(total)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Taxable: {formatCurrency(taxable)}
                                  </span>
                                </div>
                              </div>

                              {/* Controls: Qty, Cost, Discount */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                {/* Quantity */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => updatePurchaseItemQty(idx, item.quantity - 1)}
                                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) => updatePurchaseItemQty(idx, Math.max(1, Number(e.target.value)))}
                                    className="w-12 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 font-bold text-slate-900 dark:text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updatePurchaseItemQty(idx, item.quantity + 1)}
                                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                                  >
                                    +
                                  </button>
                                  <span className="text-[10px] text-slate-400 ml-1 font-semibold">{item.unit || 'PCS'}</span>
                                </div>

                                {/* Purchase Rate */}
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-500 text-[11px]">Cost: ₹</span>
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={item.purchasePrice}
                                    onChange={(e) => updatePurchaseItemRate(idx, Math.max(0, Number(e.target.value)))}
                                    className="w-20 text-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 px-1.5 font-bold font-mono text-slate-900 dark:text-white"
                                  />
                                </div>

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => removePurchaseItem(idx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg ml-auto cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Item-level Purchase Discount Selector (Section 3.C) */}
                              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Item Discount:
                                  </span>
                                  <DiscountModeSelector
                                    mode={discMode}
                                    onChange={(m) => updatePurchaseItemDiscountMode(idx, m)}
                                    size="sm"
                                  />
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min={0}
                                      max={discMode === 'percentage' ? 100 : lineGross}
                                      step="0.01"
                                      value={discVal || ''}
                                      onChange={(e) => updatePurchaseItemDiscountValue(idx, Number(e.target.value) || 0)}
                                      placeholder="0"
                                      className="w-20 px-2 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-[#0984E3]"
                                    />
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                                      {discMode === 'percentage' ? '%' : '₹'}
                                    </span>
                                  </div>

                                  {discAmt > 0 && (
                                    <span className="text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                      −{formatCurrency(discAmt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Gross Inward Subtotal:</span>
                        <span className="font-mono font-semibold">{formatCurrency(purchaseCalc.grossSubtotal)}</span>
                      </div>
                      {purchaseCalc.itemDiscountsTotal > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>Item Discounts:</span>
                          <span className="font-mono">−{formatCurrency(purchaseCalc.itemDiscountsTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                        <span>Net Eligible Inward Base:</span>
                        <span className="text-base text-blue-600 dark:text-blue-400 font-mono">
                          {formatCurrency(purchaseCalc.eligibleBaseForBillDisc)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                      >
                        Back to Supplier
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (purchaseItems.length === 0) {
                            alert('Please add at least one product.');
                            return;
                          }
                          setCurrentStep(3);
                        }}
                        disabled={purchaseItems.length === 0}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm disabled:opacity-40 shadow-xs cursor-pointer"
                      >
                        Continue to Summary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PURCHASE SUMMARY & PAYMENT MODE */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-[#1E272E] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Step 3: Purchase Summary, Discounts & ITC Tax</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Configure supplier trade discounts, additional bill discounts, freight and record payment settlement.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                {/* Left Column (7 cols): Purchase Discounts & Breakdown */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Additional Purchase Bill Discount (Section 3.C) */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                          Additional Purchase Discount
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Base Amount: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(purchaseCalc.eligibleBaseForBillDisc)}</span>
                        </span>
                      </div>

                      <DiscountModeSelector
                        mode={purchaseDiscountMode}
                        onChange={(m) => setPurchaseDiscountMode(m)}
                        size="sm"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          {purchaseDiscountMode === 'fixed' ? 'Discount Amount (₹)' : 'Discount Rate (%)'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={purchaseDiscountMode === 'percentage' ? 100 : purchaseCalc.eligibleBaseForBillDisc}
                            step="0.01"
                            value={purchaseDiscountValue === 0 ? '' : purchaseDiscountValue}
                            onChange={(e) => setPurchaseDiscountValue(e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            {purchaseDiscountMode === 'fixed' ? '₹' : '%'}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 pt-0 sm:pt-4">
                        <span className="text-[11px] text-slate-500 block">Deduction:</span>
                        <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                          −{formatCurrency(purchaseCalc.billDiscAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Trade Discount & Freight Charges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <label className="font-semibold text-slate-600 dark:text-slate-400 block text-[11px]">
                        Supplier Trade Discount (₹)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={tradeDiscount === 0 ? '' : tradeDiscount}
                          onChange={(e) => setTradeDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          ₹
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <label className="font-semibold text-slate-600 dark:text-slate-400 block text-[11px]">
                        Inward Freight / Cartage (₹)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={freightCharges === 0 ? '' : freightCharges}
                          onChange={(e) => setFreightCharges(e.target.value === '' ? 0 : Number(e.target.value))}
                          placeholder="0.00"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          ₹
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Audit Breakdown Card */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] space-y-2 text-xs shadow-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      Structured Procurement Audit
                    </span>

                    <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                      <span>1. Gross Items Subtotal:</span>
                      <span className="font-mono font-semibold">{formatCurrency(purchaseCalc.grossSubtotal)}</span>
                    </div>

                    {purchaseCalc.itemDiscountsTotal > 0 && (
                      <div className="flex justify-between py-1 text-emerald-600">
                        <span>2. Item-Level Discounts:</span>
                        <span className="font-mono">−{formatCurrency(purchaseCalc.itemDiscountsTotal)}</span>
                      </div>
                    )}

                    {purchaseCalc.billDiscAmount > 0 && (
                      <div className="flex justify-between py-1 text-emerald-600">
                        <span>3. Additional Bill Discount:</span>
                        <span className="font-mono">−{formatCurrency(purchaseCalc.billDiscAmount)}</span>
                      </div>
                    )}

                    {purchaseCalc.tradeDiscAmount > 0 && (
                      <div className="flex justify-between py-1 text-emerald-600">
                        <span>4. Supplier Trade Discount:</span>
                        <span className="font-mono">−{formatCurrency(purchaseCalc.tradeDiscAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                      <span>5. Taxable Inward Turnover:</span>
                      <span className="font-mono">{formatCurrency(purchaseCalc.taxableAmount)}</span>
                    </div>

                    <div className="flex justify-between py-1 text-blue-600 dark:text-blue-400">
                      <span>6. Inward Input GST (ITC):</span>
                      <span className="font-mono">+{formatCurrency(purchaseCalc.taxAmount)}</span>
                    </div>

                    {purchaseCalc.freightCharges > 0 && (
                      <div className="flex justify-between py-1 text-slate-500">
                        <span>7. Freight / Delivery Charges:</span>
                        <span className="font-mono">+{formatCurrency(purchaseCalc.freightCharges)}</span>
                      </div>
                    )}

                    {purchaseCalc.roundOff !== 0 && (
                      <div className="flex justify-between py-1 text-slate-500">
                        <span>8. Round Off Adjustment:</span>
                        <span className="font-mono">
                          {purchaseCalc.roundOff > 0 ? `+${formatCurrency(purchaseCalc.roundOff)}` : formatCurrency(purchaseCalc.roundOff)}
                        </span>
                      </div>
                    )}

                    {/* GRAND TOTAL BOX */}
                    <div className="mt-2 p-3.5 rounded-xl border-2 border-[#0984E3] bg-[#F0F7FD] dark:bg-[#152332] flex justify-between items-center text-sm font-black text-[#0984E3] dark:text-[#00CEC9]">
                      <span>GRAND INWARD TOTAL</span>
                      <span className="text-lg font-mono">{formatCurrency(purchaseCalc.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column (5 cols): Payment Settlement */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-4">
                    <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block border-b border-slate-100 dark:border-slate-800 pb-2">
                      Payment Settlement & Terms
                    </span>

                    <div>
                      <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Payment Settlement Status
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentStatus('paid')}
                          className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer ${
                            paymentStatus === 'paid'
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 ring-1 ring-emerald-600'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Fully Paid
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentStatus('pending')}
                          className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer ${
                            paymentStatus === 'pending'
                              ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-600 ring-1 ring-rose-600'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Pending / Due
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentStatus('partially_paid')}
                          className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer ${
                            paymentStatus === 'partially_paid'
                              ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-600 ring-1 ring-amber-600'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Partial Pay
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Amount Paid Now (₹):</span>
                        <input
                          type="number"
                          min={0}
                          max={purchaseCalc.grandTotal}
                          step="0.01"
                          value={amountPaid === '' ? (paymentStatus === 'paid' ? purchaseCalc.grandTotal : paymentStatus === 'pending' ? 0 : '') : amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder={String(purchaseCalc.grandTotal)}
                          className="w-28 px-2 py-1 bg-white dark:bg-[#1E272E] border border-slate-300 dark:border-slate-700 rounded-lg font-bold font-mono text-right text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span>Balance Payable to Supplier:</span>
                        <span className={`font-mono font-bold ${purchaseCalc.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {formatCurrency(purchaseCalc.balanceDue)}
                        </span>
                      </div>
                    </div>

                    {purchaseCalc.balanceDue > 0 && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 italic">
                        Balance due of {formatCurrency(purchaseCalc.balanceDue)} will be automatically added to {activeSupplier?.businessName}'s payable ledger.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Back to Products
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer"
                >
                  Continue to Review & Save
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SAVE */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-[#1E272E] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Step 4: Review Purchase & Confirm</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verify supplier, discounts, and item quantities before updating store inventory.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Bill No:</span>
                  <span className="font-mono font-bold text-xs text-blue-600">{purchaseNo}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold block mb-1">Supplier</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{activeSupplier?.businessName}</p>
                  <p className="text-slate-500 font-mono mt-0.5">{activeSupplier?.phone}</p>
                  {activeSupplier?.gstin && <p className="text-slate-400 font-mono text-[10px]">GSTIN: {activeSupplier.gstin}</p>}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold block mb-1">Procurement Summary</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {purchaseItems.length} Products
                  </p>
                  <p className="text-slate-500 mt-0.5 font-mono">
                    Taxable: {formatCurrency(purchaseCalc.taxableAmount)} • ITC: {formatCurrency(purchaseCalc.taxAmount)}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold block mb-1">Payment Status</span>
                  <p className="font-bold text-emerald-600 uppercase text-sm">
                    {paymentStatus} ({formatCurrency(purchaseCalc.effectivePaid)})
                  </p>
                  {purchaseCalc.balanceDue > 0 ? (
                    <p className="text-amber-600 font-semibold mt-0.5 font-mono">Due: {formatCurrency(purchaseCalc.balanceDue)}</p>
                  ) : (
                    <p className="text-slate-500 mt-0.5">Fully Settled</p>
                  )}
                </div>
              </div>

              {/* Items Table with Discounts & Taxable Base */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-[#12181F] text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Cost Rate</th>
                      <th className="py-2.5 px-3 text-right">Disc</th>
                      <th className="py-2.5 px-3 text-right">Taxable</th>
                      <th className="py-2.5 px-3 text-right">GST %</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {purchaseCalc.computedItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-semibold">{item.productName}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          +{item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.purchasePrice)}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 font-mono">
                          {item.discountAmount > 0 ? (
                            <span>
                              −{formatCurrency(item.discountAmount)}
                              <span className="block text-[9px] text-slate-400">
                                ({item.discountMode === 'fixed' ? 'Fixed' : `${item.discountValue}%`})
                              </span>
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.taxableAmount)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-500">{item.gstRate}%</td>
                        <td className="py-2.5 px-3 text-right font-bold font-mono">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Back to Summary
                </button>

                <button
                  type="button"
                  onClick={handleSaveFinalPurchase}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Save Purchase Bill ({formatCurrency(purchaseCalc.grandTotal)})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUCCESS MODAL FOR PURCHASE BILL */}
      {/* ========================================================================= */}
      {isSuccessModalOpen && lastSavedPurchase && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center text-xs animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                ✓ Purchase Saved Successfully
              </h3>
              <p className="text-slate-500">
                Inventory stock increased, vendor payable recorded, and GST inputs updated.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Purchase Bill No:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {lastSavedPurchase.purchaseNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {lastSavedPurchase.supplierName}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-900 dark:text-white">Total Amount:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  ₹{lastSavedPurchase.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setViewMode('history')}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
              >
                View History
              </button>

              <button
                onClick={handleResetForNewPurchase}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                New Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW PRODUCT MODAL */}
      {isNewProdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-3.5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Create New Product from Purchase
              </span>
              <button onClick={() => setIsNewProdModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Fast Charging 65W GaN Type-C Adapter"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">SKU</label>
                  <input
                    type="text"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="PWR-65W-GAN"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Barcode (EAN/UPC)</label>
                  <input
                    type="text"
                    value={newProdBarcode}
                    onChange={(e) => setNewProdBarcode(e.target.value)}
                    placeholder="890123456002"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Purchase Cost (₹) *</label>
                  <input
                    type="number"
                    value={newProdPurchasePrice}
                    onChange={(e) => setNewProdPurchasePrice(Number(e.target.value))}
                    placeholder="120"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={newProdSellingPrice}
                    onChange={(e) => setNewProdSellingPrice(Number(e.target.value))}
                    placeholder="199"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={newProdMrp}
                    onChange={(e) => setNewProdMrp(Number(e.target.value))}
                    placeholder="249"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">GST Rate %</label>
                  <select
                    value={newProdGstRate}
                    onChange={(e) => setNewProdGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={newProdHsn}
                    onChange={(e) => setNewProdHsn(e.target.value)}
                    placeholder="8504"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewProdModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateProductFromPurchase}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Create & Add to Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
