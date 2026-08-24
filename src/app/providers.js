'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="selection:bg-teal-500 selection:text-white">
        {children}
      </div>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          className: 'font-sans rounded-2xl border border-teal-200 dark:border-slate-800 shadow-xl',
        }}
      />
    </ThemeProvider>
  );
}
