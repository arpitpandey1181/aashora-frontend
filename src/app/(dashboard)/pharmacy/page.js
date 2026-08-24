'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Plus, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const initialStock = [
  { drugId: 'DRUG-101', name: 'Paracetamol 500mg', category: 'Analgesics', batchNo: 'B-8820', stockQty: 450, unitPrice: 2.5, expiryDate: '2027-12-31', status: 'In Stock' },
  { drugId: 'DRUG-102', name: 'Amoxicillin 500mg', category: 'Antibiotics', batchNo: 'B-7719', stockQty: 18, unitPrice: 12.0, expiryDate: '2026-11-30', status: 'Low Stock' },
  { drugId: 'DRUG-103', name: 'Pantoprazole 40mg', category: 'Gastroenterology', batchNo: 'B-9912', stockQty: 280, unitPrice: 8.5, expiryDate: '2028-06-30', status: 'In Stock' },
  { drugId: 'DRUG-104', name: 'Azithromycin 500mg', category: 'Antibiotics', batchNo: 'B-4401', stockQty: 5, unitPrice: 22.0, expiryDate: '2026-09-15', status: 'Low Stock' },
];

export default function PharmacyPage() {
  const [stock, setStock] = useState(initialStock);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStock = stock.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = stock.filter((i) => i.status === 'Low Stock').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Pill className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Pharmacy & Medical Stock Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Drug Batches, Expiry Alerts & Stock Reorder Levels
          </p>
        </div>
        <Button size="sm" onClick={() => toast.success('New Batch Added to Pharmacy Inventory')} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Drug Stock Batch
        </Button>
      </div>

      {/* Low Stock Warning Alert Bar */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-between text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Attention: {lowStockCount} medicines are below reorder threshold levels!</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.info('Reorder PO created')}>
            Create PO Purchase Order
          </Button>
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base">Medicine Inventory Master ({stock.length})</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Drug Name, Batch or Category..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Drug ID</th>
                  <th className="px-6 py-3">Medicine Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Batch #</th>
                  <th className="px-6 py-3">Available Quantity</th>
                  <th className="px-6 py-3">Unit Price</th>
                  <th className="px-6 py-3">Expiry Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStock.map((med) => (
                  <tr key={med.drugId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-teal-600 dark:text-teal-400 text-xs">
                      {med.drugId}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {med.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                      {med.category}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {med.batchNo}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                      {med.stockQty} Units
                    </td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200 text-xs">
                      {formatCurrency(med.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {med.expiryDate}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={med.status === 'Low Stock' ? 'warning' : 'success'}>
                        {med.status}
                      </Badge>
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
