'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Calendar,
  Wallet,
  DollarSign,
  TrendingUp,
  Search,
  Printer,
  Plus,
  Filter,
  ArrowUpRight,
  Receipt,
  AlertCircle,
  BarChart3,
  PieChart,
  Layers,
} from 'lucide-react';
import { useClinicStore, DOCTORS_MASTER_LIST } from '@/store/clinic-store';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

// Helper to normalize any date format into standard YYYY-MM-DD
function normalizeDate(dStr) {
  if (!dStr) return '';
  if (dStr.includes('-')) return dStr.split('T')[0];
  if (dStr.includes('/')) {
    const parts = dStr.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return dStr;
}

export default function BillingDashboardPage() {
  const { payments, patients, addPayment } = useClinicStore();
  const [mounted, setMounted] = useState(false);

  const todayYYYYMMDD = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayYYYYMMDD);
  const [timeFilter, setTimeFilter] = useState('All Time'); // Default to All Time so all collections show cleanly
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModeFilter, setSelectedModeFilter] = useState('All');

  // Modal State for "+ Create Custom Billing Receipt"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatId, setSelectedPatId] = useState('');
  const [customPatientName, setCustomPatientName] = useState('');
  const [serviceType, setServiceType] = useState('Consultation & OPD Service');
  const [doctorRef, setDoctorRef] = useState(DOCTORS_MASTER_LIST[0]);
  const [grossAmount, setGrossAmount] = useState(500);
  const [discountAmt, setDiscountAmt] = useState(0);
  const [paidAmt, setPaidAmt] = useState(500);
  const [payMode, setPayMode] = useState('Cash');
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Merge Store Payments + Registered Patient Dues/Payments into single unified collections roster
  const getAllUnifiedPayments = () => {
    const payMap = new Map();

    // 1. Existing receipts in store
    (payments || []).forEach((p) => {
      const key = p.receiptNo || `RCT-${p.gsspatid}-${p.date}`;
      payMap.set(key, {
        receiptNo: p.receiptNo || 'RCT-1000',
        gsspatid: p.gsspatid || 1001,
        regId: p.regId || `REG-${p.gsspatid || 1001}`,
        fullname: p.fullname || 'Walk-in Patient',
        date: p.date || todayYYYYMMDD,
        totalAmount: Number(p.totalAmount) || Number(p.paidAmount) || 0,
        discount: Number(p.discount) || 0,
        paidAmount: Number(p.paidAmount) || 0,
        dueAmount: Number(p.dueAmount) || 0,
        paymentMode: p.paymentMode || 'Cash',
        serviceType: p.serviceType || 'Consultation Fee',
        doctorRef: p.doctorRef || 'Dr. Alex Morgan',
      });
    });

    // 2. Also map registered patients payments if not already in roster
    (patients || []).forEach((pat) => {
      const pKey = `RCT-REG-${pat.gsspatid}`;
      if (!payMap.has(pKey) && pat.paidAmount > 0) {
        payMap.set(pKey, {
          receiptNo: `RCT-${pat.gsspatid + 1000}`,
          gsspatid: pat.gsspatid,
          regId: pat.regId || `REG-${pat.gsspatid}`,
          fullname: `${pat.title || 'Mr.'} ${pat.fullname}`,
          date: pat.registrationdate || todayYYYYMMDD,
          totalAmount: Number(pat.registrationFee) || Number(pat.paidAmount) || 200,
          discount: Number(pat.discount) || 0,
          paidAmount: Number(pat.paidAmount) || 0,
          dueAmount: Number(pat.dueAmount) || 0,
          paymentMode: pat.paymentMode || 'Cash',
          serviceType: `${pat.visitType || 'First Visit'} - Consultation & Reg Fee`,
          doctorRef: pat.doctorRef || 'Dr. Alex Morgan',
        });
      }
    });

    return Array.from(payMap.values());
  };

  const allUnifiedPayments = getAllUnifiedPayments();

  // Filter Payments based on Date Picker / Range Filter
  const getFilteredPayments = () => {
    if (!mounted) return allUnifiedPayments;

    return allUnifiedPayments.filter((p) => {
      const normPDate = normalizeDate(p.date);

      // Mode filter check
      if (selectedModeFilter !== 'All') {
        if (selectedModeFilter === 'UPI' && !(p.paymentMode === 'UPI' || p.paymentMode === 'UPI / QR Code')) return false;
        if (selectedModeFilter === 'Cash' && p.paymentMode !== 'Cash') return false;
        if (selectedModeFilter === 'Card' && !['Card', 'Card / POS', 'Net Banking', 'POS'].includes(p.paymentMode)) return false;
        if (selectedModeFilter === 'Due' && p.dueAmount <= 0) return false;
      }

      if (timeFilter === 'All Time') return true;

      if (timeFilter === 'Today') {
        return normPDate === selectedDate || normPDate === todayYYYYMMDD;
      }

      if (timeFilter === 'Yesterday') {
        const yest = new Date();
        yest.setDate(yest.getDate() - 1);
        const yestStr = yest.toISOString().split('T')[0];
        return normPDate === yestStr;
      }

      const now = new Date();
      let days = 7;
      if (timeFilter === 'Last 7 Days') days = 7;
      if (timeFilter === 'This Month') days = 30;

      const cutoff = new Date();
      cutoff.setDate(now.getDate() - days);
      const cutoffStr = cutoff.toISOString().split('T')[0];

      return normPDate >= cutoffStr;
    });
  };

  const rawFiltered = getFilteredPayments();

  const filteredPayments = rawFiltered.filter(
    (p) =>
      (p.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.receiptNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.regId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.serviceType || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Financial Metrics Calculations
  const totalRevenue = filteredPayments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const cashCollection = filteredPayments.filter((p) => p.paymentMode === 'Cash').reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const upiCollection = filteredPayments.filter((p) => p.paymentMode === 'UPI' || p.paymentMode === 'UPI / QR Code').reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const cardCollection = filteredPayments.filter((p) => ['Card', 'Card / POS', 'Net Banking', 'POS'].includes(p.paymentMode)).reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
  const totalDueOutstanding = filteredPayments.reduce((sum, p) => sum + (Number(p.dueAmount) || 0), 0);

  // Dynamic Visual Bar Chart Data Calculation
  const dailyTrends = {};
  filteredPayments.forEach((p) => {
    const d = normalizeDate(p.date) || 'Today';
    dailyTrends[d] = (dailyTrends[d] || 0) + (Number(p.paidAmount) || 0);
  });
  const chartDays = Object.keys(dailyTrends);
  const maxDayAmount = Math.max(...Object.values(dailyTrends), 500);

  // Handle Create Custom Receipt Submit
  const handleCreateReceipt = (e) => {
    e.preventDefault();

    let patName = customPatientName;
    let patGsspatid = 9999;
    let patRegId = 'REG-WALKIN';

    if (selectedPatId) {
      const pObj = (patients || []).find((p) => p.gsspatid.toString() === selectedPatId.toString());
      if (pObj) {
        patName = `${pObj.title || 'Mr.'} ${pObj.fullname}`;
        patGsspatid = pObj.gsspatid;
        patRegId = pObj.regId || `REG-${pObj.gsspatid}`;
      }
    }

    if (!patName.trim()) {
      toast.error('Please enter patient name or select patient from queue!');
      return;
    }

    const netAmt = Math.max(0, Number(grossAmount) - Number(discountAmt));
    const calculatedDue = Math.max(0, netAmt - Number(paidAmt));

    const newPay = addPayment({
      gsspatid: patGsspatid,
      regId: patRegId,
      fullname: patName,
      date: todayYYYYMMDD,
      totalAmount: Number(grossAmount),
      discount: Number(discountAmt),
      paidAmount: Number(paidAmt),
      dueAmount: calculatedDue,
      paymentMode: payMode,
      serviceType,
      doctorRef,
      paymentNote,
    });

    toast.success(`Billing Receipt ${newPay.receiptNo} created for ${patName} (Amount: ₹${paidAmt})!`);
    setShowCreateModal(false);
    setCustomPatientName('');
    setSelectedPatId('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Billing & Collections Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-Time Revenue Summaries, Cash vs Digital Collections, Visual Graphs & Invoicing
          </p>
        </div>

        {/* Action Controls & Date Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-1.5" /> + New Billing Receipt
          </Button>

          {/* Quick Time Range Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto max-w-full">
            {['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'All Time'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  timeFilter === tf
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Financial Summary Cards (100% Fully Responsive) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Collection */}
        <Card className="p-3.5 border-l-4 border-l-teal-500 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Total Collection</span>
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"><DollarSign className="w-3.5 h-3.5" /></div>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-mono" suppressHydrationWarning>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </h2>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block truncate">
            {timeFilter} Filter Active
          </span>
        </Card>

        {/* Cash Collection */}
        <Card className="p-3.5 border-l-4 border-l-emerald-500 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Cash Collection</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"><Wallet className="w-3.5 h-3.5" /></div>
          </div>
          <h2 className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono" suppressHydrationWarning>
            ₹{cashCollection.toLocaleString('en-IN')}
          </h2>
          <span className="text-[10px] text-slate-400 font-bold block truncate">Counter Cash</span>
        </Card>

        {/* UPI Collection */}
        <Card className="p-3.5 border-l-4 border-l-purple-500 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">UPI / QR Code</span>
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"><CreditCard className="w-3.5 h-3.5" /></div>
          </div>
          <h2 className="text-xl font-black text-purple-700 dark:text-purple-400 font-mono" suppressHydrationWarning>
            ₹{upiCollection.toLocaleString('en-IN')}
          </h2>
          <span className="text-[10px] text-slate-400 font-bold block truncate">GPay / PhonePe / QR</span>
        </Card>

        {/* Card & Netbanking */}
        <Card className="p-3.5 border-l-4 border-l-sky-500 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Card / POS</span>
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"><CreditCard className="w-3.5 h-3.5" /></div>
          </div>
          <h2 className="text-xl font-black text-sky-700 dark:text-sky-400 font-mono" suppressHydrationWarning>
            ₹{cardCollection.toLocaleString('en-IN')}
          </h2>
          <span className="text-[10px] text-slate-400 font-bold block truncate">Card Swipe & POS</span>
        </Card>

        {/* Total Outstanding Dues */}
        <Card className="p-3.5 border-l-4 border-l-amber-500 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Pending Dues</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"><AlertCircle className="w-3.5 h-3.5" /></div>
          </div>
          <h2 className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono" suppressHydrationWarning>
            ₹{totalDueOutstanding.toLocaleString('en-IN')}
          </h2>
          <span className="text-[10px] text-slate-400 font-bold block truncate">Unpaid Patient Dues</span>
        </Card>

        {/* Receipts Count */}
        <Card className="p-3.5 border-l-4 border-l-indigo-500 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Total Receipts</span>
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"><Receipt className="w-3.5 h-3.5" /></div>
          </div>
          <h2 className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-mono" suppressHydrationWarning>
            {filteredPayments.length}
          </h2>
          <span className="text-[10px] text-slate-400 font-bold block truncate">Issued Receipts</span>
        </Card>

      </div>

      {/* Visual Revenue Collection Chart & Method Split Breakdown (100% Dynamic Visual Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynamic Visual Revenue Bar Chart */}
        <Card className="lg:col-span-8 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" /> Dynamic Collection Visual Bar Chart ({timeFilter})
            </h3>
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md border border-teal-200">
              Live Real-Time Collections
            </span>
          </div>

          {chartDays.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs font-bold text-slate-400">
              No collection entries to display in bar chart for this filter.
            </div>
          ) : (
            <div className="h-52 flex items-end justify-around gap-2 pt-6 px-2 border-b border-slate-200 dark:border-slate-800">
              {chartDays.map((day) => {
                const amount = dailyTrends[day];
                const heightPercent = Math.min(100, Math.max(15, (amount / maxDayAmount) * 100));

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{amount}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-teal-600 to-emerald-400 rounded-t-xl transition-all shadow-md group-hover:brightness-110"
                    />
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[45px]">{day}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Dynamic Payment Method Percentage Split */}
        <Card className="lg:col-span-4 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" /> Payment Method Share (%)
            </h3>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Cash Counter
                </span>
                <span className="font-mono text-emerald-600 font-extrabold">
                  ₹{cashCollection} ({totalRevenue ? Math.round((cashCollection / totalRevenue) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div style={{ width: `${totalRevenue ? (cashCollection / totalRevenue) * 100 : 0}%` }} className="h-full bg-emerald-500 rounded-full transition-all" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> UPI / QR Code
                </span>
                <span className="font-mono text-purple-600 font-extrabold">
                  ₹{upiCollection} ({totalRevenue ? Math.round((upiCollection / totalRevenue) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div style={{ width: `${totalRevenue ? (upiCollection / totalRevenue) * 100 : 0}%` }} className="h-full bg-purple-500 rounded-full transition-all" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Card / POS / NetBank
                </span>
                <span className="font-mono text-sky-600 font-extrabold">
                  ₹{cardCollection} ({totalRevenue ? Math.round((cardCollection / totalRevenue) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div style={{ width: `${totalRevenue ? (cardCollection / totalRevenue) * 100 : 0}%` }} className="h-full bg-sky-500 rounded-full transition-all" />
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* Filter & Search Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, Receipt No (RCT-1001), Reg ID (REG-1001), Service..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>

          {/* Payment Mode Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Payment Mode:</span>
            <select
              value={selectedModeFilter}
              onChange={(e) => setSelectedModeFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 font-bold text-slate-900 dark:text-slate-100"
            >
              <option value="All">All Payment Modes</option>
              <option value="Cash">Cash Only</option>
              <option value="UPI">UPI / QR Code Only</option>
              <option value="Card">Card / POS Only</option>
              <option value="Due">Pending Dues Only</option>
            </select>
          </div>

        </div>
      </Card>

      {/* Collection Transactions Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 py-3 px-4">
          <div>
            <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Billing Receipts & Collection History ({mounted ? filteredPayments.length : 0})
            </CardTitle>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Showing collections for: <span className="font-bold text-teal-600">{timeFilter}</span> | Filtered Revenue: <span className="font-mono font-bold text-emerald-600">₹{totalRevenue}</span>
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 uppercase font-extrabold border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Patient Name & ID</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Service Details</th>
                  <th className="px-4 py-3">Doctor Ref</th>
                  <th className="px-4 py-3">Payment Mode</th>
                  <th className="px-4 py-3 text-right">Gross Amount</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-right">Due Dues</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {mounted && filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-500">
                      No billing receipts found for the selected filter/search. Click "+ New Billing Receipt" above to create one!
                    </td>
                  </tr>
                ) : (
                  mounted &&
                  filteredPayments.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-extrabold text-teal-600 dark:text-teal-400" suppressHydrationWarning>
                        {p.receiptNo}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100" suppressHydrationWarning>
                        {p.fullname}
                        <span className="block text-[10px] text-slate-500 font-mono font-medium">{p.regId}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono font-semibold" suppressHydrationWarning>
                        {formatDate(p.date)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300" suppressHydrationWarning>
                        {p.serviceType}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]" suppressHydrationWarning>
                        {p.doctorRef}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            p.paymentMode === 'Cash'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                              : p.paymentMode === 'UPI' || p.paymentMode === 'UPI / QR Code'
                              ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300'
                          }`}
                          suppressHydrationWarning
                        >
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300" suppressHydrationWarning>
                        ₹{p.totalAmount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-600 font-bold" suppressHydrationWarning>
                        ₹{p.discount || 0}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm" suppressHydrationWarning>
                        ₹{p.paidAmount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-extrabold text-rose-600 dark:text-rose-400" suppressHydrationWarning>
                        {p.dueAmount > 0 ? `₹${p.dueAmount}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <a href={`/print/billing/${p.receiptNo}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="h-7 text-[11px] font-bold rounded-xl border-teal-200 text-teal-700 hover:bg-teal-50">
                            <Printer className="w-3.5 h-3.5 mr-1" /> Receipt
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: + Create New Custom Billing Receipt */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-teal-50/50 dark:bg-teal-950/30">
              <h3 className="text-sm font-extrabold uppercase text-teal-900 dark:text-teal-200 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" /> Issue New Billing Receipt
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="p-5 space-y-4">
              
              {/* Select Registered Patient OR Type Walk-In Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Select Registered Patient (Or Leave Blank for Walk-In)
                </label>
                <select
                  value={selectedPatId}
                  onChange={(e) => {
                    setSelectedPatId(e.target.value);
                    if (e.target.value) {
                      const pObj = (patients || []).find((p) => p.gsspatid.toString() === e.target.value.toString());
                      if (pObj) setCustomPatientName(`${pObj.title || 'Mr.'} ${pObj.fullname}`);
                    }
                  }}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Walk-In Patient (Or Select from Patient Directory) --</option>
                  {(patients || []).map((p) => (
                    <option key={p.gsspatid} value={p.gsspatid}>
                      {p.regId || `REG-${p.gsspatid}`} - {p.title} {p.fullname} ({p.mobileno})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedPatId && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Walk-In Patient Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter patient full name..."
                    value={customPatientName}
                    onChange={(e) => setCustomPatientName(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 font-bold text-slate-900 dark:text-slate-100"
                    required={!selectedPatId}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Service / Charge Details
                  </label>
                  <input
                    type="text"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 font-bold text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Attending Doctor
                  </label>
                  <select
                    value={doctorRef}
                    onChange={(e) => setDoctorRef(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2.5 font-bold text-slate-900 dark:text-slate-100"
                  >
                    {DOCTORS_MASTER_LIST.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                    Gross Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={grossAmount}
                    onChange={(e) => {
                      const g = Number(e.target.value);
                      setGrossAmount(g);
                      setPaidAmt(Math.max(0, g - discountAmt));
                    }}
                    className="w-full h-8 rounded-lg border text-xs px-2 font-mono font-bold"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={discountAmt}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setDiscountAmt(d);
                      setPaidAmt(Math.max(0, grossAmount - d));
                    }}
                    className="w-full h-8 rounded-lg border text-xs px-2 font-mono font-bold text-amber-600"
                    min="0"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                    Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paidAmt}
                    onChange={(e) => setPaidAmt(Number(e.target.value))}
                    className="w-full h-8 rounded-lg border text-xs px-2 font-mono font-black text-emerald-600"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Payment Mode *
                </label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 font-bold text-slate-900 dark:text-slate-100"
                >
                  <option value="Cash">Cash Payment</option>
                  <option value="UPI">UPI / GPay / PhonePe / QR Code</option>
                  <option value="Card">POS Card Swipe</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Payment Remarks / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Transaction ID, QR Reference..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full h-8 rounded-xl border border-slate-200 dark:border-slate-700 text-xs px-2.5 font-medium bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="rounded-xl font-bold">
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md px-5">
                  <Receipt className="w-4 h-4 mr-1.5" /> Issue Receipt & Save
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
