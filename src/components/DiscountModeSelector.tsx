import React from 'react';
import { DiscountMode } from '../types';
import { Percent, IndianRupee } from 'lucide-react';

interface Props {
  mode: DiscountMode;
  onChange: (newMode: DiscountMode) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const DiscountModeSelector: React.FC<Props> = ({
  mode,
  onChange,
  size = 'md',
  disabled = false,
}) => {
  const isFixed = mode === 'fixed';
  const isSm = size === 'sm';

  return (
    <div
      role="group"
      aria-label="Discount Type Selector"
      className={`inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Option A: Fixed ₹ */}
      <button
        type="button"
        onClick={() => onChange('fixed')}
        className={`flex items-center gap-1 font-bold rounded-md transition-all cursor-pointer ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${
          isFixed
            ? 'bg-[#0984E3] text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
        }`}
        title="Apply Fixed Rupee Discount (₹)"
      >
        <IndianRupee className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        <span>Fixed ₹</span>
      </button>

      {/* Option B: Percentage % */}
      <button
        type="button"
        onClick={() => onChange('percentage')}
        className={`flex items-center gap-1 font-bold rounded-md transition-all cursor-pointer ${
          isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${
          !isFixed
            ? 'bg-[#0984E3] text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
        }`}
        title="Apply Percentage Discount (%)"
      >
        <Percent className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        <span>Percentage %</span>
      </button>
    </div>
  );
};
