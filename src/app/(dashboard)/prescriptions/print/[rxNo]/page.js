'use client';

import { PrintableLayout } from '@/components/common/printable-layout';
import { Badge } from '@/components/ui/badge';
import { Activity, Stethoscope, Pill } from 'lucide-react';

export default function PrintPrescriptionPage({ params }) {
  const rxNo = params.rxNo || 'RX-8801';

  return (
    <PrintableLayout
      docTitle="DOCTOR E-PRESCRIPTION (Rx)"
      docNumber={rxNo}
      docDate="12/08/2026"
      patientInfo={{
        fullname: 'Rajesh Kumar',
        uhid: 'PT-1001',
        ageGender: '42 Yrs / Male',
        mobile: '+91 9876543210',
        doctor: 'Dr. Alex Morgan (M.D. Cardiology)',
      }}
    >
      <div className="space-y-6">
        
        {/* Vitals Summary Strip */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">BP</span>
            <strong className="text-slate-800">120/80 mmHg</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Pulse</span>
            <strong className="text-slate-800">72 bpm</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Temp</span>
            <strong className="text-amber-600 font-bold">98.6 °F</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Weight</span>
            <strong className="text-slate-800">70 kg</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Height</span>
            <strong className="text-slate-800">175 cm</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">SpO₂</span>
            <strong className="text-emerald-600 font-bold">99 %</strong>
          </div>
        </div>

        {/* Complaints & Diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider block">Chief Complaints:</span>
            <p className="font-semibold text-slate-800">Mild fever, dry cough & nasal congestion for 3 days.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-1 text-xs">
            <span className="font-extrabold text-teal-800 uppercase tracking-wider block">Clinical Diagnosis:</span>
            <p className="font-extrabold text-teal-900">Acute Upper Respiratory Tract Infection (URTI)</p>
          </div>
        </div>

        {/* Prescription Table with Rx Symbol */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1">
            <span className="text-2xl font-serif font-black text-teal-700">℞</span>
            <span className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">Prescribed Medication Roster</span>
          </div>

          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Medicine Name & Formulation</th>
                <th className="p-3 text-center">Dosage Pattern</th>
                <th className="p-3 text-center">Food Timing</th>
                <th className="p-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3">1</td>
                <td className="p-3 font-bold text-slate-900">Paracetamol 500mg Tablet</td>
                <td className="p-3 text-center font-bold text-teal-700">1 - 0 - 1</td>
                <td className="p-3 text-center text-slate-600">After Food</td>
                <td className="p-3 text-right font-bold">5 Days</td>
              </tr>
              <tr>
                <td className="p-3">2</td>
                <td className="p-3 font-bold text-slate-900">Amoxicillin 500mg Capsule</td>
                <td className="p-3 text-center font-bold text-teal-700">1 - 1 - 1</td>
                <td className="p-3 text-center text-slate-600">After Food</td>
                <td className="p-3 text-right font-bold">5 Days</td>
              </tr>
              <tr>
                <td className="p-3">3</td>
                <td className="p-3 font-bold text-slate-900">Pantoprazole 40mg Tablet</td>
                <td className="p-3 text-center font-bold text-teal-700">1 - 0 - 0</td>
                <td className="p-3 text-center text-slate-600">Before Food (Empty Stomach)</td>
                <td className="p-3 text-right font-bold">5 Days</td>
              </tr>
              <tr>
                <td className="p-3">4</td>
                <td className="p-3 font-bold text-slate-900">Cough Syrup (Ascoril LS)</td>
                <td className="p-3 text-center font-bold text-teal-700">5 ml TDS</td>
                <td className="p-3 text-center text-slate-600">After Food</td>
                <td className="p-3 text-right font-bold">5 Days</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Doctor Advice & Follow Up Date */}
        <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-xs space-y-1">
          <span className="font-extrabold text-teal-800 uppercase block">Special Advice & Lifestyle Note:</span>
          <p className="text-slate-700">Drink plenty of warm fluids, rest well, avoid cold beverages. Return for follow-up on <strong>19/08/2026</strong> or if symptoms persist.</p>
        </div>

      </div>
    </PrintableLayout>
  );
}
