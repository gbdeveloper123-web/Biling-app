import {
  DiscountMode,
  LineItemInput,
  ComputedLineItem,
  BillCalculationInput,
  BillCalculationResult,
  StaffPermissions,
  TaxBreakdownItem,
  PaymentStatus,
} from './types';

/**
 * Decimal-safe 2-decimal money rounding.
 * e.g., 1008.8999999999 -> 1008.90
 */
export function roundMoney(amount: number): number {
  if (isNaN(amount) || !isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Compute line item financials with item-level discount (Fixed ₹ or Percentage %)
 */
export function computeLineItem(input: LineItemInput): ComputedLineItem {
  const price = Math.max(0, input.unitPrice || 0);
  const qty = Math.max(0, input.quantity || 0);
  const grossAmount = roundMoney(price * qty);

  const discountMode: DiscountMode = input.discountMode || 'percentage';
  const rawDiscountVal = Math.max(0, input.discountValue || 0);

  let discountAmount = 0;
  let discountValue = rawDiscountVal;

  if (discountMode === 'percentage') {
    discountValue = Math.min(100, rawDiscountVal);
    discountAmount = roundMoney((grossAmount * discountValue) / 100);
  } else {
    // Fixed ₹ cannot exceed gross amount
    discountAmount = Math.min(grossAmount, roundMoney(rawDiscountVal));
    discountValue = discountAmount;
  }

  const netAfterItemDiscount = Math.max(0, roundMoney(grossAmount - discountAmount));
  const gstRate = Math.max(0, input.gstRate || 0);
  const isInterState = !!input.isInterState;
  const isInclusive = input.taxMode === 'inclusive';

  let taxableAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let totalTax = 0;
  let total = 0;

  if (isInclusive) {
    // Price includes GST
    taxableAmount = gstRate > 0 ? roundMoney(netAfterItemDiscount / (1 + gstRate / 100)) : netAfterItemDiscount;
    totalTax = roundMoney(netAfterItemDiscount - taxableAmount);
    total = netAfterItemDiscount;
  } else {
    // Standard GST-Exclusive
    taxableAmount = netAfterItemDiscount;
    totalTax = roundMoney((taxableAmount * gstRate) / 100);
    total = roundMoney(taxableAmount + totalTax);
  }

  if (isInterState) {
    igstAmount = totalTax;
    cgstAmount = 0;
    sgstAmount = 0;
  } else {
    const halfTax = roundMoney(totalTax / 2);
    cgstAmount = halfTax;
    sgstAmount = roundMoney(totalTax - halfTax);
    igstAmount = 0;
  }

  return {
    grossAmount,
    discountMode,
    discountValue,
    discountAmount,
    taxableAmount,
    gstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    total,
  };
}

/**
 * Universal, decimal-safe bill calculation engine.
 * Computes exact item & bill-level discounts, taxable value, GST rate grouping, and totals.
 */
export function calculateBill(input: BillCalculationInput): BillCalculationResult {
  const isInterState = !!input.isInterState;
  const taxMode: 'exclusive' | 'inclusive' = input.taxMode || 'exclusive';
  const roundOffEnabled = !!input.roundOffEnabled;

  // 1. Compute each line item with item-level discount
  const preItems = input.items.map((item, idx) => {
    const calc = computeLineItem({
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      discountMode: item.discountMode,
      discountValue: item.discountValue,
      gstRate: item.gstRate,
      isInterState,
      taxMode,
    });

    return {
      id: item.id || `item_${idx + 1}`,
      productId: item.productId || item.id || `prod_${idx + 1}`,
      productName: item.productName,
      sku: item.sku || '',
      hsn: item.hsn || '',
      quantity: item.quantity,
      unit: item.unit || 'PCS',
      price: item.unitPrice,
      mrp: item.unitPrice,
      grossAmount: calc.grossAmount,
      discountMode: calc.discountMode,
      discountValue: calc.discountValue,
      discountPercent:
        calc.discountMode === 'percentage'
          ? calc.discountValue
          : roundMoney((calc.discountAmount / (calc.grossAmount || 1)) * 100),
      discountAmount: calc.discountAmount,
      netBeforeBillDisc: Math.max(0, calc.grossAmount - calc.discountAmount),
      gstRate: calc.gstRate,
      taxableAmount: calc.taxableAmount,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      igstAmount: calc.igstAmount,
      total: calc.total,
    };
  });

  const grossSubtotal = roundMoney(preItems.reduce((acc, i) => acc + i.grossAmount, 0));
  const itemDiscountsTotal = roundMoney(preItems.reduce((acc, i) => acc + i.discountAmount, 0));
  const eligibleBaseForBillDiscount = Math.max(0, roundMoney(grossSubtotal - itemDiscountsTotal));

  const billDiscountMode: DiscountMode = input.billDiscountMode || 'percentage';
  const rawBillDiscVal = Math.max(0, input.billDiscountValue || 0);

  let billDiscountAmount = 0;
  let billDiscountValue = rawBillDiscVal;

  if (billDiscountMode === 'percentage') {
    billDiscountValue = Math.min(100, rawBillDiscVal);
    billDiscountAmount = roundMoney((eligibleBaseForBillDiscount * billDiscountValue) / 100);
  } else {
    billDiscountAmount = Math.min(eligibleBaseForBillDiscount, roundMoney(rawBillDiscVal));
    billDiscountValue = billDiscountAmount;
  }

  const rawCouponVal = Math.max(0, input.couponDiscount || 0);
  const remainingBaseForCoupon = Math.max(0, eligibleBaseForBillDiscount - billDiscountAmount);
  const couponDiscountAmount = Math.min(remainingBaseForCoupon, roundMoney(rawCouponVal));

  const otherEligibleDiscountsTotal = 0;
  const otherCharges = Math.max(0, roundMoney(input.otherCharges || 0));
  const totalDiscount = roundMoney(itemDiscountsTotal + billDiscountAmount + couponDiscountAmount);

  const additionalDiscountToAllocate = roundMoney(billDiscountAmount + couponDiscountAmount);

  let allocatedRunningSum = 0;
  const computedItems = preItems.map((item, idx) => {
    let itemAllocatedBillDisc = 0;

    if (eligibleBaseForBillDiscount > 0 && additionalDiscountToAllocate > 0) {
      if (idx === preItems.length - 1) {
        itemAllocatedBillDisc = roundMoney(additionalDiscountToAllocate - allocatedRunningSum);
      } else {
        const itemRatio = item.netBeforeBillDisc / eligibleBaseForBillDiscount;
        itemAllocatedBillDisc = roundMoney(additionalDiscountToAllocate * itemRatio);
        allocatedRunningSum += itemAllocatedBillDisc;
      }
    }

    const finalItemNet = Math.max(0, roundMoney(item.netBeforeBillDisc - itemAllocatedBillDisc));

    let itemTaxable = 0;
    let itemTotalTax = 0;
    let itemTotal = 0;

    if (taxMode === 'inclusive') {
      itemTaxable = item.gstRate > 0 ? roundMoney(finalItemNet / (1 + item.gstRate / 100)) : finalItemNet;
      itemTotalTax = roundMoney(finalItemNet - itemTaxable);
      itemTotal = finalItemNet;
    } else {
      itemTaxable = finalItemNet;
      itemTotalTax = roundMoney((itemTaxable * item.gstRate) / 100);
      itemTotal = roundMoney(itemTaxable + itemTotalTax);
    }

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = itemTotalTax;
    } else {
      const half = roundMoney(itemTotalTax / 2);
      cgst = half;
      sgst = roundMoney(itemTotalTax - half);
    }

    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      hsn: item.hsn,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      mrp: item.mrp,
      grossAmount: item.grossAmount,
      discountMode: item.discountMode,
      discountPercent: item.discountPercent,
      discountValue: item.discountValue,
      discountAmount: item.discountAmount,
      taxableAmount: itemTaxable,
      gstRate: item.gstRate,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      total: itemTotal,
    };
  });

  const rateMap = new Map<number, { taxableAmount: number; cgstAmount: number; sgstAmount: number; igstAmount: number; totalTax: number }>();

  computedItems.forEach((ci) => {
    const existing = rateMap.get(ci.gstRate) || { taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalTax: 0 };
    existing.taxableAmount = roundMoney(existing.taxableAmount + ci.taxableAmount);
    existing.cgstAmount = roundMoney(existing.cgstAmount + ci.cgstAmount);
    existing.sgstAmount = roundMoney(existing.sgstAmount + ci.sgstAmount);
    existing.igstAmount = roundMoney(existing.igstAmount + ci.igstAmount);
    existing.totalTax = roundMoney(existing.totalTax + (isInterState ? ci.igstAmount : ci.cgstAmount + ci.sgstAmount));
    rateMap.set(ci.gstRate, existing);
  });

  const taxBreakdownByRate: TaxBreakdownItem[] = Array.from(rateMap.entries())
    .map(([rate, vals]) => ({
      gstRate: rate,
      ...vals,
    }))
    .sort((a, b) => a.gstRate - b.gstRate);

  const totalTaxable = roundMoney(computedItems.reduce((acc, i) => acc + i.taxableAmount, 0));
  const totalCgst = isInterState ? 0 : roundMoney(computedItems.reduce((acc, i) => acc + i.cgstAmount, 0));
  const totalSgst = isInterState ? 0 : roundMoney(computedItems.reduce((acc, i) => acc + i.sgstAmount, 0));
  const totalIgst = isInterState ? roundMoney(computedItems.reduce((acc, i) => acc + i.igstAmount, 0)) : 0;
  const totalGst = isInterState ? totalIgst : roundMoney(totalCgst + totalSgst);

  let exactGrandTotal = 0;
  if (taxMode === 'inclusive') {
    exactGrandTotal = roundMoney(computedItems.reduce((acc, i) => acc + i.total, 0) + otherCharges);
  } else {
    exactGrandTotal = roundMoney(totalTaxable + totalGst + otherCharges);
  }

  let roundedGrandTotal = exactGrandTotal;
  let roundOff = 0;

  if (roundOffEnabled) {
    roundedGrandTotal = Math.round(exactGrandTotal);
    roundOff = roundMoney(roundedGrandTotal - exactGrandTotal);
  }

  const grandTotal = roundedGrandTotal;

  let amountPaid = 0;
  if (input.paymentMethod === 'credit') {
    amountPaid = 0;
  } else if (input.amountPaid !== undefined && input.amountPaid !== null && input.amountPaid !== '') {
    amountPaid = Math.max(0, roundMoney(Number(input.amountPaid)));
  } else {
    amountPaid = grandTotal;
  }

  const balanceDue = Math.max(0, roundMoney(grandTotal - amountPaid));

  let paymentStatus: PaymentStatus = 'pending';
  if (grandTotal === 0 || balanceDue === 0) {
    paymentStatus = 'paid';
  } else if (amountPaid > 0) {
    paymentStatus = 'partially_paid';
  } else {
    paymentStatus = 'pending';
  }

  return {
    grossSubtotal,
    itemDiscountsTotal,
    eligibleBaseForBillDiscount,
    billDiscountMode,
    billDiscountValue,
    billDiscountAmount,
    couponCode: input.couponCode,
    couponDiscountAmount,
    otherEligibleDiscountsTotal,
    otherCharges,
    totalDiscount,
    taxableAmount: totalTaxable,
    isInterState,
    cgstAmount: totalCgst,
    sgstAmount: totalSgst,
    igstAmount: totalIgst,
    totalGst,
    taxBreakdownByRate,
    exactGrandTotal,
    roundOff,
    grandTotal,
    amountPaid,
    balanceDue,
    paymentStatus,
    computedItems,
  };
}

/**
 * Validate discount inputs against business rules and staff permissions.
 */
export function validateDiscount(
  mode: DiscountMode,
  value: number,
  eligibleBase: number,
  permissions?: Partial<StaffPermissions> | null
): { isValid: boolean; message?: string } {
  if (isNaN(value)) {
    return { isValid: false, message: 'Please enter a valid numeric discount.' };
  }

  if (value < 0) {
    return { isValid: false, message: 'Discount cannot be negative.' };
  }

  if (mode === 'percentage') {
    if (value > 100) {
      return { isValid: false, message: 'Percentage discount cannot exceed 100%.' };
    }
    if (permissions && permissions.applyDiscount === false) {
      return { isValid: false, message: 'Your staff account is not permitted to apply discounts.' };
    }
    if (permissions && permissions.maxDiscountPercent !== undefined && permissions.maxDiscountPercent !== null) {
      if (value > permissions.maxDiscountPercent) {
        return {
          isValid: false,
          message: `Discount exceeds your allowed limit of ${permissions.maxDiscountPercent}%. Owner approval required.`,
        };
      }
    }
  } else {
    if (value > eligibleBase) {
      return {
        isValid: false,
        message: `Fixed discount (₹${value}) cannot exceed the eligible amount (₹${eligibleBase}).`,
      };
    }
    if (permissions && permissions.applyDiscount === false) {
      return { isValid: false, message: 'Your staff account is not permitted to apply discounts.' };
    }
    if (permissions && permissions.maxDiscountFixed !== undefined && permissions.maxDiscountFixed !== null) {
      if (value > permissions.maxDiscountFixed) {
        return {
          isValid: false,
          message: `Fixed discount exceeds your limit of ₹${permissions.maxDiscountFixed}. Owner approval required.`,
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Calculate Sales Return / Credit Note amounts reversing the original tax and discount
 */
export function calculateReturnCreditNote(
  returnItems: Array<{ price: number; quantity: number; gstRate: number; isInterState?: boolean }>
): {
  taxableReturn: number;
  taxReturn: number;
  totalRefundAmount: number;
} {
  let taxableReturn = 0;
  let taxReturn = 0;

  for (const item of returnItems) {
    const itemSub = roundMoney(item.price * item.quantity);
    const itemTax = roundMoney((itemSub * item.gstRate) / 100);
    taxableReturn = roundMoney(taxableReturn + itemSub);
    taxReturn = roundMoney(taxReturn + itemTax);
  }

  return {
    taxableReturn,
    taxReturn,
    totalRefundAmount: roundMoney(taxableReturn + taxReturn),
  };
}
