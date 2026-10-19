import { IndianState } from '../types';

export const INDIAN_STATES: IndianState[] = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
];

/**
 * Format number in Indian currency format (e.g., ₹1,23,456.78)
 */
export function formatCurrency(amount: number = 0, includeDecimal: boolean = true): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const isNegative = rounded < 0;
  const absAmount = Math.abs(rounded);

  const parts = absAmount.toFixed(includeDecimal ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian numbering grouping: last 3 digits, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result = '₹' + formattedInteger + (decimalPart ? '.' + decimalPart : '');
  return isNegative ? '-' + result : result;
}

/**
 * Format Date to readable Indian format: 02 Oct 2026
 */
export function formatDate(dateStr?: string, includeTime: boolean = false): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  return d.toLocaleDateString('en-IN', options);
}

/**
 * Convert number to Indian currency words
 * e.g., 4550 -> Rupees Four Thousand Five Hundred Fifty Only
 */
export function numberToIndianWords(num: number): string {
  if (num === 0) return 'Rupees Zero Only';

  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit !== 0 ? ' ' + a[digit] : '');
  }

  let integer = Math.floor(Math.abs(num));
  let fraction = Math.round((Math.abs(num) - integer) * 100);

  let str = '';

  const crore = Math.floor(integer / 10000000);
  integer %= 10000000;
  const lakh = Math.floor(integer / 100000);
  integer %= 100000;
  const thousand = Math.floor(integer / 1000);
  integer %= 1000;
  const hundred = Math.floor(integer / 100);
  const remainder = integer % 100;

  if (crore > 0) {
    str += inWords(crore) + ' Crore ';
  }
  if (lakh > 0) {
    str += inWords(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    str += inWords(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    str += inWords(hundred) + ' Hundred ';
  }
  if (remainder > 0) {
    str += (str !== '' ? 'and ' : '') + inWords(remainder) + ' ';
  }

  let words = 'Rupees ' + str.trim();
  if (fraction > 0) {
    words += ' and ' + inWords(fraction) + ' Paise';
  }
  words += ' Only';

  return words;
}

/**
 * GST Calculation Helper:
 * Determines if transaction is Inter-State (IGST) or Intra-State (CGST + SGST).
 */
export function calculateGstBreakdown(
  taxableAmount: number,
  gstRate: number,
  isInterState: boolean
) {
  const totalTax = (taxableAmount * gstRate) / 100;

  if (isInterState) {
    return {
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: Math.round((totalTax + Number.EPSILON) * 100) / 100,
      totalTax: Math.round((totalTax + Number.EPSILON) * 100) / 100,
    };
  } else {
    const halfTax = totalTax / 2;
    return {
      cgstAmount: Math.round((halfTax + Number.EPSILON) * 100) / 100,
      sgstAmount: Math.round((halfTax + Number.EPSILON) * 100) / 100,
      igstAmount: 0,
      totalTax: Math.round((totalTax + Number.EPSILON) * 100) / 100,
    };
  }
}

/**
 * Clean phone number for WhatsApp link
 */
export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '91' + digits;
  if (digits.startsWith('0') && digits.length === 11) return '91' + digits.substring(1);
  return digits;
}

/**
 * Generate WhatsApp message URL for Invoices
 */
export function generateWhatsAppBillUrl(
  phone: string | undefined,
  customerName: string,
  invoiceNo: string,
  grandTotal: number,
  businessName: string,
  upiId?: string
): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const text = encodeURIComponent(
    `Dear ${customerName || 'Customer'},\n\nThank you for doing business with *${businessName}*! 🛍️\n\nYour Tax Invoice *#${invoiceNo}* for *${formatCurrency(
      grandTotal
    )}* is ready.\n${
      upiId ? `\n💳 *Pay via UPI:* ${upiId}\n` : ''
    }\nThank you for choosing us.\n\n_Generated with VYAPRIX • Powered by GOLDEN BAZAAR_`
  );
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
}

/**
 * Generate WhatsApp message URL for Khata / Udhaar payment reminders
 */
export function generateWhatsAppKhataReminderUrl(
  phone: string | undefined,
  customerName: string,
  dueAmount: number,
  businessName: string,
  upiId?: string
): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const text = encodeURIComponent(
    `Namaste ${customerName || 'Customer'} ji 🙏,\n\nThis is a polite reminder from *${businessName}* regarding your pending balance of *${formatCurrency(
      dueAmount
    )}*.\n\nPlease clear the payment at your earliest convenience.${
      upiId ? `\n\n📲 *UPI ID for instant payment:* \n${upiId}` : ''
    }\n\nThank you for your valued business!\n\n_Generated with VYAPRIX • Powered by GOLDEN BAZAAR_`
  );
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
}
