import React, { useState } from 'react';
import {
  Settings,
  Building,
  CreditCard,
  FileText,
  Save,
  Database,
  Upload,
  Download,
  ShieldAlert,
  CheckCircle,
  QrCode,
  Sun,
  Moon,
  Monitor,
  Palette,
  Sparkles,
  Globe,
  ScanLine,
  Check,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { INDIAN_STATES } from '../utils/formatters';
import { BusinessType, InvoiceTemplateId } from '../types';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../utils/translations';

export const SettingsView: React.FC = () => {
  const {
    business,
    updateBusiness,
    exportDataJson,
    importDataJson,
    resetToDemoData,
    themeMode,
    setThemeMode,
    darkMode,
    language,
    setLanguage,
    barcodeScannerEnabled,
    setBarcodeScannerEnabled,
    t,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'profile' | 'language' | 'pos' | 'display' | 'invoice' | 'bank' | 'backup'>('profile');

  // Business Profile Form
  const [name, setName] = useState(business.name);
  const [tagline, setTagline] = useState(business.tagline);
  const [ownerName, setOwnerName] = useState(business.ownerName);
  const [phone, setPhone] = useState(business.phone);
  const [email, setEmail] = useState(business.email);
  const [address, setAddress] = useState(business.address);
  const [city, setCity] = useState(business.city);
  const [stateCode, setStateCode] = useState(business.stateCode);
  const [pinCode, setPinCode] = useState(business.pinCode);
  const [gstin, setGstin] = useState(business.gstin || '');
  const [pan, setPan] = useState(business.pan || '');
  const [udyam, setUdyam] = useState(business.udyam || '');
  const [businessType, setBusinessType] = useState<BusinessType>(business.businessType);
  const [logo, setLogo] = useState(business.logo || '');

  // Bank & UPI
  const [bankName, setBankName] = useState(business.bankDetails.bankName);
  const [accountNo, setAccountNo] = useState(business.bankDetails.accountNo);
  const [ifsc, setIfsc] = useState(business.bankDetails.ifsc);
  const [branch, setBranch] = useState(business.bankDetails.branch);
  const [accountHolder, setAccountHolder] = useState(business.bankDetails.accountHolder || '');
  const [upiId, setUpiId] = useState(business.upiId || '');

  // Invoice Customization
  const [invoicePrefix, setInvoicePrefix] = useState(business.invoiceSettings.invoicePrefix || 'VY-2026-');
  const [terms, setTerms] = useState(business.invoiceSettings.terms);
  const [footerNotes, setFooterNotes] = useState(business.invoiceSettings.footerNotes);
  const [showBankDetails, setShowBankDetails] = useState(business.invoiceSettings.showBankDetails);
  const [showUpiQr, setShowUpiQr] = useState(business.invoiceSettings.showUpiQr);
  const [invoiceTemplate, setInvoiceTemplate] = useState<InvoiceTemplateId>(business.invoiceSettings.template || 'template_1');
  const [themeColor, setThemeColor] = useState(business.invoiceSettings.themeColor || '#0984E3');
  const [showPoweredBy, setShowPoweredBy] = useState(business.invoiceSettings.showPoweredBy !== false);
  const [showAmountInWords, setShowAmountInWords] = useState(business.invoiceSettings.showAmountInWords !== false);
  const [showHsn, setShowHsn] = useState(business.invoiceSettings.showHsn !== false);
  const [signatureTitle, setSignatureTitle] = useState(business.invoiceSettings.signatureTitle || 'Authorized Signatory');

  // Status
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const stObj = INDIAN_STATES.find((s) => s.code === stateCode);

    updateBusiness({
      name,
      tagline,
      ownerName,
      phone,
      email,
      address,
      city,
      state: stObj?.name || 'Maharashtra',
      stateCode,
      pinCode,
      gstin: gstin || undefined,
      pan: pan || undefined,
      udyam: udyam || undefined,
      businessType,
      logo: logo || undefined,
      upiId: upiId || undefined,
      bankDetails: {
        bankName,
        accountNo,
        ifsc,
        branch,
        accountHolder,
      },
      invoiceSettings: {
        ...business.invoiceSettings,
        invoicePrefix,
        terms,
        footerNotes,
        showBankDetails,
        showUpiQr,
        template: invoiceTemplate,
        themeColor,
        showPoweredBy,
        showAmountInWords,
        showHsn,
        signatureTitle,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShopMate_Backup_${business.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) alert('Backup restored successfully!');
        else alert('Failed to restore backup. Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 sm:w-6 h-5 sm:h-6 text-[#0984E3]" />
            Business Profile & Store Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure your GST registration, bank account, print invoice layout, and data backup.
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle className="w-4 h-4" /> Changes Saved!
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#DFE6E9] dark:border-[#2A3642] pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'profile'
              ? 'bg-[#0984E3] text-white shadow-xs'
              : 'text-[#636E72] dark:text-[#B2BEC3] hover:bg-[#F5F6FA] dark:hover:bg-[#202B33]'
          }`}
        >
          Business Profile
        </button>
        <button
          onClick={() => setActiveTab('language')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'language'
              ? 'bg-[#0984E3] text-white shadow-xs'
              : 'text-[#636E72] dark:text-[#B2BEC3] hover:bg-[#F5F6FA] dark:hover:bg-[#202B33]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Language (भाषा)
        </button>
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'pos'
              ? 'bg-[#0984E3] text-white shadow-xs'
              : 'text-[#636E72] dark:text-[#B2BEC3] hover:bg-[#F5F6FA] dark:hover:bg-[#202B33]'
          }`}
        >
          <ScanLine className="w-3.5 h-3.5" />
          POS & Scanner Settings
        </button>
        <button
          onClick={() => setActiveTab('display')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'display'
              ? 'bg-[#0984E3] text-white shadow-xs'
              : 'text-[#636E72] dark:text-[#B2BEC3] hover:bg-[#F5F6FA] dark:hover:bg-[#202B33]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Display & Theme
        </button>
        <button
          onClick={() => setActiveTab('invoice')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'invoice'
              ? 'bg-[#0984E3] text-white shadow-xs'
              : 'text-[#636E72] dark:text-[#B2BEC3] hover:bg-[#F5F6FA] dark:hover:bg-[#202B33]'
          }`}
        >
          Invoice Customizer
        </button>
        <button
          onClick={() => setActiveTab('bank')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'bank'
              ? 'bg-[#0984E3] text-white shadow-xs'
              : 'text-[#636E72] dark:text-[#B2BEC3] hover:bg-[#F5F6FA] dark:hover:bg-[#202B33]'
          }`}
        >
          Bank & UPI Details
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'backup'
              ? 'bg-[#0984E3] text-white shadow-xs'
              : 'text-[#636E72] dark:text-[#B2BEC3] hover:bg-[#F5F6FA] dark:hover:bg-[#202B33]'
          }`}
        >
          Backup & Security
        </button>
      </div>

      {/* Content Form */}
      <div className="bg-white dark:bg-[#182026] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xs p-6">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Language Tab Panel */}
          {activeTab === 'language' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#0984E3] dark:text-[#00CEC9]" />
                  Language & Regional Settings (भाषा और क्षेत्रीय भाषा विकल्प)
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#B2BEC3] mt-1">
                  Choose your preferred language. VYAPRIX supports English, Hindi, Hinglish, Urdu, and major Indian languages.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <div
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-[#0984E3] bg-[#0984E3]/10 text-[#0984E3] dark:text-[#00CEC9] shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {lang.nativeName}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {lang.name} ({lang.region})
                        </p>
                      </div>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-[#0984E3] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* POS & Scanner Tab Panel */}
          {activeTab === 'pos' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-[#0984E3] dark:text-[#00CEC9]" />
                  POS Counter & Barcode Scanner Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#B2BEC3] mt-1">
                  Configure checkout options and toggle hardware scanner displays.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ScanLine className="w-4 h-4 text-[#0984E3]" />
                    Show Barcode Scanner in Billing Screen (बिलिंग में बारकोड स्कैनर दिखाएं)
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                    By default, the barcode scanner is hidden from the main billing screen for a clean, distraction-free shop counter. Turn this ON only if you actively use camera or barcode hardware scanning.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={barcodeScannerEnabled}
                    onChange={(e) => setBarcodeScannerEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0984E3]"></div>
                </label>
              </div>
            </div>
          )}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Store / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* GSTIN, PAN, Udyam */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    MSME / Udyam Number
                  </label>
                  <input
                    type="text"
                    value={udyam}
                    onChange={(e) => setUdyam(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Address & State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State (GST State Code)
                  </label>
                  <select
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#1E272E] dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0984E3]" />
                  Display & Appearance (डिस्प्ले और थीम)
                </h3>
                <p className="text-xs text-[#636E72] dark:text-[#B2BEC3]">
                  Choose your interface theme. When Dark mode is enabled, the background canvas turns into rich midnight dark (#12181F), and foreground cards feature high-contrast surfaces (#1E272E) with Electric Blue and Cyan accents.
                </p>
              </div>

              {/* 3 Theme Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Light Mode */}
                <div
                  onClick={() => setThemeMode('light')}
                  className={`cursor-pointer rounded-2xl border-2 p-5 transition flex flex-col justify-between relative ${
                    themeMode === 'light'
                      ? 'border-[#0984E3] bg-[#0984E3]/5 dark:bg-[#0984E3]/10 shadow-sm'
                      : 'border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] hover:border-[#0984E3]/50'
                  }`}
                >
                  <div>
                    {/* Visual Mockup */}
                    <div className="h-28 rounded-xl border border-[#DFE6E9] bg-white p-3 mb-4 shadow-2xs flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between border-b border-[#DFE6E9] pb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded bg-[#0984E3] text-white flex items-center justify-center text-[9px] font-bold">V</div>
                          <div className="h-2 w-12 bg-[#2D3436] rounded" />
                        </div>
                        <div className="h-2 w-8 bg-[#0984E3] rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 my-auto">
                        <div className="h-8 rounded bg-[#F5F6FA] border border-[#DFE6E9] p-1.5">
                          <div className="h-1.5 w-8 bg-[#636E72] rounded mb-1" />
                          <div className="h-2 w-12 bg-[#2D3436] rounded" />
                        </div>
                        <div className="h-8 rounded bg-[#F5F6FA] border border-[#DFE6E9] p-1.5">
                          <div className="h-1.5 w-8 bg-[#636E72] rounded mb-1" />
                          <div className="h-2 w-12 bg-[#0984E3] rounded" />
                        </div>
                      </div>
                      <div className="h-2 w-full bg-[#DFE6E9] rounded" />
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#F5F6FA] dark:bg-[#202B33] text-[#0984E3]">
                          <Sun className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-[#1E272E] dark:text-white">
                          Light (लाइट)
                        </span>
                      </div>
                      {themeMode === 'light' && (
                        <CheckCircle className="w-5 h-5 text-[#0984E3]" />
                      )}
                    </div>
                    <p className="text-xs text-[#636E72] dark:text-[#B2BEC3] leading-relaxed">
                      Clean, pure white background for daytime brightness, high visibility, and traditional retail billing.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DFE6E9] dark:border-[#2A3642] flex items-center justify-between text-[11px]">
                    <span className="text-[#636E72] dark:text-[#B2BEC3]">Canvas: White #FFFFFF</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      themeMode === 'light' ? 'bg-[#0984E3] text-white' : 'bg-[#DFE6E9] dark:bg-[#2A3642] text-[#636E72] dark:text-[#B2BEC3]'
                    }`}>
                      {themeMode === 'light' ? 'Active' : 'Select'}
                    </span>
                  </div>
                </div>

                {/* 2. Dark Mode */}
                <div
                  onClick={() => setThemeMode('dark')}
                  className={`cursor-pointer rounded-2xl border-2 p-5 transition flex flex-col justify-between relative ${
                    themeMode === 'dark'
                      ? 'border-[#00CEC9] bg-[#00CEC9]/10 shadow-sm'
                      : 'border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] hover:border-[#00CEC9]/50'
                  }`}
                >
                  <div>
                    {/* Visual Mockup */}
                    <div className="h-28 rounded-xl border border-[#2A3642] bg-[#12181F] p-3 mb-4 shadow-2xs flex flex-col justify-between overflow-hidden">
                      <div className="flex items-center justify-between border-b border-[#2A3642] pb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded bg-[#0984E3] text-white flex items-center justify-center text-[9px] font-bold">V</div>
                          <div className="h-2 w-12 bg-white rounded" />
                        </div>
                        <div className="h-2 w-8 bg-[#00CEC9] rounded" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 my-auto">
                        <div className="h-8 rounded bg-[#1E272E] border border-[#2A3642] p-1.5">
                          <div className="h-1.5 w-8 bg-[#B2BEC3] rounded mb-1" />
                          <div className="h-2 w-12 bg-white rounded" />
                        </div>
                        <div className="h-8 rounded bg-[#1E272E] border border-[#2A3642] p-1.5">
                          <div className="h-1.5 w-8 bg-[#B2BEC3] rounded mb-1" />
                          <div className="h-2 w-12 bg-[#00CEC9] rounded" />
                        </div>
                      </div>
                      <div className="h-2 w-full bg-[#2A3642] rounded" />
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#202B33] text-[#00CEC9]">
                          <Moon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-[#1E272E] dark:text-white">
                          Dark (डार्क)
                        </span>
                      </div>
                      {themeMode === 'dark' && (
                        <CheckCircle className="w-5 h-5 text-[#00CEC9]" />
                      )}
                    </div>
                    <p className="text-xs text-[#636E72] dark:text-[#B2BEC3] leading-relaxed">
                      Deep midnight background with layered contrast cards, glowing Cyan accents, and reduced eye strain.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DFE6E9] dark:border-[#2A3642] flex items-center justify-between text-[11px]">
                    <span className="text-[#636E72] dark:text-[#B2BEC3]">Canvas: Midnight #12181F</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      themeMode === 'dark' ? 'bg-[#00CEC9] text-[#1E272E]' : 'bg-[#DFE6E9] dark:bg-[#2A3642] text-[#636E72] dark:text-[#B2BEC3]'
                    }`}>
                      {themeMode === 'dark' ? 'Active' : 'Select'}
                    </span>
                  </div>
                </div>

                {/* 3. Auto / System Mode */}
                <div
                  onClick={() => setThemeMode('auto')}
                  className={`cursor-pointer rounded-2xl border-2 p-5 transition flex flex-col justify-between relative ${
                    themeMode === 'auto'
                      ? 'border-[#0984E3] bg-[#0984E3]/5 dark:bg-[#0984E3]/10 shadow-sm'
                      : 'border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] hover:border-[#0984E3]/50'
                  }`}
                >
                  <div>
                    {/* Visual Mockup Split */}
                    <div className="h-28 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] p-0 mb-4 shadow-2xs flex overflow-hidden">
                      <div className="w-1/2 bg-white p-3 flex flex-col justify-between border-r border-[#DFE6E9]">
                        <div className="h-2 w-8 bg-[#2D3436] rounded" />
                        <div className="h-6 rounded bg-[#F5F6FA] border border-[#DFE6E9]" />
                        <div className="h-2 w-full bg-[#0984E3] rounded" />
                      </div>
                      <div className="w-1/2 bg-[#12181F] p-3 flex flex-col justify-between">
                        <div className="h-2 w-8 bg-white rounded" />
                        <div className="h-6 rounded bg-[#1E272E] border border-[#2A3642]" />
                        <div className="h-2 w-full bg-[#00CEC9] rounded" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#F5F6FA] dark:bg-[#202B33] text-[#0984E3] dark:text-[#00CEC9]">
                          <Monitor className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-[#1E272E] dark:text-white">
                          Auto (सिस्टम डिफॉल्ट)
                        </span>
                      </div>
                      {themeMode === 'auto' && (
                        <CheckCircle className="w-5 h-5 text-[#0984E3]" />
                      )}
                    </div>
                    <p className="text-xs text-[#636E72] dark:text-[#B2BEC3] leading-relaxed">
                      Automatically syncs with your device theme (Mac, Windows, Android, iPhone). Active:{' '}
                      <span className="font-bold text-[#1E272E] dark:text-white">{darkMode ? 'Dark' : 'Light'}</span>.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DFE6E9] dark:border-[#2A3642] flex items-center justify-between text-[11px]">
                    <span className="text-[#636E72] dark:text-[#B2BEC3]">Follows Device OS</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      themeMode === 'auto' ? 'bg-[#0984E3] text-white' : 'bg-[#DFE6E9] dark:bg-[#2A3642] text-[#636E72] dark:text-[#B2BEC3]'
                    }`}>
                      {themeMode === 'auto' ? 'Active' : 'Select'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoice' && (
            <div className="space-y-6">
              {/* 1. Template Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1E272E] mb-2 uppercase tracking-wider">
                  Invoice Design Template
                </label>
                <p className="text-xs text-[#636E72] mb-3">
                  Choose the default design layout for your customer invoices and PDF printouts.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Template 1 */}
                  <div
                    onClick={() => setInvoiceTemplate('template_1')}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition relative ${
                      invoiceTemplate === 'template_1' || invoiceTemplate === 'standard'
                        ? 'border-[#0984E3] bg-[#0984E3]/5 shadow-xs'
                        : 'border-[#DFE6E9] bg-white hover:border-[#74B9FF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#1E272E]">1. Modern Electric</span>
                      {(invoiceTemplate === 'template_1' || invoiceTemplate === 'standard') && (
                        <CheckCircle className="w-4 h-4 text-[#0984E3]" />
                      )}
                    </div>
                    <div className="h-2 w-full rounded bg-gradient-to-r from-[#0984E3] to-[#00CEC9] mb-2" />
                    <p className="text-[11px] text-[#636E72]">
                      VYAPRIX Signature style. Electric Blue accent header, sleek borders, and subtle total highlight box.
                    </p>
                  </div>

                  {/* Template 2 */}
                  <div
                    onClick={() => setInvoiceTemplate('template_2')}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition relative ${
                      invoiceTemplate === 'template_2' || invoiceTemplate === 'minimal'
                        ? 'border-[#1E272E] bg-[#1E272E]/5 shadow-xs'
                        : 'border-[#DFE6E9] bg-white hover:border-[#636E72]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#1E272E]">2. Minimalist Executive</span>
                      {(invoiceTemplate === 'template_2' || invoiceTemplate === 'minimal') && (
                        <CheckCircle className="w-4 h-4 text-[#1E272E]" />
                      )}
                    </div>
                    <div className="h-2 w-full rounded bg-[#1E272E] mb-2" />
                    <p className="text-[11px] text-[#636E72]">
                      Classic monochrome Swiss typography, Cyan neon accents, and understated executive hairlines.
                    </p>
                  </div>

                  {/* Template 3 */}
                  <div
                    onClick={() => setInvoiceTemplate('template_3')}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition relative ${
                      invoiceTemplate === 'template_3' || invoiceTemplate === 'modern'
                        ? 'border-[#00CEC9] bg-[#00CEC9]/10 shadow-xs'
                        : 'border-[#DFE6E9] bg-white hover:border-[#00CEC9]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#1E272E]">3. Corporate Compact</span>
                      {(invoiceTemplate === 'template_3' || invoiceTemplate === 'modern') && (
                        <CheckCircle className="w-4 h-4 text-[#00CEC9]" />
                      )}
                    </div>
                    <div className="h-2 w-full rounded bg-[#00CEC9] mb-2" />
                    <p className="text-[11px] text-[#636E72]">
                      Enterprise Indian GST layout with dedicated HSN/SAC Tax Schedule summary table for statutory compliance.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Theme Color Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1E272E] mb-2 uppercase tracking-wider">
                  Brand Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { name: 'Electric Blue', hex: '#0984E3' },
                    { name: 'Cyan Neon', hex: '#00CEC9' },
                    { name: 'Night Black', hex: '#1E272E' },
                    { name: 'Emerald Green', hex: '#00B894' },
                    { name: 'Royal Indigo', hex: '#4F46E5' },
                  ].map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setThemeColor(col.hex)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                        themeColor === col.hex
                          ? 'border-[#1E272E] bg-white shadow-2xs'
                          : 'border-[#DFE6E9] bg-[#F5F6FA] text-[#636E72]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Invoice Number Prefix & Signatory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#DFE6E9]">
                <div>
                  <label className="block text-xs font-semibold text-[#1E272E] mb-1">
                    Invoice Number Prefix
                  </label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-[#DFE6E9] bg-white text-[#1E272E] font-bold"
                  />
                  <p className="text-[10px] text-[#636E72] mt-1">Example: VY-2026-000124</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E272E] mb-1">
                    Authorized Signatory Title
                  </label>
                  <input
                    type="text"
                    value={signatureTitle}
                    onChange={(e) => setSignatureTitle(e.target.value)}
                    placeholder="e.g. Authorized Signatory / Proprietor"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#DFE6E9] bg-white text-[#1E272E]"
                  />
                  <p className="text-[10px] text-[#636E72] mt-1">Shown below the signature box</p>
                </div>
              </div>

              {/* 4. Content Visibility Toggles */}
              <div className="p-4 rounded-xl bg-[#F5F6FA] border border-[#DFE6E9] space-y-2.5">
                <p className="text-xs font-bold text-[#1E272E] uppercase tracking-wider mb-2">
                  Invoice Content Toggles
                </p>

                <label className="flex items-center gap-2.5 text-xs font-medium text-[#1E272E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPoweredBy}
                    onChange={(e) => setShowPoweredBy(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0984E3] border-[#DFE6E9] focus:ring-[#0984E3]"
                  />
                  <span>Show "Powered by GOLDEN BAZAAR" footer branding</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-[#1E272E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBankDetails}
                    onChange={(e) => setShowBankDetails(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0984E3] border-[#DFE6E9] focus:ring-[#0984E3]"
                  />
                  <span>Show Bank Account details (A/C No, IFSC, Bank Name) on printed invoices</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-[#1E272E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUpiQr}
                    onChange={(e) => setShowUpiQr(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0984E3] border-[#DFE6E9] focus:ring-[#0984E3]"
                  />
                  <span>Print dynamic UPI QR Code on invoices for instant scan-to-pay via GPay / PhonePe</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-[#1E272E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAmountInWords}
                    onChange={(e) => setShowAmountInWords(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0984E3] border-[#DFE6E9] focus:ring-[#0984E3]"
                  />
                  <span>Print Grand Total Amount in Indian Currency Words (e.g. Rupees One Thousand...)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-[#1E272E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHsn}
                    onChange={(e) => setShowHsn(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0984E3] border-[#DFE6E9] focus:ring-[#0984E3]"
                  />
                  <span>Show HSN/SAC Code Column in item table</span>
                </label>
              </div>

              {/* 5. Terms & Footer Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#1E272E] mb-1">
                  Terms & Conditions (Appears at invoice bottom)
                </label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DFE6E9] bg-white text-[#1E272E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E272E] mb-1">
                  Footer Greeting Message
                </label>
                <input
                  type="text"
                  value={footerNotes}
                  onChange={(e) => setFooterNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#DFE6E9] bg-white text-[#1E272E]"
                />
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  UPI ID (VPA) for Instant Payments *
                </label>
                <input
                  type="text"
                  placeholder="e.g. yourshop@okaxis or 9820123456@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full max-w-md px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Complete Data Export & Offline Backup
                </h4>
                <p className="text-xs text-slate-500">
                  Export all your products, sales invoices, khata ledger, suppliers, and customer balances into an encrypted JSON file for backup.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
                >
                  <Download className="w-4 h-4" /> Download Complete JSON Backup
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Restore Backup from JSON
                </h4>
                <p className="text-xs text-slate-500">
                  Restore a previously exported ShopMate backup file.
                </p>
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition">
                  <Upload className="w-4 h-4" /> Choose JSON File to Restore
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-2">
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-200 uppercase tracking-wider">
                  Reset Demo Retail Store
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Reset the database back to clean initial Indian retail sample data.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset store back to default demo state?')) {
                      resetToDemoData();
                    }
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Reset Demo Store
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'backup' && (
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
              >
                <Save className="w-4 h-4" /> Save Business Settings
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
