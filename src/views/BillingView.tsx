import React, { useState, useMemo } from 'react';
import {
  User,
  ShoppingBag,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ScanLine,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  Printer,
  Share2,
  QrCode,
  DollarSign,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  Percent,
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  Store,
  Tag,
  IndianRupee,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import {
  DiscountMode,
  InvoiceItem,
  InvoiceType,
  PaymentMethod,
  PaymentStatus,
  Product,
  Customer,
} from '../types';
import {
  formatCurrency,
  INDIAN_STATES,
} from '../utils/formatters';
import {
  calculateBill,
  computeLineItem,
  validateDiscount,
  roundMoney,
} from '../utils/billingCalculator';
import { BillSummary } from '../components/BillSummary';
import { DiscountModeSelector } from '../components/DiscountModeSelector';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { celebrateTaskCompletion, playClickSound, triggerHaptic } from '../utils/motion';

type BillingStep = 1 | 2 | 3 | 4;

export const BillingView: React.FC = () => {
  const {
    business,
    products,
    customers,
    createInvoice,
    setSelectedInvoiceForPrint,
    addCustomer,
    addProduct,
    barcodeScannerEnabled,
    currentStaff,
    t,
  } = useShop();

  // Active Billing Step
  const [currentStep, setCurrentStep] = useState<BillingStep>(1);

  // Invoice Meta
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('tax_invoice');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Step 1: Customer Selection State
  // mode: 'walk_in' | 'existing' | 'new'
  const [customerMode, setCustomerMode] = useState<'walk_in' | 'existing' | 'new'>('walk_in');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  
  // New Customer Form Fields
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustCreditLimit, setNewCustCreditLimit] = useState<number | ''>(5000);
  const [newCustStateCode, setNewCustStateCode] = useState(business.stateCode || '27');

  // Step 2: Products & Cart State
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Quick New Product state if not found
  const [quickProdName, setQuickProdName] = useState('');
  const [quickProdPrice, setQuickProdPrice] = useState<number | ''>('');
  const [quickProdStock, setQuickProdStock] = useState<number | ''>(10);
  const [quickProdGst, setQuickProdGst] = useState<number>(18);
  const [quickProdUnit, setQuickProdUnit] = useState('PCS');

  // Step 3: Payment & Summary State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [amountPaidCustom, setAmountPaidCustom] = useState<number | ''>('');
  const [billDiscountMode, setBillDiscountMode] = useState<DiscountMode>('percentage');
  const [billDiscountValue, setBillDiscountValue] = useState<number | ''>(0);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number | ''>(0);
  const [roundOffEnabled, setRoundOffEnabled] = useState<boolean>(() => business.invoiceSettings?.roundOffEnabled ?? false);
  const [discountValidationMsg, setDiscountValidationMsg] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Step 4 & Success Screen State
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<any>(null);

  // Active customer object
  const activeCustomer = useMemo(() => {
    if (customerMode === 'walk_in') {
      return {
        id: '',
        name: 'Walk-in Customer (Cash Sale)',
        phone: '',
        email: '',
        gstin: '',
        stateCode: business.stateCode,
        outstandingBalance: 0,
      };
    }
    if (customerMode === 'existing') {
      const found = customers.find((c) => c.id === selectedCustomerId);
      if (found) return found;
      return null;
    }
    return {
      id: 'new_temp',
      name: newCustName || 'New Customer',
      phone: newCustPhone,
      email: newCustEmail,
      gstin: newCustGstin,
      stateCode: newCustStateCode,
      outstandingBalance: 0,
    };
  }, [customerMode, selectedCustomerId, customers, newCustName, newCustPhone, newCustEmail, newCustGstin, newCustStateCode, business.stateCode]);

  // Tax Inter-State check
  const effectiveStateCode = activeCustomer?.stateCode || business.stateCode;
  const isInterState = effectiveStateCode !== business.stateCode;

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [products]);

  // Cart operations using unified billing calculation engine
  const addItemToCart = (product: Product) => {
    playClickSound();
    triggerHaptic('light');
    const existingIndex = items.findIndex((i) => i.productId === product.id);
    if (existingIndex >= 0) {
      const currentQty = items[existingIndex].quantity;
      if (product.stock > 0 && currentQty + 1 > product.stock) {
        alert(`Cannot add more than available stock (${product.stock} ${product.unit}).`);
        return;
      }
      updateItemQty(existingIndex, currentQty + 1);
    } else {
      if (product.stock <= 0) {
        const proceed = confirm(`Product "${product.name}" is currently out of stock. Proceed anyway?`);
        if (!proceed) return;
      }
      const calc = computeLineItem({
        unitPrice: product.sellingPrice,
        quantity: 1,
        discountMode: 'percentage',
        discountValue: 0,
        gstRate: product.gstRate,
        isInterState,
        taxMode: business.invoiceSettings?.taxMode || 'exclusive',
      });
      const newItem: InvoiceItem = {
        id: 'item_' + Date.now() + Math.random().toString().slice(2, 6),
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        hsn: product.hsnCode,
        quantity: 1,
        unit: product.unit,
        price: product.sellingPrice,
        mrp: product.mrp,
        grossAmount: calc.grossAmount,
        discountMode: 'percentage',
        discountPercent: 0,
        discountValue: 0,
        discountAmount: calc.discountAmount,
        taxableAmount: calc.taxableAmount,
        gstRate: product.gstRate,
        cgstAmount: calc.cgstAmount,
        sgstAmount: calc.sgstAmount,
        igstAmount: calc.igstAmount,
        total: calc.total,
      };
      setItems((prev) => [...prev, newItem]);
    }
  };

  const updateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeItem(index);
      return;
    }
    const item = items[index];
    const prod = products.find((p) => p.id === item.productId);
    if (prod && prod.stock > 0 && newQty > prod.stock) {
      alert(`Warning: Requested quantity (${newQty}) exceeds current stock (${prod.stock}).`);
    }

    setItems((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      const calc = computeLineItem({
        unitPrice: cur.price,
        quantity: newQty,
        discountMode: cur.discountMode || 'percentage',
        discountValue: cur.discountValue ?? cur.discountPercent ?? 0,
        gstRate: cur.gstRate,
        isInterState,
        taxMode: business.invoiceSettings?.taxMode || 'exclusive',
      });
      copy[index] = {
        ...cur,
        quantity: newQty,
        grossAmount: calc.grossAmount,
        discountAmount: calc.discountAmount,
        taxableAmount: calc.taxableAmount,
        cgstAmount: calc.cgstAmount,
        sgstAmount: calc.sgstAmount,
        igstAmount: calc.igstAmount,
        total: calc.total,
      };
      return copy;
    });
  };

  const updateItemDiscountMode = (index: number, newMode: DiscountMode) => {
    setItems((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      const lineGross = cur.price * cur.quantity;
      let newVal = cur.discountValue ?? 0;
      if (newMode === 'percentage' && newVal > 100) {
        newVal = 10;
      }
      if (newMode === 'fixed' && newVal > lineGross) {
        newVal = lineGross;
      }
      const calc = computeLineItem({
        unitPrice: cur.price,
        quantity: cur.quantity,
        discountMode: newMode,
        discountValue: newVal,
        gstRate: cur.gstRate,
        isInterState,
        taxMode: business.invoiceSettings?.taxMode || 'exclusive',
      });
      copy[index] = {
        ...cur,
        discountMode: newMode,
        discountValue: newVal,
        discountPercent: newMode === 'percentage' ? newVal : roundMoney((calc.discountAmount / (lineGross || 1)) * 100),
        discountAmount: calc.discountAmount,
        taxableAmount: calc.taxableAmount,
        cgstAmount: calc.cgstAmount,
        sgstAmount: calc.sgstAmount,
        igstAmount: calc.igstAmount,
        total: calc.total,
      };
      return copy;
    });
  };

  const updateItemDiscountValue = (index: number, val: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const cur = copy[index];
      const mode = cur.discountMode || 'percentage';
      const cleanVal = Math.max(0, val);
      const calc = computeLineItem({
        unitPrice: cur.price,
        quantity: cur.quantity,
        discountMode: mode,
        discountValue: cleanVal,
        gstRate: cur.gstRate,
        isInterState,
        taxMode: business.invoiceSettings?.taxMode || 'exclusive',
      });
      copy[index] = {
        ...cur,
        discountValue: cleanVal,
        discountPercent: mode === 'percentage' ? cleanVal : roundMoney((calc.discountAmount / ((cur.price * cur.quantity) || 1)) * 100),
        discountAmount: calc.discountAmount,
        taxableAmount: calc.taxableAmount,
        cgstAmount: calc.cgstAmount,
        sgstAmount: calc.sgstAmount,
        igstAmount: calc.igstAmount,
        total: calc.total,
      };
      return copy;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Unified Bill Calculation Engine Hook
  const calculation = useMemo(() => {
    return calculateBill({
      items: items.map((i) => ({
        id: i.id,
        productName: i.productName,
        sku: i.sku,
        hsn: i.hsn,
        unitPrice: i.price,
        quantity: i.quantity,
        discountMode: i.discountMode || 'percentage',
        discountValue: i.discountValue ?? i.discountPercent ?? 0,
        gstRate: i.gstRate,
      })),
      billDiscountMode,
      billDiscountValue: Number(billDiscountValue) || 0,
      couponCode,
      couponDiscount,
      otherCharges: Number(otherCharges) || 0,
      isInterState,
      taxMode: business.invoiceSettings?.taxMode || 'exclusive',
      roundOffEnabled: roundOffEnabled,
      amountPaid: amountPaidCustom,
      paymentMethod,
    });
  }, [
    items,
    billDiscountMode,
    billDiscountValue,
    couponCode,
    couponDiscount,
    otherCharges,
    isInterState,
    business.invoiceSettings?.taxMode,
    roundOffEnabled,
    amountPaidCustom,
    paymentMethod,
  ]);

  // Quick Customer Creation
  const handleCreateCustomerInline = () => {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('Please enter customer name and phone number.');
      return;
    }
    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim() || undefined,
      address: newCustAddress.trim() || undefined,
      gstin: newCustGstin.trim().toUpperCase() || undefined,
      creditLimit: Number(newCustCreditLimit) || 5000,
      outstandingBalance: 0,
      totalPurchases: 0,
      totalOrdersCount: 0,
      stateCode: newCustStateCode,
    });
    setSelectedCustomerId(created.id);
    setCustomerMode('existing');
  };

  // Quick Product Creation
  const handleCreateProductInline = () => {
    if (!quickProdName.trim() || !quickProdPrice) {
      alert('Please provide product name and selling price.');
      return;
    }
    const priceNum = Number(quickProdPrice);
    const stockNum = Number(quickProdStock) || 0;
    const newP = addProduct({
      name: quickProdName.trim(),
      sku: 'SKU-' + Date.now().toString().slice(-4),
      barcode: '890' + Date.now().toString().slice(-9),
      category: 'General',
      unit: quickProdUnit,
      purchasePrice: Math.round(priceNum * 0.7),
      sellingPrice: priceNum,
      mrp: Math.round(priceNum * 1.2),
      stock: stockNum,
      openingStock: stockNum,
      minStockLevel: 5,
      gstRate: quickProdGst,
      hsnCode: '9983',
      images: [],
      status: stockNum > 0 ? 'in_stock' : 'out_of_stock',
    });
    addItemToCart(newP);
    setIsNewProductModalOpen(false);
    setQuickProdName('');
    setQuickProdPrice('');
  };

  // Step Validation & Navigation
  const handleProceedToProducts = () => {
    if (customerMode === 'new') {
      if (!newCustName.trim() || !newCustPhone.trim()) {
        alert('Please enter at least customer name and phone number, or select Walk-in customer.');
        return;
      }
      handleCreateCustomerInline();
    } else if (customerMode === 'existing') {
      if (!selectedCustomerId) {
        alert('Please select an existing customer from the list or choose Walk-in customer.');
        return;
      }
    }
    setCurrentStep(2);
  };

  const handleProceedToSummary = () => {
    if (items.length === 0) {
      alert('Please add at least one product to the bill.');
      return;
    }
    setCurrentStep(3);
  };

  const handleProceedToReview = () => {
    setCurrentStep(4);
  };

  // Final Invoice Generation
  const handleGenerateInvoice = () => {
    if (items.length === 0) {
      alert('Cart is empty. Please add products.');
      return;
    }

    let customerId = '';
    let customerName = 'Walk-in Customer';
    let customerPhone = '';
    let customerGstin = '';
    let customerAddress = '';
    let customerStateCode = business.stateCode;

    if (customerMode === 'walk_in') {
      customerId = '';
      customerName = 'Walk-in Customer';
    } else if (activeCustomer) {
      customerId = activeCustomer.id;
      customerName = activeCustomer.name;
      customerPhone = activeCustomer.phone || '';
      customerGstin = activeCustomer.gstin || '';
      customerAddress = (activeCustomer as any).address || '';
      customerStateCode = (activeCustomer as any).stateCode || business.stateCode;
    }

    // Generate safe sequential invoice number
    const prefix = business.invoiceSettings?.invoicePrefix || 'VY-2026-';
    const nextNum = (business.invoiceSettings?.startingNumber || 100) + 1;
    const invoiceNo = `${prefix}${String(nextNum).padStart(6, '0')}`;

    try {
      const created = createInvoice({
        invoiceNo,
        invoiceType,
        invoiceDate,
        dueDate,
        customerId,
        customerName,
        customerPhone,
        customerGstin,
        customerAddress,
        customerStateCode,
        items: calculation.computedItems,
        subtotal: calculation.grossSubtotal,
        itemDiscountTotal: calculation.itemDiscountsTotal,
        billDiscountMode,
        billDiscountValue: Number(billDiscountValue) || 0,
        billDiscountAmount: calculation.billDiscountAmount,
        couponCode: couponCode || undefined,
        couponDiscount: calculation.couponDiscountAmount || undefined,
        otherCharges: calculation.otherCharges,
        discount: calculation.totalDiscount,
        taxableAmount: calculation.taxableAmount,
        isInterState,
        cgstAmount: calculation.cgstAmount,
        sgstAmount: calculation.sgstAmount,
        igstAmount: calculation.igstAmount,
        roundOff: calculation.roundOff,
        grandTotal: calculation.grandTotal,
        paymentStatus: calculation.paymentStatus,
        paymentMethod,
        amountPaid: calculation.amountPaid,
        balanceDue: calculation.balanceDue,
        notes,
        taxBreakdownByRate: calculation.taxBreakdownByRate,
      });

      setLastCreatedInvoice(created);
      setIsSuccessModal(true);
      celebrateTaskCompletion('Invoice generated successfully!');
    } catch (err: any) {
      alert('Failed to generate invoice: ' + (err.message || 'Unknown error'));
    }
  };

  // Reset for New Bill
  const handleStartNewBill = () => {
    setItems([]);
    setCustomerMode('walk_in');
    setSelectedCustomerId('');
    setNewCustName('');
    setNewCustPhone('');
    setAmountPaidCustom('');
    setBillDiscountMode('percentage');
    setBillDiscountValue(0);
    setCouponCode('');
    setCouponDiscount(0);
    setOtherCharges(0);
    setDiscountValidationMsg(null);
    setNotes('');
    setCurrentStep(1);
    setIsSuccessModal(false);
    setLastCreatedInvoice(null);
  };

  // WhatsApp Share Helper
  const handleShareWhatsApp = () => {
    if (!lastCreatedInvoice) return;
    const phone = lastCreatedInvoice.customerPhone?.replace(/\D/g, '') || '';
    const text = encodeURIComponent(
      `Hello ${lastCreatedInvoice.customerName}!\nThank you for shopping at ${business.name}.\nYour Invoice #${lastCreatedInvoice.invoiceNo} for ${formatCurrency(
        lastCreatedInvoice.grandTotal
      )} has been generated.\nPayment: ${lastCreatedInvoice.paymentMethod.toUpperCase()} (${lastCreatedInvoice.paymentStatus.toUpperCase()})\nHave a wonderful day!`
    );
    window.open(`https://wa.me/${phone ? '91' + phone : ''}?text=${text}`, '_blank');
  };

  // Filtered Products for Step 2
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = productSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q);
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearchQuery, selectedCategory]);

  // Stepper Items
  const stepsConfig = [
    { num: 1, label: 'Customer', icon: User },
    { num: 2, label: 'Products', icon: ShoppingBag },
    { num: 3, label: 'Summary & Taxes', icon: CreditCard },
    { num: 4, label: 'Final Review', icon: CheckCircle },
  ];

  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E272E] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Store className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 dark:text-blue-400" />
            <span>Quick Billing / POS</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step-by-step professional GST POS billing designed for Indian shopkeepers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {business.name} • GSTIN: <span className="font-mono text-slate-700 dark:text-slate-300">{business.gstin || 'None'}</span>
          </span>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold transition hover:bg-blue-100 cursor-pointer"
          >
            <ScanLine className="w-4 h-4" />
            <span>Barcode Scanner</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL ANIMATED PROGRESS STEPPER (Steps 1 to 4) */}
      <div className="bg-white dark:bg-[#1E272E] p-4 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs">
        <div className="grid grid-cols-4 items-center relative">
          {/* Background Connecting Line */}
          <div className="absolute left-[12.5%] right-[12.5%] top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
          
          {/* Active Animated Connecting Progress Line */}
          <div
            className="absolute left-[12.5%] top-1/2 -translate-y-1/2 h-1 bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-in-out -z-0"
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
                  if (s.num < currentStep) setCurrentStep(s.num as BillingStep);
                }}
                className={`flex flex-col items-center relative z-10 transition-all duration-300 ${
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
                  className={`text-[11px] sm:text-xs font-bold mt-1.5 transition-colors text-center ${
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

      {/* STEP CONTENT CONTAINER (Fast smooth transition) */}
      <div className="transition-all duration-250 ease-out">
        {/* ========================================================================= */}
        {/* STEP 1: SELECT CUSTOMER */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-[#1E272E] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Step 1: Select Customer</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Select Walk-in customer for quick counter sales, or link an existing customer Khata.
                </p>
              </div>

              {activeCustomer && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-500">Active Selection:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{activeCustomer.name}</span>
                </div>
              )}
            </div>

            {/* Customer Type Selector Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCustomerMode('walk_in')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  customerMode === 'walk_in'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Walk-in Customer</span>
                  {customerMode === 'walk_in' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant counter billing without saving details or customer Khata.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCustomerMode('existing')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  customerMode === 'existing'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Existing Customer</span>
                  {customerMode === 'existing' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Search by name, phone, or ID. View existing Udhaar dues.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setCustomerMode('new')}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  customerMode === 'new'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Add New Customer</span>
                  {customerMode === 'new' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create new customer profile with phone, address, and GSTIN.
                </p>
              </button>
            </div>

            {/* Existing Customer Search Panel */}
            {customerMode === 'existing' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    placeholder="Search customer by name, phone number, or ID..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {customers
                    .filter((c) => {
                      const q = customerSearchQuery.toLowerCase();
                      return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.id.toLowerCase().includes(q);
                    })
                    .map((cust) => {
                      const isSelected = selectedCustomerId === cust.id;
                      return (
                        <div
                          key={cust.id}
                          onClick={() => setSelectedCustomerId(cust.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-white font-medium ring-1 ring-blue-600'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E272E] hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between font-bold text-sm">
                              <span className="truncate">{cust.name}</span>
                              {cust.outstandingBalance > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  Due: ₹{cust.outstandingBalance}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                              {cust.phone} • {cust.city || 'Local'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Add New Customer Inline Form */}
            {customerMode === 'new' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      value={newCustGstin}
                      onChange={(e) => setNewCustGstin(e.target.value.toUpperCase())}
                      placeholder="15-digit GSTIN"
                      className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      State / POS Location
                    </label>
                    <select
                      value={newCustStateCode}
                      onChange={(e) => setNewCustStateCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={newCustAddress}
                      onChange={(e) => setNewCustAddress(e.target.value)}
                      placeholder="Shop/House no, Street, Area"
                      className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Credit Limit (₹)
                    </label>
                    <input
                      type="number"
                      value={newCustCreditLimit}
                      onChange={(e) => setNewCustCreditLimit(Number(e.target.value))}
                      placeholder="5000"
                      className="w-full px-3 py-2 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Selected Customer Summary Card */}
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {activeCustomer?.name}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {activeCustomer?.phone ? `Phone: ${activeCustomer.phone}` : 'Counter Walk-in Sale'}
                    {activeCustomer?.gstin ? ` • GSTIN: ${activeCustomer.gstin}` : ''}
                  </p>
                </div>
              </div>

              {activeCustomer && activeCustomer.outstandingBalance > 0 && (
                <div className="text-right">
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block">
                    Existing Khata Balance (Udhaar):
                  </span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400">
                    ₹{activeCustomer.outstandingBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleProceedToProducts}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <span>Continue to Products</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ADD PRODUCTS & CART */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Top Toolbar: Search, Category Filter, and Add Product */}
            <div className="bg-white dark:bg-[#1E272E] p-4 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Search products by name, SKU, or scan barcode..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Items' : cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsNewProductModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Item</span>
              </button>
            </div>

            {/* 2-Column Split: Catalog on Left, Live Cart Table on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Product Catalog Cards (Left 6 or 7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-[#1E272E] p-4 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold">Catalog Items ({filteredProducts.length})</span>
                  <span>Click to add item to bill</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredProducts.map((p) => {
                    const inCartItem = items.find((i) => i.productId === p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => addItemToCart(p)}
                        className={`p-3 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between relative group ${
                          inCartItem
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-[#12181F] hover:border-blue-400'
                        }`}
                      >
                        {inCartItem && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                            {inCartItem.quantity}
                          </span>
                        )}

                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-tight">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.sku}</p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            ₹{p.sellingPrice}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              p.stock > 0
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            {p.stock > 0 ? `${p.stock} ${p.unit}` : 'Out'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cart Line Items Table (Right 5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-[#1E272E] p-4 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      Current Cart ({items.length})
                    </span>
                    {items.length > 0 && (
                      <button
                        onClick={() => setItems([])}
                        className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>

                  {/* Cart Items List */}
                  {items.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>No products added to the bill yet.</p>
                      <p className="text-[11px] text-slate-500 mt-1">Select from the catalog or scan barcode.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {items.map((item, idx) => {
                        const lineGross = roundMoney(item.price * item.quantity);
                        const discMode = item.discountMode || 'percentage';
                        const discVal = item.discountValue ?? (discMode === 'percentage' ? (item.discountPercent || 0) : (item.discountAmount || 0));
                        
                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 text-xs space-y-2.5 transition-all"
                          >
                            {/* Product Info & Line Total */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-white leading-tight truncate">
                                  {item.productName}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  Rate: {formatCurrency(item.price)} • GST: {item.gstRate}% {item.hsn ? `• HSN: ${item.hsn}` : ''}
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                                  {formatCurrency(item.total)}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  Taxable: {formatCurrency(item.taxableAmount)}
                                </span>
                              </div>
                            </div>

                            {/* Quantity and Line Rate Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                              {/* Quantity Stepper */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => updateItemQty(idx, item.quantity - 1)}
                                  className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(e) => updateItemQty(idx, Math.max(1, Number(e.target.value)))}
                                  className="w-12 text-center font-bold text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 text-slate-900 dark:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateItemQty(idx, item.quantity + 1)}
                                  className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                                <span className="text-[10px] text-slate-400 ml-1 font-semibold">{item.unit || 'PCS'}</span>
                              </div>

                              {/* Gross Line Amount */}
                              <span className="text-[11px] text-slate-500 font-mono">
                                Gross: {formatCurrency(lineGross)}
                              </span>

                              {/* Remove Item Button */}
                              <button
                                type="button"
                                onClick={() => removeItem(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer ml-auto"
                                title="Remove item from cart"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Item-Level Discount Selector & Input (Section 2 & 3.A) */}
                            <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  Item Discount:
                                </span>
                                <DiscountModeSelector
                                  mode={discMode}
                                  onChange={(newMode) => updateItemDiscountMode(idx, newMode)}
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
                                    onChange={(e) => updateItemDiscountValue(idx, Number(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-20 px-2 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-[#0984E3]"
                                  />
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                                    {discMode === 'percentage' ? '%' : '₹'}
                                  </span>
                                </div>

                                {item.discountAmount > 0 && (
                                  <span className="text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                    −{formatCurrency(item.discountAmount)}
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

                {/* Subtotal Banner & Navigation */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Gross Subtotal:</span>
                      <span className="font-mono font-semibold">{formatCurrency(calculation.grossSubtotal)}</span>
                    </div>
                    {calculation.itemDiscountsTotal > 0 && (
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Item Discounts:</span>
                        <span className="font-mono">−{formatCurrency(calculation.itemDiscountsTotal)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Net Eligible Base ({items.length} items):
                      </span>
                      <span className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">
                        {formatCurrency(calculation.eligibleBaseForBillDiscount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 hover:bg-slate-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGenerateInvoice}
                        disabled={items.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-40 cursor-pointer"
                        title="Generate invoice directly without extra payment steps"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>⚡ Direct Bill ({formatCurrency(calculation.grandTotal)})</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleProceedToSummary}
                        disabled={items.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition disabled:opacity-40 cursor-pointer"
                      >
                        <span>Summary & Taxes</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: BILL SUMMARY & TAXES */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-[#1E272E] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Step 3: Bill Summary, Taxes & Payment Method</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Configure additional discounts, review CGST/SGST/IGST breakdown, and record settlement.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Additional Bill Discount, Coupons, Other Charges & Full BillSummary */}
              <div className="lg:col-span-7 space-y-4">
                {/* Additional Bill-Level Discount Card (Section 2 & 3.B) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                        Additional Bill Discount
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Base Amount: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(calculation.eligibleBaseForBillDiscount)}</span>
                      </span>
                    </div>

                    <DiscountModeSelector
                      mode={billDiscountMode}
                      onChange={(newMode) => {
                        setBillDiscountMode(newMode);
                        const val = Number(billDiscountValue) || 0;
                        const validation = validateDiscount(newMode, val, calculation.eligibleBaseForBillDiscount, currentStaff?.permissions);
                        setDiscountValidationMsg(validation.isValid ? null : validation.message || null);
                      }}
                      size="sm"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {billDiscountMode === 'fixed' ? 'Discount Amount (₹)' : 'Discount Rate (%)'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={billDiscountMode === 'percentage' ? 100 : calculation.eligibleBaseForBillDiscount}
                          step="0.01"
                          value={billDiscountValue === 0 ? '' : billDiscountValue}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                            setBillDiscountValue(val);
                            const validation = validateDiscount(billDiscountMode, val, calculation.eligibleBaseForBillDiscount, currentStaff?.permissions);
                            setDiscountValidationMsg(validation.isValid ? null : validation.message || null);
                          }}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0984E3]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          {billDiscountMode === 'fixed' ? '₹' : '%'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-0 sm:pt-4">
                      <span className="text-[11px] text-slate-500 block">Deduction:</span>
                      <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                        −{formatCurrency(calculation.billDiscountAmount)}
                      </span>
                    </div>
                  </div>

                  {discountValidationMsg && (
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-600 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{discountValidationMsg}</span>
                    </div>
                  )}
                </div>

                {/* Optional Coupon & Other Charges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Coupon Code Input */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block text-[11px]">
                      Coupon Code (Optional)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. FESTIVE50"
                        className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold uppercase text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (couponCode.trim() === 'FESTIVE50' || couponCode.trim() === 'WELCOME10') {
                            setCouponDiscount(50);
                          } else if (couponCode.trim()) {
                            setCouponDiscount(25);
                          } else {
                            setCouponDiscount(0);
                          }
                        }}
                        className="px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-[10px] cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponDiscount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        ✓ Applied −{formatCurrency(couponDiscount)}
                      </span>
                    )}
                  </div>

                  {/* Delivery / Additional Charges */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 block text-[11px]">
                      Other Charges (Delivery/Pack)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={otherCharges === 0 ? '' : otherCharges}
                        onChange={(e) => setOtherCharges(e.target.value === '' ? 0 : Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                    </div>
                  </div>

                  {/* Auto Round Off Toggle */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px]">
                        Round Off Total
                      </span>
                      <button
                        type="button"
                        onClick={() => setRoundOffEnabled(!roundOffEnabled)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          roundOffEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            roundOffEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {roundOffEnabled ? (
                        <span className="text-blue-600 dark:text-blue-400 font-medium">Active (nearest ₹1)</span>
                      ) : (
                        <span>Exact decimals (no round-off)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Professional Reusable Bill Summary Component (Section 4 & 6) */}
                <BillSummary
                  calculation={calculation}
                  title="Live Bill Summary & GST Breakdown"
                  showAmountInWords={true}
                />
              </div>

              {/* Right Column (5 cols): Payment Method, Received Amount, Khata & Notes */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-4 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                    Payment Method & Terms
                  </h3>

                  {/* Payment Mode Pills */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'UPI / QR', icon: QrCode },
                      { id: 'cash', label: 'Cash', icon: DollarSign },
                      { id: 'card', label: 'Card / POS', icon: CreditCard },
                      { id: 'bank_transfer', label: 'NetBanking', icon: Building },
                      { id: 'credit', label: 'Khata / Credit', icon: User },
                      { id: 'split', label: 'Partial Pay', icon: Percent },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                          paymentMethod === pm.id
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-white font-bold ring-1 ring-blue-600'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E272E] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <pm.icon className="w-4 h-4 text-blue-600" />
                        <span className="text-[11px]">{pm.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Payment Amount Input */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Amount Received Now:
                      </label>
                      <div className="relative w-36">
                        <input
                          type="number"
                          min={0}
                          max={calculation.grandTotal}
                          step="0.01"
                          value={amountPaidCustom === '' ? calculation.amountPaid : amountPaidCustom}
                          onChange={(e) => setAmountPaidCustom(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder={String(calculation.grandTotal)}
                          className="w-full pl-6 pr-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold text-right focus:outline-none focus:border-[#0984E3]"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          ₹
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                      <span>Balance Due:</span>
                      <span className={`font-mono font-bold ${calculation.balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(calculation.balanceDue)}
                      </span>
                    </div>

                    {calculation.balanceDue > 0 && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 italic">
                        Balance due will be posted to customer's Khata ledger.
                      </p>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Invoice Notes / Terms
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Thanks for your business! Goods once sold can be exchanged within 7 days."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 hover:bg-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateInvoice}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>⚡ Direct Generate Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToReview}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <span>Final Review</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: FINAL REVIEW & CONFIRMATION */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-[#1E272E] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#2A3642] shadow-xs space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Step 4: Final Review & Issue Invoice</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Please review the complete bill details before finalizing and updating store stock.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">Estimated Invoice No:</span>
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                  {business.invoiceSettings?.invoicePrefix || 'VY-2026-'}
                  {String((business.invoiceSettings?.startingNumber || 100) + 1).padStart(6, '0')}
                </span>
              </div>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Customer Details</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{activeCustomer?.name}</p>
                <p className="text-slate-500 font-mono mt-0.5">
                  {activeCustomer?.phone || 'Counter Walk-in'}
                </p>
                {activeCustomer?.gstin && (
                  <p className="text-slate-500 font-mono text-[10px]">GSTIN: {activeCustomer.gstin}</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Billing Summary</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {items.length} Line Items
                </p>
                <p className="text-slate-500 mt-0.5 font-mono">
                  Taxable: {formatCurrency(calculation.taxableAmount)} • GST: {formatCurrency(calculation.totalGst)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-semibold block mb-1">Payment & Settlement</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm uppercase">
                  {paymentMethod.toUpperCase()} ({formatCurrency(calculation.amountPaid)})
                </p>
                {calculation.balanceDue > 0 ? (
                  <p className="text-amber-600 font-semibold mt-0.5 font-mono">
                    Balance Due: {formatCurrency(calculation.balanceDue)} (Added to Khata)
                  </p>
                ) : (
                  <p className="text-slate-500 mt-0.5">Fully Settled</p>
                )}
              </div>
            </div>

            {/* Line Items Confirmation Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-[#12181F] text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Item Disc</th>
                    <th className="py-2.5 px-3 text-right">Taxable</th>
                    <th className="py-2.5 px-3 text-right">GST</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {calculation.computedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-semibold">
                        <div>
                          <span>{item.productName}</span>
                          {item.hsn && <span className="block text-[10px] text-slate-400 font-mono">HSN: {item.hsn}</span>}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {item.quantity} {item.unit || 'PCS'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.price)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 font-mono">
                        {item.discountAmount > 0 ? (
                          <span>
                            −{formatCurrency(item.discountAmount)}
                            <span className="block text-[9px] text-slate-400">
                              ({item.discountMode === 'fixed' ? 'Fixed' : `${item.discountValue || item.discountPercent}%`})
                            </span>
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.taxableAmount)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500 font-mono">
                        {item.gstRate}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900 dark:text-white">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 hover:bg-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Summary</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateInvoice}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition transform active:scale-98 cursor-pointer"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Generate Invoice ({formatCurrency(calculation.grandTotal)})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INVOICE CREATED SUCCESS MODAL */}
      {/* ========================================================================= */}
      {isSuccessModal && lastCreatedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center text-xs animate-modal-pop">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-checkmark-pop shadow-md shadow-emerald-500/20">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                ✓ Invoice Created Successfully
              </h3>
              <p className="text-slate-500">
                Stock updated, payment recorded, and audit trail logged.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {lastCreatedInvoice.invoiceNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {lastCreatedInvoice.customerName}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-900 dark:text-white">Total Amount:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{lastCreatedInvoice.grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Success Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setSelectedInvoiceForPrint(lastCreatedInvoice);
                }}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp Bill</span>
              </button>
            </div>

            <button
              onClick={handleStartNewBill}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Bill</span>
            </button>
          </div>
        </div>
      )}

      {/* Inline Quick Add Product Modal */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Quick Add Product</span>
              <button onClick={() => setIsNewProductModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={quickProdName}
                  onChange={(e) => setQuickProdName(e.target.value)}
                  placeholder="e.g. 65W GaN Type-C Adapter"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={quickProdPrice}
                    onChange={(e) => setQuickProdPrice(Number(e.target.value))}
                    placeholder="199"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={quickProdStock}
                    onChange={(e) => setQuickProdStock(Number(e.target.value))}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewProductModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateProductInline}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Add & Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onProductScanned={(product) => {
            addItemToCart(product);
            setIsScannerOpen(false);
          }}
        />
      )}
    </div>
  );
};
