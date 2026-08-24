'use client';

import { PrintableLayout } from '@/components/common/printable-layout';
import { formatCurrency } from '@/lib/utils';

export default function PrintReceiptPage({ params }) {
  const invoiceId = params.invoiceId || 'INV-2026-001';

  return (
    <PrintableLayout
      docTitle="CASH RECEIPT"
      icon={<Receipt className="w-5 h-5 text-emerald-600" />}
    >
      <div className="space-y-4 text-xs">
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <p className="font-bold text-slate-900">Rajesh Kumar</p>
            <p className="text-slate-500 font-mono">Reg ID: PT-1001</p>
          </div>
          <div className="text-right font-mono">
            <p className="font-bold text-teal-700">Inv #: {invoiceId}</p>
            <p className="text-slate-500">12/08/2026</p>
          </div>
        </div>

        <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100 uppercase font-bold text-slate-700 text-[11px]">
            <tr>
              <th className="p-3">Service Description</th>
              <th className="p-3 text-right">Department</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            <tr>
              <td className="p-3 font-semibold text-slate-800">Specialist Consultation Fee</td>
              <td className="p-3 text-right text-slate-600">Cardiology Dept</td>
              <td className="p-3 text-right font-bold">{formatCurrency(500)}</td>
            </tr>
            <tr>
              <td className="p-3">2</td>
              <td className="p-3 font-semibold text-slate-800">ECG Diagnostic Test Charge</td>
              <td className="p-3 text-right text-slate-600">Diagnostics</td>
              <td className="p-3 text-right font-bold">{formatCurrency(300)}</td>
            </tr>
          </tbody>
        </table>

        {/* Calculation Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-2 text-xs border border-slate-200 p-4 rounded-xl bg-slate-50">
            <div className="flex justify-between text-slate-600">
              <span>Gross Amount:</span>
              <span className="font-bold">{formatCurrency(800)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discount Allowed:</span>
              <span className="font-bold text-rose-600">-{formatCurrency(50)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-teal-800 border-t border-slate-300 pt-2">
              <span>Net Payable:</span>
              <span>{formatCurrency(750)}</span>
            </div>
            <div className="text-[10px] text-slate-500 text-right pt-1">
              Payment Mode: <strong>CASH (Paid)</strong>
            </div>
          </div>
        </div>
      </div>
    </PrintableLayout>
  );
}
