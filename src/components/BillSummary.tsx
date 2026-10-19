import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Receipt,
  Tag,
  Percent,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { BillCalculationResult } from '../utils/billingCalculator';
import { formatCurrency, numberToIndianWords } from '../utils/formatters';

interface Props {
  calculation: BillCalculationResult;
  title?: string;
  className?: string;
  showAmountInWords?: boolean;
  onPaymentChange?: (received: number) => void;
  showPaymentInput?: boolean;
}

export const BillSummary: React.FC<Props> = ({
  calculation,
  title = 'Bill Summary & Tax Details',
  className = '',
  showAmountInWords = true,
  onPaymentChange,
  showPaymentInput = false,
}) => {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const {
    grossSubtotal,
    itemDiscountsTotal,
    eligibleBaseForBillDiscount,
    billDiscountMode,
    billDiscountValue,
    billDiscountAmount,
    couponCode,
    couponDiscountAmount,
    otherEligibleDiscountsTotal = 0,
    otherCharges,
    totalDiscount,
    taxableAmount,
    isInterState,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGst,
    taxBreakdownByRate,
    roundOff,
    grandTotal,
    amountPaid,
    balanceDue,
    paymentStatus,
    computedItems,
  } = calculation;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 space-y-4 font-sans ${className}`}
    >
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0984E3]/10 dark:bg-[#0984E3]/20 flex items-center justify-center text-[#0984E3]">
            <Receipt className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">
            {title}
          </h3>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isInterState
              ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
              : 'bg-blue-50 text-[#0984E3] border-blue-200 dark:bg-blue-950/40 dark:text-cyan-300 dark:border-blue-800'
          }`}
        >
          {isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}
        </span>
      </div>

      {/* Structured Bill Sequence (Section 4 Display Order) */}
      <div className="space-y-2 text-xs">
        {/* 1. Product Subtotal / Gross Item Value */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="font-medium">1. Product Subtotal (Gross)</span>
          <span className="font-semibold font-mono text-slate-900 dark:text-white text-sm">
            {formatCurrency(grossSubtotal)}
          </span>
        </div>

        {/* 2. Item-Level Discounts */}
        {itemDiscountsTotal > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>2. Item-Level Discounts</span>
            </span>
            <span className="font-semibold font-mono">−{formatCurrency(itemDiscountsTotal)}</span>
          </div>
        )}

        {/* 3. Additional Bill Discount */}
        {billDiscountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <div>
              <span className="font-medium">3. Additional Bill Discount</span>
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {billDiscountMode === 'percentage'
                  ? `${billDiscountValue}% on ${formatCurrency(eligibleBaseForBillDiscount)}`
                  : `Fixed ₹${billDiscountValue}`}
              </span>
            </div>
            <span className="font-semibold font-mono">−{formatCurrency(billDiscountAmount)}</span>
          </div>
        )}

        {/* 4. Coupon Discount */}
        {couponDiscountAmount > 0 && (
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>4. Coupon Discount {couponCode ? `(${couponCode})` : ''}</span>
            </span>
            <span className="font-semibold font-mono">−{formatCurrency(couponDiscountAmount)}</span>
          </div>
        )}

        {/* 5. Other Eligible Discounts */}
        {otherEligibleDiscountsTotal > 0 && (
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>5. Other Eligible Discounts</span>
            </span>
            <span className="font-semibold font-mono">−{formatCurrency(otherEligibleDiscountsTotal)}</span>
          </div>
        )}

        {/* Total Discount Summary Badge if discounts applied */}
        {totalDiscount > 0 && (
          <div className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
            <span>Total Savings / Discount</span>
            <span>−{formatCurrency(totalDiscount)}</span>
          </div>
        )}

        {/* 6. Taxable Amount */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200">
          <span className="font-semibold">6. Taxable Amount</span>
          <span className="font-bold font-mono text-slate-900 dark:text-white">
            {formatCurrency(taxableAmount)}
          </span>
        </div>

        {/* 7 & 8. CGST and SGST (Intra-state only) */}
        {!isInterState && (
          <>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pl-2 border-l-2 border-blue-400">
              <span>7. Central GST (CGST)</span>
              <span className="font-mono font-medium">{formatCurrency(cgstAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pl-2 border-l-2 border-blue-400">
              <span>8. State GST (SGST)</span>
              <span className="font-mono font-medium">{formatCurrency(sgstAmount)}</span>
            </div>
          </>
        )}

        {/* 9. IGST (Inter-state only) */}
        {isInterState && (
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 pl-2 border-l-2 border-purple-400">
            <span>9. Integrated GST (IGST)</span>
            <span className="font-mono font-medium">{formatCurrency(igstAmount)}</span>
          </div>
        )}

        {/* 10. Additional Charges */}
        {otherCharges > 0 && (
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span>10. Additional Charges (Delivery/Packing)</span>
            <span className="font-mono font-medium">+{formatCurrency(otherCharges)}</span>
          </div>
        )}

        {/* 11. Round Off */}
        {roundOff !== 0 && (
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>11. Round Off Adjustment</span>
            <span className="font-mono font-medium">
              {roundOff > 0 ? `+${formatCurrency(roundOff)}` : formatCurrency(roundOff)}
            </span>
          </div>
        )}
      </div>

      {/* 12. GRAND TOTAL (Section 11 Display Requirement: Prominent Clean Light-Blue background + Electric Blue text) */}
      <div className="mt-3 p-4 rounded-2xl bg-[#F0F7FD] dark:bg-[#152332] border-2 border-[#0984E3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-black tracking-widest text-[#0984E3] dark:text-[#00CEC9] uppercase block">
            12. GRAND TOTAL
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Final amount payable inclusive of all taxes & discounts
          </span>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#0984E3] dark:text-[#00CEC9] tracking-tight">
            {formatCurrency(grandTotal)}
          </span>
        </div>
      </div>

      {/* Amount in Indian Currency Words */}
      {showAmountInWords && grandTotal > 0 && (
        <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 italic">
          <span className="font-bold not-italic text-slate-700 dark:text-slate-300">In Words: </span>
          {numberToIndianWords(grandTotal)}
        </div>
      )}

      {/* 13 & 14. Payment & Balance Due Section */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
        <div className="grid grid-cols-2 gap-3">
          {/* 13. Amount Received */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              13. Amount Received
            </span>
            {showPaymentInput ? (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-sm font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => onPaymentChange && onPaymentChange(Number(e.target.value) || 0)}
                  className="w-full font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#0984E3]"
                />
              </div>
            ) : (
              <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {formatCurrency(amountPaid)}
              </span>
            )}
          </div>

          {/* 14. Balance Due */}
          <div
            className={`p-3 rounded-xl border ${
              balanceDue > 0
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                14. Balance Due
              </span>
              <span
                className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                  paymentStatus === 'paid'
                    ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100'
                    : paymentStatus === 'partially_paid'
                    ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-100'
                    : 'bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-100'
                }`}
              >
                {paymentStatus.replace('_', ' ')}
              </span>
            </div>
            <span className="text-sm sm:text-base font-black font-mono block mt-0.5">
              {formatCurrency(balanceDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Section 6: Full Calculation Breakdown Panel */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#0984E3]" />
            View Full Calculation Breakdown (Audit Steps 1–7)
          </span>
          {isBreakdownOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {isBreakdownOpen && (
          <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-3.5 animate-in fade-in duration-150">
            {/* Step 1 — Gross Amount */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider block">
                Step 1 — Gross Product Amounts (Quantity × Unit Price)
              </span>
              <div className="space-y-1">
                {computedItems.map((ci, idx) => (
                  <div
                    key={ci.id || idx}
                    className="flex justify-between text-slate-600 dark:text-slate-300 font-mono text-[11px]"
                  >
                    <span>
                      {ci.productName} ({ci.quantity} × {formatCurrency(ci.price)})
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(ci.grossAmount || ci.quantity * ci.price)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Gross Subtotal</span>
                  <span>{formatCurrency(grossSubtotal)}</span>
                </div>
              </div>
            </div>

            {/* Step 2 — Item Discounts */}
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider block">
                Step 2 — Item-Level Discounts Applied
              </span>
              {computedItems.some((ci) => ci.discountAmount > 0) ? (
                <div className="space-y-1">
                  {computedItems
                    .filter((ci) => ci.discountAmount > 0)
                    .map((ci, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-emerald-600 dark:text-emerald-400 font-mono text-[11px]"
                      >
                        <span>
                          {ci.productName} [
                          {ci.discountMode === 'fixed'
                            ? `Fixed ₹${ci.discountValue || ci.discountAmount}`
                            : `${ci.discountPercent}%`}
                          ]
                        </span>
                        <span>−{formatCurrency(ci.discountAmount)}</span>
                      </div>
                    ))}
                  <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Remaining Eligible Base after Item Discounts</span>
                    <span>{formatCurrency(eligibleBaseForBillDiscount)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No item-level discounts applied.</p>
              )}
            </div>

            {/* Step 3 — Bill-Level Discount */}
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider block">
                Step 3 — Bill-Level Additional Discount
              </span>
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                <span>
                  Base: {formatCurrency(eligibleBaseForBillDiscount)} × Mode [
                  {billDiscountMode === 'percentage' ? `${billDiscountValue}%` : `Fixed ₹${billDiscountValue}`}]
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  −{formatCurrency(billDiscountAmount)}
                </span>
              </div>
            </div>

            {/* Step 4 & 5 — Taxable Value & GST Calculation grouped by rate */}
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider block">
                Steps 4 & 5 — Taxable Value & GST Grouping by Rate
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold">
                      <th className="py-1">Rate</th>
                      <th className="py-1 text-right">Taxable</th>
                      {isInterState ? (
                        <th className="py-1 text-right">IGST</th>
                      ) : (
                        <>
                          <th className="py-1 text-right">CGST</th>
                          <th className="py-1 text-right">SGST</th>
                        </>
                      )}
                      <th className="py-1 text-right">Total Tax</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 font-mono">
                    {taxBreakdownByRate.map((tb, idx) => (
                      <tr key={idx}>
                        <td className="py-1 font-bold text-[#0984E3]">{tb.gstRate}%</td>
                        <td className="py-1 text-right">{formatCurrency(tb.taxableAmount)}</td>
                        {isInterState ? (
                          <td className="py-1 text-right">{formatCurrency(tb.igstAmount)}</td>
                        ) : (
                          <>
                            <td className="py-1 text-right">{formatCurrency(tb.cgstAmount)}</td>
                            <td className="py-1 text-right">{formatCurrency(tb.sgstAmount)}</td>
                          </>
                        )}
                        <td className="py-1 text-right font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(tb.totalTax)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 6 & 7 — Final Summary Breakdown */}
            <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider block">
                Steps 6 & 7 — Final Amount Audit Trail
              </span>
              <div className="space-y-0.5 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Gross Subtotal</span>
                  <span>{formatCurrency(grossSubtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Total Deductions & Discounts</span>
                  <span>−{formatCurrency(totalDiscount)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Net Taxable Value</span>
                  <span>{formatCurrency(taxableAmount)}</span>
                </div>
                <div className="flex justify-between text-[#0984E3]">
                  <span>Total GST ({isInterState ? 'IGST' : 'CGST + SGST'})</span>
                  <span>+{formatCurrency(totalGst)}</span>
                </div>
                {otherCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Other Configured Charges</span>
                    <span>+{formatCurrency(otherCharges)}</span>
                  </div>
                )}
                {roundOff !== 0 && (
                  <div className="flex justify-between">
                    <span>Round-Off Adjustment</span>
                    <span>{roundOff > 0 ? `+${formatCurrency(roundOff)}` : formatCurrency(roundOff)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span>Calculated Grand Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
