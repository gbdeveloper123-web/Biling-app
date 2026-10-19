import React, { useState } from 'react';
import { Check, ArrowRight, Building, Sparkles, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { INDIAN_STATES } from '../utils/formatters';
import { BusinessType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { business, updateBusiness, addProduct } = useShop();

  const [step, setStep] = useState(1);
  const [bizName, setBizName] = useState(business.name);
  const [bizTagline, setBizTagline] = useState(business.tagline);
  const [bizType, setBizType] = useState<BusinessType>(business.businessType);
  const [isGstRegistered, setIsGstRegistered] = useState(!!business.gstin);
  const [gstin, setGstin] = useState(business.gstin || '');
  const [stateCode, setStateCode] = useState(business.stateCode || '27');
  const [city, setCity] = useState(business.city || 'Mumbai');
  const [upiId, setUpiId] = useState(business.upiId || '');
  const [invoicePrefix, setInvoicePrefix] = useState(business.invoiceSettings.invoicePrefix || 'INV-');

  // Sample first product
  const [firstProdName, setFirstProdName] = useState('Classic Cotton Polo Shirt');
  const [firstProdPrice, setFirstProdPrice] = useState(599);
  const [firstProdStock, setFirstProdStock] = useState(25);

  if (!isOpen) return null;

  const handleFinish = () => {
    // Determine state name
    const stateObj = INDIAN_STATES.find((s) => s.code === stateCode);

    updateBusiness({
      name: bizName,
      tagline: bizTagline,
      businessType: bizType,
      gstin: isGstRegistered ? gstin : undefined,
      state: stateObj?.name || 'Maharashtra',
      stateCode: stateCode,
      city: city,
      upiId: upiId,
      invoiceSettings: {
        ...business.invoiceSettings,
        invoicePrefix: invoicePrefix,
      },
    });

    if (firstProdName) {
      addProduct({
        name: firstProdName,
        sku: 'POLO-001',
        barcode: '890123456999',
        category: 'Clothing',
        unit: 'PCS',
        purchasePrice: Math.round(firstProdPrice * 0.5),
        sellingPrice: firstProdPrice,
        mrp: Math.round(firstProdPrice * 1.3),
        stock: firstProdStock,
        openingStock: firstProdStock,
        minStockLevel: 5,
        gstRate: 5,
        hsnCode: '6105',
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80'],
        status: 'in_stock',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-modal-pop">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div
            className="bg-indigo-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Step {step} of 4 • Business Setup
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {step === 1 && 'Welcome! Tell us about your business'}
              {step === 2 && 'GST & Location Details'}
              {step === 3 && 'Invoicing & UPI Payment'}
              {step === 4 && 'Add your first product catalog'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Contents */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Retail & Electronics"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electronics, Fashion & General Store"
                  value={bizTagline}
                  onChange={(e) => setBizTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Category
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {(['retailer', 'wholesaler', 'service', 'distributor'] as BusinessType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBizType(type)}
                      className={`p-2.5 rounded-xl border text-left font-medium capitalize transition ${
                        bizType === type
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Are you GST Registered?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGstRegistered(true)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      isGstRegistered
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Yes, GST Registered
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGstRegistered(false)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      !isGstRegistered
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    No, Unregistered / Composition
                  </button>
                </div>
              </div>

              {isGstRegistered && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN Number (15 digits) *
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="27AABCA1234D1Z2"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs uppercase font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business State *
                  </label>
                  <select
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  UPI ID for Instant QR Billing
                </label>
                <input
                  type="text"
                  placeholder="e.g. apexretail@okaxis or 9820123456@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Your bills will print with a dynamic UPI QR code for direct customer payments!
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Number Prefix
                </label>
                <input
                  type="text"
                  placeholder="INV-"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You can add your first product now to start billing immediately:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={firstProdName}
                  onChange={(e) => setFirstProdName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={firstProdPrice}
                    onChange={(e) => setFirstProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Opening Stock (Units)
                  </label>
                  <input
                    type="number"
                    value={firstProdStock}
                    onChange={(e) => setFirstProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 rounded-lg"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
            >
              <Check className="w-4 h-4" /> Your Business is Ready!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
