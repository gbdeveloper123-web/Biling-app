import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Business,
  Product,
  Customer,
  Supplier,
  Invoice,
  Purchase,
  KhataEntry,
  Expense,
  Staff,
  Notification,
  ActivityLog,
  StockMovement,
  SalesReturn,
  PurchaseReturn,
  ThemeMode,
  SmtpSettings,
} from '../types';
import { AuthUser, OnboardingPayload } from '../types/auth';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';
import { offlineSyncManager } from '../services/offlineSyncManager';
import { detectPlatform, PlatformType } from '../services/platformService';
import {
  INITIAL_BUSINESS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_INVOICES,
  INITIAL_PURCHASES,
  INITIAL_KHATA,
  INITIAL_EXPENSES,
  INITIAL_STAFF,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/mockData';

export type AppView =
  | 'dashboard'
  | 'billing'
  | 'invoices'
  | 'purchases'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'khata'
  | 'expenses'
  | 'returns'
  | 'reports'
  | 'gst'
  | 'staff'
  | 'notifications'
  | 'ai_assistant'
  | 'settings'
  | 'super_admin';

interface ShopContextType {
  // SaaS Authentication & Onboarding
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  loginUser: (user: AuthUser, token: string) => void;
  logoutUser: () => void;
  completeOnboardingUser: (payload: OnboardingPayload) => Promise<void>;

  // Core Entities
  business: Business;
  allBusinesses: Business[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  purchases: Purchase[];
  khata: KhataEntry[];
  expenses: Expense[];
  staff: Staff[];
  currentStaff: Staff;
  notifications: Notification[];
  activityLogs: ActivityLog[];
  stockMovements: StockMovement[];
  salesReturns: SalesReturn[];
  purchaseReturns: PurchaseReturn[];

  // Navigation & UI
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  goBack: () => void;
  canGoBack: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  desktopSidebarCollapsed: boolean;
  setDesktopSidebarCollapsed: (collapsed: boolean) => void;
  selectedInvoiceForPrint: Invoice | null;
  setSelectedInvoiceForPrint: (inv: Invoice | null) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  barcodeScannerEnabled: boolean;
  setBarcodeScannerEnabled: (enabled: boolean) => void;
  smtpSettings: SmtpSettings;
  updateSmtpSettings: (settings: Partial<SmtpSettings>) => void;

  // Actions
  createInvoice: (inv: Omit<Invoice, 'id' | 'createdAt' | 'businessId'>) => Invoice;
  cancelInvoice: (id: string, reason: string) => void;
  addProduct: (p: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (
    productId: string,
    quantityChange: number,
    type: StockMovement['type'],
    reason: string
  ) => void;
  addPurchase: (pur: Omit<Purchase, 'id' | 'createdAt' | 'businessId'>) => Purchase;
  addCustomer: (c: Omit<Customer, 'id' | 'businessId' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  addSupplier: (s: Omit<Supplier, 'id' | 'businessId' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  recordKhataEntry: (entry: Omit<KhataEntry, 'id' | 'businessId' | 'createdAt'>) => void;
  addExpense: (exp: Omit<Expense, 'id' | 'businessId' | 'createdAt'>) => Expense;
  processSalesReturn: (
    ret: Omit<SalesReturn, 'id' | 'businessId' | 'createdAt'>
  ) => SalesReturn;
  processPurchaseReturn: (
    ret: Omit<PurchaseReturn, 'id' | 'businessId' | 'createdAt'>
  ) => PurchaseReturn;
  addStaff: (s: Omit<Staff, 'id' | 'businessId' | 'createdAt'>) => Staff;
  updateStaff: (id: string, s: Partial<Staff>) => void;
  setCurrentStaff: (s: Staff) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateBusiness: (b: Partial<Business>) => void;
  switchBusiness: (id: string) => void;
  createNewBusiness: (b: Omit<Business, 'id' | 'createdAt'>) => void;
  resetToDemoData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;

  // Multi-Platform & Offline Sync
  platform: PlatformType;
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncedAt: string | null;
  triggerManualSync: () => Promise<void>;

  // Computed Business Analytics
  analytics: {
    salesToday: number;
    salesYesterday: number;
    salesTodayChangePct: number;
    salesThisMonth: number;
    ordersToday: number;
    ordersThisMonth: number;
    estimatedProfitToday: number;
    estimatedProfitThisMonth: number;
    pendingPayments: number; // Customer dues
    supplierDues: number;
    totalStockValue: number;
    lowStockCount: number;
    lowStockProducts: Product[];
    outOfStockCount: number;
    expensesThisMonth: number;
    salesTrend7D: { date: string; label: string; amount: number }[];
    paymentBreakdown: { method: string; label: string; amount: number; count: number }[];
    topProducts: { name: string; sku: string; unitsSold: number; revenue: number }[];
    topCustomers: Customer[];
  };
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEY = 'shopmate_business_v1';

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // SaaS Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('vyaprix_auth_user') || sessionStorage.getItem('vyaprix_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('vyaprix_auth_token') || sessionStorage.getItem('vyaprix_auth_token');
    return !!token;
  });

  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Load state from local storage or defaults
  const [business, setBusiness] = useState<Business>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_biz`);
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS;
  });

  const [allBusinesses, setAllBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_all_biz`);
    return saved ? JSON.parse(saved) : [INITIAL_BUSINESS];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prods`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_custs`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_supps`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invs`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_purch`);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [khata, setKhata] = useState<KhataEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_khata`);
    return saved ? JSON.parse(saved) : INITIAL_KHATA;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_exp`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_staff`);
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [currentStaff, setCurrentStaff] = useState<Staff>(() => staff[0] || INITIAL_STAFF[0]);

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notif`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_movements`);
    return saved ? JSON.parse(saved) : [];
  });

  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);

  // Multi-platform & Offline Sync State
  const [platform] = useState<PlatformType>(() => detectPlatform());
  const [syncStatus, setSyncStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncedAt: null as string | null,
    lastError: null as string | null,
  });

  useEffect(() => {
    const unsubscribe = offlineSyncManager.subscribe((status) => {
      setSyncStatus(status);
    });
    return unsubscribe;
  }, []);

  const triggerManualSync = async () => {
    await offlineSyncManager.processQueue();
  };

  // Validate session on mount
  useEffect(() => {
    const token = localStorage.getItem('vyaprix_auth_token') || sessionStorage.getItem('vyaprix_auth_token');
    if (!token) {
      setAuthChecked(true);
      return;
    }

    fetch(`/api/auth/session?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setAuthUser(data.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('vyaprix_auth_token');
          localStorage.removeItem('vyaprix_auth_user');
          sessionStorage.removeItem('vyaprix_auth_token');
          sessionStorage.removeItem('vyaprix_auth_user');
          setAuthUser(null);
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        // Fallback for network issues in dev environment
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  const loginUser = (user: AuthUser, token: string) => {
    setAuthUser(user);
    setIsAuthenticated(true);
    if (user.businessName) {
      setBusiness((prev) => ({
        ...prev,
        name: user.businessName,
      }));
    }
  };

  const logoutUser = () => {
    const token = localStorage.getItem('vyaprix_auth_token') || sessionStorage.getItem('vyaprix_auth_token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => {});
    }
    localStorage.removeItem('vyaprix_auth_token');
    localStorage.removeItem('vyaprix_auth_user');
    sessionStorage.removeItem('vyaprix_auth_token');
    sessionStorage.removeItem('vyaprix_auth_user');
    sessionStorage.removeItem('vyaprix_sa_token');
    setAuthUser(null);
    setIsAuthenticated(false);
    setActiveViewRaw('dashboard');
  };

  const completeOnboardingUser = async (payload: OnboardingPayload) => {
    if (authUser) {
      try {
        await fetch('/api/auth/complete-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authUser.id, businessDetails: payload }),
        });
      } catch (e) {}

      const updatedUser: AuthUser = {
        ...authUser,
        onboardingComplete: true,
        businessName: payload.businessName,
      };
      setAuthUser(updatedUser);
      localStorage.setItem('vyaprix_auth_user', JSON.stringify(updatedUser));
    }

    updateBusiness({
      name: payload.businessName,
      businessType: payload.businessType as any,
      gstin: payload.isGstRegistered ? payload.gstin : undefined,
      state: payload.state,
      stateCode: payload.stateCode,
      city: payload.city,
      address: payload.address,
      phone: payload.phone,
      email: payload.email,
      invoiceSettings: {
        ...business.invoiceSettings,
        invoicePrefix: payload.invoicePrefix,
        startingNumber: payload.startingInvoiceNo,
      },
    });
  };

  // Navigation state with history tracking
  const [activeView, setActiveViewRaw] = useState<AppView>('dashboard');
  const [viewHistory, setViewHistory] = useState<AppView[]>(['dashboard']);

  const setActiveView = (view: AppView) => {
    setActiveViewRaw(view);
    setViewHistory((prev) => {
      if (prev[prev.length - 1] === view) return prev;
      return [...prev, view];
    });
  };

  const goBack = () => {
    if (viewHistory.length > 1) {
      const copy = [...viewHistory];
      copy.pop();
      const prevView = copy[copy.length - 1];
      setViewHistory(copy);
      setActiveViewRaw(prevView);
    } else {
      setActiveViewRaw('dashboard');
    }
  };

  const canGoBack = activeView !== 'dashboard' || viewHistory.length > 1;
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Language state
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_language`);
      if (saved && saved in TRANSLATIONS) return saved as SupportedLanguage;
    } catch {}
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_language`, language);
  }, [language]);

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  // Barcode scanner setting (Default: FALSE - hidden by default unless opened from Settings)
  const [barcodeScannerEnabled, setBarcodeScannerEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_barcode_scanner_enabled`);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_barcode_scanner_enabled`, JSON.stringify(barcodeScannerEnabled));
  }, [barcodeScannerEnabled]);

  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_desktop_sidebar_collapsed`);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_desktop_sidebar_collapsed`, JSON.stringify(desktopSidebarCollapsed));
  }, [desktopSidebarCollapsed]);

  // Theme Mode: 'light' | 'dark' | 'auto'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_theme_mode`);
      if (saved === 'light' || saved === 'dark' || saved === 'auto') {
        return saved;
      }
    } catch {}
    return 'light';
  });

  // Track system preference for auto mode
  const [isSystemDark, setIsSystemDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Compute active dark state
  const darkMode = themeMode === 'dark' || (themeMode === 'auto' && isSystemDark);

  // Apply dark class to document root and save
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_theme_mode`, themeMode);
    localStorage.setItem('shopmate_business_v1_theme', themeMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode, darkMode]);

  const toggleDarkMode = () => {
    setThemeMode((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'auto';
      return 'light';
    });
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_biz`, JSON.stringify(business));
    localStorage.setItem(`${STORAGE_KEY}_all_biz`, JSON.stringify(allBusinesses));
    localStorage.setItem(`${STORAGE_KEY}_prods`, JSON.stringify(products));
    localStorage.setItem(`${STORAGE_KEY}_custs`, JSON.stringify(customers));
    localStorage.setItem(`${STORAGE_KEY}_supps`, JSON.stringify(suppliers));
    localStorage.setItem(`${STORAGE_KEY}_invs`, JSON.stringify(invoices));
    localStorage.setItem(`${STORAGE_KEY}_purch`, JSON.stringify(purchases));
    localStorage.setItem(`${STORAGE_KEY}_khata`, JSON.stringify(khata));
    localStorage.setItem(`${STORAGE_KEY}_exp`, JSON.stringify(expenses));
    localStorage.setItem(`${STORAGE_KEY}_staff`, JSON.stringify(staff));
    localStorage.setItem(`${STORAGE_KEY}_notif`, JSON.stringify(notifications));
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(activityLogs));
    localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify(stockMovements));
    localStorage.setItem(`${STORAGE_KEY}_dark`, JSON.stringify(darkMode));
  }, [
    business,
    allBusinesses,
    products,
    customers,
    suppliers,
    invoices,
    purchases,
    khata,
    expenses,
    staff,
    notifications,
    activityLogs,
    stockMovements,
    darkMode,
  ]);

  // Helper to log activities
  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: 'act_' + Date.now(),
      businessId: business.id,
      staffName: currentStaff.name,
      role: currentStaff.role.toUpperCase(),
      action,
      details,
      timestamp: new Date().toISOString(),
      device: 'ShopMate Web App (Browser)',
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Helper to add notification
  const notify = (title: string, message: string, type: Notification['type'], link?: string) => {
    const newNotif: Notification = {
      id: 'notif_' + Date.now(),
      businessId: business.id,
      title,
      message,
      type,
      read: false,
      link,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // --- ACTIONS ---

  // 1. Create Invoice
  const createInvoice = (invData: Omit<Invoice, 'id' | 'createdAt' | 'businessId'>): Invoice => {
    const newId = 'inv_' + Date.now();
    const newInvoice: Invoice = {
      ...invData,
      id: newId,
      businessId: business.id,
      createdAt: new Date().toISOString(),
      createdByName: currentStaff.name,
      createdByStaffId: currentStaff.id,
    };

    // 1. Add to invoices
    setInvoices((prev) => [newInvoice, ...prev]);

    // Multi-Platform Durable Offline Queue
    offlineSyncManager.enqueueInvoice(business.id, newInvoice).catch((err) => {
      console.warn('Offline sync enqueue notice:', err);
    });

    // 2. Reduce product stock & record movements
    setProducts((prev) => {
      return prev.map((prod) => {
        const item = newInvoice.items.find((i) => i.productId === prod.id);
        if (item) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          const newStatus =
            newStock === 0 ? 'out_of_stock' : newStock <= prod.minStockLevel ? 'low_stock' : 'in_stock';

          // Log movement
          setStockMovements((sm) => [
            {
              id: 'sm_' + Date.now() + '_' + prod.id,
              businessId: business.id,
              productId: prod.id,
              productName: prod.name,
              type: 'sold',
              quantityChange: -item.quantity,
              stockBefore: prod.stock,
              stockAfter: newStock,
              reason: `Sold via Invoice #${newInvoice.invoiceNo}`,
              referenceId: newInvoice.invoiceNo,
              createdBy: currentStaff.name,
              createdAt: new Date().toISOString(),
            },
            ...sm,
          ]);

          // Trigger low stock notification
          if (newStock <= prod.minStockLevel) {
            notify(
              `Low Stock: ${prod.name}`,
              `Only ${newStock} units left. Min required: ${prod.minStockLevel}`,
              'low_stock',
              'inventory'
            );
          }

          return {
            ...prod,
            stock: newStock,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return prod;
      });
    });

    // 3. Update customer stats & Khata if pending/partial
    if (newInvoice.customerId) {
      setCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id === newInvoice.customerId) {
            const addedDue = newInvoice.balanceDue;
            return {
              ...cust,
              totalPurchases: cust.totalPurchases + newInvoice.grandTotal,
              totalOrdersCount: cust.totalOrdersCount + 1,
              outstandingBalance: cust.outstandingBalance + addedDue,
              lastPurchaseDate: newInvoice.createdAt,
            };
          }
          return cust;
        })
      );

      // If credit / partial, record in Khata
      if (newInvoice.balanceDue > 0) {
        const cust = customers.find((c) => c.id === newInvoice.customerId);
        const curBal = (cust?.outstandingBalance || 0) + newInvoice.balanceDue;
        const khataEntry: KhataEntry = {
          id: 'kht_' + Date.now(),
          businessId: business.id,
          partyType: 'customer',
          partyId: newInvoice.customerId,
          partyName: newInvoice.customerName,
          partyPhone: newInvoice.customerPhone || '',
          date: newInvoice.invoiceDate,
          type: 'credit',
          amount: newInvoice.balanceDue,
          balanceAfter: curBal,
          referenceType: 'invoice',
          referenceId: newInvoice.invoiceNo,
          notes: `Pending balance on invoice ${newInvoice.invoiceNo}`,
          createdAt: new Date().toISOString(),
        };
        setKhata((prev) => [khataEntry, ...prev]);
      }
    }

    // 4. Log activity & notification
    logActivity(
      `Created Invoice ${newInvoice.invoiceNo}`,
      `Customer: ${newInvoice.customerName} | Total: ₹${newInvoice.grandTotal} (${newInvoice.paymentStatus})`
    );

    notify(
      `Invoice Created: #${newInvoice.invoiceNo}`,
      `${newInvoice.customerName} - ₹${newInvoice.grandTotal} (${newInvoice.paymentMethod})`,
      'invoice_created',
      'invoices'
    );

    return newInvoice;
  };

  // 2. Cancel Invoice (Reversible & Audit-safe)
  const cancelInvoice = (id: string, reason: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv || inv.paymentStatus === 'cancelled') return;

    // Update status
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, paymentStatus: 'cancelled', notes: `${i.notes || ''} [CANCELLED: ${reason}]` } : i))
    );

    // Restore stock
    setProducts((prev) =>
      prev.map((prod) => {
        const item = inv.items.find((i) => i.productId === prod.id);
        if (item) {
          const restoredStock = prod.stock + item.quantity;
          const restoredStatus =
            restoredStock === 0
              ? 'out_of_stock'
              : restoredStock <= prod.minStockLevel
              ? 'low_stock'
              : 'in_stock';

          setStockMovements((sm) => [
            {
              id: 'sm_' + Date.now() + '_' + prod.id,
              businessId: business.id,
              productId: prod.id,
              productName: prod.name,
              type: 'returned_in',
              quantityChange: item.quantity,
              stockBefore: prod.stock,
              stockAfter: restoredStock,
              reason: `Invoice #${inv.invoiceNo} Cancelled: ${reason}`,
              referenceId: inv.invoiceNo,
              createdBy: currentStaff.name,
              createdAt: new Date().toISOString(),
            },
            ...sm,
          ]);

          return {
            ...prod,
            stock: restoredStock,
            status: restoredStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return prod;
      })
    );

    // Revert customer dues if invoice had balanceDue
    if (inv.customerId && inv.balanceDue > 0) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === inv.customerId
            ? { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - inv.balanceDue) }
            : c
        )
      );

      setKhata((prev) => [
        {
          id: 'kht_' + Date.now(),
          businessId: business.id,
          partyType: 'customer',
          partyId: inv.customerId,
          partyName: inv.customerName,
          partyPhone: inv.customerPhone || '',
          date: new Date().toISOString(),
          type: 'payment_in',
          amount: inv.balanceDue,
          balanceAfter: 0,
          referenceType: 'return',
          referenceId: inv.invoiceNo,
          notes: `Reversal: Invoice #${inv.invoiceNo} cancelled (${reason})`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    logActivity(`Cancelled Invoice ${inv.invoiceNo}`, `Reason: ${reason}`);
  };

  // 3. Products CRUD
  const addProduct = (
    pData: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>
  ): Product => {
    const newProd: Product = {
      ...pData,
      id: 'prod_' + Date.now(),
      businessId: business.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);

    // Initial stock movement
    if (newProd.stock > 0) {
      setStockMovements((sm) => [
        {
          id: 'sm_' + Date.now(),
          businessId: business.id,
          productId: newProd.id,
          productName: newProd.name,
          type: 'opening',
          quantityChange: newProd.stock,
          stockBefore: 0,
          stockAfter: newProd.stock,
          reason: 'Initial Opening Stock',
          createdBy: currentStaff.name,
          createdAt: new Date().toISOString(),
        },
        ...sm,
      ]);
    }

    logActivity(`Added Product`, `${newProd.name} (SKU: ${newProd.sku}, Price: ₹${newProd.sellingPrice})`);
    return newProd;
  };

  const updateProduct = (id: string, pData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...pData, updatedAt: new Date().toISOString() };
          // Re-evaluate stock status
          if (pData.stock !== undefined || pData.minStockLevel !== undefined) {
            const stock = pData.stock !== undefined ? pData.stock : p.stock;
            const min = pData.minStockLevel !== undefined ? pData.minStockLevel : p.minStockLevel;
            updated.status = stock === 0 ? 'out_of_stock' : stock <= min ? 'low_stock' : 'in_stock';
          }
          return updated;
        }
        return p;
      })
    );
    logActivity(`Updated Product`, `Product ID: ${id}`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logActivity(`Deleted Product`, `Product ID: ${id}`);
  };

  // 4. Stock Operations
  const adjustStock = (
    productId: string,
    quantityChange: number,
    type: StockMovement['type'],
    reason: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const stockBefore = p.stock;
          const stockAfter = Math.max(0, stockBefore + quantityChange);
          const status =
            stockAfter === 0 ? 'out_of_stock' : stockAfter <= p.minStockLevel ? 'low_stock' : 'in_stock';

          setStockMovements((sm) => [
            {
              id: 'sm_' + Date.now(),
              businessId: business.id,
              productId: p.id,
              productName: p.name,
              type,
              quantityChange,
              stockBefore,
              stockAfter,
              reason,
              createdBy: currentStaff.name,
              createdAt: new Date().toISOString(),
            },
            ...sm,
          ]);

          logActivity(
            `Stock Adjustment (${type})`,
            `${p.name}: ${stockBefore} → ${stockAfter} (${reason})`
          );

          return { ...p, stock: stockAfter, status, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  // 5. Purchases
  const addPurchase = (purData: Omit<Purchase, 'id' | 'createdAt' | 'businessId'>): Purchase => {
    const newPur: Purchase = {
      ...purData,
      id: 'pur_' + Date.now(),
      businessId: business.id,
      createdAt: new Date().toISOString(),
    };

    setPurchases((prev) => [newPur, ...prev]);

    // Automatically increase inventory
    newPur.items.forEach((item) => {
      adjustStock(item.productId, item.quantity, 'purchased', `Purchase Invoice #${newPur.purchaseNo}`);
    });

    // Update supplier stats & dues
    if (newPur.supplierId) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === newPur.supplierId) {
            return {
              ...s,
              totalPurchases: s.totalPurchases + newPur.grandTotal,
              outstandingBalance: s.outstandingBalance + newPur.balanceDue,
            };
          }
          return s;
        })
      );
    }

    logActivity(`Recorded Purchase ${newPur.purchaseNo}`, `Supplier: ${newPur.supplierName} | Total: ₹${newPur.grandTotal}`);
    notify(`Purchase Recorded: ${newPur.purchaseNo}`, `From ${newPur.supplierName} (₹${newPur.grandTotal})`, 'purchase_added', 'purchases');
    return newPur;
  };

  // 6. Customers & Suppliers
  const addCustomer = (cData: Omit<Customer, 'id' | 'businessId' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...cData,
      id: 'cust_' + Date.now(),
      businessId: business.id,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    logActivity(`Added Customer`, `${newCust.name} (${newCust.phone})`);
    return newCust;
  };

  const updateCustomer = (id: string, cData: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...cData } : c)));
    logActivity(`Updated Customer`, `Customer ID: ${id}`);
  };

  const addSupplier = (sData: Omit<Supplier, 'id' | 'businessId' | 'createdAt'>): Supplier => {
    const newSup: Supplier = {
      ...sData,
      id: 'sup_' + Date.now(),
      businessId: business.id,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSup, ...prev]);
    logActivity(`Added Supplier`, `${newSup.businessName} (${newSup.phone})`);
    return newSup;
  };

  const updateSupplier = (id: string, sData: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...sData } : s)));
    logActivity(`Updated Supplier`, `Supplier ID: ${id}`);
  };

  // 7. Khata Entries & Payment Recording
  const recordKhataEntry = (entryData: Omit<KhataEntry, 'id' | 'businessId' | 'createdAt'>) => {
    const newEntry: KhataEntry = {
      ...entryData,
      id: 'kht_' + Date.now(),
      businessId: business.id,
      createdAt: new Date().toISOString(),
    };
    setKhata((prev) => [newEntry, ...prev]);

    // Update customer or supplier balance
    if (newEntry.partyType === 'customer') {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newEntry.partyId) {
            const diff =
              newEntry.type === 'credit'
                ? newEntry.amount
                : newEntry.type === 'payment_in'
                ? -newEntry.amount
                : 0;
            return {
              ...c,
              outstandingBalance: Math.max(0, c.outstandingBalance + diff),
            };
          }
          return c;
        })
      );
    } else {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === newEntry.partyId) {
            const diff =
              newEntry.type === 'credit'
                ? newEntry.amount
                : newEntry.type === 'payment_out'
                ? -newEntry.amount
                : 0;
            return {
              ...s,
              outstandingBalance: Math.max(0, s.outstandingBalance + diff),
            };
          }
          return s;
        })
      );
    }

    logActivity(`Recorded Khata Entry`, `${newEntry.partyName}: ₹${newEntry.amount} (${newEntry.type})`);
  };

  // 8. Expenses
  const addExpense = (expData: Omit<Expense, 'id' | 'businessId' | 'createdAt'>): Expense => {
    const newExp: Expense = {
      ...expData,
      id: 'exp_' + Date.now(),
      businessId: business.id,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
    logActivity(`Recorded Expense`, `${newExp.title}: ₹${newExp.amount} [${newExp.category}]`);
    return newExp;
  };

  // 9. Returns
  const processSalesReturn = (
    retData: Omit<SalesReturn, 'id' | 'businessId' | 'createdAt'>
  ): SalesReturn => {
    const newRet: SalesReturn = {
      ...retData,
      id: 'ret_' + Date.now(),
      businessId: business.id,
      createdAt: new Date().toISOString(),
    };
    setSalesReturns((prev) => [newRet, ...prev]);

    // Restore returned product stock
    newRet.items.forEach((item) => {
      adjustStock(item.productId, item.returnQty, 'returned_in', `Sales Return from Invoice ${newRet.invoiceNo}`);
    });

    // Update customer outstanding if store credit
    if (newRet.customerId && newRet.refundMethod === 'store_credit') {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === newRet.customerId
            ? { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - newRet.totalRefund) }
            : c
        )
      );
    }

    logActivity(`Processed Sales Return`, `Invoice: ${newRet.invoiceNo} | Refund: ₹${newRet.totalRefund}`);
    return newRet;
  };

  const processPurchaseReturn = (
    retData: Omit<PurchaseReturn, 'id' | 'businessId' | 'createdAt'>
  ): PurchaseReturn => {
    const newRet: PurchaseReturn = {
      ...retData,
      id: 'pret_' + Date.now(),
      businessId: business.id,
      createdAt: new Date().toISOString(),
    };
    setPurchaseReturns((prev) => [newRet, ...prev]);

    // Reduce returned product stock (returned out to supplier)
    newRet.items.forEach((item) => {
      adjustStock(item.productId, -item.returnQty, 'returned_out', `Purchase Return from Bill #${newRet.purchaseNo}`);
    });

    // Update supplier outstanding balance (reduce payable amount)
    if (newRet.supplierId) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === newRet.supplierId
            ? { ...s, outstandingBalance: Math.max(0, s.outstandingBalance - newRet.totalRefund) }
            : s
        )
      );
    }

    logActivity(`Processed Purchase Return`, `Bill: ${newRet.purchaseNo} | Debit: ₹${newRet.totalRefund}`);
    return newRet;
  };

  // 10. Staff
  const addStaff = (sData: Omit<Staff, 'id' | 'businessId' | 'createdAt'>): Staff => {
    const newS: Staff = {
      ...sData,
      id: 'staff_' + Date.now(),
      businessId: business.id,
      createdAt: new Date().toISOString(),
    };
    setStaff((prev) => [...prev, newS]);
    logActivity(`Created Staff Account`, `${newS.name} (${newS.role})`);
    return newS;
  };

  const updateStaff = (id: string, sData: Partial<Staff>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...sData } : s)));
    logActivity(`Updated Staff Permissions`, `Staff ID: ${id}`);
  };

  // 11. Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // 12. Business Switcher & Onboarding
  const updateBusiness = (bData: Partial<Business>) => {
    setBusiness((prev) => {
      const updated = { ...prev, ...bData };
      setAllBusinesses((ab) => ab.map((b) => (b.id === updated.id ? updated : b)));
      return updated;
    });
    logActivity(`Updated Business Profile`, `${business.name}`);
  };

  const switchBusiness = (id: string) => {
    const found = allBusinesses.find((b) => b.id === id);
    if (found) {
      setBusiness(found);
      logActivity(`Switched Business`, `Now viewing ${found.name}`);
    }
  };

  const createNewBusiness = (bData: Omit<Business, 'id' | 'createdAt'>) => {
    const newBiz: Business = {
      ...bData,
      id: 'biz_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAllBusinesses((prev) => [...prev, newBiz]);
    setBusiness(newBiz);
    logActivity(`Created New Business`, `${newBiz.name}`);
  };

  // 13. SMTP / Gmail Service Settings
  const defaultSmtp: SmtpSettings = useMemo(() => ({
    enabled: true,
    host: 'smtp.gmail.com',
    port: 465,
    email: business.email || 'apexretail.mumbai@gmail.com',
    appPassword: '',
    senderName: business.name || 'VYAPRIX Business',
    secure: true,
  }), [business.email, business.name]);

  const smtpSettings: SmtpSettings = business.smtpSettings || defaultSmtp;

  const updateSmtpSettings = (settings: Partial<SmtpSettings>) => {
    const updatedSmtp: SmtpSettings = {
      ...smtpSettings,
      ...settings,
    };
    updateBusiness({
      smtpSettings: updatedSmtp,
    });
    logActivity('Updated Email / SMTP Settings', `Email: ${updatedSmtp.email} | Host: ${updatedSmtp.host}`);
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setBusiness(INITIAL_BUSINESS);
    setAllBusinesses([INITIAL_BUSINESS]);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setInvoices(INITIAL_INVOICES);
    setPurchases(INITIAL_PURCHASES);
    setKhata(INITIAL_KHATA);
    setExpenses(INITIAL_EXPENSES);
    setStaff(INITIAL_STAFF);
    setCurrentStaff(INITIAL_STAFF[0]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setStockMovements([]);
    localStorage.clear();
    logActivity(`Reset Demo Store`, `Re-initialized sample Indian business data.`);
  };

  // Export / Import
  const exportDataJson = () => {
    const exportObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      business,
      allBusinesses,
      products,
      customers,
      suppliers,
      invoices,
      purchases,
      khata,
      expenses,
      staff,
      stockMovements,
    };
    return JSON.stringify(exportObject, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.business && parsed.products) {
        setBusiness(parsed.business);
        if (parsed.allBusinesses) setAllBusinesses(parsed.allBusinesses);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.suppliers) setSuppliers(parsed.suppliers);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.purchases) setPurchases(parsed.purchases);
        if (parsed.khata) setKhata(parsed.khata);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.staff) setStaff(parsed.staff);
        logActivity(`Imported Business Backup`, `Successfully restored data from JSON.`);
        return true;
      }
    } catch (err) {
      console.error('Import error:', err);
    }
    return false;
  };

  // --- COMPUTED ANALYTICS ---
  const analytics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

    // Filter valid (non-cancelled) invoices
    const validInvoices = invoices.filter((i) => i.paymentStatus !== 'cancelled');

    // Sales today & yesterday
    const todayInvoices = validInvoices.filter((i) => i.invoiceDate.startsWith(todayStr));
    const yesterdayInvoices = validInvoices.filter((i) => i.invoiceDate.startsWith(yesterday));
    const monthInvoices = validInvoices.filter((i) => i.invoiceDate.startsWith(currentMonthStr));

    const salesToday = todayInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const salesYesterday = yesterdayInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const salesTodayChangePct =
      salesYesterday > 0 ? Math.round(((salesToday - salesYesterday) / salesYesterday) * 100) : 0;

    const salesThisMonth = monthInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const ordersToday = todayInvoices.length;
    const ordersThisMonth = monthInvoices.length;

    // Estimated profit: (selling price - purchase cost - item discount)
    let estimatedProfitThisMonth = 0;
    monthInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const costPrice = prod ? prod.purchasePrice : item.price * 0.6;
        const grossMargin = (item.price - costPrice) * item.quantity - item.discountAmount;
        estimatedProfitThisMonth += grossMargin;
      });
    });

    let estimatedProfitToday = 0;
    todayInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const costPrice = prod ? prod.purchasePrice : item.price * 0.6;
        estimatedProfitToday += (item.price - costPrice) * item.quantity - item.discountAmount;
      });
    });

    // Expenses this month
    const expensesThisMonth = expenses
      .filter((e) => e.date.startsWith(currentMonthStr))
      .reduce((sum, e) => sum + e.amount, 0);

    // Dues
    const pendingPayments = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
    const supplierDues = suppliers.reduce((sum, s) => sum + (s.outstandingBalance || 0), 0);

    // Stock
    const totalStockValue = products.reduce((sum, p) => sum + p.stock * p.purchasePrice, 0);
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= p.minStockLevel);
    const lowStockCount = lowStockProducts.length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    // Sales trend past 7 days
    const salesTrend7D = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(Date.now() - (6 - idx) * 86400000);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      const daySales = validInvoices
        .filter((i) => i.invoiceDate.startsWith(dStr))
        .reduce((sum, i) => sum + i.grandTotal, 0);
      return { date: dStr, label: dayLabel, amount: daySales };
    });

    // Payment breakdown
    const paymentMap: Record<string, { amount: number; count: number }> = {
      cash: { amount: 0, count: 0 },
      upi: { amount: 0, count: 0 },
      card: { amount: 0, count: 0 },
      bank_transfer: { amount: 0, count: 0 },
      credit: { amount: 0, count: 0 },
    };

    validInvoices.forEach((inv) => {
      const method = inv.paymentMethod || 'cash';
      if (!paymentMap[method]) paymentMap[method] = { amount: 0, count: 0 };
      paymentMap[method].amount += inv.amountPaid || inv.grandTotal;
      paymentMap[method].count += 1;
    });

    const paymentBreakdown = [
      { method: 'upi', label: 'UPI / QR', amount: paymentMap['upi'].amount, count: paymentMap['upi'].count },
      { method: 'cash', label: 'Cash', amount: paymentMap['cash'].amount, count: paymentMap['cash'].count },
      { method: 'card', label: 'Card / POS', amount: paymentMap['card'].amount, count: paymentMap['card'].count },
      {
        method: 'bank_transfer',
        label: 'Net Banking / NEFT',
        amount: paymentMap['bank_transfer'].amount,
        count: paymentMap['bank_transfer'].count,
      },
      { method: 'credit', label: 'Khata / Credit', amount: paymentMap['credit'].amount, count: paymentMap['credit'].count },
    ];

    // Top selling products
    const productSalesMap: Record<string, { unitsSold: number; revenue: number; name: string; sku: string }> = {};
    validInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            unitsSold: 0,
            revenue: 0,
            name: item.productName,
            sku: item.sku,
          };
        }
        productSalesMap[item.productId].unitsSold += item.quantity;
        productSalesMap[item.productId].revenue += item.total;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top customers
    const topCustomers = [...customers].sort((a, b) => b.totalPurchases - a.totalPurchases).slice(0, 5);

    return {
      salesToday,
      salesYesterday,
      salesTodayChangePct,
      salesThisMonth,
      ordersToday,
      ordersThisMonth,
      estimatedProfitToday,
      estimatedProfitThisMonth,
      pendingPayments,
      supplierDues,
      totalStockValue,
      lowStockCount,
      lowStockProducts,
      outOfStockCount,
      expensesThisMonth,
      salesTrend7D,
      paymentBreakdown,
      topProducts,
      topCustomers,
    };
  }, [invoices, products, customers, suppliers, expenses]);

  return (
    <ShopContext.Provider
      value={{
        // SaaS Authentication & Onboarding
        authUser,
        isAuthenticated,
        authChecked,
        loginUser,
        logoutUser,
        completeOnboardingUser,

        business,
        allBusinesses,
        products,
        customers,
        suppliers,
        invoices,
        purchases,
        khata,
        expenses,
        staff,
        currentStaff,
        notifications,
        activityLogs,
        stockMovements,
        salesReturns,
        purchaseReturns,
        activeView,
        setActiveView,
        goBack,
        canGoBack,
        themeMode,
        setThemeMode,
        darkMode,
        toggleDarkMode,
        desktopSidebarCollapsed,
        setDesktopSidebarCollapsed,
        selectedInvoiceForPrint,
        setSelectedInvoiceForPrint,
        language,
        setLanguage,
        t,
        barcodeScannerEnabled,
        setBarcodeScannerEnabled,
        smtpSettings,
        updateSmtpSettings,
        createInvoice,
        cancelInvoice,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addPurchase,
        addCustomer,
        updateCustomer,
        addSupplier,
        updateSupplier,
        recordKhataEntry,
        addExpense,
        processSalesReturn,
        processPurchaseReturn,
        addStaff,
        updateStaff,
        setCurrentStaff,
        markNotificationRead,
        markAllNotificationsRead,
        updateBusiness,
        switchBusiness,
        createNewBusiness,
        resetToDemoData,
        exportDataJson,
        importDataJson,
        platform,
        isOnline: syncStatus.isOnline,
        isSyncing: syncStatus.isSyncing,
        pendingSyncCount: syncStatus.pendingCount,
        lastSyncedAt: syncStatus.lastSyncedAt,
        triggerManualSync,
        analytics,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
