'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AashoraLogo } from '@/components/common/logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import {
  Lock,
  User,
  Building2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  X,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useClinicStore } from '@/store/clinic-store';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useClinicStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('DEMO AASHORA QA');
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error('Please accept Terms & Conditions before logging in');
      return;
    }
    setLoading(true);

    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const logintime = `${dd}/${mm}/${yyyy}`;

      const params = new URLSearchParams({
        loginid: username,
        pwd: password,
        userloginempid: username,
        logintime: logintime,
        UserName: username,
        Password: password,
        Logintime: logintime,
      });

      const jsonOrgParam = JSON.stringify({
        loginid: username,
        pwd: password,
      });

      const loginBaseUrl = process.env.NEXT_PUBLIC_LOGIN_BASE_URL || 'http://localhost:48570/frmUserLog';
      const doctorApiUrl = process.env.NEXT_PUBLIC_DOCTOR_API_URL || 'http://localhost:48570/DoctorAPI';

      let response;
      try {
        response = await fetch(`${loginBaseUrl}/GetUserLogin?${params}`);
        if (!response.ok) {
          response = await fetch(`${doctorApiUrl}/GetUserLogin?JsonOrg=${encodeURIComponent(jsonOrgParam)}`);
        }
      } catch {
        response = await fetch(`${doctorApiUrl}/GetUserLogin?JsonOrg=${encodeURIComponent(jsonOrgParam)}`);
      }

      const rawText = await response.text();
      setLoading(false);
      console.log('[LOGIN API RAW RESPONSE]:', rawText);

      let cleanText = rawText ? rawText.trim() : '';
      if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
        try {
          cleanText = JSON.parse(cleanText);
        } catch { }
      }

      if (cleanText === 'Invalid User ID or PWD' || cleanText === 'Not Registered' || cleanText === '-1') {
        const errorMsg = cleanText === '-1' ? 'Access not allowed for this IP/Device' : cleanText;
        toast.error(`Login Failed: ${errorMsg}`);
        return;
      }

      let data;
      try {
        data = typeof cleanText === 'string' ? JSON.parse(cleanText) : cleanText;
      } catch {
        data = cleanText;
      }

      const loginUserObj = data?.Table?.[0] || data?.Table1?.[0] || (Array.isArray(data) ? data[0] : null);

      if (loginUserObj || (typeof data === 'object' && data && !data.error)) {
        const activeLocation = loginUserObj?.locationname || loginUserObj?.locationName || 'DEMO SOFTY CARE QA';
        const activeEmpName = loginUserObj?.empname || loginUserObj?.empName || username;

        setLocation(activeLocation);
        toast.success(`Welcome back ${activeEmpName}! Logged in successfully.`);

        const sessionUser = {
          ...loginUserObj,
          username: username,
          empname: activeEmpName,
          locationname: activeLocation,
          loginTime: Date.now(),
        };

        localStorage.setItem('softycare_user', JSON.stringify(sessionUser));
        localStorage.setItem('softycare_token', 'session_active_' + Date.now());
        router.push('/frontdesk');
      } else {
        toast.error('Login Failed: Invalid Username or Password!');
      }
    } catch (err) {
      setLoading(false);
      console.error('[LOGIN API ERROR]:', err);
      toast.error('Unable to connect to backend server. Please check Visual Studio on port 48570.');
    }
  };

  const [mobileTab, setMobileTab] = useState('login'); // 'login' | 'features'

  return (
    <div className="min-h-screen lg:h-screen w-full bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-2.5 sm:p-4 lg:p-6 relative overflow-y-auto lg:overflow-hidden">
      {/* Background Soft Light-Green Glow Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse" />

      {/* Main 2-Column Split Portal Container */}
      <div className="w-full max-w-5xl my-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-emerald-200/80 dark:border-teal-900/40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl z-10 overflow-hidden lg:max-h-[92vh]">
        
        {/* Left Column: AASHORA Showcase (Visible on Desktop lg:flex, or on mobile when features tab active) */}
        <div className={`p-5 sm:p-7 lg:p-8 bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-sky-50/80 dark:from-teal-950/50 dark:via-slate-900 dark:to-sky-950/40 flex-col justify-between border-b lg:border-b-0 lg:border-r border-teal-100 dark:border-slate-800 relative ${mobileTab === 'features' ? 'flex col-span-1' : 'hidden lg:flex lg:col-span-6'}`}>
          <div className="space-y-3 sm:space-y-5 z-10">
            
            {/* Header Logo */}
            <div className="flex items-center justify-between">
              <AashoraLogo size="lg" className="max-w-[85%] sm:max-w-full" />
            </div>

            <div className="space-y-2 pt-0.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] sm:text-xs font-black">
                <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Next-Gen Healthcare Management OS</span>
              </div>
              
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Smart Clinic & Operations
              </h1>

              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                Streamlined Patient Registrations, Doctor Queue, E-Prescriptions, Billing Receipts, and Lab Reports.
              </p>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-left">
                {[
                  { title: 'Queue Counter System', desc: 'Real-time patient flow & doctor schedules' },
                  { title: 'Dynamic E-Prescription', desc: 'Translate advice & custom templates' },
                  { title: 'Integrated Counter Billing', desc: 'Net / due payment tracking & receipts' },
                  { title: 'Vitals Assessment Inbox', desc: 'Seamless routing from front desk' },
                ].map((f) => (
                  <div key={f.title} className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                      {f.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Mobile Back to Login Button */}
              <div className="pt-2 lg:hidden">
                <Button
                  onClick={() => setMobileTab('login')}
                  className="w-full h-9 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl"
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5" /> Back to Portal Login
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Login Portal Form */}
        <div className={`p-4 sm:p-6 lg:p-8 flex-col justify-between bg-white dark:bg-slate-900/95 w-full ${mobileTab === 'login' ? 'flex col-span-1 lg:col-span-6' : 'hidden lg:flex lg:col-span-6'}`}>
          
          {/* Mobile Header + 2-Tab Switcher & Theme Selector */}
          <div className="w-full pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-2 sm:mb-3">
            <div className="flex items-center justify-between">
              <div className="lg:hidden">
                <AashoraLogo size="md" />
              </div>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile 2-Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mt-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileTab('login')}
                className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition-all ${
                  mobileTab === 'login'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                🔑 Portal Login
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('features')}
                className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg transition-all ${
                  mobileTab === 'features'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                🌟 Clinic Features
              </button>
            </div>
          </div>

          <div className="space-y-3 max-w-md mx-auto w-full my-auto">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Portal Login</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-2.5 sm:space-y-3">
              {/* Username Field */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Username / Staff ID *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Username"
                    className="w-full h-9 sm:h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Password *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full h-9 sm:h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Clinic Location & Financial Year Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Location Branch *</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-9 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="DEMO AASHORA QA">DEMO AASHORA QA</option>
                    <option value="MAIN CLINIC BRANCH">MAIN AASHORA CENTER #1</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Financial Year *</label>
                  <select
                    value={financialYear}
                    onChange={(e) => setFinancialYear(e.target.value)}
                    className="w-full h-9 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="2026-2027">2026 - 2027</option>
                    <option value="2025-2026">2025 - 2026</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes: Remember Me & Terms Modal Link */}
              <div className="space-y-2 pt-0.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-[11px]">Remember Session</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); toast.info('Contact system administrator for password reset'); }} className="text-teal-600 dark:text-teal-400 hover:underline text-[11px] font-semibold">
                    Forgot Password?
                  </a>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    id="termsChk"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor="termsChk" className="text-slate-700 dark:text-slate-300 cursor-pointer text-[11px]">
                    I agree to{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-teal-600 dark:text-teal-400 font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      Terms & Conditions
                    </button>
                  </label>
                </div>
              </div>

              {/* Login Action CTA Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 sm:h-10 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-500/20 rounded-xl mt-1.5"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </Button>
            </form>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2">
            AASHORA Clinic OS System &copy; 2026
          </div>
        </div>
      </div>

      {/* Interactive Terms & Conditions Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-teal-200 dark:border-teal-500/30 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  AASHORA Clinic Terms & Conditions
                </h3>
                <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 max-h-60 overflow-y-auto pr-2">
                <p><strong>1. Patient Data Confidentiality:</strong> All clinical records and prescriptions are protected under healthcare privacy standards.</p>
                <p><strong>2. Authorized Credentials:</strong> Only credentialed clinic staff, doctors, and nurses may access patient records.</p>
                <p><strong>3. Clinical Decision Support:</strong> AI recommendations serve as decision assistance under the supervising doctor's control.</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={() => setShowTermsModal(false)} className="text-xs">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setTermsAccepted(true);
                    setShowTermsModal(false);
                    toast.success('Terms & Conditions Accepted');
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                >
                  <Check className="w-4 h-4 mr-1" /> Agree & Accept
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
