'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('softycare_user');
      const token = localStorage.getItem('softycare_token');

      if (!user || !token || token.trim() === '') {
        setIsAuthorized(false);
        router.replace('/login');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Verifying session &amp; authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased selection:bg-teal-500 selection:text-white">
      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Navigation */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto w-full px-2 sm:px-6 lg:px-8 py-3 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-[1920px] mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
