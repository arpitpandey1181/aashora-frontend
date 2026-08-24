'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Search, CheckCircle } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';

export default function LedgerPage() {
  const { payments } = useClinicStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ledgerList = payments || [];

  const filtered = ledgerList.filter(
    (item) =>
      (item.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.gsspatid || '').toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.receiptNo || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCredit = ledgerList.reduce((acc, curr) => acc + (parseFloat(curr.paidAmount) || 0), 0);
  const totalBalance = ledgerList.reduce((acc, curr) => acc + (parseFloat(curr.balanceAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Dynamic Patient Financial Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Patient Advances, Receipts, and Outstanding Balance Records
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Received Payments</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1" suppressHydrationWarning>
            {formatCurrency(totalCredit)}
          </h2>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Pending Dues</p>
          <h2 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1" suppressHydrationWarning>
            {formatCurrency(totalBalance)}
          </h2>
        </Card>

        <Card className="p-5 border-l-4 border-l-teal-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Ledger Accounts</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1" suppressHydrationWarning>
            {mounted ? ledgerList.length : 0} Active Records
          </h2>
        </Card>
      </div>

      {/* Main Ledger Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base">
            Financial Transactions Ledger (<span suppressHydrationWarning>{mounted ? filtered.length : 0}</span>)
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Patient Name or Receipt No..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Receipt / Entry ID</th>
                  <th className="px-6 py-3">Patient Name & UHID</th>
                  <th className="px-6 py-3">Payment Mode</th>
                  <th className="px-6 py-3">Total Paid</th>
                  <th className="px-6 py-3">Outstanding Balance</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mounted && filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-teal-600 dark:text-teal-400 text-xs" suppressHydrationWarning>
                      {item.receiptNo}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100" suppressHydrationWarning>{item.fullname}</div>
                      <div className="text-[10px] text-slate-400 font-mono" suppressHydrationWarning>PT-{item.gsspatid}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400" suppressHydrationWarning>
                      {item.paymentMode}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400" suppressHydrationWarning>
                      {formatCurrency(item.paidAmount)}
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-600 dark:text-amber-400" suppressHydrationWarning>
                      {formatCurrency(item.balanceAmount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.balanceAmount > 0 ? 'warning' : 'success'} suppressHydrationWarning>
                        {item.balanceAmount > 0 ? 'Due Pending' : 'Completed'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono" suppressHydrationWarning>
                      {item.date}
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
