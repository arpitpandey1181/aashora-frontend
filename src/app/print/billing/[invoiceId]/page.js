'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PrintableLayout } from '@/components/common/printable-layout';
import { useClinicStore } from '@/store/clinic-store';

export default function PrintBillingReceiptStandalonePage() {
  const params = useParams();
  const router = useRouter();
  const receiptNo = params?.invoiceId;

  const { payments, patients } = useClinicStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const storedPayment = (payments || []).find((p) => p.receiptNo === receiptNo);
  const storedPat = (patients || []).find((p) => p.regId === receiptNo || `REG-${p.gsspatid}` === receiptNo);

  const paymentData = storedPayment || {
    receiptNo: receiptNo || 'RCT-1001',
    fullname: storedPat ? `${storedPat.title || ''} ${storedPat.fullname || ''}`.trim() : 'Patient Record',
    gsspatid: storedPat?.gsspatid || 1001,
    regId: storedPat?.regId || `REG-${storedPat?.gsspatid || 1001}`,
    mobile: storedPat?.mobileno || '',
    age: storedPat?.age || 30,
    gender: storedPat?.gender || 'Male',
    date: storedPat?.registrationdate || new Date().toISOString().split('T')[0],
    totalAmount: storedPat?.registrationFee !== undefined ? storedPat.registrationFee : 0,
    discount: storedPat?.discount !== undefined ? storedPat.discount : 0,
    discountPercent: storedPat?.discountPercent !== undefined ? storedPat.discountPercent : 0,
    netAmount: storedPat?.netAmount !== undefined ? storedPat.netAmount : (storedPat?.registrationFee || 0) - (storedPat?.discount || 0),
    paidAmount: storedPat?.paidAmount !== undefined ? storedPat.paidAmount : 0,
    balanceAmount: storedPat?.dueAmount !== undefined ? storedPat.dueAmount : 0,
    paymentMode: storedPat?.paymentMode || 'Cash',
    doctorRef: storedPat?.doctorRef || 'Consultant Physician',
    paymentNote: storedPat?.paymentNote || '',
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center font-bold text-xs">Loading Receipt...</div>;
  }

  const grossFee = paymentData.totalAmount || 0;
  const discountAmt = paymentData.discount || 0;
  const netPayable = paymentData.netAmount || Math.max(0, grossFee - discountAmt);
  const paidAmt = paymentData.paidAmount || 0;
  const dueAmt = paymentData.balanceAmount || Math.max(0, netPayable - paidAmt);

  return (
    <PrintableLayout
      docTitle="OFFICIAL CASH PAYMENT RECEIPT"
      docNumber={paymentData.receiptNo}
      docDate={paymentData.date || 'Today'}
      patientInfo={{
        fullname: paymentData.fullname,
        uhid: paymentData.regId,
        ageGender: `${paymentData.age} Yrs / ${paymentData.gender}`,
        mobile: paymentData.mobile || 'N/A',
        doctor: paymentData.doctorRef || 'Consultant Physician',
      }}
    >
      <div className="space-y-4 text-xs font-sans text-slate-900">
        
        {/* Itemized Service Breakdown Table */}
        <table className="w-full text-left border border-slate-300 rounded-xl overflow-hidden shadow-sm">
          <thead className="bg-slate-100 uppercase text-[10px] font-extrabold text-slate-700 border-b border-slate-300">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Service Particulars</th>
              <th className="p-3 text-center">Payment Mode</th>
              <th className="p-3 text-right">Gross Amount</th>
              <th className="p-3 text-right">Discount</th>
              <th className="p-3 text-right">Net Payable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
            <tr>
              <td className="p-3 font-mono font-bold text-slate-500">1</td>
              <td className="p-3 font-bold text-slate-900">
                Patient Registration & OPD Consultation Charges
                {paymentData.doctorRef && <span className="block text-[10px] text-teal-700 font-normal">Doctor Ref: {paymentData.doctorRef}</span>}
              </td>
              <td className="p-3 text-center font-bold text-purple-700">{paymentData.paymentMode}</td>
              <td className="p-3 text-right font-mono font-semibold">₹{grossFee}</td>
              <td className="p-3 text-right font-mono text-rose-600 font-bold">
                {discountAmt > 0 ? `-₹${discountAmt} (${paymentData.discountPercent}%)` : '₹0'}
              </td>
              <td className="p-3 text-right font-mono font-extrabold text-purple-900 text-sm">₹{netPayable}</td>
            </tr>
          </tbody>
        </table>

        {/* Calculation Summary Side-by-Side Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
          
          {/* Payment Notes & Terms */}
          <div className="flex-1 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">Payment Notes / Remarks</span>
            <p className="text-xs text-slate-700 font-medium">
              {paymentData.paymentNote || 'Payment received against OPD Registration & Consultation. Thank you!'}
            </p>
            <div className="pt-2 text-[9px] text-slate-400 font-sans border-t border-slate-200">
              * Valid receipt generated by AASHORA Clinic Management System.
            </div>
          </div>

          {/* Detailed Calculations Box */}
          <div className="w-full sm:w-72 p-3.5 rounded-xl border border-slate-300 bg-slate-50/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Gross Total Amount:</span>
              <span className="font-mono font-bold text-slate-900">₹{grossFee}</span>
            </div>
            <div className="flex justify-between text-rose-600 font-medium">
              <span>Discount Allowed ({paymentData.discountPercent}%):</span>
              <span className="font-mono font-bold">-₹{discountAmt}</span>
            </div>
            <div className="flex justify-between text-purple-900 font-black text-xs border-t border-slate-300 pt-1.5">
              <span>Net Amount Payable:</span>
              <span className="font-mono">₹{netPayable}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold border-t border-slate-200 pt-1">
              <span>Total Paid Amount:</span>
              <span className="font-mono text-sm font-extrabold">₹{paidAmt}</span>
            </div>
            <div className={`flex justify-between font-black border-t border-slate-300 pt-1.5 ${
              dueAmt > 0 ? 'text-rose-600' : 'text-slate-500'
            }`}>
              <span>Balance Due Amount:</span>
              <span className="font-mono text-sm">₹{dueAmt}</span>
            </div>
          </div>
        </div>

        {/* Confirmation Status Banner */}
        <div className={`p-3 rounded-xl border flex justify-between items-center text-xs font-bold ${
          dueAmt > 0 ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <span>Payment Confirmation Status:</span>
          <span className="font-mono text-sm font-black">
            {dueAmt > 0 ? `DUE PAYMENT (BAL: ₹${dueAmt})` : `FULL PAYMENT RECEIVED (PAID: ₹${paidAmt})`}
          </span>
        </div>

        {/* Signature & Stamp Footer Area */}
        <div className="pt-8 flex justify-between items-end text-xs border-t border-slate-200 mt-6">
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>Printed on: {new Date().toLocaleDateString('en-IN')}</p>
            <p>Computer Generated Receipt — Valid without manual seal.</p>
          </div>
          <div className="text-center space-y-1">
            <div className="w-40 border-b border-slate-400 mb-1"></div>
            <span className="text-[10px] font-bold uppercase text-slate-700 tracking-wider">Authorized Signatory</span>
          </div>
        </div>

      </div>
    </PrintableLayout>
  );
}
