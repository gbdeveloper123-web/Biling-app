import React, { useState } from 'react';
import {
  Store,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  FileText,
  CreditCard,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AuthUser, OnboardingPayload } from '../../types/auth';
import { INDIAN_STATES } from '../../utils/formatters';

interface BusinessOnboardingViewProps {
  user: AuthUser;
  onComplete: (data: OnboardingPayload) => void;
}

export const BusinessOnboardingView: React.FC<BusinessOnboardingViewProps> = ({
  user,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Business Details
  const [businessName, setBusinessName] = useState(user.businessName || 'My Vyapar Store');
  const [businessType, setBusinessType] = useState('Retail & Wholesale');
  const [ownerName, setOwnerName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [address, setAddress] = useState('Main Market Road');
  const [city, setCity] = useState('Mumbai');
  const [stateCode, setStateCode] = useState('27');
  const [pinCode, setPinCode] = useState('400001');

  // Step 2: GST Details
  const [isGstRegistered, setIsGstRegistered] = useState(false);
  const [gstin, setGstin] = useState('');
  const [legalName, setLegalName] = useState(businessName);

  // Step 3: Invoice Settings
  const [invoicePrefix, setInvoicePrefix] = useState('VY-2026-');
  const [startingInvoiceNo, setStartingInvoiceNo] = useState<number>(101);
  const [defaultTaxMode, setDefaultTaxMode] = useState<'exclusive' | 'inclusive'>('inclusive');
  const [defaultPaymentMethods, setDefaultPaymentMethods] = useState<string[]>([
    'upi',
    'cash',
    'card',
  ]);

  // Handle Next
  const handleNext = () => {
    if (step === 1) {
      if (!businessName.trim()) {
        alert('Please enter your business name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (isGstRegistered && !gstin.trim()) {
        alert('Please enter your GSTIN or select "No" if not registered.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      const stateObj = INDIAN_STATES.find((s) => s.code === stateCode);
      onComplete({
        businessName: businessName.trim(),
        businessType,
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        state: stateObj?.name || 'Maharashtra',
        stateCode,
        pinCode: pinCode.trim(),
        isGstRegistered,
        gstin: isGstRegistered ? gstin.trim() : undefined,
        legalName: isGstRegistered ? legalName.trim() : undefined,
        invoicePrefix: invoicePrefix.trim(),
        startingInvoiceNo,
        defaultTaxMode,
        defaultPaymentMethods,
      });
    }
  };

  const stepsConfig = [
    { num: 1, label: 'Business Details', icon: Building },
    { num: 2, label: 'GST Details', icon: ShieldCheck },
    { num: 3, label: 'Invoice Settings', icon: FileText },
    { num: 4, label: 'Ready', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-[#F5F6FA] via-[#FFFFFF] to-[#E7F3FB] dark:from-[#12181F] dark:via-[#182026] dark:to-[#1E272E] text-[#2D3436] dark:text-[#F5F6FA] font-sans selection:bg-[#0984E3] selection:text-white">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1E272E] rounded-3xl border border-[#DFE6E9] dark:border-[#2A3642] shadow-2xl p-6 sm:p-10 space-y-6">
        {/* Top Header & Brand */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0984E3]/10 text-[#0984E3] dark:text-[#00CEC9] text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" /> First-Time Business Setup
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2D3436] dark:text-white">
            Welcome to VYAPRIX, {user.name}!
          </h1>
          <p className="text-xs sm:text-sm text-[#636E72] dark:text-[#B2BEC3]">
            Let's configure your store settings in 4 simple steps.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="py-2">
          <div className="grid grid-cols-4 items-center relative">
            {/* Background line */}
            <div className="absolute left-[12.5%] right-[12.5%] top-1/2 -translate-y-1/2 h-1 bg-[#DFE6E9] dark:bg-[#2A3642] -z-0" />
            {/* Active animated line */}
            <div
              className="absolute left-[12.5%] top-1/2 -translate-y-1/2 h-1 bg-[#0984E3] transition-all duration-300 -z-0"
              style={{
                width: step === 1 ? '0%' : step === 2 ? '33.33%' : step === 3 ? '66.66%' : '100%',
              }}
            />

            {stepsConfig.map((s) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              const Icon = s.icon;
              return (
                <div key={s.num} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#00B894] text-white'
                        : isCurrent
                        ? 'bg-[#0984E3] text-white ring-4 ring-[#0984E3]/20 shadow-md'
                        : 'bg-[#F5F6FA] dark:bg-[#2A3642] text-[#636E72] border border-[#DFE6E9] dark:border-[#2A3642]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold mt-1.5 text-center ${
                      isCurrent
                        ? 'text-[#0984E3] dark:text-[#00CEC9]'
                        : isCompleted
                        ? 'text-[#00B894]'
                        : 'text-[#636E72]'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* STEP 1: BUSINESS DETAILS                                            */}
        {/* =================================================================== */}
        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Balaji Enterprises"
                  className="w-full h-10 px-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                >
                  <option value="Retail">Retail Store / Kirana</option>
                  <option value="Wholesale">Wholesale & Distribution</option>
                  <option value="Retail & Wholesale">Retail & Wholesale</option>
                  <option value="Pharmacy">Pharmacy / Medical</option>
                  <option value="Electronics">Electronics & Hardware</option>
                  <option value="Apparel">Textiles & Garments</option>
                  <option value="Services">Services & Repairs</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                  Owner / Proprietor Name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                Shop / Office Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop No., Street, Landmark"
                className="w-full h-10 px-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                  State
                </label>
                <select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                  PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-mono rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                />
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 2: GST DETAILS                                                 */}
        {/* =================================================================== */}
        {step === 2 && (
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                Is your business GST registered?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsGstRegistered(true)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    isGstRegistered
                      ? 'border-[#0984E3] bg-[#0984E3]/10 ring-2 ring-[#0984E3]/20'
                      : 'border-[#DFE6E9] dark:border-[#2A3642] hover:bg-[#F5F6FA] dark:hover:bg-[#182026]'
                  }`}
                >
                  <p className="text-sm font-bold text-[#2D3436] dark:text-white">Yes, GST Registered</p>
                  <p className="text-[11px] text-[#636E72] dark:text-[#B2BEC3] mt-0.5">
                    Generate B2B/B2C GST tax invoices with HSN & ITC reports.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsGstRegistered(false);
                    setGstin('');
                  }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    !isGstRegistered
                      ? 'border-[#0984E3] bg-[#0984E3]/10 ring-2 ring-[#0984E3]/20'
                      : 'border-[#DFE6E9] dark:border-[#2A3642] hover:bg-[#F5F6FA] dark:hover:bg-[#182026]'
                  }`}
                >
                  <p className="text-sm font-bold text-[#2D3436] dark:text-white">No / Composition</p>
                  <p className="text-[11px] text-[#636E72] dark:text-[#B2BEC3] mt-0.5">
                    Bill of Supply / regular retail receipts without GST breakdown.
                  </p>
                </button>
              </div>
            </div>

            {isGstRegistered && (
              <div className="space-y-3.5 p-4 rounded-2xl bg-[#F5F6FA] dark:bg-[#182026] border border-[#DFE6E9] dark:border-[#2A3642] animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                    15-Digit GSTIN Number *
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 27AABCU9603R1ZM"
                    className="w-full h-10 px-3 text-sm font-mono tracking-wider uppercase rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#1E272E] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                    Legal Business Name (as on GST Certificate)
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Legal trade name"
                    className="w-full h-10 px-3 text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#1E272E] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: INVOICE SETTINGS                                            */}
        {/* =================================================================== */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. VY-2026-"
                  className="w-full h-10 px-3 text-sm font-mono rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                  Starting Invoice Number
                </label>
                <input
                  type="number"
                  value={startingInvoiceNo}
                  onChange={(e) => setStartingInvoiceNo(Number(e.target.value) || 1)}
                  className="w-full h-10 px-3 text-sm font-mono rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white outline-none focus:border-[#0984E3]"
                />
              </div>
            </div>

            {/* Preview of Generated Invoice Number */}
            <div className="p-3.5 rounded-xl bg-[#0984E3]/10 border border-[#0984E3]/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#636E72] dark:text-[#B2BEC3]">First Invoice Number Preview:</span>
              <span className="font-mono font-bold text-[#0984E3] dark:text-[#00CEC9]">
                {invoicePrefix}{String(startingInvoiceNo).padStart(4, '0')}
              </span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2D3436] dark:text-[#F5F6FA]">
                Default Tax Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDefaultTaxMode('inclusive')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    defaultTaxMode === 'inclusive'
                      ? 'border-[#0984E3] bg-[#0984E3]/10 font-bold text-[#0984E3]'
                      : 'border-[#DFE6E9] dark:border-[#2A3642] text-[#636E72]'
                  }`}
                >
                  <p className="text-xs">MRP / Tax Inclusive</p>
                  <p className="text-[10px] opacity-75">Price includes GST</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultTaxMode('exclusive')}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    defaultTaxMode === 'exclusive'
                      ? 'border-[#0984E3] bg-[#0984E3]/10 font-bold text-[#0984E3]'
                      : 'border-[#DFE6E9] dark:border-[#2A3642] text-[#636E72]'
                  }`}
                >
                  <p className="text-xs">Tax Exclusive</p>
                  <p className="text-[10px] opacity-75">Tax added at checkout</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 4: BUSINESS READY                                              */}
        {/* =================================================================== */}
        {step === 4 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#00B894]/15 text-[#00B894] flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#2D3436] dark:text-white">
                You're all set!
              </h2>
              <p className="text-xs sm:text-sm text-[#636E72] dark:text-[#B2BEC3] max-w-md mx-auto">
                Your VYAPRIX business workspace for{' '}
                <span className="font-bold text-[#2D3436] dark:text-white">{businessName}</span> is
                configured and ready for fast GST billing, inventory, and Khata.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F6FA] dark:bg-[#182026] border border-[#DFE6E9] dark:border-[#2A3642] max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#636E72]">Store:</span>
                <span className="font-bold">{businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#636E72]">Location:</span>
                <span className="font-bold">{city}, {INDIAN_STATES.find(s => s.code === stateCode)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#636E72]">GST Status:</span>
                <span className="font-bold text-[#0984E3]">{isGstRegistered ? gstin : 'Regular/Unregistered'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#636E72]">First Bill:</span>
                <span className="font-mono font-bold">{invoicePrefix}{String(startingInvoiceNo).padStart(4, '0')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-[#DFE6E9] dark:border-[#2A3642] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] text-xs font-bold text-[#636E72] hover:text-[#2D3436] dark:hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0984E3] hover:bg-[#0770C2] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
          >
            <span>{step === 4 ? 'Go to Dashboard' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
