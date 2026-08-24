'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="p-1.5 rounded-lg text-slate-400"><Sun className="w-3.5 h-3.5" /></div>
        <div className="p-1.5 rounded-lg text-slate-400"><Moon className="w-3.5 h-3.5" /></div>
        <div className="p-1.5 rounded-lg text-slate-400"><Monitor className="w-3.5 h-3.5" /></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs shadow-inner">
      {/* Light Button */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${
          theme === 'light'
            ? 'bg-white text-amber-600 shadow-md ring-1 ring-amber-400/40'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        title="Light Mode"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[10px]">Light</span>
      </button>

      {/* Dark Button */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${
          theme === 'dark'
            ? 'bg-slate-900 text-teal-400 shadow-md ring-1 ring-teal-500/40'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[10px]">Dark</span>
      </button>

      {/* System Button */}
      <button
        type="button"
        onClick={() => setTheme('system')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all ${
          theme === 'system'
            ? 'bg-teal-600 text-white shadow-md'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        title="System Preference Mode"
      >
        <Monitor className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[10px]">System</span>
      </button>
    </div>
  );
}
