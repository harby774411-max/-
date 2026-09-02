import React, { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface BirthdayInputProps {
  value: string; // Stored as 'YYYY-MM-DD' or ''
  onChange: (val: string) => void;
  className?: string;
}

export const BirthdayInput: React.FC<BirthdayInputProps> = ({
  value,
  onChange,
  className
}) => {
  // Parse incoming value 'YYYY-MM-DD' into separate components
  const parseInitial = () => {
    if (!value) return { day: '', month: '', year: '' };
    const parts = value.split('-');
    if (parts.length === 3) {
      return {
        year: parts[0] || '',
        month: parts[1] || '',
        day: parts[2] || ''
      };
    }
    return { day: '', month: '', year: '' };
  };

  const [day, setDay] = useState(parseInitial().day);
  const [month, setMonth] = useState(parseInitial().month);
  const [year, setYear] = useState(parseInitial().year);

  // Sync state when external value changes
  useEffect(() => {
    const parsed = parseInitial();
    setDay(parsed.day);
    setMonth(parsed.month);
    setYear(parsed.year);
  }, [value]);

  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
    // If all are filled and numeric, propagate formatted 'YYYY-MM-DD'
    if (newDay && newMonth && newYear) {
      const padDay = newDay.padStart(2, '0');
      const padMonth = newMonth.padStart(2, '0');
      const validYear = newYear.padStart(4, '2000');
      onChange(`${validYear}-${padMonth}-${padDay}`);
    } else if (!newDay && !newMonth && !newYear) {
      onChange('');
    } else {
      // Partial input: format if possible or keep track
      const d = newDay ? newDay.padStart(2, '0') : '01';
      const m = newMonth ? newMonth.padStart(2, '0') : '01';
      const y = newYear ? (newYear.length === 4 ? newYear : '2000') : '2000';
      if (newDay && newMonth) {
        onChange(`${y}-${m}-${d}`);
      }
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(val, 10);
    if (val === '' || (num >= 1 && num <= 31)) {
      setDay(val);
      updateDate(val, month, year);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(val, 10);
    if (val === '' || (num >= 1 && num <= 12)) {
      setMonth(val);
      updateDate(day, val, year);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(val);
    updateDate(day, month, val);
  };

  const handleClear = () => {
    setDay('');
    setMonth('');
    setYear('');
    onChange('');
  };

  const hasValue = !!(day || month || year);

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      <div className={cn(
        "w-full p-2.5 bg-white rounded-2xl border transition-all flex items-center justify-between gap-2 shadow-xs",
        hasValue ? "border-brand-burgundy/40 bg-[#FAF6F0]/40" : "border-brand-border hover:border-brand-burgundy/40"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-burgundy text-[#FAF6F0] flex items-center justify-center shrink-0 shadow-xs">
            <Calendar className="w-4 h-4 text-brand-gold" />
          </div>
          <span className="text-[11px] font-bold text-brand-burgundy hidden sm:inline">تاريخ الميلاد:</span>
        </div>

        {/* 3 Direct Manual Numeric Inputs: Day / Month / Year (Pure user typing with placeholders) */}
        <div className="flex items-center gap-1.5 flex-1 justify-center dir-ltr" dir="ltr">
          {/* Day */}
          <div className="relative flex-1 max-w-[70px]">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="يوم"
              value={day}
              onChange={handleDayChange}
              className="w-full text-center py-2 px-1 text-xs font-mono font-black text-brand-burgundy placeholder:text-gray-400 placeholder:font-sans placeholder:font-normal bg-white border border-brand-border rounded-xl focus:border-brand-burgundy focus:ring-1 focus:ring-brand-burgundy outline-none"
            />
          </div>

          <span className="text-brand-border font-bold text-sm">/</span>

          {/* Month */}
          <div className="relative flex-1 max-w-[70px]">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="شهر"
              value={month}
              onChange={handleMonthChange}
              className="w-full text-center py-2 px-1 text-xs font-mono font-black text-brand-burgundy placeholder:text-gray-400 placeholder:font-sans placeholder:font-normal bg-white border border-brand-border rounded-xl focus:border-brand-burgundy focus:ring-1 focus:ring-brand-burgundy outline-none"
            />
          </div>

          <span className="text-brand-border font-bold text-sm">/</span>

          {/* Year */}
          <div className="relative flex-1 max-w-[85px]">
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="سنة"
              value={year}
              onChange={handleYearChange}
              className="w-full text-center py-2 px-1 text-xs font-mono font-black text-brand-burgundy placeholder:text-gray-400 placeholder:font-sans placeholder:font-normal bg-white border border-brand-border rounded-xl focus:border-brand-burgundy focus:ring-1 focus:ring-brand-burgundy outline-none"
            />
          </div>
        </div>

        {/* Clear Button */}
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            title="مسح التاريخ"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <p className="text-[10px] text-brand-text-muted text-right pr-1">
        اكتبي تاريخ ميلادكِ بالأرقام (مثال: يوم <span className="font-mono font-bold text-brand-burgundy">15</span> / شهر <span className="font-mono font-bold text-brand-burgundy">08</span> / سنة <span className="font-mono font-bold text-brand-burgundy">1998</span>)
      </p>
    </div>
  );
};
