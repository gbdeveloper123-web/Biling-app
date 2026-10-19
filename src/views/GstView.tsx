import React, { useState, useMemo, useEffect } from 'react';
import {
  FileCheck2,
  Download,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  Mail,
  Phone,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  Share2,
  History,
  AlertCircle,
  ChevronDown,
  Check,
  X,
  Send,
  ExternalLink,
  Lock,
  SlidersHorizontal,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/formatters';

interface CaContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  firmName: string;
  notes?: string;
  isDefault: boolean;
}

interface ReportHistoryItem {
  id: string;
  report: 'GSTR-1' | 'GSTR-3B';
  fy: string;
  period: string;
  generatedOn: string;
  generatedBy: string;
  emailStatus: 'Sent' | 'Pending' | 'Not Sent';
  whatsappStatus: 'Sent' | 'Not Sent';
  emailRecipient?: string;
  whatsappRecipient?: string;
}

export const GstView: React.FC = () => {
  const { business, invoices, purchases, salesReturns = [], purchaseReturns = [], currentStaff } = useShop();

  // Primary navigation tabs
  const [activeReportTab, setActiveReportTab] = useState<'GSTR-1' | 'GSTR-3B'>('GSTR-1');

  // Filters State
  const [fy, setFy] = useState('2026-27');
  const [month, setMonth] = useState('04'); // April default
  const [fromDate, setFromDate] = useState('2026-04-01');
  const [toDate, setToDate] = useState('2026-04-30');
  const [branch, setBranch] = useState('All');

  // Modals state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [isCaModalOpen, setIsCaModalOpen] = useState(false);

  // CA Contact list and default
  const [caContacts, setCaContacts] = useState<CaContact[]>(() => {
    try {
      const saved = localStorage.getItem('vyaprix_ca_contacts');
      return saved ? JSON.parse(saved) : [
        {
          id: '1',
          name: 'ABC Tax Consultants',
          email: 'ca@example.com',
          phone: '+919876543210',
          firmName: 'ABC & Associates',
          notes: 'Primary Accountant',
          isDefault: true,
        },
      ];
    } catch {
      return [
        {
          id: '1',
          name: 'ABC Tax Consultants',
          email: 'ca@example.com',
          phone: '+919876543210',
          firmName: 'ABC & Associates',
          notes: 'Primary Accountant',
          isDefault: true,
        },
      ];
    }
  });

  // Report Share / Export History
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('vyaprix_report_history');
      return saved ? JSON.parse(saved) : [
        {
          id: 'h-1',
          report: 'GSTR-1',
          fy: '2026-27',
          period: 'April 2026',
          generatedOn: '2026-05-03T11:24:00.000Z',
          generatedBy: 'Owner',
          emailStatus: 'Sent',
          whatsappStatus: 'Sent',
          emailRecipient: 'ca@example.com',
          whatsappRecipient: '+919876543210',
        },
        {
          id: 'h-2',
          report: 'GSTR-3B',
          fy: '2026-27',
          period: 'April 2026',
          generatedOn: '2026-05-18T16:45:00.000Z',
          generatedBy: 'Owner',
          emailStatus: 'Pending',
          whatsappStatus: 'Not Sent',
        },
      ];
    } catch {
      return [];
    }
  });

  // ITC Available custom Status mapping
  const [itcStatuses, setItcStatuses] = useState<Record<string, 'Available' | 'Review Required' | 'Not Marked' | 'Reversed'>>(() => {
    try {
      const saved = localStorage.getItem('vyaprix_itc_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleUpdateItcStatus = (purchaseId: string, status: 'Available' | 'Review Required' | 'Not Marked' | 'Reversed') => {
    const updated = { ...itcStatuses, [purchaseId]: status };
    setItcStatuses(updated);
    localStorage.setItem('vyaprix_itc_statuses', JSON.stringify(updated));
  };

  // Sync state helpers to localStorage
  useEffect(() => {
    localStorage.setItem('vyaprix_ca_contacts', JSON.stringify(caContacts));
  }, [caContacts]);

  useEffect(() => {
    localStorage.setItem('vyaprix_report_history', JSON.stringify(reportHistory));
  }, [reportHistory]);

  // Email form state
  const defaultCa = useMemo(() => caContacts.find((c) => c.isDefault) || caContacts[0], [caContacts]);
  const [emailTo, setEmailTo] = useState(defaultCa?.email || '');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [saveCaEmail, setSaveCaEmail] = useState(false);

  // WhatsApp form state
  const [whatsappPhone, setWhatsappPhone] = useState(defaultCa?.phone || '');
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // Update default states on CA contacts changes
  useEffect(() => {
    if (defaultCa) {
      setEmailTo(defaultCa.email);
      setWhatsappPhone(defaultCa.phone);
    }
  }, [defaultCa]);

  // Sync date ranges when Month or FY selection changes
  useEffect(() => {
    const startYear = parseInt(fy.split('-')[0]); // e.g. 2026
    let mNum = parseInt(month);
    let year = startYear;
    if (mNum < 4) {
      // Jan, Feb, Mar are next calendar year
      year = startYear + 1;
    }
    const daysInMonth = new Date(year, mNum, 0).getDate();
    setFromDate(`${year}-${month.padStart(2, '0')}-01`);
    setToDate(`${year}-${month.padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`);
  }, [fy, month]);

  // Generate Email presets when modal opens
  useEffect(() => {
    const periodLabel = `${getMonthName(month)} ${fromDate.substring(0, 4)}`;
    setEmailSubject(`VYAPRIX GST Report — ${activeReportTab} — ${business.name} — ${periodLabel}`);
    setEmailMessage(
      `Dear Sir/Madam,\n\nPlease find attached the ${activeReportTab} report generated from VYAPRIX for the period ${periodLabel}.\n\nKindly review and verify the figures before statutory filing.\n\nRegards,\n${business.name}`
    );
  }, [isEmailModalOpen, activeReportTab, month, fromDate, business]);

  // Generate WhatsApp message when modal opens
  useEffect(() => {
    const periodLabel = `${getMonthName(month)} ${fromDate.substring(0, 4)}`;
    setWhatsappMessage(
      `Hello, please find the VYAPRIX GST report for *${business.name}* (${business.gstin || 'No GSTIN'}), Period: *${periodLabel}*.\n\nReport Type: *${activeReportTab}*.\n\nKindly review and verify the figures before statutory filing. Sent via Vyaparix.`
    );
  }, [isWhatsappModalOpen, activeReportTab, month, fromDate, business]);

  // Filtered dataset computed variables
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (inv.paymentStatus === 'cancelled') return false;
      const dateStr = inv.createdAt.substring(0, 10);
      return dateStr >= fromDate && dateStr <= toDate;
    });
  }, [invoices, fromDate, toDate]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((pur) => {
      const dateStr = pur.date.substring(0, 10);
      return dateStr >= fromDate && dateStr <= toDate;
    });
  }, [purchases, fromDate, toDate]);

  const filteredSalesReturns = useMemo(() => {
    return salesReturns.filter((ret) => {
      const dateStr = ret.date.substring(0, 10);
      return dateStr >= fromDate && dateStr <= toDate;
    });
  }, [salesReturns, fromDate, toDate]);

  const filteredPurchaseReturns = useMemo(() => {
    return purchaseReturns.filter((ret) => {
      const dateStr = ret.date.substring(0, 10);
      return dateStr >= fromDate && dateStr <= toDate;
    });
  }, [purchaseReturns, fromDate, toDate]);

  // GSTR-1 Metrics
  const gstr1Totals = useMemo(() => {
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let count = filteredInvoices.length;

    filteredInvoices.forEach((i) => {
      taxable += i.taxableAmount || 0;
      cgst += i.cgstAmount || 0;
      sgst += i.sgstAmount || 0;
      igst += i.igstAmount || 0;
    });

    return {
      taxableValue: taxable,
      cgst,
      sgst,
      igst,
      totalTax: cgst + sgst + igst,
      invoiceValue: taxable + cgst + sgst + igst,
      invoiceCount: count,
    };
  }, [filteredInvoices]);

  // B2B & B2C separation for GSTR-1
  const { b2bInvoices, b2cLargeInvoices, b2cOtherInvoices } = useMemo(() => {
    const b2b = filteredInvoices.filter((i) => i.customerGstin && i.customerGstin.trim().length > 0);
    const b2c = filteredInvoices.filter((i) => !i.customerGstin || i.customerGstin.trim().length === 0);

    // B2C Large are Inter-state invoices (> ₹2.5 Lakhs & IGST is active)
    const b2cLarge = b2c.filter((i) => i.grandTotal > 250000 && i.igstAmount > 0);
    const b2cOther = b2c.filter((i) => !(i.grandTotal > 250000 && i.igstAmount > 0));

    return {
      b2bInvoices: b2b,
      b2cLargeInvoices: b2cLarge,
      b2cOtherInvoices: b2cOther,
    };
  }, [filteredInvoices]);

  // Credit / Debit Notes adjustment amounts (returns)
  const returnsAdjustments = useMemo(() => {
    let creditTaxable = 0;
    let creditTax = 0;
    filteredSalesReturns.forEach((ret) => {
      creditTaxable += ret.totalRefund * 0.84; // approx taxable
      creditTax += ret.totalRefund * 0.16; // approx tax
    });

    let debitTaxable = 0;
    let debitTax = 0;
    filteredPurchaseReturns.forEach((ret) => {
      debitTaxable += ret.totalRefund * 0.84;
      debitTax += ret.totalRefund * 0.16;
    });

    return {
      creditTaxable,
      creditTax,
      debitTaxable,
      debitTax,
    };
  }, [filteredSalesReturns, filteredPurchaseReturns]);

  // HSN summary
  const hsnSummary = useMemo(() => {
    const map: Record<
      string,
      { hsn: string; description: string; uqc: string; totalQty: number; taxableValue: number; cgst: number; sgst: number; igst: number; totalTax: number }
    > = {};

    filteredInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const code = item.hsn || '998711'; // Default service/others code
        if (!map[code]) {
          map[code] = {
            hsn: code,
            description: 'Taxable Goods',
            uqc: 'PCS',
            totalQty: 0,
            taxableValue: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalTax: 0,
          };
        }
        map[code].totalQty += item.quantity || 0;
        map[code].taxableValue += item.taxableAmount || 0;
        map[code].cgst += item.cgstAmount || 0;
        map[code].sgst += item.sgstAmount || 0;
        map[code].igst += item.igstAmount || 0;
        map[code].totalTax += (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0);
      });
    });

    return Object.values(map);
  }, [filteredInvoices]);

  // GSTR-3B Metrics
  const gstr3bITC = useMemo(() => {
    let eligibleCgst = 0;
    let eligibleSgst = 0;
    let eligibleIgst = 0;
    let reviewCount = 0;
    let reversedCount = 0;

    filteredPurchases.forEach((p) => {
      const status = itcStatuses[p.id] || 'Available';
      if (status === 'Available') {
        eligibleCgst += p.taxAmount * 0.5; // CGST component
        eligibleSgst += p.taxAmount * 0.5; // SGST component
      } else if (status === 'Review Required') {
        reviewCount++;
      } else if (status === 'Reversed') {
        reversedCount++;
      } else if (status === 'Not Marked') {
        // Assume default eligible but not reconcile
        eligibleCgst += p.taxAmount * 0.5;
        eligibleSgst += p.taxAmount * 0.5;
      }
    });

    return {
      cgstITC: eligibleCgst,
      sgstITC: eligibleSgst,
      igstITC: eligibleIgst,
      totalEligibleITC: eligibleCgst + eligibleSgst + eligibleIgst,
      reviewCount,
      reversedCount,
    };
  }, [filteredPurchases, itcStatuses]);

  // Estimated Net Tax Liability (3B output tax - available input tax)
  const gstr3bTaxLiability = useMemo(() => {
    const netCgst = Math.max(0, gstr1Totals.cgst - gstr3bITC.cgstITC);
    const netSgst = Math.max(0, gstr1Totals.sgst - gstr3bITC.sgstITC);
    const netIgst = Math.max(0, gstr1Totals.igst - gstr3bITC.igstITC);

    return {
      netCgst,
      netSgst,
      netIgst,
      totalNetLiability: netCgst + netSgst + netIgst,
    };
  }, [gstr1Totals, gstr3bITC]);

  // Trigger export of report CSV
  const handleDownloadCSV = () => {
    setIsDownloadDropdownOpen(false);
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (activeReportTab === 'GSTR-1') {
      csvContent += `VYAPRIX GSTR-1 Report - ${business.name} - Period: ${getMonthName(month)} ${fy}\n`;
      csvContent += `GSTIN: ${business.gstin || 'N/A'}\n\n`;
      csvContent += 'B2B Invoices Section\n';
      csvContent += 'Invoice No.,Invoice Date,Customer,GSTIN,Place of Supply,Taxable Value,CGST,SGST,IGST,Invoice Value\n';
      b2bInvoices.forEach((i) => {
        csvContent += `"${i.invoiceNo}","${formatDate(i.createdAt)}","${i.customerName}","${i.customerGstin}","${business.state || 'Local'}",${i.taxableAmount.toFixed(2)},${i.cgstAmount.toFixed(2)},${i.sgstAmount.toFixed(2)},${i.igstAmount.toFixed(2)},${i.grandTotal.toFixed(2)}\n`;
      });
    } else {
      csvContent += `VYAPRIX GSTR-3B Summary Report - ${business.name} - Period: ${getMonthName(month)} ${fy}\n`;
      csvContent += `GSTIN: ${business.gstin || 'N/A'}\n\n`;
      csvContent += 'Outward and Inward Supplies Summary\n';
      csvContent += 'Description,Taxable Value,CGST,SGST,IGST,Total Tax\n';
      csvContent += `"Outward Taxable Supplies",${gstr1Totals.taxableValue.toFixed(2)},${gstr1Totals.cgst.toFixed(2)},${gstr1Totals.sgst.toFixed(2)},${gstr1Totals.igst.toFixed(2)},${gstr1Totals.totalTax.toFixed(2)}\n`;
      csvContent += `"Eligible Input Tax Credit (ITC)",0.00,${gstr3bITC.cgstITC.toFixed(2)},${gstr3bITC.sgstITC.toFixed(2)},${gstr3bITC.igstITC.toFixed(2)},${gstr3bITC.totalEligibleITC.toFixed(2)}\n`;
      csvContent += `"Estimated Net Tax Liability",0.00,${gstr3bTaxLiability.netCgst.toFixed(2)},${gstr3bTaxLiability.netSgst.toFixed(2)},${gstr3bTaxLiability.netIgst.toFixed(2)},${gstr3bTaxLiability.totalNetLiability.toFixed(2)}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VYAPRIX_${activeReportTab}_FY${fy}_${getMonthName(month)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Add to history
    recordHistoryEntry('Download CSV');
  };

  const triggerPrintReport = () => {
    window.print();
    recordHistoryEntry('Print Document');
  };

  // Record Share & Generation Activity
  const recordHistoryEntry = (actionType: string, emailStr?: string, phoneStr?: string) => {
    const newItem: ReportHistoryItem = {
      id: `h-${Date.now()}`,
      report: activeReportTab,
      fy,
      period: `${getMonthName(month)} ${fromDate.substring(0, 4)}`,
      generatedOn: new Date().toISOString(),
      generatedBy: currentStaff?.name || 'Owner',
      emailStatus: actionType === 'Email Sent' ? 'Sent' : 'Not Sent',
      whatsappStatus: actionType === 'WhatsApp Shared' ? 'Sent' : 'Not Sent',
      emailRecipient: emailStr,
      whatsappRecipient: phoneStr,
    };
    setReportHistory((prev) => [newItem, ...prev]);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailModalOpen(false);

    // Save newly entered contact if checked
    if (saveCaEmail && !caContacts.some((c) => c.email.toLowerCase() === emailTo.toLowerCase())) {
      const newContact: CaContact = {
        id: `ca-${Date.now()}`,
        name: emailTo.split('@')[0],
        email: emailTo,
        phone: whatsappPhone,
        firmName: 'Associates',
        isDefault: false,
      };
      setCaContacts((prev) => [...prev, newContact]);
    }

    recordHistoryEntry('Email Sent', emailTo);
    alert(`GST ${activeReportTab} report emailed successfully to ${emailTo}`);
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsWhatsappModalOpen(false);

    // Open WhatsApp link
    const cleanedPhone = whatsappPhone.replace(/\D/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');

    recordHistoryEntry('WhatsApp Shared', undefined, whatsappPhone);
  };

  // Add custom CA contact
  const [newCa, setNewCa] = useState<Omit<CaContact, 'id'>>({
    name: '',
    email: '',
    phone: '',
    firmName: '',
    notes: '',
    isDefault: false,
  });

  const handleAddCa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCa.name || !newCa.email) return;

    const added: CaContact = {
      id: `ca-${Date.now()}`,
      ...newCa,
    };

    if (newCa.isDefault) {
      setCaContacts((prev) => prev.map((c) => ({ ...c, isDefault: false })).concat(added));
    } else {
      setCaContacts((prev) => [...prev, added]);
    }

    setNewCa({ name: '', email: '', phone: '', firmName: '', notes: '', isDefault: false });
    setIsCaModalOpen(false);
  };

  const handleDeleteCa = (id: string) => {
    if (confirm('Delete this contact?')) {
      setCaContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSetDefaultCa = (id: string) => {
    setCaContacts((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  function getMonthName(mCode: string) {
    const names: Record<string, string> = {
      '04': 'April',
      '05': 'May',
      '06': 'June',
      '07': 'July',
      '08': 'August',
      '09': 'September',
      '10': 'October',
      '11': 'November',
      '12': 'December',
      '01': 'January',
      '02': 'February',
      '03': 'March',
    };
    return names[mCode] || 'April';
  }

  return (
    <div className="vy-view-container space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5.5 sm:w-6 h-5.5 sm:h-6 text-[#0984E3]" />
            GST Reports & ITC (जीएसटी ऑडिट बुक)
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#B2BEC3] mt-0.5">
            Prepare, review and export GST reports from your VYAPRIX business data.
          </p>
        </div>

        {/* Action buttons bar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Download Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
              className="flex items-center gap-1.5 h-10 px-3.5 bg-[#0984E3] hover:bg-[#0770C2] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download <ChevronDown className="w-3 h-3" />
            </button>
            {isDownloadDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in duration-100">
                <button
                  onClick={handleDownloadCSV}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#F5F6FA] dark:hover:bg-[#202B33] text-slate-700 dark:text-[#F5F6FA] flex items-center gap-2 font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Excel / CSV
                </button>
                <button
                  onClick={triggerPrintReport}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#F5F6FA] dark:hover:bg-[#202B33] text-slate-700 dark:text-[#F5F6FA] flex items-center gap-2 font-medium"
                >
                  <FileText className="w-3.5 h-3.5 text-[#0984E3]" /> Save as PDF Document
                </button>
              </div>
            )}
          </div>

          {/* Email button */}
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1.5 h-10 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Mail className="w-4 h-4" /> Email CA
          </button>

          {/* WhatsApp button */}
          <button
            onClick={() => setIsWhatsappModalOpen(true)}
            className="flex items-center gap-1.5 h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4" /> Share WhatsApp
          </button>
        </div>
      </div>

      {/* 2. Selection Tabs */}
      <div className="flex border-b border-[#DFE6E9] dark:border-[#2A3642] gap-1 pb-px print:hidden">
        <button
          onClick={() => setActiveReportTab('GSTR-1')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition duration-150 ${
            activeReportTab === 'GSTR-1'
              ? 'border-[#0984E3] text-[#0984E3] dark:text-[#00CEC9] dark:border-[#00CEC9]'
              : 'border-transparent text-slate-500 dark:text-[#B2BEC3] hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          GSTR-1 — Outward Supplies (बिक्री रिपोर्ट)
        </button>
        <button
          onClick={() => setActiveReportTab('GSTR-3B')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition duration-150 ${
            activeReportTab === 'GSTR-3B'
              ? 'border-[#0984E3] text-[#0984E3] dark:text-[#00CEC9] dark:border-[#00CEC9]'
              : 'border-transparent text-slate-500 dark:text-[#B2BEC3] hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          GSTR-3B — Tax Summary & ITC (टैक्स दायित्व)
        </button>
      </div>

      {/* 3. Common Filter Bar */}
      <div className="bg-white dark:bg-[#1E272E] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] p-4 flex flex-wrap items-center gap-3 shadow-2xs print:hidden">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
        </div>

        {/* FY */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">FY</label>
          <select
            value={fy}
            onChange={(e) => setFy(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-700 dark:text-[#F5F6FA] font-medium"
          >
            <option value="2026-27">2026-27</option>
            <option value="2025-26">2025-26</option>
          </select>
        </div>

        {/* Tax Period Month */}
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Tax Period</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-700 dark:text-[#F5F6FA] font-medium"
          >
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
          </select>
        </div>

        {/* Date Ranges displays */}
        <div className="text-xs text-slate-500 dark:text-[#B2BEC3] bg-slate-50 dark:bg-[#182026] border border-[#DFE6E9] dark:border-[#2A3642] px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium ml-1">
          <Calendar className="w-3.5 h-3.5 text-[#0984E3]" />
          <span>Range: <strong className="text-slate-800 dark:text-white">{formatDate(fromDate)}</strong> to <strong className="text-slate-800 dark:text-white">{formatDate(toDate)}</strong></span>
        </div>

        {/* Business Select */}
        <div className="flex flex-col gap-0.5 ml-auto">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Branch / State</label>
          <span className="text-xs bg-[#F5F6FA] dark:bg-[#182026] border border-[#DFE6E9] dark:border-[#2A3642] px-2.5 py-1 rounded-lg text-[#2D3436] dark:text-[#F5F6FA] font-bold">
            {business.state || 'Local POS Store'} ({business.gstin || 'No GSTIN'})
          </span>
        </div>
      </div>

      {/* 4. Active Report Workspace Container */}
      <div id="print-tax-report" className="space-y-6">

        {/* A. GSTR-1 View Screen */}
        {activeReportTab === 'GSTR-1' && (
          <div className="space-y-6">
            <div className="p-4 bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                GSTR-1 — Outward Supplies (बिक्री विवरण)
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#B2BEC3] mt-0.5">
                Sales and outward-supply summary based on invoices recorded in VYAPRIX.
              </p>
            </div>

            {/* GSTR-1 Summary KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taxable Sales</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(gstr1Totals.taxableValue)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total CGST</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(gstr1Totals.cgst)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total SGST</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(gstr1Totals.sgst)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total IGST</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(gstr1Totals.igst)}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#0984E3]/10 dark:bg-[#00CEC9]/15 border border-[#0984E3]/20 dark:border-[#00CEC9]/20 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-[#0984E3] dark:text-[#00CEC9] uppercase tracking-wider block">Total GST</span>
                <p className="text-sm font-black text-[#0984E3] dark:text-[#00CEC9]">{formatCurrency(gstr1Totals.totalTax)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoices Count</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{gstr1Totals.invoiceCount} Bills</p>
              </div>
            </div>

            {/* SECTION A: B2B Invoices */}
            <div className="bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-2xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Section A: B2B Invoices (पंजीकृत बिक्री)
                </h4>
                <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {b2bInvoices.length} Registered Transactions
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#182026] text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-3">Invoice No.</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Customer</th>
                      <th className="py-2 px-3">GSTIN</th>
                      <th className="py-2 px-3">POS State</th>
                      <th className="py-2 px-3 text-right">Taxable</th>
                      <th className="py-2 px-3 text-right">CGST</th>
                      <th className="py-2 px-3 text-right">SGST</th>
                      <th className="py-2 px-3 text-right">IGST</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2A3642]">
                    {b2bInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                          No B2B invoices recorded in this period.
                        </td>
                      </tr>
                    ) : (
                      b2bInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                          <td className="py-2 px-3 font-bold text-[#0984E3]">{inv.invoiceNo}</td>
                          <td className="py-2 px-3 font-medium">{formatDate(inv.createdAt)}</td>
                          <td className="py-2 px-3 font-medium truncate max-w-[120px]">{inv.customerName}</td>
                          <td className="py-2 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">{inv.customerGstin}</td>
                          <td className="py-2 px-3 font-medium">{inv.customerAddress?.substring(0, 15) || business.state || 'Local'}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(inv.taxableAmount)}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(inv.cgstAmount)}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(inv.sgstAmount)}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(inv.igstAmount)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(inv.grandTotal)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION B: B2C Large */}
            <div className="bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-2xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Section B: B2C Large (&gt; ₹2.5 Lakhs Inter-State)
                </h4>
                <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-[#0984E3]/15 text-[#0984E3] dark:bg-slate-800 dark:text-slate-300">
                  {b2cLargeInvoices.length} Large Unregistered Invoices
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#182026] text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-3">Invoice No.</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">State POS</th>
                      <th className="py-2 px-3 text-right">Taxable Value</th>
                      <th className="py-2 px-3 text-center">Tax Rate</th>
                      <th className="py-2 px-3 text-right">IGST</th>
                      <th className="py-2 px-3 text-right">Invoice Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2A3642]">
                    {b2cLargeInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                          No large inter-state B2C transactions in this period.
                        </td>
                      </tr>
                    ) : (
                      b2cLargeInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                          <td className="py-2 px-3 font-bold text-[#0984E3]">{inv.invoiceNo}</td>
                          <td className="py-2 px-3 font-medium">{formatDate(inv.createdAt)}</td>
                          <td className="py-2 px-3 font-medium">{inv.customerAddress || 'Interstate'}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(inv.taxableAmount)}</td>
                          <td className="py-2 px-3 text-center font-bold">18%</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(inv.igstAmount)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(inv.grandTotal)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION C: B2C Other Outward */}
            <div className="bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-2xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Section C: B2C / Retail Outward Supplies (छोटे ग्राहक)
                </h4>
                <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {b2cOtherInvoices.length} Retail Sales
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#182026] text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-3">Place of Supply (POS)</th>
                      <th className="py-2 px-3 text-center">Tax Slab</th>
                      <th className="py-2 px-3 text-right">Taxable Value</th>
                      <th className="py-2 px-3 text-right">CGST</th>
                      <th className="py-2 px-3 text-right">SGST</th>
                      <th className="py-2 px-3 text-right">IGST</th>
                      <th className="py-2 px-3 text-right">Total Invoice Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2A3642]">
                    {b2cOtherInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                          No retail B2C invoices recorded in this period.
                        </td>
                      </tr>
                    ) : (
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                        <td className="py-2.5 px-3 font-bold text-indigo-600">{business.state || 'Local State POS'}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">Mixed Rates</td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {formatCurrency(b2cOtherInvoices.reduce((sum, i) => sum + i.taxableAmount, 0))}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-500">
                          {formatCurrency(b2cOtherInvoices.reduce((sum, i) => sum + i.cgstAmount, 0))}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-500">
                          {formatCurrency(b2cOtherInvoices.reduce((sum, i) => sum + i.sgstAmount, 0))}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-500">
                          {formatCurrency(b2cOtherInvoices.reduce((sum, i) => sum + i.igstAmount, 0))}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">
                          {formatCurrency(b2cOtherInvoices.reduce((sum, i) => sum + i.grandTotal, 0))}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION D: Credit Notes / Returns */}
            <div className="bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-2xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Section D: Credit Notes & Returns (सेल्स रिटर्न)
                </h4>
                <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  {filteredSalesReturns.length} Sales Returns
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#182026] text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-3">Return ID</th>
                      <th className="py-2 px-3">Original Invoice No</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Taxable Adjustment</th>
                      <th className="py-2 px-3 text-right">Tax Offset</th>
                      <th className="py-2 px-3 text-right">Total Refunded</th>
                      <th className="py-2 px-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2A3642]">
                    {filteredSalesReturns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                          No sales return credit notes in this period.
                        </td>
                      </tr>
                    ) : (
                      filteredSalesReturns.map((ret) => (
                        <tr key={ret.id} className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                          <td className="py-2 px-3 font-bold text-red-600">{ret.id.substring(0, 8).toUpperCase()}</td>
                          <td className="py-2 px-3 font-medium">{ret.invoiceNo || 'N/A'}</td>
                          <td className="py-2 px-3 font-medium">{formatDate(ret.date)}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(ret.totalRefund * 0.84)}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(ret.totalRefund * 0.16)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(ret.totalRefund)}</td>
                          <td className="py-2 px-3 text-slate-500 font-mono italic">Method: {ret.refundMethod}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION E: HSN Summary */}
            <div className="bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-2xs p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  Section E: HSN/SAC Summary Table 12
                </h4>
                <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  {hsnSummary.length} HSN Categories
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#182026] text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-3">HSN/SAC</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-center">UQC</th>
                      <th className="py-2 px-3 text-center">Quantity</th>
                      <th className="py-2 px-3 text-right">Taxable Value</th>
                      <th className="py-2 px-3 text-right">CGST</th>
                      <th className="py-2 px-3 text-right">SGST</th>
                      <th className="py-2 px-3 text-right">IGST</th>
                      <th className="py-2 px-3 text-right">Total Tax</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2A3642]">
                    {hsnSummary.map((h) => (
                      <tr key={h.hsn} className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                        <td className="py-2 px-3 font-mono font-black text-indigo-600 dark:text-[#00CEC9]">{h.hsn}</td>
                        <td className="py-2 px-3 font-medium text-slate-500">{h.description}</td>
                        <td className="py-2 px-3 text-center font-bold text-slate-400">{h.uqc}</td>
                        <td className="py-2 px-3 text-center font-bold">{h.totalQty}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatCurrency(h.taxableValue)}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatCurrency(h.cgst)}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatCurrency(h.sgst)}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatCurrency(h.igst)}</td>
                        <td className="py-2 px-3 text-right font-black text-slate-900 dark:text-white">{formatCurrency(h.totalTax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION F: GSTR-1 Final Summary Summary Card */}
            <div className="p-5 bg-slate-50 dark:bg-[#182026] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#0984E3] uppercase tracking-wider block">Total GSTR-1 Liability</span>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(gstr1Totals.invoiceValue)} <span className="text-xs font-normal text-slate-400">({formatCurrency(gstr1Totals.taxableValue)} Taxable + {formatCurrency(gstr1Totals.totalTax)} Tax)</span>
                </p>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Includes Credit Notes adjustment: -{formatCurrency(returnsAdjustments.creditTaxable)} taxable
                </span>
              </div>
              <div className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-300 p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 max-w-sm">
                <p className="font-bold flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Accountant Disclaimer:</p>
                <p className="text-[10px] leading-tight mt-0.5">Software-generated report based on store records. Please audit all invoice figures with your Chartered Accountant before actual statutory submission.</p>
              </div>
            </div>
          </div>
        )}

        {/* B. GSTR-3B View Screen */}
        {activeReportTab === 'GSTR-3B' && (
          <div className="space-y-6">
            <div className="p-4 bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                GSTR-3B — Summary Return (टैक्स लायबिलिटी और इनपुट टैक्स क्रेडिट)
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#B2BEC3] mt-0.5">
                Summary of outward supplies, eligible ITC, and estimated tax liability.
              </p>
            </div>

            {/* GSTR-3B Top summary metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outward Taxable</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(gstr1Totals.taxableValue)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Output CGST</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(gstr1Totals.cgst)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Output SGST</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(gstr1Totals.sgst)}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Eligible ITC</span>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(gstr3bITC.totalEligibleITC)}</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-[#00CEC9]/15 border border-indigo-100 dark:border-[#00CEC9]/20 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 dark:text-[#00CEC9] uppercase tracking-wider block">Net Tax Payable</span>
                <p className="text-sm font-black text-indigo-700 dark:text-white">{formatCurrency(gstr3bTaxLiability.totalNetLiability)}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
                <p className="text-sm font-black text-amber-500">{gstr3bITC.reviewCount} Bills</p>
              </div>
            </div>

            {/* SECTION A: Outward Taxable Supplies */}
            <div className="bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-2xs p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-[#DFE6E9] dark:border-[#2A3642] pb-2">
                1. Outward Taxable Supplies (Liability Summary)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#182026] text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-3">Supply Category</th>
                      <th className="py-2 px-3 text-right">Taxable Value</th>
                      <th className="py-2 px-3 text-right">CGST Liability</th>
                      <th className="py-2 px-3 text-right">SGST Liability</th>
                      <th className="py-2 px-3 text-right">IGST Liability</th>
                      <th className="py-2 px-3 text-right">Total Tax</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2A3642]">
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-white">Standard Outward Taxable Supplies (B2B + B2C)</td>
                      <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(gstr1Totals.taxableValue)}</td>
                      <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(gstr1Totals.cgst)}</td>
                      <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(gstr1Totals.sgst)}</td>
                      <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(gstr1Totals.igst)}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">{formatCurrency(gstr1Totals.totalTax)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-500">Zero-Rated & Exempted Supplies</td>
                      <td className="py-2.5 px-3 text-right font-medium">₹0.00</td>
                      <td className="py-2.5 px-3 text-right font-medium">₹0.00</td>
                      <td className="py-2.5 px-3 text-right font-medium">₹0.00</td>
                      <td className="py-2.5 px-3 text-right font-medium">₹0.00</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-400">₹0.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION B: ITC Available & Reconciled Bills */}
            <div className="bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-2xs p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-2 gap-2">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    2. Input Tax Credit (ITC Available on Purchases)
                  </h4>
                  <p className="text-[10px] text-slate-400">Flag, reconcile, and mark tax set-off eligibility for each vendor purchase bill</p>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 font-bold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 shrink-0 self-start sm:self-auto">
                  {filteredPurchases.length} Purchase Bills Reco
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#182026] text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-3">Supplier Name</th>
                      <th className="py-2 px-3">Bill No.</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Taxable Value</th>
                      <th className="py-2 px-3 text-right">Eligible Tax</th>
                      <th className="py-2 px-3 text-center">ITC Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2A3642]">
                    {filteredPurchases.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          No supplier purchase bills recorded in this period.
                        </td>
                      </tr>
                    ) : (
                      filteredPurchases.map((pur) => {
                        const currentStatus = itcStatuses[pur.id] || 'Available';
                        return (
                          <tr key={pur.id} className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                            <td className="py-2 px-3">
                              <span className="font-bold text-slate-800 dark:text-white block">{pur.supplierName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">GST: 27AAAAA1111A1Z2</span>
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-600 dark:text-slate-400">{pur.purchaseNo}</td>
                            <td className="py-2 px-3 font-medium">{formatDate(pur.date)}</td>
                            <td className="py-2 px-3 text-right font-medium">{formatCurrency(pur.grandTotal * 0.84)}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(pur.taxAmount)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <select
                                value={currentStatus}
                                onChange={(e) => handleUpdateItcStatus(pur.id, e.target.value as any)}
                                className={`px-2 py-1 text-[10px] font-bold rounded-lg border focus:ring-0 ${
                                  currentStatus === 'Available'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                                    : currentStatus === 'Review Required'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                                    : currentStatus === 'Reversed'
                                    ? 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
                                    : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-900/50'
                                }`}
                              >
                                <option value="Available">Available (दावा करें)</option>
                                <option value="Review Required">Review Required (जांचें)</option>
                                <option value="Not Marked">Not Marked (लंबित)</option>
                                <option value="Reversed">Reversed (वापस)</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION C: Tax Liability Summary Comparison Table */}
            <div className="bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-2xs p-4 space-y-3">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b border-[#DFE6E9] dark:border-[#2A3642] pb-2">
                3. Tax Liability Calculation (Output Tax minus Eligible ITC)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#182026] text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-3">Tax Head</th>
                      <th className="py-2 px-3 text-right">Output Sales Tax (Liability)</th>
                      <th className="py-2 px-3 text-right">Less: Eligible Input Credit (ITC Set-Off)</th>
                      <th className="py-2 px-3 text-right">Estimated Net GST Cash Liability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2A3642] font-medium">
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">Central Tax (CGST)</td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-[#F5F6FA]">{formatCurrency(gstr1Totals.cgst)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600">-{formatCurrency(gstr3bITC.cgstITC)}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">{formatCurrency(gstr3bTaxLiability.netCgst)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">State Tax (SGST)</td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-[#F5F6FA]">{formatCurrency(gstr1Totals.sgst)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600">-{formatCurrency(gstr3bITC.sgstITC)}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">{formatCurrency(gstr3bTaxLiability.netSgst)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                      <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">Integrated Tax (IGST)</td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-[#F5F6FA]">{formatCurrency(gstr1Totals.igst)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600">-{formatCurrency(gstr3bITC.igstITC)}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white">{formatCurrency(gstr3bTaxLiability.netIgst)}</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-[#182026] text-[11px] font-black">
                      <td className="py-3 px-3 uppercase text-slate-800 dark:text-white">Total Combined Net GST Payable</td>
                      <td className="py-3 px-3 text-right text-slate-800 dark:text-white">{formatCurrency(gstr1Totals.totalTax)}</td>
                      <td className="py-3 px-3 text-right text-emerald-600">-{formatCurrency(gstr3bITC.totalEligibleITC)}</td>
                      <td className="py-3 px-3 text-right text-indigo-600 dark:text-[#00CEC9] text-sm">
                        {formatCurrency(gstr3bTaxLiability.totalNetLiability)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION D: Advisory disclaimer */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 rounded-xl">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-800 dark:text-white">Statutory Advisory Note</span>
                <p className="text-[10px] mt-0.5 leading-relaxed">ShopMate estimates your Net Tax liability by matching outward Sales GST invoice items with eligible Input Tax Credit (ITC) as Reconciliation flags inside the system. Ensure all invoice classifications are validated. Verify legal compliance rules with your legal auditor before GST portal tax submissions.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Report Audit History section */}
      <div className="bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-2xs p-5 space-y-4 print:hidden">
        <div className="flex items-center gap-2 border-b border-[#DFE6E9] dark:border-[#2A3642] pb-3">
          <History className="w-4 h-4 text-slate-400" />
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Share & Activity Audit History (ऑडिट ट्रेल)
            </h3>
            <p className="text-[10px] text-slate-400">Verifiable logging of all GST report downloads, prints, and CA shares</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#182026] text-[10px] font-bold text-slate-400 uppercase">
                <th className="py-2 px-3">Report</th>
                <th className="py-2 px-3">Period</th>
                <th className="py-2 px-3">Generated On</th>
                <th className="py-2 px-3">Shared By</th>
                <th className="py-2 px-3">Email Status</th>
                <th className="py-2 px-3">WhatsApp Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2A3642]">
              {reportHistory.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-[#202B33]/50">
                  <td className="py-2 px-3 font-bold text-indigo-600 dark:text-[#00CEC9]">{h.report}</td>
                  <td className="py-2 px-3 font-semibold">{h.period}</td>
                  <td className="py-2 px-3 text-slate-500">{formatDate(h.generatedOn)} • {h.generatedOn.substring(11, 16)}</td>
                  <td className="py-2 px-3 text-slate-700 dark:text-white font-bold">{h.generatedBy}</td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      h.emailStatus === 'Sent'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : h.emailStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {h.emailStatus} {h.emailRecipient && `(${h.emailRecipient})`}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      h.whatsappStatus === 'Sent'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {h.whatsappStatus} {h.whatsappRecipient && `(${h.whatsappRecipient})`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. CA Accountant Contacts quick setting dashboard */}
      <div className="bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] rounded-2xl shadow-2xs p-5 space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0984E3]" />
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                Chartered Accountant & Tax Advisors Contacts (अकाउंटेंट संपर्क्स)
              </h3>
              <p className="text-[10px] text-slate-400">Manage CA contacts to automatically pre-populate email & WhatsApp shares</p>
            </div>
          </div>
          <button
            onClick={() => setIsCaModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0984E3]/10 hover:bg-[#0984E3]/20 border border-[#0984E3]/30 text-[#0984E3] dark:text-[#00CEC9] text-xs font-bold rounded-xl transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Add Accountant
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caContacts.map((c) => (
            <div key={c.id} className={`p-4 rounded-xl border flex flex-col justify-between relative ${
              c.isDefault
                ? 'border-[#0984E3] bg-[#0984E3]/5 dark:bg-[#00CEC9]/10'
                : 'border-[#DFE6E9] dark:border-[#2A3642] bg-slate-50/50 dark:bg-[#182026]'
            }`}>
              {c.isDefault && (
                <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider bg-[#0984E3] text-white px-2 py-0.5 rounded-md shadow-2xs">
                  DEFAULT CA
                </span>
              )}
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-800 dark:text-white">{c.name}</p>
                <p className="text-[11px] font-semibold text-slate-500">{c.firmName}</p>
                <div className="space-y-0.5 pt-2 text-[11px] text-slate-500 font-medium">
                  <p className="flex items-center gap-1 text-indigo-600 dark:text-[#00CEC9]"><Mail className="w-3 h-3" /> {c.email}</p>
                  <p className="flex items-center gap-1 text-emerald-600"><Phone className="w-3 h-3" /> {c.phone}</p>
                </div>
                {c.notes && <p className="text-[10px] text-slate-400 italic mt-1 font-medium">Note: {c.notes}</p>}
              </div>

              <div className="flex items-center gap-2 pt-3 mt-3 border-t border-[#DFE6E9] dark:border-[#2A3642]">
                {!c.isDefault && (
                  <button
                    onClick={() => handleSetDefaultCa(c.id)}
                    className="text-[10px] font-bold text-[#0984E3] hover:underline"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCa(c.id)}
                  className="text-[10px] font-bold text-red-600 hover:underline ml-auto flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ======================= MODAL PORTALS ======================== */}
      {/* ============================================================== */}

      {/* MODAL 1: Email GST Report Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-[#12181F]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1E272E] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xl w-full max-w-lg p-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" /> Send GST Report by Email
              </h3>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#202B33] hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  CA / Accountant Email Address
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-800 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="ca@office.com"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-800 dark:text-white font-medium focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message Details
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-800 dark:text-white font-medium focus:outline-hidden resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#182026] rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="font-bold">Attachment Included:</p>
                  <p className="text-[10px] text-slate-400">VYAPRIX_{activeReportTab}_FY{fy}_{getMonthName(month)}.pdf</p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  id="saveCa"
                  checked={saveCaEmail}
                  onChange={(e) => setSaveCaEmail(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0"
                />
                <label htmlFor="saveCa" className="text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer">
                  Save Email to CA Contacts list
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#DFE6E9] dark:border-[#2A3642]">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-bold bg-slate-100 dark:bg-[#182026] text-slate-700 dark:text-white rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send Report Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WhatsApp share prefilled Modal */}
      {isWhatsappModalOpen && (
        <div className="fixed inset-0 bg-[#12181F]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1E272E] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xl w-full max-w-lg p-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" /> Share GST Report on WhatsApp
              </h3>
              <button
                onClick={() => setIsWhatsappModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#202B33] hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendWhatsApp} className="space-y-4 text-xs text-left">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  CA WhatsApp Number (with country code, e.g. +91)
                </label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-800 dark:text-white font-medium focus:outline-hidden"
                  placeholder="+919876543210"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Prefilled WhatsApp Message Body
                </label>
                <textarea
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-800 dark:text-white font-medium focus:outline-hidden resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-[11px] leading-tight font-medium">
                <p className="font-bold flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Note on Share Link:</p>
                <p className="mt-0.5">Clicking send will securely launch the official WhatsApp application with the custom generated report overview formatted instantly.</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#DFE6E9] dark:border-[#2A3642]">
                <button
                  type="button"
                  onClick={() => setIsWhatsappModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-bold bg-slate-100 dark:bg-[#182026] text-slate-700 dark:text-white rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send on WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add new Accountant Contact */}
      {isCaModalOpen && (
        <div className="fixed inset-0 bg-[#12181F]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1E272E] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xl w-full max-w-lg p-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Add CA / Accountant Contact
              </h3>
              <button
                onClick={() => setIsCaModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#202B33] hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCa} className="space-y-4 text-xs text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newCa.name}
                    onChange={(e) => setNewCa({ ...newCa, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-800 dark:text-white font-medium"
                    placeholder="CA Sunil Sharma"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Firm Name</label>
                  <input
                    type="text"
                    value={newCa.firmName}
                    onChange={(e) => setNewCa({ ...newCa, firmName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-800 dark:text-white font-medium"
                    placeholder="Sharma & Associates"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newCa.email}
                    onChange={(e) => setNewCa({ ...newCa, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-800 dark:text-white font-medium"
                    placeholder="ca@firm.com"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={newCa.phone}
                    onChange={(e) => setNewCa({ ...newCa, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-800 dark:text-white font-medium"
                    placeholder="+919876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Advisory Notes</label>
                <input
                  type="text"
                  value={newCa.notes}
                  onChange={(e) => setNewCa({ ...newCa, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-slate-800 dark:text-white font-medium"
                  placeholder="Handles standard monthly retail filings"
                />
              </div>

              <div className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  id="defaultCa"
                  checked={newCa.isDefault}
                  onChange={(e) => setNewCa({ ...newCa, isDefault: e.target.checked })}
                  className="rounded text-[#0984E3] focus:ring-0"
                />
                <label htmlFor="defaultCa" className="text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer">
                  Mark as Default Primary Accountant Contact
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#DFE6E9] dark:border-[#2A3642]">
                <button
                  type="button"
                  onClick={() => setIsCaModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-bold bg-slate-100 dark:bg-[#182026] text-slate-700 dark:text-white rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold bg-[#0984E3] text-white rounded-xl hover:bg-[#0770C2]"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
