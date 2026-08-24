'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AashoraLogo } from '@/components/common/logo';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  FileText,
  CreditCard,
  Pill,
  Wallet,
  BarChart3,
  Settings,
  Activity,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const navigationGroups = [
  {
    title: 'CLINIC CORE',
    items: [
      { name: 'Clinic Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Front Desk Inbox', href: '/frontdesk', icon: Users },
      { name: 'Vitals Taken Inbox', href: '/vitals-inbox', icon: Activity },
      { name: 'Patient Registration', href: '/patients', icon: UserPlus },
      { name: 'Book Appointment Slot', href: '/appointments/book', icon: Calendar },
      { name: 'E-Prescriptions (Rx)', href: '/prescriptions', icon: FileText },
      { name: 'Follow-Up Patients', href: '/followups', icon: Calendar },
      { name: 'Billing Dashboard', href: '/billing', icon: CreditCard },
    ],
  },
  {
    title: 'DIAGNOSTICS & PHARMACY',
    items: [
      { name: 'Pharmacy Stock', href: '/pharmacy', icon: Pill },
      { name: 'Patient Ledger', href: '/ledger', icon: Wallet },
    ],
  },
  {
    title: 'CLINIC ADMIN',
    items: [
      { name: 'Clinic Reports', href: '/reports', icon: BarChart3 },
      { name: 'Clinic Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function SidebarContent({ onClose }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col justify-between h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div>
        {/* Official Aashora Brand Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" onClick={onClose} className="py-2">
            <AashoraLogo size="lg" />
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Grouped Navigation Links */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {group.title}
              </span>
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-bold shadow-sm border border-teal-200/60 dark:border-teal-900/60'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Branding Info */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-teal-50/50 dark:bg-slate-800/40 border border-teal-100/50 dark:border-slate-700/50">
          <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
            AASHORA Clinic Management
          </p>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            .NET REST API Live Connected
          </span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl lg:hidden"
          >
            <SidebarContent onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
