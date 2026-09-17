'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export const AgeInput = React.forwardRef(({
  value = '',
  dob = '',
  onChange,
  onAgeSelect,
  onDobChange,
  placeholder = 'e.g. 24',
  className,
  containerClassName,
  required = false,
  disabled = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [displayValue, setDisplayValue] = useState(value || '');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync internal display value when prop value changes
  useEffect(() => {
    setDisplayValue(value || '');
  }, [value]);

  // Sync Age display from DOB when dob prop changes externally
  useEffect(() => {
    if (!dob) return;
    const birth = new Date(dob);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (isNaN(birth.getTime()) || birth > today) return;

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    let calculatedAge = '';
    let calculatedUnit = 'Years';
    if (years > 0) {
      calculatedAge = years.toString();
      calculatedUnit = 'Years';
    } else if (months > 0) {
      calculatedAge = months.toString();
      calculatedUnit = 'Months';
    } else {
      calculatedAge = days.toString();
      calculatedUnit = 'Days';
    }

    setDisplayValue(`${calculatedAge} ${calculatedUnit}`);
    setIsOpen(false);
  }, [dob]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Extract pure digits from input
  const numMatch = (displayValue || '').toString().trim().match(/\d+/);
  const numericAge = numMatch ? parseInt(numMatch[0], 10) : 0;

  // 3 Dynamic Unit Options (Width matches input 100%)
  const unitOptions = numericAge > 0 ? [
    { label: `${numericAge} Years`, unit: 'Years', short: 'Yrs', color: 'text-teal-600 dark:text-teal-400' },
    { label: `${numericAge} Months`, unit: 'Months', short: 'Mths', color: 'text-purple-600 dark:text-purple-400' },
    { label: `${numericAge} Days`, unit: 'Days', short: 'Days', color: 'text-rose-600 dark:text-rose-400' },
  ] : [];

  // Helper to select an option and calculate DOB
  const handleSelectOption = (opt) => {
    if (!numericAge || numericAge <= 0) {
      setIsOpen(false);
      return;
    }

    const ageStr = numericAge.toString();
    const formattedDisplay = `${numericAge} ${opt.unit}`;
    setDisplayValue(formattedDisplay);

    const today = new Date();
    let birthDate = new Date(today);
    if (opt.unit === 'Years') {
      birthDate.setFullYear(today.getFullYear() - numericAge);
    } else if (opt.unit === 'Months') {
      birthDate.setMonth(today.getMonth() - numericAge);
    } else if (opt.unit === 'Days') {
      birthDate.setDate(today.getDate() - numericAge);
    }

    const birthYear = birthDate.getFullYear();
    const monthStr = String(birthDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(birthDate.getDate()).padStart(2, '0');
    const computedDob = `${birthYear}-${monthStr}-${dayStr}`;

    setIsOpen(false);

    if (onChange) onChange({ target: { value: formattedDisplay } });
    if (onDobChange) onDobChange(computedDob);
    if (onAgeSelect) {
      onAgeSelect({
        age: ageStr,
        unit: opt.unit,
        display: formattedDisplay,
        dob: computedDob,
      });
    }
  };

  // Keyboard Navigation Handler (Up, Down, Enter, Escape)
  const handleKeyDown = (e) => {
    if (!isOpen || unitOptions.length === 0) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && numericAge > 0) {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % unitOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + unitOptions.length) % unitOptions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (unitOptions[highlightedIndex]) {
        handleSelectOption(unitOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setDisplayValue(val);
    if (onChange) onChange(e);

    const match = val.trim().match(/\d+/);
    if (match && parseInt(match[0], 10) > 0) {
      setIsOpen(true);
      setHighlightedIndex(0);

      // Auto-compute default Years DOB while typing
      const num = parseInt(match[0], 10);
      const today = new Date();
      let birthDate = new Date(today);
      birthDate.setFullYear(today.getFullYear() - num);
      const birthYear = birthDate.getFullYear();
      const monthStr = String(birthDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(birthDate.getDate()).padStart(2, '0');
      const computedDob = `${birthYear}-${monthStr}-${dayStr}`;
      if (onDobChange) onDobChange(computedDob);
    } else {
      setIsOpen(false);
      if (onDobChange) onDobChange('');
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', containerClassName)}>
      <input
        ref={ref || inputRef}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (numericAge > 0) setIsOpen(true);
        }}
        onClick={() => {
          if (numericAge > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        required={required}
        className={cn(
          'h-9 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-1.5 font-bold text-slate-900 dark:text-slate-100 text-center transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800',
          className
        )}
        {...props}
      />

      {/* Dynamic Dropdown matching EXACT Input Width (w-full) */}
      {isOpen && unitOptions.length > 0 && (
        <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-slate-900 border border-teal-500/80 dark:border-teal-600 rounded-xl shadow-2xl z-50 p-1 space-y-0.5 animate-in zoom-in-95 overflow-hidden">
          {unitOptions.map((opt, idx) => (
            <div
              key={opt.unit}
              onClick={() => handleSelectOption(opt)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={cn(
                'px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-between transition-colors',
                idx === highlightedIndex
                  ? 'bg-teal-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-900 dark:text-slate-100 hover:bg-teal-50 dark:hover:bg-teal-950/70'
              )}
            >
              <span className="truncate">{opt.label}</span>
              <span className={cn('text-[10px] font-black shrink-0 ml-1', idx === highlightedIndex ? 'text-teal-100' : opt.color)}>
                {opt.short}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

AgeInput.displayName = 'AgeInput';
