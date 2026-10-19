import { StaffPermissions } from './types';

export interface ValidationItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  availableStock?: number;
}

export interface InvoiceValidationPayload {
  items: ValidationItem[];
  customerPhone?: string;
  customerGstin?: string;
  invoiceType?: string;
  billDiscountPercent?: number;
  billDiscountFixed?: number;
  amountPaid?: number;
  grandTotal?: number;
  paymentMethod?: string;
  allowNegativeStock?: boolean;
  staffPermissions?: Partial<StaffPermissions> | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate standard Indian 15-character GSTIN format
 * Format: 2 digits (State) + 10 chars (PAN) + 1 digit (entity) + 'Z' + 1 checksum
 */
export function validateGstinFormat(gstin: string): boolean {
  if (!gstin) return true; // Optional for B2C
  const clean = gstin.trim().toUpperCase();
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(clean);
}

/**
 * Comprehensive client & server shared invoice validation engine.
 */
export function validateInvoicePayload(payload: InvoiceValidationPayload): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Items array validation
  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('Invoice must contain at least one product item.');
    return { isValid: false, errors, warnings };
  }

  // 2. Line item level validation
  const validGstRates = [0, 0.25, 3, 5, 12, 18, 28];

  payload.items.forEach((item, index) => {
    const itemNum = index + 1;
    if (!item.productName || !item.productName.trim()) {
      errors.push(`Item #${itemNum} is missing a product name.`);
    }

    if (isNaN(item.quantity) || item.quantity <= 0) {
      errors.push(`Item #${itemNum} (${item.productName || 'Unnamed'}) has invalid quantity: ${item.quantity}. Must be > 0.`);
    }

    if (isNaN(item.unitPrice) || item.unitPrice < 0) {
      errors.push(`Item #${itemNum} (${item.productName || 'Unnamed'}) has invalid price: ₹${item.unitPrice}. Must be >= 0.`);
    }

    if (!validGstRates.includes(item.gstRate)) {
      warnings.push(`Item #${itemNum} uses non-standard GST rate: ${item.gstRate}%.`);
    }

    // Stock check
    if (item.availableStock !== undefined && item.availableStock !== null) {
      if (item.quantity > item.availableStock) {
        if (payload.allowNegativeStock) {
          warnings.push(`Low/Negative Stock: Selling ${item.quantity} units of ${item.productName}, but only ${item.availableStock} in stock.`);
        } else {
          errors.push(`Insufficient Stock: Cannot sell ${item.quantity} units of ${item.productName}. Current stock is ${item.availableStock}.`);
        }
      }
    }
  });

  // 3. GSTIN validation for B2B invoices
  if (payload.invoiceType === 'tax_invoice' && payload.customerGstin) {
    if (!validateGstinFormat(payload.customerGstin)) {
      errors.push(`Invalid GSTIN format: "${payload.customerGstin}". Standard 15-character GSTIN is required for B2B invoices.`);
    }
  }

  // 4. Staff permissions discount validation
  const perms = payload.staffPermissions;
  if (perms && perms.applyDiscount === false) {
    if ((payload.billDiscountPercent && payload.billDiscountPercent > 0) || (payload.billDiscountFixed && payload.billDiscountFixed > 0)) {
      errors.push('Your staff role is not authorized to grant discounts.');
    }
  } else if (perms) {
    if (perms.maxDiscountPercent !== undefined && payload.billDiscountPercent && payload.billDiscountPercent > perms.maxDiscountPercent) {
      errors.push(`Discount of ${payload.billDiscountPercent}% exceeds your authorized limit of ${perms.maxDiscountPercent}%.`);
    }
    if (perms.maxDiscountFixed !== undefined && payload.billDiscountFixed && payload.billDiscountFixed > perms.maxDiscountFixed) {
      errors.push(`Discount of ₹${payload.billDiscountFixed} exceeds your authorized limit of ₹${perms.maxDiscountFixed}.`);
    }
  }

  // 5. Payment amount sanity check
  if (payload.amountPaid !== undefined && payload.amountPaid < 0) {
    errors.push('Amount received cannot be negative.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
