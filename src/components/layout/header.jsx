'use client';

import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Bell, User, Menu } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';

export function Header({ onMenuClick }) {
  const { currentUser } = useClinicStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const doctorName = currentUser?.doctorName || 'Dr. Arpit Pandey';
  const role = currentUser?.role || 'Consultant Physician';

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile Hamburger Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Theme Toggle + Notifications + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <ThemeToggle />

        <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 relative shrink-0">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 font-semibold text-xs shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden md:block">
            {mounted ? (
              <>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none">
                  {doctorName.toUpperCase()}
                </p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {role}
                </span>
              </>
            ) : (
              <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
