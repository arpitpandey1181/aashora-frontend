// Central Dynamic Prescription & Patient Database Store with LocalStorage fallback

// Central Dynamic Prescription & Patient Database Store with LocalStorage fallback

export const dynamicPrescriptions = [];

export function getPrescriptionByRxNo(rxNo) {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('aashora_prescriptions');
      if (stored) {
        const parsed = JSON.parse(stored);
        const match = parsed.find((p) => p.rxNo.toLowerCase() === rxNo.toLowerCase());
        if (match) return match;
      }
    } catch (e) {
      console.warn('LocalStorage prescription read error:', e);
    }
  }

  const staticMatch = dynamicPrescriptions.find((p) => p.rxNo.toLowerCase() === rxNo.toLowerCase());
  if (staticMatch) return staticMatch;

  return {
    rxNo: rxNo.toUpperCase(),
    uhid: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
    fullname: 'Patient Record',
    ageGender: '35 Yrs / Patient',
    mobile: '+91 9876543210',
    doctor: 'Dr. Arpit Pandey (M.D. Cardiology)',
    date: '24/08/2026',
    vitals: { bp: '120/80 mmHg', pulse: '72 bpm', temp: '98.6 °F', weight: '68 kg', height: '170 cm', spo2: '99 %' },
    complaints: 'General OPD Consultation & Checkup',
    diagnosis: 'Routine OPD Evaluation',
    medicines: [
      { name: 'Paracetamol 500mg Tablet', dosage: '1 - 0 - 1', timing: 'After Food', duration: '5 Days' },
      { name: 'Pantoprazole 40mg Tablet', dosage: '1 - 0 - 0', timing: 'Before Food', duration: '5 Days' },
    ],
    advice: 'Rest well and stay hydrated.',
    followUpDate: '31/08/2026',
  };
}
