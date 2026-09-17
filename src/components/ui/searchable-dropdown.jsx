import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, X, Search } from 'lucide-react';

export const SearchableDropdown = React.forwardRef(({
  className,
  containerClassName,
  width = 'w-full', // 'w-full', 'w-64', 'w-48', 'w-32', '250px'
  label,
  options = [], // ['Delhi', 'Mumbai'] or [{ value: '1', label: 'Male', subtext: '...' }]
  placeholder = 'Search & select option...',
  error,
  required = false,
  value = '',
  onChange,
  onSelectOption,
  disabled = false,
  maxHeight = 'max-h-52',
  allowCustomInput = true,
  emptyText = 'No matching options found',
  style,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter options dynamically based on input typing
  const filteredOptions = (options || []).filter((opt) => {
    if (!value || !value.toString().trim()) return true;
    const searchText = value.toString().toLowerCase();
    if (typeof opt === 'object' && opt !== null) {
      const text = (opt.label || opt.name || opt.text || opt.value || '').toString().toLowerCase();
      const sub = (opt.subtext || opt.desc || opt.code || opt.regId || opt.mobile || '').toString().toLowerCase();
      return text.includes(searchText) || sub.includes(searchText);
    }
    return String(opt).toLowerCase().includes(searchText);
  });

  const handleSelect = (opt) => {
    const val = typeof opt === 'object' && opt !== null ? (opt.label || opt.name || opt.value) : opt;
    if (onChange) onChange({ target: { value: val } });
    if (onSelectOption) onSelectOption(opt);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (onChange) onChange(e);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (isOpen && filteredOptions.length > 0) {
        e.preventDefault();
        const selected = filteredOptions[highlightedIndex] || filteredOptions[0];
        handleSelect(selected);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

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
        </label>
      )}

      <div className="relative w-full">
        <input
          ref={ref || inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={!allowCustomInput}
          className={cn(
            'flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3 pr-8 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors font-medium',
            error && 'border-rose-500 focus:ring-rose-500 text-rose-900 dark:text-rose-200',
            className
          )}
          {...props}
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onChange) onChange({ target: { value: '' } });
                setIsOpen(true);
              }}
              className="pointer-events-auto text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} />
        </div>
      </div>

      {/* Floating Dynamic Dropdown Menu */}
      {isOpen && (
        <div className={cn('absolute left-0 top-full mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-y-auto p-1 space-y-1', maxHeight)}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isObj = typeof opt === 'object' && opt !== null;
              const text = isObj ? (opt.label || opt.name || opt.value) : opt;
              const subtext = isObj ? (opt.subtext || opt.desc || opt.code || opt.regId || opt.mobile) : null;

              return (
                <div
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    'px-3 py-2 text-xs cursor-pointer rounded-lg transition-colors flex items-center justify-between',
                    idx === highlightedIndex
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium'
                  )}
                >
                  <span className="truncate">{text}</span>
                  {subtext && (
                    <span className={cn('text-[10px] ml-2 font-mono truncate', idx === highlightedIndex ? 'text-emerald-100' : 'text-slate-400')}>
                      {subtext}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 text-center font-medium italic">
              {emptyText}
            </div>
          )}
        </div>
      )}

      {error && (
        <span className="text-xs font-medium text-rose-500 dark:text-rose-400 flex items-center gap-1 animate-pulse">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
});

SearchableDropdown.displayName = 'SearchableDropdown';
export const Autocomplete = SearchableDropdown;
