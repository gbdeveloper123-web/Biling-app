import React, { useRef, useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  X,
  Building,
  QrCode,
  Mail,
  Copy,
  Check,
  CheckCircle2,
  LayoutTemplate,
  FileCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { Invoice, InvoiceTemplateId } from '../types';
import { useShop } from '../context/ShopContext';
import {
  formatCurrency,
  formatDate,
  numberToIndianWords,
  generateWhatsAppBillUrl,
} from '../utils/formatters';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<Props> = ({ invoice, onClose }) => {
  const { business } = useShop();
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Active template state (defaults to business setting or 'template_1')
  const [activeTemplate, setActiveTemplate] = useState<InvoiceTemplateId>(
    business.invoiceSettings.template || 'template_1'
  );
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Print via browser
  const handlePrint = () => {
    window.print();
  };

  // Download high-resolution true A4 PDF
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsDownloadingPdf(true);
    const prevTitle = document.title;
    try {
      document.title = `Invoice_${invoice.invoiceNo}`;
      window.print();
    } finally {
      document.title = prevTitle;
      setIsDownloadingPdf(false);
    }
  };

  // WhatsApp bill url
  const whatsAppUrl = generateWhatsAppBillUrl(
    invoice.customerPhone,
    invoice.customerName,
    invoice.invoiceNo,
    invoice.grandTotal,
    business.name,
    business.upiId
  );

  // Email share link
  const emailSubject = encodeURIComponent(`Tax Invoice #${invoice.invoiceNo} from ${business.name}`);
  const emailBody = encodeURIComponent(
    `Dear ${invoice.customerName || 'Customer'},\n\nPlease find attached your Tax Invoice #${
      invoice.invoiceNo
    } for the amount of ${formatCurrency(invoice.grandTotal)}.\n\nDate: ${formatDate(
      invoice.invoiceDate
    )}\nDue Date: ${formatDate(invoice.dueDate)}\nStatus: ${invoice.paymentStatus.toUpperCase()}\n\n${
      business.upiId ? `Pay via UPI: ${business.upiId}\n\n` : ''
    }Thank you for doing business with us.\n\n${business.name}\n${business.phone} | ${business.email}\n\nGenerated with VYAPRIX • Powered by GOLDEN BAZAAR`
  );
  const emailUrl = `mailto:${invoice.customerPhone ? '' : ''}?subject=${emailSubject}&body=${emailBody}`;

  // Safe Copy Summary (Handles iframe & unfocused document gracefully)
  const handleCopySummary = async () => {
    const text = `Tax Invoice #${invoice.invoiceNo}\nBusiness: ${business.name}\nCustomer: ${
      invoice.customerName
    }\nAmount: ${formatCurrency(invoice.grandTotal)}\nStatus: ${invoice.paymentStatus.toUpperCase()}\nDate: ${formatDate(
      invoice.invoiceDate
    )}${business.upiId ? `\nUPI: ${business.upiId}` : ''}\nGenerated with VYAPRIX • Powered by GOLDEN BAZAAR`;

    // 1. Try modern clipboard API if document has focus
    if (document.hasFocus() && navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
        return;
      } catch {
        // Fall through to fallback
      }
    }

    // 2. Robust fallback for iframes or unfocused document
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy fallback was not permitted:', err);
    }
  };

  // Web Share API with safe fallback
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tax Invoice #${invoice.invoiceNo} - ${business.name}`,
          text: `Tax Invoice #${invoice.invoiceNo} for ${formatCurrency(invoice.grandTotal)} from ${business.name}`,
          url: window.location.href,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return; // User simply closed the share sheet
      }
    }
    handleCopySummary();
  };

  // Dynamic UPI QR Code
  const upiQrString = business.upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
        `upi://pay?pa=${business.upiId}&pn=${encodeURIComponent(
          business.name
        )}&am=${invoice.grandTotal.toFixed(2)}&tn=${encodeURIComponent(
          `Bill ${invoice.invoiceNo}`
        )}`
      )}`
    : null;

  // Inter-state tax calculations
  const isInterState = invoice.isInterState;
  const showHsn = business.invoiceSettings.showHsn !== false;
  const showAmountWords = business.invoiceSettings.showAmountInWords !== false;
  const showPoweredBy = business.invoiceSettings.showPoweredBy !== false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-[#1E272E]/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl my-auto bg-white rounded-2xl shadow-2xl border border-[#DFE6E9] overflow-hidden flex flex-col max-h-[96vh] animate-modal-pop print:max-h-none print:border-none print:shadow-none print:m-0 print:p-0">
        
        {/* Top Action Toolbar (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#DFE6E9] bg-[#F5F6FA] gap-3 shrink-0 print:hidden">
          {/* Left: Invoice Title & Template Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0984E3] text-white font-black text-sm shadow-2xs">
                V
              </span>
              <div>
                <h3 className="font-bold text-[#1E272E] text-sm sm:text-base flex items-center gap-2">
                  Tax Invoice #{invoice.invoiceNo}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      invoice.paymentStatus === 'paid'
                        ? 'bg-[#E6F8F3] text-[#00B894] border border-[#A3E9D7]'
                        : invoice.paymentStatus === 'partially_paid'
                        ? 'bg-[#FEF9E7] text-[#E1A73E] border border-[#FDECB2]'
                        : 'bg-[#FDEAEA] text-[#D63031] border border-[#F8B7B7]'
                    }`}
                  >
                    {invoice.paymentStatus.toUpperCase().replace('_', ' ')}
                  </span>
                </h3>
                <p className="text-[11px] text-[#636E72]">
                  {formatDate(invoice.invoiceDate)} • A4 PDF & Print Format
                </p>
              </div>
            </div>

            {/* Template Selector Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#DFE6E9] shadow-2xs">
              <span className="text-[10px] font-bold text-[#636E72] px-2 flex items-center gap-1">
                <LayoutTemplate className="w-3 h-3 text-[#0984E3]" /> Template:
              </span>
              <button
                onClick={() => setActiveTemplate('template_1')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  activeTemplate === 'template_1' || activeTemplate === 'standard'
                    ? 'bg-[#0984E3] text-white shadow-2xs'
                    : 'text-[#636E72] hover:bg-[#F5F6FA]'
                }`}
              >
                1. Modern Electric
              </button>
              <button
                onClick={() => setActiveTemplate('template_2')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  activeTemplate === 'template_2' || activeTemplate === 'minimal'
                    ? 'bg-[#1E272E] text-white shadow-2xs'
                    : 'text-[#636E72] hover:bg-[#F5F6FA]'
                }`}
              >
                2. Minimalist Exec
              </button>
              <button
                onClick={() => setActiveTemplate('template_3')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  activeTemplate === 'template_3' || activeTemplate === 'modern'
                    ? 'bg-[#00CEC9] text-[#1E272E] font-bold shadow-2xs'
                    : 'text-[#636E72] hover:bg-[#F5F6FA]'
                }`}
              >
                3. Corporate GST
              </button>
            </div>

            {/* Desktop Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-xl border border-[#DFE6E9] shadow-2xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="p-1 text-[#636E72] hover:text-[#2D3436] rounded transition cursor-pointer"
                title="Zoom Out (Ctrl -)"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-[#636E72] px-1 w-9 text-center font-mono">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1 text-[#636E72] hover:text-[#2D3436] rounded transition cursor-pointer"
                title="Zoom In (Ctrl +)"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              {zoomLevel !== 100 && (
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 text-[#0984E3] hover:text-[#0770C2] rounded transition cursor-pointer"
                  title="Reset Zoom to 100%"
                  aria-label="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0984E3] hover:bg-[#0770C2] disabled:opacity-50 active:scale-95 rounded-xl shadow-xs transition"
              title="Download high resolution true A4 PDF"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2D3436] bg-white hover:bg-[#F5F6FA] border border-[#DFE6E9] active:scale-95 rounded-xl shadow-2xs transition"
              title="Print A4 invoice"
            >
              <Printer className="w-3.5 h-3.5 text-[#0984E3]" />
              Print
            </button>

            {/* WhatsApp Button */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#00B894] bg-[#E6F8F3] hover:bg-[#C9F3E8] border border-[#A3E9D7] rounded-xl transition"
              title="Send to WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp
            </a>

            {/* Share / Copy Summary */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#636E72] hover:text-[#2D3436] hover:bg-[#F5F6FA] border border-[#DFE6E9] rounded-xl transition"
              title="Share or copy invoice details"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#00B894]" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied' : 'Share'}
            </button>

            {/* Email Button */}
            <a
              href={emailUrl}
              className="p-1.5 text-[#636E72] hover:text-[#2D3436] hover:bg-[#F5F6FA] border border-[#DFE6E9] rounded-xl transition"
              title="Send via Email"
            >
              <Mail className="w-4 h-4" />
            </a>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 text-[#636E72] hover:text-[#2D3436] hover:bg-[#F5F6FA] rounded-xl transition ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Viewport Canvas (Centered A4 Page) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F5F6FA] print:p-0 print:bg-white">
          <div
            ref={printAreaRef}
            id="printable-invoice"
            style={{
              transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
            }}
            className="w-full max-w-[794px] min-h-[1050px] mx-auto bg-white border border-[#DFE6E9] rounded-xl p-8 sm:p-10 text-[#1E272E] font-sans shadow-md print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none print:w-full print:min-h-0 flex flex-col justify-between"
          >
            {/* INVOICE BODY CONTENT */}
            <div>
              {/* TOP ACCENT LINE (Solid hex colors to ensure html2canvas compatibility) */}
              <div
                className={`h-1.5 w-full rounded-full mb-6 ${
                  activeTemplate === 'template_2'
                    ? 'bg-[#1E272E]'
                    : activeTemplate === 'template_3'
                    ? 'bg-[#00CEC9]'
                    : 'bg-[#0984E3]'
                }`}
              />

              {/* 1. TOP HEADER SECTION */}
              <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-[#DFE6E9] gap-6">
                {/* Left: Brand & Business Details */}
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-3">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="w-12 h-12 object-contain rounded-xl border border-[#DFE6E9] bg-white p-1"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-[#0984E3] text-white flex items-center justify-center font-black text-xl shadow-xs relative shrink-0">
                        V
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00CEC9] ring-2 ring-white" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1E272E] uppercase">
                        {business.name}
                      </h1>
                      <p className="text-xs font-semibold text-[#0984E3]">
                        {business.tagline || 'Run Smarter. Grow Better.'}
                      </p>
                      {showPoweredBy && (
                        <p className="text-[9px] font-bold text-[#636E72] uppercase tracking-wider mt-0.5">
                          Powered by GOLDEN BAZAAR
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-[#636E72] pt-2 leading-relaxed">
                    <p>{business.address}, {business.city}, {business.state} - {business.pinCode}</p>
                    <p>
                      <span className="font-bold text-[#1E272E]">GSTIN:</span>{' '}
                      <span className="font-mono">{business.gstin || '27AABCS1429B1Z'}</span>{' '}
                      | <span className="font-bold text-[#1E272E]">State Code:</span> {business.stateCode} ({business.state})
                    </p>
                    <p>
                      <span className="font-bold text-[#1E272E]">Phone:</span> {business.phone}{' '}
                      | <span className="font-bold text-[#1E272E]">Email:</span> {business.email}
                    </p>
                    {business.pan && (
                      <p>
                        <span className="font-bold text-[#1E272E]">PAN:</span> <span className="font-mono">{business.pan}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Invoice Metadata */}
                <div className="text-left sm:text-right space-y-1 sm:min-w-[220px]">
                  <div className="inline-block px-3 py-1 bg-[#0984E3] text-white text-xs font-black tracking-wider uppercase rounded-lg shadow-2xs">
                    TAX INVOICE
                  </div>
                  <div className="pt-2 text-xs space-y-1">
                    <p>
                      <span className="text-[#636E72]">Invoice No:</span>{' '}
                      <span className="font-mono font-bold text-[#1E272E] text-sm">
                        {invoice.invoiceNo}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#636E72]">Invoice Date:</span>{' '}
                      <span className="font-semibold text-[#1E272E]">{formatDate(invoice.invoiceDate)}</span>
                    </p>
                    <p>
                      <span className="text-[#636E72]">Due Date:</span>{' '}
                      <span className="font-semibold text-[#1E272E]">{formatDate(invoice.dueDate)}</span>
                    </p>
                    <p>
                      <span className="text-[#636E72]">Place of Supply:</span>{' '}
                      <span className="font-semibold text-[#1E272E]">
                        {isInterState ? 'Inter-State (IGST 18%)' : `Intra-State (${business.stateCode} - CGST+SGST)`}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. BUSINESS & CUSTOMER TWO-COLUMN SECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 p-4 rounded-xl bg-white border border-[#DFE6E9] text-xs">
                {/* FROM BOX */}
                <div className="space-y-1 sm:pr-4 sm:border-r border-[#DFE6E9]">
                  <p className="font-bold text-[#0984E3] uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3" /> FROM (Billed By)
                  </p>
                  <p className="font-bold text-sm text-[#1E272E]">{business.name}</p>
                  <p className="text-[#636E72]">{business.address}, {business.city}, {business.state} - {business.pinCode}</p>
                  <p className="text-[#636E72]">Phone: {business.phone}</p>
                  <p className="text-[#636E72]">Email: {business.email}</p>
                  <p className="text-[#1E272E] font-medium">
                    GSTIN: <span className="font-mono font-bold">{business.gstin || '27AABCS1429B1Z'}</span>
                  </p>
                </div>

                {/* BILL TO BOX */}
                <div className="space-y-1 sm:pl-2">
                  <p className="font-bold text-[#0984E3] uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1">
                    <FileCheck className="w-3 h-3" /> BILL TO (Customer)
                  </p>
                  <p className="font-bold text-sm text-[#1E272E]">
                    {invoice.customerName || 'Cash / Retail Walk-in Customer'}
                  </p>
                  {invoice.customerAddress && <p className="text-[#636E72]">{invoice.customerAddress}</p>}
                  <p className="text-[#636E72]">
                    {invoice.customerPhone ? `Phone: ${invoice.customerPhone}` : 'Customer Phone: -'}
                  </p>
                  <p className="text-[#1E272E] font-medium">
                    GSTIN: <span className="font-mono font-semibold">{invoice.customerGstin || 'Unregistered / B2C Consumer'}</span>
                  </p>
                  <p className="text-[#636E72]">
                    State Code: {invoice.customerStateCode || business.stateCode} ({isInterState ? 'Inter-State' : 'Intra-State'})
                  </p>
                </div>
              </div>

              {/* 3. PRODUCT TABLE */}
              <div className="my-5 overflow-x-auto rounded-xl border border-[#DFE6E9]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        activeTemplate === 'template_2'
                          ? 'bg-[#1E272E] text-white'
                          : activeTemplate === 'template_3'
                          ? 'bg-[#26343D] text-white'
                          : 'bg-[#0984E3] text-white'
                      }`}
                    >
                      <th className="py-2.5 px-2 text-center w-8">#</th>
                      <th className="py-2.5 px-3">Item / Description</th>
                      {showHsn && <th className="py-2.5 px-2 text-center">HSN/SAC</th>}
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">Taxable</th>
                      <th className="py-2.5 px-2 text-center">GST</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE6E9]">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-[#F5F6FA] transition-colors">
                        <td className="py-2.5 px-2 text-center text-[#636E72] font-medium">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-[#1E272E]">{item.productName}</p>
                          {item.sku && <p className="text-[10px] text-[#636E72] font-mono">SKU: {item.sku}</p>}
                        </td>
                        {showHsn && (
                          <td className="py-2.5 px-2 text-center font-mono text-[11px] text-[#636E72]">
                            {item.hsn || '9983'}
                          </td>
                        )}
                        <td className="py-2.5 px-2 text-center font-medium">
                          {item.quantity} {item.unit || 'PCS'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-[#1E272E]">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#636E72]">
                          {item.discountAmount > 0 ? formatCurrency(item.discountAmount) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-[#1E272E]">
                          {formatCurrency(item.taxableAmount)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-semibold text-[#0984E3]">
                          {item.gstRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#1E272E]">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. BOTTOM SUMMARY & PAYMENT SECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 pt-2">
                {/* LEFT SIDE: Payment Status, Method, Bank & UPI */}
                <div className="space-y-3.5 text-xs">
                  {/* Payment Details Box */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#DFE6E9] space-y-2">
                    <p className="font-bold text-[#1E272E] uppercase text-[10px] tracking-wider border-b border-[#DFE6E9] pb-1.5">
                      Payment Information
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-[#636E72]">Payment Status:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                          invoice.paymentStatus === 'paid'
                            ? 'bg-[#E6F8F3] text-[#00B894] border border-[#A3E9D7]'
                            : invoice.paymentStatus === 'partially_paid'
                            ? 'bg-[#FEF9E7] text-[#E1A73E] border border-[#FDECB2]'
                            : 'bg-[#FDEAEA] text-[#D63031] border border-[#F8B7B7]'
                        }`}
                      >
                        {invoice.paymentStatus.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#636E72]">Payment Method:</span>
                      <span className="font-semibold text-[#1E272E] uppercase">
                        {invoice.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#636E72]">Transaction Reference:</span>
                      <span className="font-mono font-medium text-[#1E272E]">
                        {invoice.paymentMethod === 'upi'
                          ? `UPI-REF-${invoice.invoiceNo.slice(-6)}`
                          : invoice.paymentMethod === 'bank_transfer'
                          ? `UTR-${invoice.invoiceNo.slice(-6)}`
                          : 'CASH-SETTLED'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#DFE6E9]">
                      <span className="text-[#636E72]">Amount Paid:</span>
                      <span className="font-bold text-[#00B894]">{formatCurrency(invoice.amountPaid)}</span>
                    </div>

                    {invoice.balanceDue > 0 && (
                      <div className="flex items-center justify-between font-bold text-[#D63031]">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(invoice.balanceDue)}</span>
                      </div>
                    )}
                  </div>

                  {/* Bank Account Details */}
                  {business.invoiceSettings.showBankDetails && business.bankDetails.accountNo && (
                    <div className="p-3 rounded-xl bg-white border border-[#DFE6E9] space-y-1">
                      <p className="font-bold uppercase text-[10px] tracking-wider mb-1 flex items-center gap-1 text-[#0984E3]">
                        <Building className="w-3.5 h-3.5" /> Bank Account Details
                      </p>
                      <p className="text-[#636E72]">
                        Bank Name: <span className="font-semibold text-[#1E272E]">{business.bankDetails.bankName}</span>
                      </p>
                      <p className="text-[#636E72]">
                        A/C No: <span className="font-mono font-bold text-[#1E272E]">{business.bankDetails.accountNo}</span>
                      </p>
                      <p className="text-[#636E72]">
                        IFSC: <span className="font-mono font-bold text-[#1E272E]">{business.bankDetails.ifsc}</span> | Branch: {business.bankDetails.branch}
                      </p>
                      {business.bankDetails.accountHolder && (
                        <p className="text-[10px] text-[#636E72]">A/C Holder: {business.bankDetails.accountHolder}</p>
                      )}
                    </div>
                  )}

                  {/* Dynamic UPI QR Code */}
                  {upiQrString && business.invoiceSettings.showUpiQr && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#DFE6E9]">
                      <img
                        src={upiQrString}
                        alt="UPI QR Code"
                        className="w-16 h-16 rounded-lg border border-[#DFE6E9] bg-white p-0.5 shrink-0"
                      />
                      <div className="text-[11px]">
                        <p className="font-bold text-[#1E272E] flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5 text-[#00B894]" /> Scan to Pay via UPI
                        </p>
                        <p className="text-[#0984E3] font-mono text-[10px] font-bold">{business.upiId}</p>
                        <p className="text-[#636E72] text-[10px] mt-0.5">Use GPay, PhonePe, Paytm, or BHIM</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE: Subtotal, Tax Breakdown & Total Box */}
                <div className="space-y-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-[#DFE6E9] space-y-2">
                    <div className="flex justify-between py-0.5 text-[#636E72]">
                      <span>Gross Subtotal</span>
                      <span className="font-semibold text-[#1E272E]">{formatCurrency(invoice.subtotal)}</span>
                    </div>

                    {(invoice.itemDiscountTotal || 0) > 0 && (
                      <div className="flex justify-between py-0.5 text-[#00B894]">
                        <span>Item-Level Discounts</span>
                        <span className="font-semibold">−{formatCurrency(invoice.itemDiscountTotal!)}</span>
                      </div>
                    )}

                    {(invoice.billDiscountAmount || 0) > 0 && (
                      <div className="flex justify-between py-0.5 text-[#00B894]">
                        <span>
                          Additional Bill Discount{' '}
                          {invoice.billDiscountMode === 'percentage'
                            ? `(${invoice.billDiscountValue}%)`
                            : '(Fixed ₹)'}
                        </span>
                        <span className="font-semibold">−{formatCurrency(invoice.billDiscountAmount!)}</span>
                      </div>
                    )}

                    {(invoice.couponDiscount || 0) > 0 && (
                      <div className="flex justify-between py-0.5 text-indigo-600">
                        <span>Coupon Discount {invoice.couponCode ? `(${invoice.couponCode})` : ''}</span>
                        <span className="font-semibold">−{formatCurrency(invoice.couponDiscount!)}</span>
                      </div>
                    )}

                    {!invoice.itemDiscountTotal && !invoice.billDiscountAmount && !invoice.couponDiscount && invoice.discount > 0 && (
                      <div className="flex justify-between py-0.5 text-[#00B894]">
                        <span>Discount</span>
                        <span className="font-semibold">−{formatCurrency(invoice.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-0.5 text-[#636E72] border-t border-[#DFE6E9] pt-1.5 font-medium">
                      <span>Taxable Amount</span>
                      <span className="font-semibold text-[#1E272E]">{formatCurrency(invoice.taxableAmount)}</span>
                    </div>

                    {/* Tax Logic: If Inter-state, show IGST. If Intra-state, show CGST + SGST */}
                    {isInterState ? (
                      <div className="flex justify-between py-0.5 text-[#636E72]">
                        <span>Integrated GST (IGST)</span>
                        <span className="font-semibold text-[#1E272E]">{formatCurrency(invoice.igstAmount)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between py-0.5 text-[#636E72]">
                          <span>Central GST (CGST)</span>
                          <span className="font-semibold text-[#1E272E]">{formatCurrency(invoice.cgstAmount)}</span>
                        </div>
                        <div className="flex justify-between py-0.5 text-[#636E72]">
                          <span>State GST (SGST)</span>
                          <span className="font-semibold text-[#1E272E]">{formatCurrency(invoice.sgstAmount)}</span>
                        </div>
                      </>
                    )}

                    {(invoice.otherCharges || 0) > 0 && (
                      <div className="flex justify-between py-0.5 text-[#636E72]">
                        <span>Delivery / Other Charges</span>
                        <span className="font-semibold text-[#1E272E]">+{formatCurrency(invoice.otherCharges!)}</span>
                      </div>
                    )}

                    {invoice.roundOff !== 0 && (
                      <div className="flex justify-between py-0.5 text-[#636E72]">
                        <span>Round Off Adjustment</span>
                        <span className="font-semibold text-[#1E272E]">
                          {invoice.roundOff > 0 ? `+${formatCurrency(invoice.roundOff)}` : formatCurrency(invoice.roundOff)}
                        </span>
                      </div>
                    )}

                    {/* TOTAL BOX WITH SUBTLE ELECTRIC BLUE HIGHLIGHT */}
                    <div className="mt-3 p-3 rounded-xl border-2 border-[#0984E3] bg-[#F0F7FD] flex justify-between items-center text-sm sm:text-base font-black text-[#0984E3]">
                      <span>GRAND TOTAL</span>
                      <span className="text-base sm:text-lg">{formatCurrency(invoice.grandTotal)}</span>
                    </div>

                    {/* Payment breakdown */}
                    <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Amount Received ({invoice.paymentMethod?.toUpperCase()}):</span>
                        <span className="font-bold text-emerald-600 font-mono">{formatCurrency(invoice.amountPaid)}</span>
                      </div>
                      {invoice.balanceDue > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Balance Due:</span>
                          <span className="font-bold text-amber-600 font-mono">{formatCurrency(invoice.balanceDue)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount in words */}
                  {showAmountWords && (
                    <div className="p-3 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] text-[11px] text-[#636E72]">
                      <span className="font-bold text-[#1E272E]">Amount in Words:</span>{' '}
                      <span className="font-semibold text-[#1E272E] italic">
                        {numberToIndianWords(invoice.grandTotal)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Template 3: Corporate GST Tax Summary Table */}
              {activeTemplate === 'template_3' && (
                <div className="my-4 p-3 rounded-xl bg-white border border-[#DFE6E9]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#636E72] mb-2">
                    GST Tax Breakdown Schedule (Sec 31 CGST Act)
                  </p>
                  <table className="w-full text-[10px] text-center border-collapse">
                    <thead>
                      <tr className="bg-[#F5F6FA] text-[#636E72] font-bold uppercase">
                        <th className="p-1.5 border border-[#DFE6E9]">HSN/SAC</th>
                        <th className="p-1.5 border border-[#DFE6E9]">Taxable Value</th>
                        <th className="p-1.5 border border-[#DFE6E9]">CGST Rate</th>
                        <th className="p-1.5 border border-[#DFE6E9]">CGST Amt</th>
                        <th className="p-1.5 border border-[#DFE6E9]">SGST Rate</th>
                        <th className="p-1.5 border border-[#DFE6E9]">SGST Amt</th>
                        <th className="p-1.5 border border-[#DFE6E9]">IGST Amt</th>
                        <th className="p-1.5 border border-[#DFE6E9]">Total Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1.5 border border-[#DFE6E9] font-mono">9983/Retail</td>
                        <td className="p-1.5 border border-[#DFE6E9] font-medium">{formatCurrency(invoice.taxableAmount)}</td>
                        <td className="p-1.5 border border-[#DFE6E9]">{isInterState ? '0%' : '9%'}</td>
                        <td className="p-1.5 border border-[#DFE6E9]">{formatCurrency(invoice.cgstAmount)}</td>
                        <td className="p-1.5 border border-[#DFE6E9]">{isInterState ? '0%' : '9%'}</td>
                        <td className="p-1.5 border border-[#DFE6E9]">{formatCurrency(invoice.sgstAmount)}</td>
                        <td className="p-1.5 border border-[#DFE6E9]">{formatCurrency(invoice.igstAmount)}</td>
                        <td className="p-1.5 border border-[#DFE6E9] font-bold">{formatCurrency(invoice.cgstAmount + invoice.sgstAmount + invoice.igstAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 5. FOOTER & SIGNATURE SECTION */}
            <div className="mt-8 pt-4 border-t border-[#DFE6E9]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[10px] text-[#636E72]">
                {/* Notes & Terms */}
                <div className="space-y-1.5">
                  <p className="font-bold uppercase tracking-wider text-[#1E272E]">
                    Notes / Terms & Conditions:
                  </p>
                  <p className="whitespace-pre-line leading-relaxed text-[#636E72]">
                    {business.invoiceSettings.terms ||
                      '1. Goods once sold will be accepted for return within 7 days with original invoice.\n2. Subject to local jurisdiction.\n3. Warranty as per manufacturer terms.'}
                  </p>
                  <p className="italic font-semibold text-[#0984E3] pt-1">
                    "{business.invoiceSettings.footerNotes || 'Thank you for doing business with us.'}"
                  </p>
                </div>

                {/* Authorized Signature */}
                <div className="flex flex-col justify-end items-start sm:items-end text-left sm:text-right pt-4 sm:pt-0">
                  <p className="font-bold text-xs text-[#1E272E] mb-12">
                    For {business.name}
                  </p>
                  <div className="border-t border-dashed border-[#636E72] w-48 text-center pt-1 text-[10px] text-[#1E272E] font-medium">
                    {business.invoiceSettings.signatureTitle || 'Authorized Signatory'}
                  </div>
                </div>
              </div>

              {/* 6. BOTTOM BRANDING */}
              {showPoweredBy && (
                <div className="mt-6 pt-3 border-t border-[#DFE6E9] flex items-center justify-between text-[9px] text-[#636E72]">
                  <p className="font-semibold">
                    Generated with <span className="font-bold text-[#0984E3]">VYAPRIX</span>
                  </p>
                  <p className="font-medium tracking-wide">
                    Powered by <span className="font-bold text-[#1E272E]">GOLDEN BAZAAR</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
