import React, { useState } from 'react';
import { Calendar, ChevronDown, Check, X, ArrowRight } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export type DateFilterOption =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export interface DateRangeState {
  option: DateFilterOption;
  fromDate: string;
  toDate: string;
  isCustomActive: boolean;
}

export const INITIAL_DATE_RANGE: DateRangeState = {
  option: 'today',
  fromDate: '',
  toDate: '',
  isCustomActive: false,
};

// Standard date matching utility across all VYAPRIX modules
export function matchesDateRange(dateStr: string, filter: DateRangeState): boolean {
  if (!dateStr) return true;
  if (filter.option === 'all' && !filter.isCustomActive) return true;

  const itemDate = new Date(dateStr);
  if (isNaN(itemDate.getTime())) return true;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (filter.option === 'today') {
    return itemDate >= todayStart && itemDate <= todayEnd;
  }

  if (filter.option === 'yesterday') {
    const yStart = new Date(todayStart);
    yStart.setDate(yStart.getDate() - 1);
    const yEnd = new Date(todayEnd);
    yEnd.setDate(yEnd.getDate() - 1);
    return itemDate >= yStart && itemDate <= yEnd;
  }

  if (filter.option === 'this_week') {
    const day = todayStart.getDay(); // 0 is Sun
    const diff = todayStart.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const weekStart = new Date(todayStart);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return itemDate >= weekStart && itemDate <= todayEnd;
  }

  if (filter.option === 'this_month') {
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return itemDate >= mStart && itemDate <= todayEnd;
  }

  if (filter.option === 'last_month') {
    const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return itemDate >= lmStart && itemDate <= lmEnd;
  }

  if (filter.option === 'this_year') {
    const yStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    return itemDate >= yStart && itemDate <= todayEnd;
  }

  if (filter.option === 'custom' || filter.isCustomActive) {
    if (filter.fromDate && filter.toDate) {
      const from = new Date(filter.fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(filter.toDate);
      to.setHours(23, 59, 59, 999);
      return itemDate >= from && itemDate <= to;
    } else if (filter.fromDate) {
      const target = new Date(filter.fromDate);
      const start = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0, 0);
      const end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    } else if (filter.toDate) {
      const to = new Date(filter.toDate);
      to.setHours(23, 59, 59, 999);
      return itemDate <= to;
    }
  }

  return true;
}

interface DateRangeFilterProps {
  value: DateRangeState;
  onChange: (val: DateRangeState) => void;
  className?: string;
  showAllOption?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  className = '',
  showAllOption = false,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('single');
  const [singleDate, setSingleDate] = useState(() => value.fromDate || new Date().toISOString().split('T')[0]);
  const [rangeFrom, setRangeFrom] = useState(() => value.fromDate || new Date().toISOString().split('T')[0]);
  const [rangeTo, setRangeTo] = useState(() => value.toDate || new Date().toISOString().split('T')[0]);

  // The 4 concise tabs requested: Today, Week, Month, Selective Date
  const primaryTabs: { id: DateFilterOption; label: string }[] = [
    ...(showAllOption ? [{ id: 'all' as DateFilterOption, label: 'All' }] : []),
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'Week' },
    { id: 'this_month', label: 'Month' },
  ];

  const isCustomActive = value.option === 'custom' || value.isCustomActive;

  const handleSelectTab = (opt: DateFilterOption) => {
    setIsCustomOpen(false);
    onChange({
      option: opt,
      fromDate: '',
      toDate: '',
      isCustomActive: false,
    });
  };

  const handleApplySingleDate = () => {
    if (!singleDate) return;
    onChange({
      option: 'custom',
      fromDate: singleDate,
      toDate: singleDate,
      isCustomActive: true,
    });
    setIsCustomOpen(false);
  };

  const handleApplyRange = () => {
    if (!rangeFrom && !rangeTo) return;
    onChange({
      option: 'custom',
      fromDate: rangeFrom,
      toDate: rangeTo || rangeFrom,
      isCustomActive: true,
    });
    setIsCustomOpen(false);
  };

  const handleClearCustom = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      option: 'today',
      fromDate: '',
      toDate: '',
      isCustomActive: false,
    });
  };

  // Format custom date badge label
  const customLabel = React.useMemo(() => {
    if (!value.fromDate) return 'Selective Date';
    if (value.fromDate === value.toDate || !value.toDate) {
      try {
        const d = new Date(value.fromDate);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } catch {
        return value.fromDate;
      }
    }
    try {
      const d1 = new Date(value.fromDate);
      const d2 = new Date(value.toDate);
      const f1 = d1.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const f2 = d2.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return `${f1} - ${f2}`;
    } catch {
      return `${value.fromDate} - ${value.toDate}`;
    }
  }, [value.fromDate, value.toDate]);

  return (
    <div className={`relative flex items-center gap-1.5 ${className}`}>
      {/* Short, compact segmented controller */}
      <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#182026] border border-slate-200 dark:border-[#2A3642] text-xs font-semibold shadow-2xs">
        {primaryTabs.map((tab) => {
          const isSelected = value.option === tab.id && !isCustomActive;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                isSelected
                  ? 'bg-[#0984E3] text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#202B33]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}

        {/* 4th Tab: Selective Date Button */}
        <button
          type="button"
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
            isCustomActive
              ? 'bg-[#00B894] text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#202B33]'
          }`}
          title="Filter by specific date or date range"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{isCustomActive ? customLabel : 'Selective Date'}</span>
          {isCustomActive ? (
            <span
              onClick={handleClearCustom}
              className="p-0.5 hover:bg-black/20 rounded-full cursor-pointer ml-0.5 transition"
              title="Reset to Today"
            >
              <X className="w-3 h-3" />
            </span>
          ) : (
            <ChevronDown className="w-3 h-3 opacity-70" />
          )}
        </button>
      </div>

      {/* Popover / Modal for Selective Date Picker */}
      {isCustomOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs"
            onClick={() => setIsCustomOpen(false)}
          />
          <div className="fixed sm:absolute top-1/2 sm:top-full left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 -translate-y-1/2 sm:translate-y-2 z-50 w-[92vw] max-w-xs sm:w-80 bg-white dark:bg-[#1E272E] border border-slate-200 dark:border-[#2A3642] rounded-2xl shadow-2xl p-4 space-y-3.5 text-xs text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold flex items-center gap-1.5 text-sm text-slate-900 dark:text-white">
                <Calendar className="w-4 h-4 text-[#0984E3] dark:text-[#00CEC9]" />
                Selective Date Filter
              </span>
              <button
                type="button"
                onClick={() => setIsCustomOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switch: Single Date vs Date Range */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#12181F] border border-slate-200 dark:border-slate-800 text-center font-semibold text-xs">
              <button
                type="button"
                onClick={() => setSelectionMode('single')}
                className={`py-1.5 rounded-lg transition cursor-pointer ${
                  selectionMode === 'single'
                    ? 'bg-white dark:bg-[#1E272E] text-[#0984E3] dark:text-[#00CEC9] shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Single Day
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode('range')}
                className={`py-1.5 rounded-lg transition cursor-pointer ${
                  selectionMode === 'range'
                    ? 'bg-white dark:bg-[#1E272E] text-[#0984E3] dark:text-[#00CEC9] shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Date Range
              </button>
            </div>

            {/* Inputs based on Mode */}
            {selectionMode === 'single' ? (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Select Specific Date
                </label>
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-[#2A3642] rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#0984E3]"
                />
                <p className="text-[10px] text-slate-400">
                  Filters invoices, sales, and profits for this specific day only.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-[#2A3642] rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#0984E3]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={rangeTo}
                    min={rangeFrom}
                    onChange={(e) => setRangeTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#12181F] border border-slate-200 dark:border-[#2A3642] rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#0984E3]"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onChange({
                    option: 'today',
                    fromDate: '',
                    toDate: '',
                    isCustomActive: false,
                  });
                  setIsCustomOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Reset to Today
              </button>
              <button
                type="button"
                onClick={selectionMode === 'single' ? handleApplySingleDate : handleApplyRange}
                className="px-4 py-1.5 rounded-xl bg-[#0984E3] hover:bg-[#0770C2] text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Filter</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
