'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'aashora-clinic-store-v11';

// Initial Time Slot Settings Master
const defaultTimeSlotMaster = {
  slotDuration: 15, // minutes (10, 15, 20, 25, 30)
  shifts: {
    Morning: { start: '09:00', end: '13:00' },
    Afternoon: { start: '14:00', end: '17:00' },
    Evening: { start: '18:00', end: '21:00' },
  },
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

// Demo Doctors Configuration
export const DEMO_DOCTORS = {
  Arpit: {
    username: 'Arpit',
    password: 'A@27',
    doctorName: 'Dr. Arpit Pandey',
    fullName: 'Dr. Arpit Pandey (M.D. Cardiology)',
    role: 'Consultant Physician & Cardiologist',
    specialty: 'Cardiology',
  },
  admin: {
    username: 'admin',
    password: 'admin',
    doctorName: 'Dr. B.M. Jayswal',
    fullName: 'Dr. B.M. Jayswal (Consultant Physician)',
    role: 'Consultant Physician',
    specialty: 'General Medicine',
  },
};

// Doctors Master List
export const DOCTORS_MASTER_LIST = [
  'Dr. Arpit Pandey (M.D. Cardiology)',
  'Dr. B.M. Jayswal (Consultant Physician)',
  'Dr. R.K. Sharma (General Surgeon)',
  'Dr. Priya Singh (Pediatrician)',
  'Dr. Ankit Verma (Orthopedic)',
];

// Initial Patient Advice Templates Master
export const INITIAL_ADVICE_TEMPLATES = [
  'DO\'S: Drink warm fluids/herbal tea, take steam inhalation twice daily, and rest adequately.\nDON\'TS: Avoid chilled ice water, cold beverages, oily fried food, and heavy physical exertion.',
  'DO\'S: Walk 30 mins daily, follow low salt & low sugar diet, drink 3L water.\nDON\'TS: Avoid smoking, alcohol, high cholesterol fried snacks.',
  'DO\'S: Take light soft diet (Khichdi/Daliya), drink boiled water.\nDON\'TS: Avoid spicy food, dairy products during acute stomach upset.',
  'DO\'S: Maintain proper posture, use firm mattress, apply warm compress.\nDON\'TS: Avoid bending forward sharply, lifting heavy weights.',
];

// Initial Store State
let globalStoreState = {
  currentUser: DEMO_DOCTORS.Arpit,
  patients: [],
  appointments: [],
  prescriptions: [],
  payments: [],
  reports: [],
  complaintsMaster: [],
  diagnosisMaster: [],
  medicinesMaster: [],
  labTestsMaster: [],
  adviceTemplatesMaster: INITIAL_ADVICE_TEMPLATES,
  timeSlotSettings: defaultTimeSlotMaster,
};

const listeners = new Set();

function getSavedStore() {
  if (typeof window === 'undefined') return globalStoreState;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      globalStoreState = { ...globalStoreState, ...parsed };
    }
  } catch (e) {
    console.warn('LocalStorage store error:', e);
  }
  return globalStoreState;
}

function saveStore(newState) {
  globalStoreState = { ...globalStoreState, ...newState };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalStoreState));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }
  listeners.forEach((listener) => listener(globalStoreState));
}

export function useClinicStore() {
  const [state, setState] = useState(() => getSavedStore());

  useEffect(() => {
    listeners.add(setState);
    return () => listeners.delete(setState);
  }, []);

  // Add Registered Patient & Auto-Create Payment Receipt
  const addPatient = (patData) => {
    const nextId = state.patients.length > 0 ? Math.max(...state.patients.map((p) => p.gsspatid)) + 1 : 1001;
    const regDate = patData.registrationdate || new Date().toISOString().split('T')[0];
    const newPat = {
      ...patData,
      title: patData.title || 'Mr.',
      gsspatid: nextId,
      regId: `REG-${nextId}`,
      status: patData.status || 'Registered',
      checkInStatus: patData.checkInStatus || 'Registered',
      registrationdate: regDate,
      dueAmount: patData.dueAmount || 0,
      doctorRef: patData.doctorRef || '',
    };
    const updatedPatients = [newPat, ...state.patients];

    let updatedAppointments = state.appointments;
    if (patData.importedAppId) {
      updatedAppointments = state.appointments.filter((a) => a.id.toString() !== patData.importedAppId.toString());
    } else {
      updatedAppointments = state.appointments.filter((a) => a.mobileno !== patData.mobileno);
    }

    // Auto-create Billing Payment Receipt if paidAmount > 0
    let updatedPayments = state.payments || [];
    if (newPat.paidAmount > 0) {
      const nextRct = `RCT-${(state.payments || []).length + 1001}`;
      const newPay = {
        receiptNo: nextRct,
        gsspatid: newPat.gsspatid,
        regId: newPat.regId,
        fullname: `${newPat.title} ${newPat.fullname}`,
        date: regDate,
        totalAmount: newPat.registrationFee || 200,
        discount: newPat.discount || 0,
        paidAmount: newPat.paidAmount || 0,
        dueAmount: newPat.dueAmount || 0,
        paymentMode: newPat.paymentMode || 'Cash',
        serviceType: `${newPat.visitType || 'First Visit'} - Consultation & Registration Fee`,
        doctorRef: newPat.doctorRef || '',
      };
      updatedPayments = [newPay, ...(state.payments || [])];
    }

    saveStore({ patients: updatedPatients, appointments: updatedAppointments, payments: updatedPayments });
    return newPat;
  };

  // Route patient to Vitals Queue
  const sendForVitals = (gsspatid) => {
    const updated = state.patients.map((p) =>
      p.gsspatid.toString() === gsspatid.toString()
        ? { ...p, checkInStatus: 'Pending Vitals', sendForVitalsTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : p
    );
    saveStore({ patients: updated });
  };

  // Save Vitals from Vitals Inbox & mark status as Vitals Completed
  const saveVitalsAndCheckIn = (gsspatid, vitalsData) => {
    const updated = state.patients.map((p) =>
      p.gsspatid.toString() === gsspatid.toString()
        ? {
            ...p,
            vitals: vitalsData,
            checkInStatus: 'Vitals Completed',
            vitalsTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : p
    );
    saveStore({ patients: updated });
  };

  // Mark patient as Checked-In for Doctor consultation
  const checkInPatient = (gsspatid) => {
    const updated = state.patients.map((p) =>
      p.gsspatid.toString() === gsspatid.toString()
        ? { ...p, checkInStatus: 'Checked-In', checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : p
    );
    saveStore({ patients: updated });
  };

  // Mark patient as Checked-Out after E-Prescription issued
  const checkOutPatient = (gsspatid) => {
    const updatedPatients = state.patients.map((p) =>
      p.gsspatid.toString() === gsspatid.toString()
        ? { ...p, checkInStatus: 'Checked-Out', checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : p
    );
    saveStore({ patients: updatedPatients });
  };

  const updatePatient = (gsspatid, updatedFields) => {
    const updated = state.patients.map((p) => (p.gsspatid === gsspatid ? { ...p, ...updatedFields } : p));
    saveStore({ patients: updated });
  };

  const removeAppointment = (appId) => {
    const updated = state.appointments.filter((a) => a.id.toString() !== appId.toString());
    saveStore({ appointments: updated });
  };

  const addAppointment = (app) => {
    const nextId = state.appointments.length > 0 ? Math.max(...state.appointments.map((a) => a.id)) + 1 : 2001;
    const newApp = { ...app, id: nextId, status: 'Booked' };
    const updated = [newApp, ...state.appointments];
    saveStore({ appointments: updated });
    return newApp;
  };

  const addPayment = (paymentData) => {
    const nextRct = `RCT-${(state.payments || []).length + 1001}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const newPay = { ...paymentData, receiptNo: nextRct, date: paymentData.date || todayStr };
    const updated = [newPay, ...(state.payments || [])];
    saveStore({ payments: updated });
    return newPay;
  };

  const addPatientReport = (reportData) => {
    const nextId = `REP-${(state.reports || []).length + 1}`;
    const newRep = { ...reportData, id: nextId, uploadDate: new Date().toLocaleDateString('en-GB') };
    const updated = [newRep, ...(state.reports || [])];
    saveStore({ reports: updated });
    return newRep;
  };

  const removePatientReport = (reportId) => {
    const updated = (state.reports || []).filter((r) => r.id.toString() !== reportId.toString());
    saveStore({ reports: updated });
  };

  const createPrescription = (rxData) => {
    const nextId = ((state.prescriptions || []).length + 1).toString().padStart(4, '0');
    const rxNo = `RX-${nextId}`;
    const newRx = { ...rxData, rxNo, createdAt: new Date().toISOString() };
    const updatedPrescriptions = [newRx, ...(state.prescriptions || [])];
    
    // Auto checkout patient when prescription is created
    const updatedPatients = state.patients.map((p) =>
      p.gsspatid.toString() === rxData.gsspatid.toString()
        ? { ...p, checkInStatus: 'Checked-Out', checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : p
    );

    saveStore({ prescriptions: updatedPrescriptions, patients: updatedPatients });
    return newRx;
  };

  const addComplaintMaster = (text) => {
    const updated = Array.from(new Set([...(state.complaintsMaster || []), text]));
    saveStore({ complaintsMaster: updated });
  };

  const addDiagnosisMaster = (text) => {
    const updated = Array.from(new Set([...(state.diagnosisMaster || []), text]));
    saveStore({ diagnosisMaster: updated });
  };

  const addAdviceTemplateMaster = (text) => {
    const updated = Array.from(new Set([...(state.adviceTemplatesMaster || []), text]));
    saveStore({ adviceTemplatesMaster: updated });
  };

  const loginUser = (inputUsername, inputPassword) => {
    const u = (inputUsername || '').trim();
    const p = (inputPassword || '').trim();

    // Find matching doctor from DEMO_DOCTORS registry
    const doctorKey = Object.keys(DEMO_DOCTORS).find((key) => {
      const doc = DEMO_DOCTORS[key];
      return doc.username.toLowerCase() === u.toLowerCase() && doc.password === p;
    });

    if (doctorKey) {
      const doc = DEMO_DOCTORS[doctorKey];
      saveStore({ currentUser: doc });
      return { success: true, user: doc };
    }

    return { success: false, error: 'Invalid Username or Password! Please enter valid doctor credentials.' };
  };

  const updateTimeSlotSettings = (newSettings) => {
    saveStore({ timeSlotSettings: newSettings });
  };

  return {
    currentUser: state.currentUser || DEMO_DOCTORS.Arpit,
    loginUser,
    patients: state.patients || [],
    appointments: state.appointments || [],
    prescriptions: state.prescriptions || [],
    payments: state.payments || [],
    reports: state.reports || [],
    complaintsMaster: state.complaintsMaster || [],
    diagnosisMaster: state.diagnosisMaster || [],
    medicinesMaster: state.medicinesMaster || [],
    labTestsMaster: state.labTestsMaster || [],
    adviceTemplatesMaster: state.adviceTemplatesMaster || INITIAL_ADVICE_TEMPLATES,
    timeSlotSettings: state.timeSlotSettings || defaultTimeSlotMaster,
    addPatient,
    sendForVitals,
    saveVitalsAndCheckIn,
    checkInPatient,
    checkOutPatient,
    updatePatient,
    removeAppointment,
    addAppointment,
    addPayment,
    addPatientReport,
    removePatientReport,
    createPrescription,
    addComplaintMaster,
    addDiagnosisMaster,
    addAdviceTemplateMaster,
    updateTimeSlotSettings,
  };
}
