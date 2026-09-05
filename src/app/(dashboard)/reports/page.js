'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calendar, Wallet, CreditCard, DollarSign, Filter, TrendingUp, User, ArrowUpRight, Download } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';

export default function ReportsAnalyticsDashboardPage() {
  const { payments } = useClinicStore();
  const [mounted, setMounted] = useState(false);
  const [timeFilter, setTimeFilter] = useState('1 Week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const allPayments = payments || [];

  // Filter Payments based on selected Time Range
  const getFilteredPayments = () => {
    if (!mounted) return allPayments;
    const now = new Date();

    if (timeFilter === 'Custom Date Range') {
      if (!startDate || !endDate) return allPayments;
      return allPayments.filter((p) => {
        const pDate = new Date(p.date);
        return pDate >= new Date(startDate) && pDate <= new Date(endDate);
      });
    }

    let days = 7;
    if (timeFilter === '1 Week') days = 7;
    if (timeFilter === '2 Weeks') days = 14;
    if (timeFilter === '3 Weeks') days = 21;
    if (timeFilter === '1 Month') days = 30;
    if (timeFilter === '1 Year') days = 365;

    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);

    return allPayments.filter((p) => new Date(p.date) >= cutoff);
  };

  const filteredPayments = getFilteredPayments();

  // Financial Metrics Calculation
  const totalRevenue = filteredPayments.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
  const cashCollection = filteredPayments.filter((p) => p.paymentMode === 'Cash').reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
  const upiCollection = filteredPayments.filter((p) => p.paymentMode === 'UPI').reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
  const cardCollection = filteredPayments.filter((p) => p.paymentMode === 'Card').reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
  const netBankingCollection = filteredPayments.filter((p) => p.paymentMode === 'Net Banking').reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);

  // Group Collections by Date for Visual Chart
  const dailyTrends = {};
  filteredPayments.forEach((p) => {
    const d = p.date || 'Today';
    dailyTrends[d] = (dailyTrends[d] || 0) + (parseFloat(p.paidAmount) || 0);
  });
  const chartDays = Object.keys(dailyTrends);
  const maxDayAmount = Math.max(...Object.values(dailyTrends), 1000);

  return (
    <div className="space-y-6">
      {/* Top Header & Time Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
            Reports
          </h1>
        </div>

        {/* Time Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          {['1 Week', '2 Weeks', '3 Weeks', '1 Month', '1 Year', 'Custom Date Range'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeFilter(tf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeFilter === tf
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker inputs if selected */}
      {timeFilter === 'Custom Date Range' && (
        <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-center gap-3 max-w-md">
          <div className="space-y-0.5 flex-1">
            <label className="text-[10px] font-bold text-teal-800 dark:text-teal-200 uppercase">From Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-8 px-2 rounded-lg border border-teal-300 text-xs font-bold" />
          </div>
          <div className="space-y-0.5 flex-1">
            <label className="text-[10px] font-bold text-teal-800 dark:text-teal-200 uppercase">To Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-8 px-2 rounded-lg border border-teal-300 text-xs font-bold" />
          </div>
        </div>
      )}

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="p-4 border-l-4 border-l-teal-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Total Collection</span>
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700"><DollarSign className="w-4 h-4" /></div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-mono" suppressHydrationWarning>₹{totalRevenue.toLocaleString('en-IN')}</h2>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Live Collection ({timeFilter})</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Cash Collection</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700"><Wallet className="w-4 h-4" /></div>
          </div>
          <h2 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono" suppressHydrationWarning>₹{cashCollection.toLocaleString('en-IN')}</h2>
          <span className="text-[10px] text-slate-500 font-bold">Physical Counter Cash</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">UPI / QR Code</span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700"><CreditCard className="w-4 h-4" /></div>
          </div>
          <h2 className="text-2xl font-black text-purple-700 dark:text-purple-400 font-mono" suppressHydrationWarning>₹{upiCollection.toLocaleString('en-IN')}</h2>
          <span className="text-[10px] text-slate-500 font-bold">Digital Wallet / QR</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-sky-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Card & NetBanking</span>
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700"><CreditCard className="w-4 h-4" /></div>
          </div>
          <h2 className="text-2xl font-black text-sky-700 dark:text-sky-400 font-mono" suppressHydrationWarning>₹{(cardCollection + netBankingCollection).toLocaleString('en-IN')}</h2>
          <span className="text-[10px] text-slate-500 font-bold">POS Terminal & Online</span>
        </Card>

      </div>

      {/* Visual Collection Graph & Method Split Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Bar Chart */}
        <Card className="lg:col-span-8 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" /> Daily Revenue Collection Visual Graph ({timeFilter})
            </h3>
          </div>

          <div className="h-64 flex items-end justify-around gap-2 pt-6 px-2 border-b border-slate-200 dark:border-slate-800">
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
                    className="w-full max-w-[48px] bg-gradient-to-t from-teal-600 to-emerald-400 rounded-t-xl transition-all shadow-md group-hover:brightness-110"
                  />
                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[50px]">{day}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Method-wise Split Breakdown */}
        <Card className="lg:col-span-4 p-5 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2">
            Payment Method Split Summary
          </h3>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Cash Payment</span>
                <span className="font-mono text-emerald-600">₹{cashCollection}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div style={{ width: `${totalRevenue ? (cashCollection / totalRevenue) * 100 : 0}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">UPI / QR Code</span>
                <span className="font-mono text-purple-600">₹{upiCollection}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div style={{ width: `${totalRevenue ? (upiCollection / totalRevenue) * 100 : 0}%` }} className="h-full bg-purple-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Card Payment</span>
                <span className="font-mono text-sky-600">₹{cardCollection}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div style={{ width: `${totalRevenue ? (cardCollection / totalRevenue) * 100 : 0}%` }} className="h-full bg-sky-500 rounded-full" />
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* Patient-Wise Ledger Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle className="text-base">Patient-Wise Collection Ledger ({mounted ? filteredPayments.length : 0})</CardTitle>
            <p className="text-xs text-slate-500">Per-day patient receipts with payment mode breakdown</p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Receipt No</th>
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Payment Date</th>
                  <th className="px-6 py-3">Payment Mode</th>
                  <th className="px-6 py-3 text-right">Total (₹)</th>
                  <th className="px-6 py-3 text-right">Paid (₹)</th>
                  <th className="px-6 py-3 text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mounted && filteredPayments.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-teal-600 text-xs" suppressHydrationWarning>
                      {p.receiptNo}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100" suppressHydrationWarning>
                      {p.fullname} (PT-{p.gsspatid})
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono" suppressHydrationWarning>
                      {p.date}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200" suppressHydrationWarning>
                        {p.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold" suppressHydrationWarning>
                      ₹{p.totalAmount}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-extrabold text-emerald-600" suppressHydrationWarning>
                      ₹{p.paidAmount}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-rose-600" suppressHydrationWarning>
                      ₹{p.balanceAmount || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
