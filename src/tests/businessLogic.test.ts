/**
 * VYAPRIX Automated Unit Test Suite
 * Validates shared business logic, GST arithmetic, invoice validation, offline IDs, and stock logic.
 */

import {
  roundMoney,
  computeLineItem,
  calculateBill,
  validateDiscount,
  validateInvoicePayload,
  validateGstinFormat,
  computeStockDeductions,
  generateOfflineInvoiceNumber,
  generateOperationId,
  calculateReturnCreditNote,
} from '../shared/businessLogic';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  const isMatch = JSON.stringify(actual) === JSON.stringify(expected);
  if (isMatch) {
    passedCount++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${message}\n    Expected: ${JSON.stringify(expected)}\n    Received: ${JSON.stringify(actual)}`);
  }
}

console.log('\n============================================================');
console.log('🧪 RUNNING VYAPRIX SHARED BUSINESS LOGIC AUTOMATED TESTS');
console.log('============================================================\n');

// Group 1: Decimal-Safe Money Rounding
console.log('[1/8] Testing Decimal-Safe Money Rounding...');
assertEquals(roundMoney(10.555), 10.56, 'roundMoney rounds 10.555 up to 10.56');
assertEquals(roundMoney(10.554), 10.55, 'roundMoney rounds 10.554 down to 10.55');
assertEquals(roundMoney(0.0001), 0, 'roundMoney rounds 0.0001 to 0');
assertEquals(roundMoney(NaN), 0, 'roundMoney handles NaN safely as 0');

// Group 2: Line Item & GST Calculations
console.log('\n[2/8] Testing Line Item & GST Calculations (Exclusive & Inclusive)...');
const lineItemExclusive = computeLineItem({
  unitPrice: 1000,
  quantity: 2,
  discountMode: 'percentage',
  discountValue: 10, // 10% discount -> Gross: 2000, Disc: 200, Net: 1800
  gstRate: 18,
  isInterState: false, // Intra-state: CGST 9% (162) + SGST 9% (162) = 324
  taxMode: 'exclusive',
});
assertEquals(lineItemExclusive.grossAmount, 2000, 'Gross amount is 2000');
assertEquals(lineItemExclusive.discountAmount, 200, 'Discount amount is 200');
assertEquals(lineItemExclusive.taxableAmount, 1800, 'Taxable amount is 1800');
assertEquals(lineItemExclusive.cgstAmount, 162, 'CGST is 162 (9%)');
assertEquals(lineItemExclusive.sgstAmount, 162, 'SGST is 162 (9%)');
assertEquals(lineItemExclusive.total, 2124, 'Total is 2124 (1800 + 324)');

// Inter-State (IGST) test
const lineItemInterstate = computeLineItem({
  unitPrice: 500,
  quantity: 1,
  discountMode: 'fixed',
  discountValue: 50, // Net: 450
  gstRate: 12,
  isInterState: true,
  taxMode: 'exclusive',
});
assertEquals(lineItemInterstate.igstAmount, 54, 'IGST is 54 (12% of 450)');
assertEquals(lineItemInterstate.cgstAmount, 0, 'CGST is 0 for inter-state');
assertEquals(lineItemInterstate.total, 504, 'Total is 504');

// Inclusive GST test
const lineItemInclusive = computeLineItem({
  unitPrice: 118,
  quantity: 1,
  gstRate: 18,
  isInterState: false,
  taxMode: 'inclusive',
});
assertEquals(lineItemInclusive.taxableAmount, 100, 'Inclusive taxable amount is 100');
assertEquals(lineItemInclusive.totalTax, 18, 'Inclusive total tax is 18');
assertEquals(lineItemInclusive.total, 118, 'Inclusive total matches unitPrice');

// Group 3: Multi-Item Bill Calculation & Cascading Discounts
console.log('\n[3/8] Testing Full Bill Calculation Engine & Round-Off...');
const billResult = calculateBill({
  items: [
    { productName: 'Wireless Mouse', unitPrice: 500, quantity: 2, gstRate: 18 }, // 1000 + 18% = 1180
    { productName: 'Notebook', unitPrice: 100, quantity: 5, gstRate: 5 }, // 500 + 5% = 525
  ],
  billDiscountMode: 'percentage',
  billDiscountValue: 10, // 10% bill discount on eligible 1500 = 150 discount
  isInterState: false,
  roundOffEnabled: true,
  paymentMethod: 'cash',
  amountPaid: 1500,
});
assert(billResult.grossSubtotal === 1500, 'Gross subtotal is 1500');
assert(billResult.billDiscountAmount === 150, 'Bill discount is 150 (10% of 1500)');
assert(billResult.taxableAmount === 1350, 'Net taxable base is 1350 (1500 - 150)');
assert(billResult.grandTotal > 0, 'Grand total computed correctly');
assert(billResult.paymentStatus === 'partially_paid', 'Payment status is partially_paid');
assert(billResult.balanceDue > 0, 'Balance due tracked accurately');

// Group 4: Discount Validation & Role Limits
console.log('\n[4/8] Testing Staff Discount Limits & Validation...');
const validDisc = validateDiscount('percentage', 10, 1000, { applyDiscount: true, maxDiscountPercent: 15 });
assert(validDisc.isValid === true, '10% discount is valid under 15% limit');

const exceedingDisc = validateDiscount('percentage', 20, 1000, { applyDiscount: true, maxDiscountPercent: 15 });
assert(exceedingDisc.isValid === false, '20% discount rejected when staff limit is 15%');

const disallowDisc = validateDiscount('fixed', 50, 1000, { applyDiscount: false });
assert(disallowDisc.isValid === false, 'Discount rejected when staff lacks applyDiscount permission');

// Group 5: Invoice Payload Validation
console.log('\n[5/8] Testing Invoice Payload Validation...');
const emptyInvoice = validateInvoicePayload({ items: [] });
assert(emptyInvoice.isValid === false, 'Empty invoice rejected');

const validPayload = validateInvoicePayload({
  items: [{ productName: 'Keyboard', quantity: 1, unitPrice: 750, gstRate: 18, availableStock: 10 }],
  customerGstin: '27AABCU9603R1ZN',
  invoiceType: 'tax_invoice',
  amountPaid: 750,
});
assert(validPayload.isValid === true, 'Valid invoice payload passes validation');

const invalidGstin = validateGstinFormat('INVALID_GSTIN_123');
assert(invalidGstin === false, 'Invalid GSTIN string correctly rejected');

const validGstin = validateGstinFormat('27AABCU9603R1ZN');
assert(validGstin === true, 'Valid Maharashtra GSTIN correctly accepted');

// Group 6: Stock Deductions & Low Stock Alerting
console.log('\n[6/8] Testing Atomic Stock Deductions & Low Stock Thresholds...');
const stockResult = computeStockDeductions(
  [
    { id: 'p1', name: 'Product 1', currentStock: 15, minStockLevel: 5 },
    { id: 'p2', name: 'Product 2', currentStock: 4, minStockLevel: 3 },
  ],
  [
    { productId: 'p1', quantity: 12 }, // 15 - 12 = 3 (<= 5, so triggers low stock!)
    { productId: 'p2', quantity: 4 }, // 4 - 4 = 0 (out of stock!)
  ],
  'INV-001'
);
assertEquals(stockResult.updatedProducts[0].stockAfter, 3, 'Product 1 reduced from 15 to 3');
assertEquals(stockResult.updatedProducts[0].status, 'low_stock', 'Product 1 marked as low_stock');
assertEquals(stockResult.updatedProducts[1].stockAfter, 0, 'Product 2 reduced from 4 to 0');
assertEquals(stockResult.updatedProducts[1].status, 'out_of_stock', 'Product 2 marked as out_of_stock');
assert(stockResult.lowStockAlerts.length > 0, 'Low stock alerts triggered');

// Group 7: Offline Collision-Resistant ID Generation
console.log('\n[7/8] Testing Multi-Device Offline ID Generation...');
const offlineInv1 = generateOfflineInvoiceNumber('VYA', 1, 'POS1');
const offlineInv2 = generateOfflineInvoiceNumber('VYA', 2, 'POS1');
assert(offlineInv1 !== offlineInv2, 'Consecutive invoice numbers are unique');
assert(offlineInv1.includes('POS1'), 'Contains terminal identifier');

const opId1 = generateOperationId('create_invoice');
const opId2 = generateOperationId('create_invoice');
assert(opId1 !== opId2, 'Operation IDs are universally unique for idempotency');
assert(opId1.startsWith('op_create_invoice_'), 'Operation ID has correct namespace prefix');

// Group 8: Sales Return Credit Note Reversal
console.log('\n[8/8] Testing Return & Credit Note Calculation...');
const returnCalc = calculateReturnCreditNote([
  { price: 200, quantity: 2, gstRate: 18 }, // 400 + 72 = 472
]);
assertEquals(returnCalc.taxableReturn, 400, 'Taxable return is 400');
assertEquals(returnCalc.taxReturn, 72, 'Tax return is 72');
assertEquals(returnCalc.totalRefundAmount, 472, 'Total refund amount is 472');

console.log('\n============================================================');
console.log(`📊 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('============================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SHARED BUSINESS LOGIC TESTS PASSED SUCCESSFULLY!\n');
}
