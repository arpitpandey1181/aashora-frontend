import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { sanitizeInput, validateName, validateMobile, validateNumber, validateEmail, validateRequired } from '@/lib/validation';

// Helper to generate dynamic duration dropdown suggestions based on numeric typing
export function getDynamicDurationOptions(inputVal) {
  if (!inputVal || !inputVal.toString().trim()) return [];
  const str = inputVal.toString().trim();
  const match = str.match(/^(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    const dayUnit = num === 1 ? 'Day' : 'Days';
    const weekUnit = num === 1 ? 'Week' : 'Weeks';
    const monthUnit = num === 1 ? 'Month' : 'Months';
    const yearUnit = num === 1 ? 'Year' : 'Years';

    return [
      `${num} ${dayUnit}`,
      `${num} ${weekUnit}`,
      `${num} ${monthUnit}`,
      `${num} ${yearUnit}`,
      'Continue',
    ];
  }
  return [];
}

// Helper to format raw numeric duration into full string (e.g. 1 -> 1 Day, 3 -> 3 Days)
export function formatRawDuration(inputVal) {
  if (!inputVal || !inputVal.toString().trim()) return '';
  const str = inputVal.toString().trim();
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10);
    return `${num} ${num === 1 ? 'Day' : 'Days'}`;
  }
  return str;
}

// Helper to generate dynamic Age unit dropdown suggestions based on numeric typing
export function getDynamicAgeOptions(inputVal) {
  if (!inputVal || !inputVal.toString().trim()) return [];
  const str = inputVal.toString().trim();
  const match = str.match(/^(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    const yearUnit = num === 1 ? 'Year' : 'Years';
    const monthUnit = num === 1 ? 'Month' : 'Months';
    const dayUnit = num === 1 ? 'Day' : 'Days';

    return [
      `${num} ${yearUnit}`,
      `${num} ${monthUnit}`,
      `${num} ${dayUnit}`,
    ];
  }
  return [];
}

// Helper to format raw numeric Age into full string (e.g. 25 -> 25 Years)
export function formatRawAge(inputVal) {
  if (!inputVal || !inputVal.toString().trim()) return '';
  const str = inputVal.toString().trim();
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10);
    return `${num} ${num === 1 ? 'Year' : 'Years'}`;
  }
  return str;
}

export const Textbox = React.forwardRef(({
  className,
  containerClassName,
  width = 'w-full', // Custom width prop: 'w-full', 'w-64', 'w-48', 'w-32', '250px'
  type = 'text',
  validationType, // 'name' | 'mobile' | 'number' | 'email' | 'duration' | 'age' | 'text'
  label,
  error: externalError,
  required = false,
  onChange,
  onBlur,
  value,
  placeholder,
  disabled,
  style,
  ...props
}, ref) => {
  const [internalError, setInternalError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);

  // Determine effective validation type based on prop or HTML type or label text
  const effectiveType = validationType || (
    type === 'tel' || label?.toLowerCase().includes('mobile') || label?.toLowerCase().includes('phone') ? 'mobile' :
    label?.toLowerCase().includes('name') && !label?.toLowerCase().includes('username') ? 'name' :
    label?.toLowerCase().includes('age') ? 'age' :
    label?.toLowerCase().includes('duration') ? 'duration' :
    type === 'number' || label?.toLowerCase().includes('fee') || label?.toLowerCase().includes('amount') ? 'number' :
    type === 'email' ? 'email' : 'text'
  );

  // Close dropdown on click outside & format duration/age if raw numeric
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        if ((effectiveType === 'duration' || effectiveType === 'age') && value) {
          const formatted = effectiveType === 'age' ? formatRawAge(value) : formatRawDuration(value);
          if (formatted !== value && onChange) {
            const event = { target: { value: formatted } };
            onChange(event);
          }
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [effectiveType, value, onChange]);

  const handleChange = (e) => {
    let val = e.target.value;

    // Auto-sanitize inputs real-time according to validation type
    if (effectiveType === 'name' || effectiveType === 'mobile' || effectiveType === 'number') {
      val = sanitizeInput(val, effectiveType);
      e.target.value = val;
    }

    if (effectiveType === 'duration' || effectiveType === 'age') {
      setShowDropdown(true);
      setHighlightedIndex(0);
    }

    if (internalError) setInternalError('');
    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    let val = e.target.value;

    // Auto format duration or age on blur if raw numeric value
    if ((effectiveType === 'duration' || effectiveType === 'age') && val) {
      const formatted = effectiveType === 'age' ? formatRawAge(val) : formatRawDuration(val);
      if (formatted !== val) {
        val = formatted;
        e.target.value = val;
        if (onChange) onChange(e);
      }
    }

    let res = { isValid: true, error: '' };

    if (required && (!val || !val.trim())) {
      res = validateRequired(val, label || 'Field');
    } else if (val) {
      if (effectiveType === 'name') res = validateName(val, required);
      else if (effectiveType === 'mobile') res = validateMobile(val, required);
      else if (effectiveType === 'number') res = validateNumber(val, required);
      else if (effectiveType === 'email') res = validateEmail(val, required);
    }

    setInternalError(res.isValid ? '' : res.error);
    if (onBlur) onBlur(e);
  };

  const options = effectiveType === 'age'
    ? getDynamicAgeOptions(value)
    : effectiveType === 'duration'
    ? getDynamicDurationOptions(value)
    : [];

  const handleKeyDown = (e) => {
    if (effectiveType === 'duration' || effectiveType === 'age') {
      if (options.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          const fallback = effectiveType === 'age' ? formatRawAge(value) : formatRawDuration(value);
          const selected = options[highlightedIndex] || options[0] || fallback;
          if (onChange) onChange({ target: { value: selected } });
          setShowDropdown(false);
        } else if (e.key === 'Escape') {
          setShowDropdown(false);
        }
      }
    }
    if (props.onKeyDown) props.onKeyDown(e);
  };

  const displayError = externalError || internalError;
  const isTailwindWidth = typeof width === 'string' && (width.startsWith('w-') || width.startsWith('max-w-') || width.startsWith('min-w-'));
  const customStyle = !isTailwindWidth && width ? { width, ...style } : style;
  const widthClass = isTailwindWidth ? width : '';

  return (
    <div ref={containerRef} className={cn('flex flex-col gap-1.5 relative', widthClass || 'w-full', containerClassName)} style={customStyle}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </span>
          {effectiveType === 'name' && <span className="text-[10px] text-slate-400 lowercase font-normal">(letters only)</span>}
          {effectiveType === 'mobile' && <span className="text-[10px] text-slate-400 lowercase font-normal">(10 digits)</span>}
          {effectiveType === 'number' && <span className="text-[10px] text-slate-400 lowercase font-normal">(numbers only)</span>}
        </label>
      )}

      <input
        ref={ref}
        type={type === 'mobile' ? 'tel' : type === 'number' ? 'text' : type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => { if (effectiveType === 'duration' || effectiveType === 'age') setShowDropdown(true); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || (
          effectiveType === 'name' ? 'e.g. John Doe' :
          effectiveType === 'mobile' ? 'e.g. 9876543210' :
          effectiveType === 'number' ? '0' :
          effectiveType === 'age' ? 'e.g. 25 Years, 6 Months...' :
          effectiveType === 'duration' ? 'e.g. 3 Days, 1 Week...' : ''
        )}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          displayError && 'border-rose-500 focus:ring-rose-500 text-rose-900 dark:text-rose-200',
          className
        )}
        {...props}
      />

      {/* Dynamic Suggestions Dropdown (Duration or Age) */}
      {showDropdown && options.length > 0 && (
        <div className="absolute left-0 top-full mt-1 w-full max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-1">
          {options.map((opt, idx) => (
            <div
              key={opt}
              onMouseDown={(e) => {
                e.preventDefault();
                if (onChange) onChange({ target: { value: opt } });
                setShowDropdown(false);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={cn(
                'px-2.5 py-1.5 text-xs cursor-pointer font-semibold rounded-lg transition-colors',
                idx === highlightedIndex
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
              )}
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      {displayError && (
        <span className="text-xs font-medium text-rose-500 dark:text-rose-400 flex items-center gap-1 animate-pulse">
          ⚠️ {displayError}
        </span>
      )}
    </div>
  );
});

Textbox.displayName = 'Textbox';
export const ValidatedInput = Textbox;
