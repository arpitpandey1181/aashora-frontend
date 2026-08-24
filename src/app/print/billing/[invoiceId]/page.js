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
    fullname: storedPat?.fullname || 'Rajesh Kumar',
    gsspatid: storedPat?.gsspatid || 1001,
    mobile: storedPat?.mobileno || '9826571181',
    date: '17/08/2026',
    totalAmount: storedPat?.registrationFee || 200,
    discount: storedPat?.discount || 0,
    discountPercent: storedPat?.discountPercent || 0,
    netAmount: storedPat?.netAmount || 200,
    paidAmount: storedPat?.paidAmount || 200,
    balanceAmount: storedPat?.dueAmount || 0,
    paymentMode: storedPat?.paymentMode || 'Cash',
    doctorRef: storedPat?.doctorRef || 'Dr. Alex Morgan (M.D. Cardiology)',
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center font-bold text-xs">Loading Receipt...</div>;
  }

  return (
    <PrintableLayout
      docTitle="CASH PAYMENT RECEIPT"
      docNumber={paymentData.receiptNo}
      docDate={paymentData.date || '17/08/2026'}
      patientInfo={{
        fullname: paymentData.fullname,
        uhid: paymentData.regId || (paymentData.gsspatid ? `REG-${paymentData.gsspatid}` : 'REG-1001'),
        ageGender: paymentData.ageGender || `${paymentData.age || 30} Yrs / ${paymentData.gender || 'Male'}`,
        mobile: paymentData.mobile || '+91 9876543210',
        doctor: paymentData.doctorRef || 'Dr. Alex Morgan (M.D. Cardiology)',
      }}
    >
      <div className="space-y-4 text-xs font-sans text-slate-900">
        <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
          <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-700 border-b border-slate-200">
            <tr>
              <th className="p-2.5">Service Description</th>
              <th className="p-2.5 text-center">Payment Mode</th>
              <th className="p-2.5 text-right">Gross Amount</th>
              <th className="p-2.5 text-right">Discount</th>
              <th className="p-2.5 text-right">Paid Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2.5 font-bold">Registration & Doctor Consultation Counter Fee</td>
              <td className="p-2.5 text-center font-bold text-purple-700">{paymentData.paymentMode}</td>
              <td className="p-2.5 text-right font-mono font-semibold">₹{paymentData.totalAmount}</td>
              <td className="p-2.5 text-right font-mono text-amber-600 font-bold">₹{paymentData.discount || 0} ({paymentData.discountPercent || 0}%)</td>
              <td className="p-2.5 text-right font-mono font-extrabold text-emerald-700 text-sm">₹{paymentData.paidAmount}</td>
            </tr>
          </tbody>
        </table>

        <div className={`p-3 rounded-xl border flex justify-between items-center text-xs font-bold ${
          paymentData.balanceAmount > 0 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <span>Payment Confirmation Status:</span>
          <span className="font-mono text-sm">
            {paymentData.balanceAmount > 0 ? `DUE AMOUNT: ₹${paymentData.balanceAmount}` : `FULL PAYMENT RECEIVED (BAL: ₹0)`}
          </span>
        </div>
      </div>
    </PrintableLayout>
  );
}
