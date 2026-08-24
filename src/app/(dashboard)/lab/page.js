'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Plus, Search, Printer, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

const initialLabOrders = [
  { testId: 'LAB-901', patientName: 'Rajesh Kumar', testName: 'Complete Blood Count (CBC)', doctorName: 'Dr. Alex Morgan', status: 'Report Ready', date: '2026-08-10', result: 'Hemoglobin: 14.2 g/dL (Normal)' },
  { testId: 'LAB-902', patientName: 'Priya Verma', testName: 'Lipid Profile (Cholesterol)', doctorName: 'Dr. Patel', status: 'In Testing', date: '2026-08-10', result: 'Pending Lab Review' },
  { testId: 'LAB-903', patientName: 'Sunita Rao', testName: 'Thyroid Profile (T3/T4/TSH)', doctorName: 'Dr. Sharma', status: 'Sample Collected', date: '2026-08-09', result: 'Sample in Processing' },
];

export default function PathologyLabPage() {
  const [orders, setOrders] = useState(initialLabOrders);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(
    (o) =>
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.testId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Pathology & Lab Test Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connected to `HMSBE.Models.Pathology` & Lab Test Masters
          </p>
        </div>
        <Button size="sm" onClick={() => toast.success('New Lab Test Request Created')} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Lab Order
        </Button>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base">Pathology Test Queue ({orders.length})</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Test ID, Patient or Test Name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Test Order ID</th>
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Pathology Test</th>
                  <th className="px-6 py-3">Ref Doctor</th>
                  <th className="px-6 py-3">Lab Status</th>
                  <th className="px-6 py-3">Result Summary</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((ord) => (
                  <tr key={ord.testId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-teal-600 dark:text-teal-400 text-xs">
                      {ord.testId}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {ord.patientName}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {ord.testName}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                      {ord.doctorName}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          ord.status === 'Report Ready'
                            ? 'success'
                            : ord.status === 'In Testing'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs max-w-xs truncate">
                      {ord.result}
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" onClick={() => window.print()}>
                        <Printer className="w-3.5 h-3.5 mr-1 text-teal-600" /> Print Report
                      </Button>
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
