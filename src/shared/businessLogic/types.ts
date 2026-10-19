import {
  PaymentMethod,
  PaymentStatus,
  DiscountMode,
  InvoiceItem,
  TaxBreakdownItem,
  StaffPermissions,
} from '../../types';

export type { PaymentMethod, PaymentStatus, DiscountMode, InvoiceItem, TaxBreakdownItem, StaffPermissions };

export type InvoiceType = 'tax_invoice' | 'bill_of_supply' | 'proforma' | 'credit_note' | 'debit_note';

export type SyncStatus = 'synced' | 'pending_sync' | 'syncing' | 'sync_failed' | 'conflict';

export interface LineItemInput {
  productId?: string;
  productName?: string;
  sku?: string;
  hsn?: string;
  unitPrice: number;
  quantity: number;
  unit?: string;
  discountMode?: DiscountMode;
  discountValue?: number;
  gstRate: number;
  isInterState: boolean;
  taxMode?: 'exclusive' | 'inclusive';
}

export interface ComputedLineItem {
  grossAmount: number;
  discountMode: DiscountMode;
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  total: number;
}

export interface BillCalculationInput {
  items: Array<{
    id?: string;
    productId?: string;
    productName: string;
    sku?: string;
    hsn?: string;
    unitPrice: number;
    quantity: number;
    unit?: string;
    discountMode?: DiscountMode;
    discountValue?: number;
    gstRate: number;
  }>;
  billDiscountMode?: DiscountMode;
  billDiscountValue?: number;
  couponCode?: string;
  couponDiscount?: number;
  otherCharges?: number;
  isInterState: boolean;
  taxMode?: 'exclusive' | 'inclusive';
  roundOffEnabled?: boolean;
  amountPaid?: number | null | '';
  paymentMethod?: PaymentMethod;
}

export interface BillCalculationResult {
  grossSubtotal: number;
  itemDiscountsTotal: number;
  eligibleBaseForBillDiscount: number;
  billDiscountMode: DiscountMode;
  billDiscountValue: number;
  billDiscountAmount: number;
  couponCode?: string;
  couponDiscountAmount: number;
  otherEligibleDiscountsTotal: number;
  otherCharges: number;
  totalDiscount: number;
  taxableAmount: number;
  isInterState: boolean;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGst: number;
  taxBreakdownByRate: TaxBreakdownItem[];
  exactGrandTotal: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  computedItems: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    hsn: string;
    quantity: number;
    unit: string;
    price: number;
    mrp: number;
    grossAmount: number;
    discountMode: DiscountMode;
    discountPercent: number;
    discountValue: number;
    discountAmount: number;
    taxableAmount: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    total: number;
  }>;
}

