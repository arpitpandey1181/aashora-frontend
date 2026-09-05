'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'aashora-clinic-store-v11';

// Initial Time Slot Settings Master
const defaultTimeSlotMaster = {
  slotDuration: 15, // minutes (10, 15, 20, 25, 30)
  maxPatientsPerSlot: 4,
  shifts: {
    Morning: { start: '09:00', end: '13:00', enabled: true },
    Afternoon: { start: '14:00', end: '17:00', enabled: true },
    Evening: { start: '18:00', end: '21:00', enabled: true },
  },
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

// Default Doctor Master Configuration
export const DEFAULT_DOCTORS_MASTER = [
  {
    id: 'DOC-101',
    doctorName: 'Dr. Arpit Pandey',
    fullName: 'Dr. Arpit Pandey (M.D. Cardiology)',
    department: 'Cardiology',
    specialization: 'Cardiologist',
    phone: '9876543210',
    email: 'arpit@medonext.com',
    opdRoom: 'OPD-101',
    consultationFee: 500,
    status: 'Active',
  },
  {
    id: 'DOC-102',
    doctorName: 'Dr. B.M. Jayswal',
    fullName: 'Dr. B.M. Jayswal (Consultant Physician)',
    department: 'General Medicine',
    specialization: 'Consultant Physician',
    phone: '9876543211',
    email: 'jayswal@medonext.com',
    opdRoom: 'OPD-102',
    consultationFee: 400,
    status: 'Active',
  },
  {
    id: 'DOC-103',
    doctorName: 'Dr. R.K. Sharma',
    fullName: 'Dr. R.K. Sharma (General Surgeon)',
    department: 'General Surgery',
    specialization: 'Surgeon',
    phone: '9876543212',
    email: 'sharma@medonext.com',
    opdRoom: 'OPD-103',
    consultationFee: 600,
    status: 'Active',
  },
  {
    id: 'DOC-104',
    doctorName: 'Dr. Priya Singh',
    fullName: 'Dr. Priya Singh (Pediatrician)',
    department: 'Pediatrics',
    specialization: 'Pediatrician',
    phone: '9876543213',
    email: 'priya@medonext.com',
    opdRoom: 'OPD-104',
    consultationFee: 350,
    status: 'Active',
  },
  {
    id: 'DOC-105',
    doctorName: 'Dr. Ankit Verma',
    fullName: 'Dr. Ankit Verma (Orthopedic)',
    department: 'Orthopedics',
    specialization: 'Orthopedic Surgeon',
    phone: '9876543214',
    email: 'ankit@medonext.com',
    opdRoom: 'OPD-105',
    consultationFee: 450,
    status: 'Active',
  },
];

// Default Department & Specialization Master
export const DEFAULT_DEPARTMENTS_MASTER = [
  { id: 'DEP-1', name: 'Cardiology', code: 'CARD', specializations: ['Cardiologist', 'Interventional Cardiology'], status: 'Active' },
  { id: 'DEP-2', name: 'General Medicine', code: 'GENMED', specializations: ['Consultant Physician', 'Internal Medicine'], status: 'Active' },
  { id: 'DEP-3', name: 'General Surgery', code: 'GENSURG', specializations: ['Surgeon', 'Laparoscopic Surgeon'], status: 'Active' },
  { id: 'DEP-4', name: 'Pediatrics', code: 'PED', specializations: ['Pediatrician', 'Neonatologist'], status: 'Active' },
  { id: 'DEP-5', name: 'Orthopedics', code: 'ORTHO', specializations: ['Orthopedic Surgeon', 'Joint Replacement'], status: 'Active' },
  { id: 'DEP-6', name: 'Dermatology', code: 'DERM', specializations: ['Dermatologist', 'Cosmetologist'], status: 'Active' },
];

// Default Payment Modes & Charges Master
export const DEFAULT_PAYMENT_MODES_MASTER = [
  { id: 'PM-1', name: 'Cash', type: 'Direct', isDefault: true, extraChargePercent: 0, status: 'Active' },
  { id: 'PM-2', name: 'UPI / QR Code', type: 'Digital', isDefault: false, extraChargePercent: 0, status: 'Active' },
  { id: 'PM-3', name: 'Card / POS', type: 'Digital', isDefault: false, extraChargePercent: 0, status: 'Active' },
  { id: 'PM-4', name: 'Net Banking', type: 'Digital', isDefault: false, extraChargePercent: 0, status: 'Active' },
  { id: 'PM-5', name: 'Due / Credit', type: 'Credit', isDefault: false, extraChargePercent: 0, status: 'Active' },
];

export const DEFAULT_SERVICE_CHARGES_MASTER = [
  { id: 'CHG-1', serviceName: 'OPD Consultation Fee', category: 'Consultation', amount: 500, status: 'Active' },
  { id: 'CHG-2', serviceName: 'Emergency Consultation', category: 'Consultation', amount: 800, status: 'Active' },
  { id: 'CHG-3', serviceName: 'Follow-Up Visit Fee', category: 'Consultation', amount: 300, status: 'Active' },
  { id: 'CHG-4', serviceName: 'Registration Charge', category: 'Administrative', amount: 100, status: 'Active' },
];

// Default Prescription Fields Control
export const DEFAULT_PRESCRIPTION_CONTROLS = {
  showHeader: true,
  showDoctorDetails: true,
  showPatientVitals: true,
  showAllergiesAddictions: true,
  showPastHistory: true,
  showComplaints: true,
  showDiagnosis: true,
  showMedicines: true,
  showLabTests: true,
  showAdviceNotes: true,
  showFollowUpDate: true,
  showSignature: true,
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
  doctorsMaster: DEFAULT_DOCTORS_MASTER,
  departmentsMaster: DEFAULT_DEPARTMENTS_MASTER,
  paymentModesMaster: DEFAULT_PAYMENT_MODES_MASTER,
  serviceChargesMaster: DEFAULT_SERVICE_CHARGES_MASTER,
  prescriptionFieldControls: DEFAULT_PRESCRIPTION_CONTROLS,
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

    // Auto-create Billing Payment Receipt for any finalized registration
    let updatedPayments = state.payments || [];
    const nextRct = `RCT-${(state.payments || []).length + 1001}`;
    const newPay = {
      receiptNo: nextRct,
      gsspatid: newPat.gsspatid,
      regId: newPat.regId,
      fullname: `${newPat.title} ${newPat.fullname}`,
      date: regDate,
      totalAmount: newPat.registrationFee !== undefined ? newPat.registrationFee : 0,
      discount: newPat.discount !== undefined ? newPat.discount : 0,
      discountPercent: newPat.discountPercent !== undefined ? newPat.discountPercent : 0,
      paidAmount: newPat.paidAmount !== undefined ? newPat.paidAmount : 0,
      dueAmount: newPat.dueAmount !== undefined ? newPat.dueAmount : 0,
      paymentMode: newPat.paymentMode || 'Cash',
      serviceType: `${newPat.visitType || 'First Visit'} - Consultation & Registration Fee`,
      doctorRef: newPat.doctorRef || '',
    };
    updatedPayments = [newPay, ...(state.payments || [])];

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

  // --- DOCTOR MASTER ACTIONS ---
  const addDoctorMaster = (docData) => {
    const nextId = `DOC-${(state.doctorsMaster || []).length + 101}`;
    const newDoc = {
      ...docData,
      id: nextId,
      fullName: docData.fullName || `${docData.doctorName} (${docData.specialization || docData.department})`,
      status: docData.status || 'Active',
    };
    const updated = [newDoc, ...(state.doctorsMaster || [])];
    saveStore({ doctorsMaster: updated });
    return newDoc;
  };

  const updateDoctorMaster = (id, updatedFields) => {
    const updated = (state.doctorsMaster || []).map((d) =>
      d.id.toString() === id.toString()
        ? {
            ...d,
            ...updatedFields,
            fullName: updatedFields.doctorName || updatedFields.specialization
              ? `${updatedFields.doctorName || d.doctorName} (${updatedFields.specialization || d.specialization || updatedFields.department || d.department})`
              : d.fullName,
          }
        : d
    );
    saveStore({ doctorsMaster: updated });
  };

  const toggleDoctorStatus = (id) => {
    const updated = (state.doctorsMaster || []).map((d) =>
      d.id.toString() === id.toString() ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d
    );
    saveStore({ doctorsMaster: updated });
  };

  const deleteDoctorMaster = (id) => {
    const updated = (state.doctorsMaster || []).filter((d) => d.id.toString() !== id.toString());
    saveStore({ doctorsMaster: updated });
  };

  // --- DEPARTMENT MASTER ACTIONS ---
  const addDepartmentMaster = (depData) => {
    const nextId = `DEP-${(state.departmentsMaster || []).length + 1}`;
    const newDep = {
      ...depData,
      id: nextId,
      specializations: Array.isArray(depData.specializations)
        ? depData.specializations
        : (depData.specializations || '').split(',').map((s) => s.trim()).filter(Boolean),
      status: depData.status || 'Active',
    };
    const updated = [...(state.departmentsMaster || []), newDep];
    saveStore({ departmentsMaster: updated });
    return newDep;
  };

  const updateDepartmentMaster = (id, updatedFields) => {
    const updated = (state.departmentsMaster || []).map((dep) =>
      dep.id.toString() === id.toString()
        ? {
            ...dep,
            ...updatedFields,
            specializations: Array.isArray(updatedFields.specializations)
              ? updatedFields.specializations
              : (updatedFields.specializations || '').split(',').map((s) => s.trim()).filter(Boolean),
          }
        : dep
    );
    saveStore({ departmentsMaster: updated });
  };

  const deleteDepartmentMaster = (id) => {
    const updated = (state.departmentsMaster || []).filter((dep) => dep.id.toString() !== id.toString());
    saveStore({ departmentsMaster: updated });
  };

  // --- PAYMENT MODE & CHARGE MASTER ACTIONS ---
  const addPaymentModeMaster = (pmData) => {
    const nextId = `PM-${(state.paymentModesMaster || []).length + 1}`;
    const newPm = { ...pmData, id: nextId, status: pmData.status || 'Active' };
    const updated = [...(state.paymentModesMaster || []), newPm];
    saveStore({ paymentModesMaster: updated });
    return newPm;
  };

  const togglePaymentModeStatus = (id) => {
    const updated = (state.paymentModesMaster || []).map((pm) =>
      pm.id.toString() === id.toString() ? { ...pm, status: pm.status === 'Active' ? 'Inactive' : 'Active' } : pm
    );
    saveStore({ paymentModesMaster: updated });
  };

  const deletePaymentModeMaster = (id) => {
    const updated = (state.paymentModesMaster || []).filter((pm) => pm.id.toString() !== id.toString());
    saveStore({ paymentModesMaster: updated });
  };

  const addServiceChargeMaster = (chgData) => {
    const nextId = `CHG-${(state.serviceChargesMaster || []).length + 1}`;
    const newChg = { ...chgData, id: nextId, status: chgData.status || 'Active' };
    const updated = [...(state.serviceChargesMaster || []), newChg];
    saveStore({ serviceChargesMaster: updated });
    return newChg;
  };

  const updateServiceChargeMaster = (id, updatedFields) => {
    const updated = (state.serviceChargesMaster || []).map((c) =>
      c.id.toString() === id.toString() ? { ...c, ...updatedFields } : c
    );
    saveStore({ serviceChargesMaster: updated });
  };

  const deleteServiceChargeMaster = (id) => {
    const updated = (state.serviceChargesMaster || []).filter((c) => c.id.toString() !== id.toString());
    saveStore({ serviceChargesMaster: updated });
  };

  // --- PRESCRIPTION FIELDS CONTROL ACTIONS ---
  const updatePrescriptionFieldControls = (newControls) => {
    saveStore({ prescriptionFieldControls: newControls });
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
    doctorsMaster: state.doctorsMaster || DEFAULT_DOCTORS_MASTER,
    departmentsMaster: state.departmentsMaster || DEFAULT_DEPARTMENTS_MASTER,
    paymentModesMaster: state.paymentModesMaster || DEFAULT_PAYMENT_MODES_MASTER,
    serviceChargesMaster: state.serviceChargesMaster || DEFAULT_SERVICE_CHARGES_MASTER,
    prescriptionFieldControls: state.prescriptionFieldControls || DEFAULT_PRESCRIPTION_CONTROLS,
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
    addDoctorMaster,
    updateDoctorMaster,
    toggleDoctorStatus,
    deleteDoctorMaster,
    addDepartmentMaster,
    updateDepartmentMaster,
    deleteDepartmentMaster,
    addPaymentModeMaster,
    togglePaymentModeStatus,
    deletePaymentModeMaster,
    addServiceChargeMaster,
    updateServiceChargeMaster,
    deleteServiceChargeMaster,
    updatePrescriptionFieldControls,
  };
}
