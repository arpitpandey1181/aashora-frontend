'use client';

import React, { useState, useEffect } from 'react';
import { AashoraLogo } from '@/components/common/logo';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Languages, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LANGUAGES } from '@/lib/rx-translations';
import { toast } from 'sonner';

export function PrintableLayout({
  docTitle = 'DOCTOR E-PRESCRIPTION (Rx)',
  docNumber = 'RX-8801',
  docDate = '12/08/2026',
  patientInfo = {
    fullname: 'Rajesh Kumar',
    uhid: 'PT-1001',
    ageGender: '42 Yrs / Male',
    mobile: '+91 9876543210',
    doctor: 'Dr. Alex Morgan (M.D. Cardiology)',
  },
  selectedLang = 'English',
  onLangChange,
  children,
}) {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState(selectedLang);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setCurrentLang(newLang);
    if (onLangChange) onLangChange(newLang);
  };

  // Smart Back Handler
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1 && document.referrer) {
        router.back();
      } else {
        window.location.href = '/patients';
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Send Report / Receipt via WhatsApp
  const handleSendWhatsApp = () => {
    const mobile = patientInfo.mobile || patientInfo.whatsappno || '9876543210';
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const printUrl = typeof window !== 'undefined' ? window.location.href : '';
    const msg = `Hello ${patientInfo.fullname || 'Patient'}, your official ${docTitle} (${docNumber}) from AASHORA Clinic is ready! View & Print: ${printUrl}`;

    window.open(`https://api.whatsapp.com/send?phone=91${cleanMobile}&text=${encodeURIComponent(msg)}`, '_blank');
    toast.success(`WhatsApp receipt link sent to +91 ${cleanMobile}!`);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-3 sm:p-6 font-sans print:bg-white print:p-0 print:m-0">
      
      {/* 1 SINGLE CLEAN HORIZONTAL LINE ACTION BAR */}
      <div className="max-w-4xl mx-auto mb-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 print:hidden bg-white dark:bg-slate-900 p-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
        
        {/* Working Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="h-8 text-xs font-bold rounded-xl shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1 text-teal-600 dark:text-teal-400 shrink-0" /> Back
        </Button>

        {/* Choose Other Language Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-teal-50 dark:bg-teal-950/60 px-2.5 sm:px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-900 shrink-0">
          <Languages className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="text-[11px] sm:text-xs font-extrabold text-teal-900 dark:text-teal-200 whitespace-nowrap">Choose language:</span>
          <select
            value={currentLang}
            onChange={handleLanguageChange}
            className="h-7 rounded-lg border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900 px-1.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 cursor-pointer max-w-[120px] sm:max-w-none"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls (WhatsApp + Print Page A4) */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSendWhatsApp}
            className="h-8 text-xs font-bold rounded-xl border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> Send via WhatsApp
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" /> Print Page (A4)
          </Button>
        </div>
      </div>

      {/* Single-Page A4 Sheet */}
      <div className="a4-sheet w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 shadow-2xl p-4 sm:p-8 border border-slate-200 flex flex-col justify-between overflow-x-auto print:shadow-none print:border-none print:p-6 print:m-0 print:w-[210mm] print:h-[297mm]">
        
        {/* 15% HEADER SECTION */}
        <div className="header-15 text-xs border-b-2 border-teal-600 pb-4 mb-4 flex items-center justify-between gap-4 h-[15%]">
          <div className="flex items-center gap-3">
            <AashoraLogo size="lg" />
            <div>
              <p className="text-[10px] text-slate-500 font-mono pt-1">Reg # CLINIC/2026/8810 | Phone: +91 9876543210</p>
            </div>
          </div>
          <div className="text-right text-xs space-y-1">
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-900 font-black rounded-lg uppercase tracking-wider text-[11px]" suppressHydrationWarning>
              {docTitle}
            </span>
            <p className="font-mono text-slate-700 font-extrabold pt-1 text-xs" suppressHydrationWarning>Doc #: {docNumber}</p>
            <p className="text-slate-500 font-mono text-[11px]" suppressHydrationWarning>
              Date: {docDate}
            </p>
          </div>
        </div>

        {/* 75% DETAILS BODY SECTION */}
        <div className="body-75 flex-1 space-y-4 h-[75%] overflow-hidden">
          {/* Patient Info Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient Name</span>
              <strong className="text-slate-900" suppressHydrationWarning>{patientInfo.fullname}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">UHID / Patient ID</span>
              <strong className="text-teal-700 font-mono" suppressHydrationWarning>{patientInfo.uhid}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Age / Gender</span>
              <strong className="text-slate-900" suppressHydrationWarning>{patientInfo.ageGender}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Doctor Name</span>
              <strong className="text-slate-900" suppressHydrationWarning>{patientInfo.doctor}</strong>
            </div>
          </div>

          {/* Dynamic Content Slot */}
          <div className="space-y-4 text-xs">
            {typeof children === 'function' ? children(currentLang) : children}
          </div>
        </div>

        {/* 10% FOOTER SECTION */}
        <div className="footer-10 border-t border-slate-200 pt-4 mt-4 text-xs h-[10%] flex flex-col justify-end">
          <div className="flex items-end justify-between">
            <div className="space-y-1 max-w-sm">
              <p className="font-bold text-slate-700 uppercase text-[11px]">Terms & Instructions:</p>
              <p className="text-[10px] text-slate-500 leading-tight">
                1. Receipt / Prescription valid for official record.<br />
                2. Non-refundable registration fee.
              </p>
            </div>
            <div className="text-center space-y-1">
              <div className="h-10 border-b border-slate-300 w-36 flex items-end justify-center pb-1">
                <span className="text-[9px] text-slate-400 italic">Authorized Signature Stamp</span>
              </div>
              <p className="font-bold text-slate-800 text-xs" suppressHydrationWarning>{patientInfo.doctor}</p>
              <p className="text-[9px] text-slate-400">Authorized Signatory</p>
            </div>
          </div>

          <div className="mt-3 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-1" suppressHydrationWarning>
            Powered by AASHORA Clinic Management | Printed on {docDate}
          </div>
        </div>

      </div>

      {/* Clean Single-Page Print Media Queries (Guaranteed 1-Page Output for both A4 and Letter sizes) */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0;
          }
          html, body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
          }
          .print\\:hidden, header, nav, button, .toast, [role="status"], [data-sonner-toaster] {
            display: none !important;
          }
          .a4-sheet {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            height: 100vh !important;
            max-height: 100vh !important;
            padding: 6mm 10mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            break-after: avoid !important;
            break-before: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
