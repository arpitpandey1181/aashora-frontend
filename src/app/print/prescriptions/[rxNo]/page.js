'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PrintableLayout } from '@/components/common/printable-layout';
import { useClinicStore } from '@/store/clinic-store';
import { translateText } from '@/lib/translate-api';

export default function PrintPrescriptionStandalonePage() {
  const params = useParams();
  const router = useRouter();
  const rxNo = params?.rxNo;

  const { prescriptions, patients } = useClinicStore();
  const [mounted, setMounted] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [translating, setTranslating] = useState(false);

  // Dynamic Live Translated Content State
  const [translatedContent, setTranslatedContent] = useState({
    complaints: '',
    diagnosis: '',
    advice: '',
    medicines: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Find dynamic prescription record from store (or matching patient)
  const storedRx = (prescriptions || []).find((r) => r.rxNo === rxNo || (r.regId && r.regId === rxNo));
  const storedPat = (patients || []).find((p) => p.regId === rxNo || p.gsspatid?.toString() === rxNo?.replace('REG-', ''));

  const rxData = storedRx || {
    rxNo: rxNo || 'RX-0001',
    regId: storedPat?.regId || 'REG-1002',
    fullname: storedPat?.fullname || 'Mr. arpit',
    ageGender: storedPat ? `${storedPat.age} Yrs / ${storedPat.gender}` : '25 Yrs / Male',
    mobile: storedPat?.mobileno || '9826571181',
    doctor: storedPat?.doctorRef || 'Dr. Alex Morgan (M.D. Cardiology)',
    vitals: storedPat?.vitals || { bp: '120/80 mmHg', pulse: '72 bpm', temp: '98.6 °F', weight: '70 kg', height: '175 cm', spo2: '99 %', rbs: '110 mg/dL', rr: '18 /min' },
    complaints: 'COUGH & COLD (Alternate Day) - Note: mmm, HIGH FEVER (Twice Weekly) - Note: mmm',
    diagnosis: 'UPPER RESPIRATORY TRACT INFECTION (URTI), ESSENTIAL HYPERTENSION',
    medicines: [
      { name: 'ALTACEF OD 500MG TABLET', dosage: '1 - 0 - 0', timing: 'Before Food', duration: '10 Days' },
      { name: 'P ZOX TABLET', dosage: '0 - 0 - 1', timing: 'After Food', duration: '7 Days' },
      { name: 'ACUTROL C 400 MG TABLET', dosage: '1 - 0 - 1', timing: 'After Breakfast', duration: '5 Days' },
    ],
    testsPrescribed: ['TREAD MILL TEST (TMT)', 'SUGAR FASTING (FBS)', 'KFT (KIDNEY FUNCTION TEST)', 'THYROID PROFILE (T3, T4, TSH)'],
    advice: "DO'S: Take warm tea/water, rest for 2 days.\nDON'TS: Avoid cold drinks, oily heavy food.",
    followUpDate: '17/08/2026',
    date: '17/08/2026',
  };

  // 2. Perform Live Dynamic Multi-Language Translations for all circled fields!
  useEffect(() => {
    if (!rxData) return;

    // Default English View
    if (selectedLang === 'English' || selectedLang === 'en') {
      setTranslatedContent({
        complaints: rxData.complaints || '',
        diagnosis: rxData.diagnosis || '',
        advice: rxData.advice || '',
        medicines: (rxData.medicines || []).map((m) => ({
          ...m,
          timingTranslated: m.timing,
          durationTranslated: m.duration,
        })),
      });
      return;
    }

    setTranslating(true);

    // Concurrently translate Complaints, Diagnosis, Advice, and Medicine Timing/Duration
    Promise.all([
      translateText(rxData.complaints || '', selectedLang),
      translateText(rxData.diagnosis || '', selectedLang),
      translateText(rxData.advice || '', selectedLang),
      Promise.all(
        (rxData.medicines || []).map(async (m) => ({
          ...m,
          timingTranslated: await translateText(m.timing || '', selectedLang),
          durationTranslated: await translateText(m.duration || '', selectedLang),
        }))
      ),
    ])
      .then(([comp, diag, adv, meds]) => {
        setTranslatedContent({
          complaints: comp,
          diagnosis: diag,
          advice: adv,
          medicines: meds,
        });
      })
      .catch((err) => {
        console.warn('Translation engine error:', err);
      })
      .finally(() => setTranslating(false));
  }, [selectedLang, rxData.rxNo, rxData.complaints, rxData.diagnosis, rxData.advice]);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center font-bold text-xs">Loading Prescription...</div>;
  }

  return (
    <PrintableLayout
      docTitle="DOCTOR E-PRESCRIPTION (Rx)"
      docNumber={rxData.rxNo}
      docDate={rxData.date || '17/08/2026'}
      patientInfo={{
        fullname: rxData.fullname,
        uhid: rxData.regId || (rxData.gsspatid ? `REG-${rxData.gsspatid}` : 'REG-1002'),
        ageGender: rxData.ageGender || `${rxData.age || 25} Yrs / ${rxData.gender || 'Male'}`,
        mobile: rxData.mobileno || rxData.mobile || '9826571181',
        doctor: rxData.doctor || 'Dr. Alex Morgan (M.D. Cardiology)',
      }}
      selectedLang={selectedLang}
      onLangChange={(newLang) => setSelectedLang(newLang)}
    >
      <div className="space-y-4 text-xs font-sans text-slate-900">
        
        {/* Clinical Vitals Strip */}
        {rxData.vitals && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-[11px] font-medium">
            <div>BP: <strong className="font-bold">{rxData.vitals.bp}</strong></div>
            <div>Pulse: <strong className="font-bold">{rxData.vitals.pulse}</strong></div>
            <div>Temp: <strong className="font-bold">{rxData.vitals.temp}</strong></div>
            <div>Weight: <strong className="font-bold">{rxData.vitals.weight}</strong></div>
            <div>Height: <strong className="font-bold">{rxData.vitals.height}</strong></div>
            <div>SpO2: <strong className="font-bold">{rxData.vitals.spo2}</strong></div>
            <div>RBS: <strong className="font-bold">{rxData.vitals.rbs}</strong></div>
            <div>RR: <strong className="font-bold">{rxData.vitals.rr}</strong></div>
          </div>
        )}

        {/* Dynamic Translated Chief Complaints & Clinical Diagnosis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl border border-slate-200 space-y-1 bg-slate-50/50">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center justify-between">
              <span>Chief Complaints:</span>
              {translating && <span className="text-[9px] text-teal-600 animate-pulse">Translating...</span>}
            </span>
            <p className="font-bold text-slate-800" suppressHydrationWarning>
              {translatedContent.complaints || rxData.complaints}
            </p>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-200 space-y-1 bg-slate-50/50">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center justify-between">
              <span>Clinical Diagnosis:</span>
              {translating && <span className="text-[9px] text-teal-600 animate-pulse">Translating...</span>}
            </span>
            <p className="font-bold text-purple-900" suppressHydrationWarning>
              {translatedContent.diagnosis || rxData.diagnosis}
            </p>
          </div>
        </div>

        {/* Prescribed Medicines Roster with Dynamic Translated Timing & Duration */}
        <div className="space-y-1.5 pt-1">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>Prescribed Medication Roster (Rx)</span>
            {translating && <span className="text-[10px] text-teal-600 font-semibold animate-pulse">Translating Timing & Duration...</span>}
          </h4>
          <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Medicine Name & Formulation</th>
                <th className="p-2 text-center">Dose</th>
                <th className="p-2 text-center">Timing</th>
                <th className="p-2 text-center">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(translatedContent.medicines.length > 0 ? translatedContent.medicines : rxData.medicines || []).map((m, idx) => (
                <tr key={idx}>
                  <td className="p-2 font-bold">{idx + 1}</td>
                  <td className="p-2 font-bold text-slate-900" suppressHydrationWarning>{m.name}</td>
                  <td className="p-2 text-center font-mono font-bold text-teal-700" suppressHydrationWarning>{m.dosage}</td>
                  <td className="p-2 text-center font-bold text-slate-800" suppressHydrationWarning>
                    {m.timingTranslated || m.timing}
                  </td>
                  <td className="p-2 text-center font-bold text-slate-800" suppressHydrationWarning>
                    {m.durationTranslated || m.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Prescribed Tests */}
        {rxData.testsPrescribed && rxData.testsPrescribed.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500">Prescribed Diagnostic Lab Scans:</span>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {rxData.testsPrescribed.map((t) => (
                <span key={t} className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 font-extrabold text-[10px]" suppressHydrationWarning>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Translated Patient Advice & Instructions */}
        <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase text-amber-900">
              Patient Advice & Instructions ({selectedLang.toUpperCase()})
            </span>
            {translating && <span className="text-[10px] text-amber-700 animate-pulse">Translating Advice...</span>}
          </div>
          <p className="text-xs font-medium text-slate-800 whitespace-pre-line leading-relaxed" suppressHydrationWarning>
            {translatedContent.advice || rxData.advice}
          </p>
        </div>

        {/* Next Follow-up Date */}
        <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold">
          <span>Next Recommended Follow-Up Date:</span>
          <strong className="font-mono text-teal-700 text-sm" suppressHydrationWarning>{rxData.followUpDate}</strong>
        </div>

      </div>
    </PrintableLayout>
  );
}
