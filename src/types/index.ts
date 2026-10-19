export type BusinessType = 'retailer' | 'wholesaler' | 'service' | 'distributor' | 'manufacturer';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type SubscriptionTier = 'free' | 'basic' | 'business' | 'pro';

export interface BankDetails {
  bankName: string;
  accountNo: string;
  ifsc: string;
  branch: string;
  accountHolder?: string;
}

export type InvoiceTemplateId =
  | 'template_1' // Modern Electric (VYAPRIX Signature)
  | 'template_2' // Minimalist Executive (Monochrome & Cyan)
  | 'template_3' // Corporate Compact (Enterprise GST Grid)
  | 'standard'
  | 'modern'
  | 'minimal';

export interface InvoiceSettings {
  invoicePrefix: string;
  startingNumber: number;
  terms: string;
  footerNotes: string;
  showLogo: boolean;
  showBankDetails: boolean;
  showUpiQr: boolean;
  themeColor: string;
  template: InvoiceTemplateId;
  showPoweredBy?: boolean;
  showAmountInWords?: boolean;
  showHsn?: boolean;
  signatureTitle?: string;
  tagline?: string;
  taxMode?: 'exclusive' | 'inclusive'; // Tax-exclusive (default) or Tax-inclusive
  roundOffEnabled?: boolean;
  showDecimals?: boolean;
}

export type DiscountMode = 'fixed' | 'percentage';

export interface TaxBreakdownItem {
  gstRate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
}

export interface SmtpSettings {
  enabled: boolean;
  host: string;
  port: number;
  email: string;
  appPassword: string;
  senderName: string;
  secure: boolean;
}

export interface Business {
  id: string;
  name: string;
  tagline: string;
  logo?: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  stateCode: string; // e.g. "27" for Maharashtra
  pinCode: string;
  gstin?: string;
  pan?: string;
  udyam?: string;
  businessType: BusinessType;
  bankDetails: BankDetails;
  upiId?: string;
  invoiceSettings: InvoiceSettings;
  smtpSettings?: SmtpSettings;
  plan: SubscriptionTier;
  createdAt: string;
  currency: string; // '₹'
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size: L, Color: Navy"
  sku: string;
  price: number;
  stock: number;
}

export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'inactive';

export interface ProductSupplierHistory {
  supplierId: string;
  supplierName: string;
  supplierSku?: string;
  purchasePrice?: number;
  lastPurchaseDate?: string;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory?: string;
  brand?: string;
  unit: string; // PCS, KG, BOX, MTR, LTR, PKT, SET
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  stock: number;
  openingStock: number;
  minStockLevel: number;
  gstRate: number; // 0, 3, 5, 12, 18, 28
  hsnCode: string;
  supplierId?: string;
  supplierName?: string;
  supplierSku?: string;
  lastPurchasePrice?: number;
  lastPurchaseDate?: string;
  supplierHistory?: ProductSupplierHistory[];
  description?: string;
  images: string[];
  batchNumber?: string;
  expiryDate?: string;
  variants?: ProductVariant[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  creditLimit: number;
  outstandingBalance: number; // Positive means customer owes business (Udhaar)
  totalPurchases: number;
  totalOrdersCount: number;
  lastPurchaseDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  businessName: string;
  ownerName?: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentTerms?: string; // e.g. "15 Days"
  outstandingBalance: number; // Positive means business owes supplier
  totalPurchases: number;
  createdAt: string;
}

export type InvoiceType =
  | 'tax_invoice'
  | 'bill_of_supply'
  | 'quotation'
  | 'proforma'
  | 'estimate'
  | 'receipt';

export type PaymentStatus = 'paid' | 'partially_paid' | 'pending' | 'cancelled' | 'returned';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'credit' | 'split';

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  hsn: string;
  quantity: number;
  unit: string;
  price: number; // Base unit selling price
  mrp: number;
  grossAmount?: number; // quantity * price
  discountMode?: DiscountMode; // 'fixed' | 'percentage'
  discountPercent: number; // Percentage value (for backwards compatibility)
  discountValue?: number; // Entered discount value (₹ or %)
  discountAmount: number; // Calculated rupee discount amount
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  businessId: string;
  invoiceNo: string;
  invoiceType: InvoiceType;
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerGstin?: string;
  customerAddress?: string;
  customerStateCode?: string;
  items: InvoiceItem[];
  subtotal: number; // Gross item subtotal (sum of price * qty)
  itemDiscountTotal?: number; // Total of item-level discounts
  billDiscountMode?: DiscountMode; // 'fixed' | 'percentage'
  billDiscountValue?: number; // Entered bill-level discount rate or ₹
  billDiscountAmount?: number; // Calculated bill-level discount ₹
  couponCode?: string;
  couponDiscount?: number;
  otherCharges?: number; // Shipping, packaging, or delivery
  discount: number; // Combined total discount (items + bill + coupon)
  taxableAmount: number;
  isInterState: boolean;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  roundOff: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  createdByStaffId?: string;
  createdByName?: string;
  createdAt: string;
  returnedAmount?: number;
  taxBreakdownByRate?: TaxBreakdownItem[];
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  grossAmount?: number;
  discountMode?: DiscountMode;
  discountValue?: number;
  discountAmount?: number;
  taxableAmount?: number;
  gstRate: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  total: number;
}

export interface Purchase {
  id: string;
  businessId: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  supplierGstin?: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number; // Gross items total
  itemDiscountTotal?: number;
  billDiscountMode?: DiscountMode;
  billDiscountValue?: number;
  billDiscountAmount?: number;
  discount?: number; // Combined discounts
  taxableAmount?: number;
  taxAmount: number;
  otherCharges?: number;
  roundOff?: number;
  grandTotal: number;
  paymentStatus: 'paid' | 'pending' | 'partially_paid';
  paymentMethod: PaymentMethod;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  createdAt: string;
}

export type KhataType = 'credit' | 'debit' | 'payment_in' | 'payment_out';

export interface KhataEntry {
  id: string;
  businessId: string;
  partyType: 'customer' | 'supplier';
  partyId: string;
  partyName: string;
  partyPhone: string;
  date: string;
  type: KhataType;
  amount: number;
  balanceAfter: number;
  referenceType: 'invoice' | 'purchase' | 'manual_credit' | 'manual_payment' | 'return';
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity'
  | 'Internet'
  | 'Salary'
  | 'Transport'
  | 'Packaging'
  | 'Marketing'
  | 'Maintenance'
  | 'Purchases'
  | 'Other';

export interface Expense {
  id: string;
  businessId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
  description?: string;
  receiptUrl?: string;
  referenceNo?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  businessId: string;
  type: 'received' | 'paid';
  partyType: 'customer' | 'supplier' | 'other';
  partyId?: string;
  partyName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  invoiceId?: string;
  purchaseId?: string;
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface SalesReturnItem {
  productId: string;
  productName: string;
  returnQty: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface SalesReturn {
  id: string;
  businessId: string;
  invoiceId: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  date: string;
  items: SalesReturnItem[];
  totalRefund: number;
  refundMethod: 'cash' | 'upi' | 'store_credit' | 'original';
  reason: string;
  createdAt: string;
}

export interface PurchaseReturnItem {
  productId: string;
  productName: string;
  returnQty: number;
  purchasePrice: number;
  total: number;
}

export interface PurchaseReturn {
  id: string;
  businessId: string;
  purchaseId: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseReturnItem[];
  totalRefund: number;
  reason: string;
  createdAt: string;
}

export type StockMovementType =
  | 'opening'
  | 'sold'
  | 'purchased'
  | 'returned_in'
  | 'returned_out'
  | 'damaged'
  | 'adjustment'
  | 'expired';

export interface StockMovement {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityChange: number; // positive for addition, negative for reduction
  stockBefore: number;
  stockAfter: number;
  reason: string;
  referenceId?: string;
  createdBy: string;
  createdAt: string;
}

export type StaffRole = 'owner' | 'manager' | 'cashier' | 'inventory_manager' | 'accountant';

export interface StaffPermissions {
  viewSales: boolean;
  createInvoice: boolean;
  editInvoice: boolean;
  cancelInvoice: boolean;
  viewProfit: boolean;
  viewGst: boolean;
  manageInventory: boolean;
  manageCustomers: boolean;
  manageSuppliers: boolean;
  manageExpenses: boolean;
  manageSettings: boolean;
  applyDiscount?: boolean;
  maxDiscountPercent?: number; // Maximum % discount this staff can give (e.g. 15%)
  maxDiscountFixed?: number; // Maximum ₹ fixed discount this staff can give (e.g. 500)
  requireDiscountApproval?: boolean;
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  pin: string;
  permissions: StaffPermissions;
  active: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'low_stock'
  | 'payment_due'
  | 'invoice_created'
  | 'payment_received'
  | 'purchase_added'
  | 'return_created'
  | 'system';

export interface Notification {
  id: string;
  businessId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  businessId: string;
  staffName: string;
  role: string;
  action: string;
  details: string;
  timestamp: string;
  device: string;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  pricePerMonth: number;
  description: string;
  features: string[];
  maxInvoicesPerMonth: number;
  hasAi: boolean;
  hasStaff: boolean;
  hasWhatsApp: boolean;
  hasAdvancedReports: boolean;
}

export interface IndianState {
  code: string;
  name: string;
}
