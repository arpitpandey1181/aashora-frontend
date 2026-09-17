import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { validateRequired } from '@/lib/validation';

export const Dropdown = React.forwardRef(({
  className,
  containerClassName,
  width = 'w-full', // Custom width prop: e.g. 'w-full', 'w-64', 'w-48', 'w-32', '250px'
  label,
  options = [], // [{ value: '1', label: 'Male' }] or string array
  placeholder = 'Select option...',
  error: externalError,
  required = false,
  value,
  onChange,
  onBlur,
  disabled,
  style,
  ...props
}, ref) => {
  const [internalError, setInternalError] = useState('');

  const handleBlur = (e) => {
    const val = e.target.value;
    if (required && (!val || !val.trim())) {
      const res = validateRequired(val, label || 'Selection');
      setInternalError(res.error);
    } else {
      setInternalError('');
    }
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    if (internalError) setInternalError('');
    if (onChange) onChange(e);
  };

  const displayError = externalError || internalError;
  const isTailwindWidth = typeof width === 'string' && (width.startsWith('w-') || width.startsWith('max-w-') || width.startsWith('min-w-'));
  const customStyle = !isTailwindWidth && width ? { width, ...style } : style;
  const widthClass = isTailwindWidth ? width : '';

  return (
    <div className={cn('flex flex-col gap-1.5', widthClass || 'w-full', containerClassName)} style={customStyle}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <select
          ref={ref}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors appearance-none pr-8 cursor-pointer',
            displayError && 'border-rose-500 focus:ring-rose-500 text-rose-900 dark:text-rose-200',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-400">
              {placeholder}
            </option>
          )}

          {options.map((opt, idx) => {
            const isObj = typeof opt === 'object' && opt !== null;
            const val = isObj ? (opt.value ?? opt.id ?? opt.name) : opt;
            const text = isObj ? (opt.label ?? opt.name ?? opt.text) : opt;

            return (
              <option key={idx} value={val} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {text}
              </option>
            );
          })}
        </select>

        {/* Custom Chevron Arrow Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {displayError && (
        <span className="text-xs font-medium text-rose-500 dark:text-rose-400 flex items-center gap-1 animate-pulse">
          ⚠️ {displayError}
        </span>
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';
export const Select = Dropdown;
