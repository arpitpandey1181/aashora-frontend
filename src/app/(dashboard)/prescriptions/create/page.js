'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useClinicStore } from '@/store/clinic-store';
import vitalsConfigExport from '@/config/vitals-config';
import {
  COMPLAINTS_MASTER_OPTIONS,
  DIAGNOSIS_MASTER_OPTIONS,
  MEDICINES_MASTER_OPTIONS,
  LAB_TESTS_MASTER_OPTIONS,
  ALLERGIES_MASTER_OPTIONS,
  ADDICTION_MASTER_OPTIONS,
  PAST_HISTORY_MASTER_OPTIONS,
  DOSE_OPTIONS,
  WHEN_OPTIONS,
  FREQ_OPTIONS,
  DURATION_LIST_OPTIONS,
} from '@/config/clinic-constants';
import { formatDate } from '@/lib/utils';
import { FileText, Plus, ArrowLeft, Activity, Pill, Sparkles, Calendar, FlaskConical, X, CalendarIcon, Paperclip, Eye, Image as ImageIcon, Stethoscope, FileCheck, Ban, MessageSquare, BookmarkPlus, Printer, Search } from 'lucide-react';
import { toast } from 'sonner';

const vitalsCfg = vitalsConfigExport || {
  showBP: true,
  showPulse: true,
  showTemp: true,
  showWeight: true,
  showHeight: true,
  showSpO2: true,
  showRBS: true,
  showRR: true,
  showPainScore: true,
};

const SEVERITY_OPTIONS = ['Mild', 'Moderate', 'Severe', 'Profound'];

// Helper to generate dynamic duration dropdown suggestions based on numeric typing (e.g. 1 -> 1 Day, 1 Week, 1 Month, 1 Year | 15 -> 15 Days, 15 Weeks, 15 Months, 15 Years)
function getDynamicDurationOptions(inputVal) {
  if (!inputVal || !inputVal.toString().trim()) {
    return ['3 Days', '5 Days', '7 Days', '10 Days', '14 Days', '1 Month', '2 Months', '3 Months', '6 Months', '1 Year', 'Continue'];
  }

  const str = inputVal.toString().trim();
  const match = str.match(/^(\d+)/);

  if (match) {
    const num = parseInt(match[1], 10);
    const dayUnit = num === 1 ? 'Day' : 'Days';
    const weekUnit = num === 1 ? 'Week' : 'Weeks';
    const monthUnit = num === 1 ? 'Month' : 'Months';
    const yearUnit = num === 1 ? 'Year' : 'Years';

    return [
      `${num} ${dayUnit}`,
      `${num} ${weekUnit}`,
      `${num} ${monthUnit}`,
      `${num} ${yearUnit}`,
      'Continue',
    ];
  }

  const defaults = ['3 Days', '5 Days', '7 Days', '10 Days', '14 Days', '1 Month', '2 Months', '3 Months', '6 Months', '1 Year', 'Continue'];
  const filtered = defaults.filter((d) => d.toLowerCase().includes(str.toLowerCase()));
  return filtered.length > 0 ? filtered : [`${str} Days`, `${str} Weeks`, `${str} Months`, `${str} Years`, 'Continue'];
}

function PrescriptionFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramPatId = searchParams?.get('patId') || '';

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-teal-600 font-bold text-sm">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Loading E-Prescription Creator...
        </div>
      </div>
    );
  }

  const {
    currentUser,
    patients,
    createPrescription,
    complaintsMaster,
    diagnosisMaster,
    medicinesMaster,
    labTestsMaster,
    adviceTemplatesMaster,
    reports,
    addComplaintMaster,
    addDiagnosisMaster,
    addAdviceTemplateMaster,
    prescriptionFieldControls,
  } = useClinicStore();

  // Dynamic Master Lists initialized with clinic constants
  const [complaintsOptions, setComplaintsOptions] = useState(Array.from(new Set([...COMPLAINTS_MASTER_OPTIONS, ...(complaintsMaster || [])])));
  const [diagnosisOptions, setDiagnosisOptions] = useState(Array.from(new Set([...DIAGNOSIS_MASTER_OPTIONS, ...(diagnosisMaster || [])])));
  const [medicinesOptions, setMedicinesOptions] = useState(Array.from(new Set([...MEDICINES_MASTER_OPTIONS, ...(medicinesMaster || [])])));
  const [labTestsMasterList, setLabTestsMasterList] = useState(Array.from(new Set([...LAB_TESTS_MASTER_OPTIONS, ...(labTestsMaster || [])])));
  const [allergiesMasterList, setAllergiesMasterList] = useState(ALLERGIES_MASTER_OPTIONS);
  const [addictionMasterList, setAddictionMasterList] = useState(ADDICTION_MASTER_OPTIONS);
  const [pastHistoryMasterList, setPastHistoryMasterList] = useState(PAST_HISTORY_MASTER_OPTIONS);

  const [selectedPatId, setSelectedPatId] = useState('');
  const [doctorName, setDoctorName] = useState(currentUser?.fullName || 'Dr. Arpit Pandey (M.D. Cardiology)');

  useEffect(() => {
    if (currentUser?.fullName) {
      setDoctorName(currentUser.fullName);
    }
  }, [currentUser]);

  // Card 3: Patient Allergy & Patient Addiction State (Clean Empty Default)
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [allergySearchTerm, setAllergySearchTerm] = useState('');
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  const [selectedAddictions, setSelectedAddictions] = useState([]);
  const [addictionSearchTerm, setAddictionSearchTerm] = useState('');
  const [customAddictionInput, setCustomAddictionInput] = useState('');

  // Card 4: 3-Column Past Medical & Surgical History Table Grid (Clean Empty Default)
  const [pastHistoryList, setPastHistoryList] = useState([
    { id: 1, condition: '', duration: '', notes: '' },
  ]);
  const [customHistoryInput, setCustomHistoryInput] = useState('');

  useEffect(() => {
    if (paramPatId) {
      setSelectedPatId(paramPatId);
    }
  }, [paramPatId]);

  const checkedInPatients = (patients || []).filter((p) => p.checkInStatus === 'Checked-In');

  const [showReportsModal, setShowReportsModal] = useState(false);
  const [activePreviewReport, setActivePreviewReport] = useState(null);

  // Vitals Assessment State
  const [vitals, setVitals] = useState({
    bp: '',
    pulse: '',
    temp: '',
    weight: '',
    height: '',
    spo2: '',
    rbs: '',
    rr: '',
    painScore: '',
  });

  // Strictly evaluate selected patient object & patient attached reports
  const selectedPatientObj = (selectedPatId && selectedPatId !== '')
    ? (patients || []).find((p) => p.gsspatid.toString() === selectedPatId.toString())
    : null;

  // AUTO-POPULATE VITALS WHENEVER A CHECKED-IN PATIENT IS SELECTED!
  useEffect(() => {
    if (selectedPatientObj && selectedPatientObj.vitals) {
      setVitals({
        bp: selectedPatientObj.vitals.bp || '',
        pulse: selectedPatientObj.vitals.pulse || '',
        temp: selectedPatientObj.vitals.temp || '',
        weight: selectedPatientObj.vitals.weight || '',
        height: selectedPatientObj.vitals.height || '',
        spo2: selectedPatientObj.vitals.spo2 || '',
        rbs: selectedPatientObj.vitals.rbs || '',
        rr: selectedPatientObj.vitals.rr || '',
        painScore: selectedPatientObj.vitals.painScore || '',
      });
      toast.info(`Auto-populated vitals recorded for ${selectedPatientObj.fullname}!`);
    } else {
      setVitals({
        bp: '',
        pulse: '',
        temp: '',
        weight: '',
        height: '',
        spo2: '',
        rbs: '',
        rr: '',
        painScore: '',
      });
    }
  }, [selectedPatId]);

  // Card 5: Complaints Table Grid (Clean Empty Default)
  const [complaintsList, setComplaintsList] = useState([
    { id: 1, name: '', frequency: '', severity: '', duration: '', notes: '' },
  ]);

  // Card 6: Clinical Diagnosis Grid (Clean Empty Default)
  const [diagnosisList, setDiagnosisList] = useState([
    { id: 1, name: '', duration: '', date: formatDate(new Date()), showDateCalendar: false },
  ]);

  // Card 7: Prescribed Medication Roster (Rx Grid) (Clean Empty Default)
  const [medicinesList, setMedicinesList] = useState([
    { id: 1, name: '', dose: '', when: '', frequency: '', duration: '', notes: '' },
  ]);

  // Card 8: Prescribe Diagnostic Lab Scans (Clean Empty Default)
  const [labTestsList, setLabTestsList] = useState([
    { id: 1, name: '', notes: '' },
  ]);
  const [newTestInput, setNewTestInput] = useState('');

  // Card 9: Combined Patient Advice & Calendar Follow-Up Date State
  const [selectedAdviceTemplate, setSelectedAdviceTemplate] = useState('');
  const [advice, setAdvice] = useState('');

  // Default Calendar Date: Today + 7 Days
  const defaultFutureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [calendarFollowUpDate, setCalendarFollowUpDate] = useState(defaultFutureDate);
  const [computedFollowUpDate, setComputedFollowUpDate] = useState(formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));

  const [activeDropdown, setActiveDropdown] = useState(null);

  // References to input elements for seamless column-to-column auto-focusing
  const cellRefs = useRef({});

  const setCellRef = (grid, rowId, colName, el) => {
    const key = `${grid}_${rowId}_${colName}`;
    if (el) cellRefs.current[key] = el;
  };

  const focusNextCell = (grid, rowId, nextCol) => {
    const key = `${grid}_${rowId}_${nextCol}`;
    setTimeout(() => {
      if (cellRefs.current[key]) {
        cellRefs.current[key].focus();
        if (['comp', 'freq', 'sev', 'dur', 'diag', 'name', 'dose', 'when', 'test', 'cond', 'hist'].includes(nextCol)) {
          setActiveDropdown({ id: rowId, col: nextCol, grid });
        } else {
          setActiveDropdown(null);
        }
      }
    }, 50);
  };

  // Add Custom Allergy to Master Option List & Auto Select
  const handleAddCustomAllergy = () => {
    if (!customAllergyInput.trim()) {
      toast.error('Please type allergy name first!');
      return;
    }
    const val = customAllergyInput.trim();
    if (!allergiesMasterList.includes(val)) {
      setAllergiesMasterList([...allergiesMasterList, val]);
    }
    if (!selectedAllergies.includes(val)) {
      setSelectedAllergies([...selectedAllergies.filter((a) => a !== 'No Known Allergies (NKDA)'), val]);
    }
    setCustomAllergyInput('');
    toast.success(`Added & selected new allergy: "${val}"`);
  };

  // Add Custom Addiction to Master Option List & Auto Select
  const handleAddCustomAddiction = () => {
    if (!customAddictionInput.trim()) {
      toast.error('Please type addiction name first!');
      return;
    }
    const val = customAddictionInput.trim();
    if (!addictionMasterList.includes(val)) {
      setAddictionMasterList([...addictionMasterList, val]);
    }
    if (!selectedAddictions.includes(val)) {
      setSelectedAddictions([...selectedAddictions.filter((ad) => ad !== 'None / N/A'), val]);
    }
    setCustomAddictionInput('');
    toast.success(`Added & selected new addiction: "${val}"`);
  };

  // Add Custom History Condition Option to Master
  const handleAddCustomHistoryOption = () => {
    if (!customHistoryInput.trim()) {
      toast.error('Please type medical/surgical condition name first!');
      return;
    }
    const val = customHistoryInput.trim();
    if (!pastHistoryMasterList.includes(val)) {
      setPastHistoryMasterList([...pastHistoryMasterList, val]);
    }
    setCustomHistoryInput('');
    toast.success(`Added "${val}" to Past History options!`);
  };

  const handleAddHistoryRow = () => {
    const newId = Date.now();
    setPastHistoryList([...pastHistoryList, { id: newId, condition: '', duration: '1 Year', notes: '' }]);
  };

  // Add Custom Lab Scan Option to Master List
  const handleAddCustomTestOption = () => {
    if (!newTestInput.trim()) {
      toast.error('Please type lab scan name first!');
      return;
    }
    const testName = newTestInput.trim().toUpperCase();
    if (!labTestsMasterList.includes(testName)) {
      setLabTestsMasterList([testName, ...labTestsMasterList]);
    }
    setNewTestInput('');
    toast.success(`Added "${testName}" to Diagnostic Master Options!`);
  };

  const handleAddLabTestRow = () => {
    const newId = Date.now();
    setLabTestsList([...labTestsList, { id: newId, name: '', notes: '' }]);
  };

  const handleSelectAdviceTemplate = (tplText) => {
    setSelectedAdviceTemplate(tplText);
    if (tplText) {
      setAdvice(tplText);
    }
  };

  const handleSaveAdviceAsTemplate = () => {
    if (!advice.trim()) {
      toast.error('Please type advice text before saving as template!');
      return;
    }
    addAdviceTemplateMaster(advice.trim());
    toast.success('Saved custom advice as new template master in dropdown options!');
  };

  const patientAttachedReports = (selectedPatId && selectedPatId !== '')
    ? (reports || []).filter((r) => r.gsspatid.toString() === selectedPatId.toString())
    : [];

  const shouldShowReportsButton = Boolean(
    mounted &&
    selectedPatId &&
    selectedPatId !== '' &&
    patientAttachedReports &&
    patientAttachedReports.length > 0
  );

  // Sync Direct Calendar Date Selection
  const handleSelectCalendarDate = (dateVal) => {
    setCalendarFollowUpDate(dateVal);
    if (dateVal) {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        setComputedFollowUpDate(`${parts[2]}/${parts[1]}/${parts[0]}`);
      }
    }
  };

  const handleAddComplaintRow = () => {
    const newId = Date.now();
    setComplaintsList([...complaintsList, { id: newId, name: '', frequency: 'Daily', severity: 'Moderate', duration: '7 Days', notes: '' }]);
  };

  const handleAddDiagnosisRow = () => {
    const newId = Date.now();
    setDiagnosisList([...diagnosisList, { id: newId, name: '', duration: '1 Months', date: formatDate(new Date()), showDateCalendar: false }]);
  };

  const handleAddMedicineRow = () => {
    const newId = Date.now();
    setMedicinesList([...medicinesList, { id: newId, name: '', dose: '1 - 0 - 1', when: 'After Food', frequency: 'Daily', duration: '5 Days', notes: '' }]);
  };

  // Auto-Appending Row Helpers (Automatically appends the next row when data is filled in the last row!)
  const updatePastHistoryRow = (id, field, value) => {
    setPastHistoryList((prev) => {
      const nextList = prev.map((h) => (h.id === id ? { ...h, [field]: value } : h));
      const lastItem = nextList[nextList.length - 1];
      if (lastItem && (lastItem.condition.trim() !== '' || lastItem.notes.trim() !== '')) {
        nextList.push({ id: Date.now() + Math.random(), condition: '', duration: '', notes: '' });
      }
      return nextList;
    });
  };

  const updateComplaintRow = (id, field, value) => {
    setComplaintsList((prev) => {
      const nextList = prev.map((c) => (c.id === id ? { ...c, [field]: value } : c));
      const lastItem = nextList[nextList.length - 1];
      if (lastItem && (lastItem.name.trim() !== '' || lastItem.notes.trim() !== '')) {
        nextList.push({ id: Date.now() + Math.random(), name: '', frequency: '', severity: '', duration: '', notes: '' });
      }
      return nextList;
    });
  };

  const updateDiagnosisRow = (id, field, value) => {
    setDiagnosisList((prev) => {
      const nextList = prev.map((d) => (d.id === id ? { ...d, [field]: value } : d));
      const lastItem = nextList[nextList.length - 1];
      if (lastItem && lastItem.name.trim() !== '') {
        nextList.push({ id: Date.now() + Math.random(), name: '', duration: '', date: formatDate(new Date()), showDateCalendar: false });
      }
      return nextList;
    });
  };

  const updateMedicineRow = (id, field, value) => {
    setMedicinesList((prev) => {
      const nextList = prev.map((m) => (m.id === id ? { ...m, [field]: value } : m));
      const lastItem = nextList[nextList.length - 1];
      if (lastItem && (lastItem.name.trim() !== '' || lastItem.notes.trim() !== '')) {
        nextList.push({ id: Date.now() + Math.random(), name: '', dose: '', when: '', frequency: '', duration: '', notes: '' });
      }
      return nextList;
    });
  };

  const updateLabTestRow = (id, field, value) => {
    setLabTestsList((prev) => {
      const nextList = prev.map((t) => (t.id === id ? { ...t, [field]: value } : t));
      const lastItem = nextList[nextList.length - 1];
      if (lastItem && (lastItem.name.trim() !== '' || lastItem.notes.trim() !== '')) {
        nextList.push({ id: Date.now() + Math.random(), name: '', notes: '' });
      }
      return nextList;
    });
  };

  const handleSaveAndPrint = (e) => {
    e.preventDefault();

    if (!selectedPatId) {
      toast.error('Please select a Checked-In patient from queue!');
      return;
    }

    const patientObj = (patients || []).find((p) => p.gsspatid.toString() === selectedPatId.toString());
    if (!patientObj) {
      toast.error('Patient profile record not found!');
      return;
    }

    // Format Complaints text
    const complaintsFormatted = complaintsList
      .filter((c) => c.name.trim())
      .map((c) => `${c.name} (${c.frequency}) - Note: ${c.notes || 'N/A'}`)
      .join(', ');

    // Format Diagnosis text
    const diagnosisFormatted = diagnosisList
      .filter((d) => d.name.trim())
      .map((d) => d.name)
      .join(', ');

    // Format Lab Tests List
    const testsPrescribedArray = labTestsList
      .filter((t) => t.name && t.name.trim())
      .map((t) => t.notes ? `${t.name} (${t.notes})` : t.name);

    const rxData = {
      rxNo: `RX-${Date.now().toString().slice(-4)}`,
      date: formatDate(new Date()),
      gsspatid: patientObj.gsspatid,
      regId: patientObj.regId || `REG-${patientObj.gsspatid}`,
      uhid: patientObj.regId || `REG-${patientObj.gsspatid}`,
      fullname: `${patientObj.title || 'Mr.'} ${patientObj.fullname}`,
      ageGender: `${patientObj.age || 40} Yrs / ${patientObj.gender || 'Male'}`,
      mobile: patientObj.mobileno,
      doctor: doctorName,
      allergy: selectedAllergies.length > 0 ? selectedAllergies.join(', ') : 'No Known Allergies (NKDA)',
      addiction: selectedAddictions.length > 0 ? selectedAddictions.join(', ') : 'None / N/A',
      pastHistory: pastHistoryList.filter((h) => h.condition.trim()),
      vitals,
      complaints: complaintsFormatted || 'General Checkup',
      diagnosis: diagnosisFormatted || 'Clinical Evaluation',
      medicines: medicinesList.map((m) => ({
        name: m.name,
        dosage: m.dose,
        timing: m.when,
        duration: m.duration,
        notes: m.notes,
      })),
      testsPrescribed: testsPrescribedArray,
      advice,
      followUpDate: computedFollowUpDate,
    };

    const newRx = createPrescription(rxData);
    toast.success(`Prescription issued for ${patientObj.fullname}! Patient status marked as Checked-Out.`);
    router.push(`/print/prescriptions/${newRx.rxNo}`);
  };

  return (
    <div className="space-y-6" onClick={() => setActiveDropdown(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl font-bold">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
              Create E-Prescription (Rx)
            </h1>
          </div>
        </div>

        {shouldShowReportsButton && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setShowReportsModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg animate-pulse"
            >
              <Paperclip className="w-4 h-4 mr-1.5" />
              View Attached Reports ({patientAttachedReports.length})
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveAndPrint} className="space-y-5" onClick={(e) => e.stopPropagation()}>
        
        {/* Patient & Prescribing Doctor Details (TEAL ACCENT) */}
        <Card className="p-4 border-l-4 border-l-teal-500 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Patient & Prescribing Doctor Details
            </h3>
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-extrabold" suppressHydrationWarning>
              Checked-In Patients Queue: ({checkedInPatients.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                Select Checked-In Patient *
              </label>
              <select
                value={selectedPatId}
                onChange={(e) => setSelectedPatId(e.target.value)}
                className="h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 font-bold text-slate-900 dark:text-slate-100"
                required
                suppressHydrationWarning
              >
                <option value="">-- Choose Checked-In Patient --</option>
                {checkedInPatients.map((p) => (
                  <option key={p.gsspatid} value={p.gsspatid}>
                    {p.regId || `REG-${p.gsspatid}`} - {p.title} {p.fullname} ({p.gender}, {p.age}Y) - {p.mobileno}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                Prescribing Doctor *
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 font-bold"
                required
              />
            </div>
          </div>
        </Card>

        {/* Clinical Vitals */}
        {prescriptionFieldControls?.showPatientVitals !== false && (
          <Card className="p-4 space-y-4 border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Clinical Vitals
              </h3>
              {selectedPatientObj?.vitals && (
                <Badge className="bg-emerald-600 text-white font-mono text-[10px] px-2 py-0.5">
                  ✓ Auto-Populated from Vitals Intake Inbox
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
              {vitalsCfg.showBP && (
                <Input label="BP" value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })} className="h-8 text-xs p-1.5 font-bold" />
              )}
              {vitalsCfg.showPulse && (
                <Input label="Pulse" value={vitals.pulse} onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })} className="h-8 text-xs p-1.5 font-bold" />
              )}
              {vitalsCfg.showTemp && (
                <Input label="Temp (°F)" value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} className="h-8 text-xs p-1.5 font-bold" />
              )}
              {vitalsCfg.showWeight && (
                <Input label="Weight (kg)" value={vitals.weight} onChange={(e) => setVitals({ ...vitals, weight: e.target.value })} className="h-8 text-xs p-1.5 font-bold" />
              )}
              {vitalsCfg.showHeight && (
                <Input label="Height (cm)" value={vitals.height} onChange={(e) => setVitals({ ...vitals, height: e.target.value })} className="h-8 text-xs p-1.5 font-bold" />
              )}
              {vitalsCfg.showSpO2 && (
                <Input label="SpO2 (%)" value={vitals.spo2} onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })} className="h-8 text-xs p-1.5 font-bold" />
              )}
              {vitalsCfg.showRBS && (
                <Input label="RBS (mg/dL)" value={vitals.rbs} onChange={(e) => setVitals({ ...vitals, rbs: e.target.value })} className="h-8 text-xs p-1.5 font-bold" />
              )}
              {vitalsCfg.showRR && (
                <Input label="RR (/min)" value={vitals.rr} onChange={(e) => setVitals({ ...vitals, rr: e.target.value })} className="h-8 text-xs p-1.5 font-bold" />
              )}
              {vitalsCfg.showPainScore && (
                <Input label="Pain (0-10)" value={vitals.painScore} onChange={(e) => setVitals({ ...vitals, painScore: e.target.value })} className="h-8 text-xs p-1.5 font-bold" />
              )}
            </div>
          </Card>
        )}

        {/* Allergies & Addictions */}
        {prescriptionFieldControls?.showAllergiesAddictions !== false && (
          <Card className={`p-4 space-y-4 border-l-4 border-l-amber-500 relative transition-all duration-300 ${
            activeDropdown?.grid === 'allergy' || activeDropdown?.grid === 'addiction' ? 'pb-44' : ''
          }`}>
            <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Ban className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Allergies & Addictions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Patient Allergy Info (Search & Select Dropdown with Below Chips) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5 text-amber-500" /> Patient Allergy Info
                  </label>
                  <Badge variant="outline" className="border-amber-200 text-amber-700 bg-white font-bold text-[10px]">
                    {selectedAllergies.length} Selected
                  </Badge>
                </div>

                {/* Master Add Bar for Allergy */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Add new allergy option to master..."
                    value={customAllergyInput}
                    onChange={(e) => setCustomAllergyInput(e.target.value)}
                    className="flex-1 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2.5 font-medium text-slate-900 dark:text-slate-100"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomAllergy}
                    className="h-8 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-3 shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add to Master
                  </Button>
                </div>

                {/* Searchable Floating Input Field */}
                <div className="relative">
                  <input
                    type="text"
                    value={allergySearchTerm}
                    onChange={(e) => {
                      setAllergySearchTerm(e.target.value);
                      if (activeDropdown?.grid !== 'allergy') setActiveDropdown({ grid: 'allergy' });
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown?.grid === 'allergy' ? null : { grid: 'allergy' });
                    }}
                    placeholder="Search & select patient allergy..."
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 font-bold text-slate-900 dark:text-slate-100"
                  />

                  {/* Floating Dropdown Overlay Popup */}
                  {activeDropdown?.grid === 'allergy' && (
                    <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-1">
                      {allergiesMasterList
                        .filter((opt) => opt.toLowerCase().includes((allergySearchTerm || '').toLowerCase()))
                        .map((opt) => {
                          const isSelected = selectedAllergies.includes(opt);
                          return (
                            <div
                              key={opt}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSelected) {
                                  setSelectedAllergies(selectedAllergies.filter((a) => a !== opt));
                                } else {
                                  setSelectedAllergies([...selectedAllergies.filter((a) => a !== 'No Known Allergies (NKDA)'), opt]);
                                }
                                setActiveDropdown(null);
                                setAllergySearchTerm('');
                              }}
                              className={`px-3 py-1.5 text-xs rounded-lg font-bold cursor-pointer flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-extrabold'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <span className="text-amber-700 dark:text-amber-400 font-black">✓</span>}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Selected Allergy Chips Displayed BELOW the Input Field */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {selectedAllergies.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => setSelectedAllergies(selectedAllergies.filter((a) => a !== item))}
                        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 font-bold ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

              </div>

              {/* Patient Addiction Info (Search & Select Dropdown with Below Chips) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Patient Addiction Info
                  </label>
                  <Badge variant="outline" className="border-amber-200 text-amber-700 bg-white font-bold text-[10px]">
                    {selectedAddictions.length} Selected
                  </Badge>
                </div>

                {/* Master Add Bar for Addiction */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Add new addiction option to master..."
                    value={customAddictionInput}
                    onChange={(e) => setCustomAddictionInput(e.target.value)}
                    className="flex-1 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2.5 font-medium text-slate-900 dark:text-slate-100"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomAddiction}
                    className="h-8 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-3 shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add to Master
                  </Button>
                </div>

                {/* Searchable Floating Input Field */}
                <div className="relative">
                  <input
                    type="text"
                    value={addictionSearchTerm}
                    onChange={(e) => {
                      setAddictionSearchTerm(e.target.value);
                      if (activeDropdown?.grid !== 'addiction') setActiveDropdown({ grid: 'addiction' });
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown?.grid === 'addiction' ? null : { grid: 'addiction' });
                    }}
                    placeholder="Search & select patient addiction..."
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 font-bold text-slate-900 dark:text-slate-100"
                  />

                  {/* Floating Dropdown Overlay Popup */}
                  {activeDropdown?.grid === 'addiction' && (
                    <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-1">
                      {addictionMasterList
                        .filter((opt) => opt.toLowerCase().includes((addictionSearchTerm || '').toLowerCase()))
                        .map((opt) => {
                          const isSelected = selectedAddictions.includes(opt);
                          return (
                            <div
                              key={opt}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isSelected) {
                                  setSelectedAddictions(selectedAddictions.filter((ad) => ad !== opt));
                                } else {
                                  setSelectedAddictions([...selectedAddictions.filter((ad) => ad !== 'None / N/A'), opt]);
                                }
                                setActiveDropdown(null);
                                setAddictionSearchTerm('');
                              }}
                              className={`px-3 py-1.5 text-xs rounded-lg font-bold cursor-pointer flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-200 font-extrabold'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <span className="text-amber-700 dark:text-amber-400 font-black">✓</span>}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Selected Addiction Chips Displayed BELOW the Input Field */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {selectedAddictions.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => setSelectedAddictions(selectedAddictions.filter((ad) => ad !== item))}
                        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 font-bold ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

              </div>

            </div>
          </Card>
        )}

        {/* Past Medical & Surgical History (VIOLET ACCENT) */}
        {prescriptionFieldControls?.showPastHistory !== false && (
          <Card className="p-4 space-y-3 border-l-4 border-l-violet-500 relative overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Past Medical & Surgical History
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {/* Compact Inline Add to Master Controls */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    placeholder="Add condition to master..."
                    value={customHistoryInput}
                    onChange={(e) => setCustomHistoryInput(e.target.value)}
                    className="w-36 sm:w-44 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-xs px-2 font-medium bg-white dark:bg-slate-900"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomHistoryOption}
                    className="h-7 text-[11px] font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-2.5 shrink-0 shadow-sm"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add to Master
                  </Button>
                </div>
              </div>
            </div>

            {/* 3-Column History Table with Floating Searchable Dropdowns & Auto-Focus */}
            <div className={`w-full overflow-x-auto transition-all duration-200 ${activeDropdown?.grid === 'hist' ? 'pb-48' : ''}`}>
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl min-w-[600px]">
                <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-8 text-center">#</th>
                    <th className="p-2">Past Medical & Surgical History</th>
                    <th className="p-2 w-36">Duration</th>
                    <th className="p-2">Clinical Notes / Remarks</th>
                    <th className="p-2 w-8 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {pastHistoryList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2 font-bold text-center">{idx + 1}</td>
                      
                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('hist', item.id, 'cond', el)}
                          type="text"
                          value={item.condition}
                          onChange={(e) => updatePastHistoryRow(item.id, 'condition', e.target.value)}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'cond', grid: 'hist' }); }}
                          placeholder="Search/Select condition..."
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold text-slate-900 dark:text-slate-100"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'cond' && activeDropdown?.grid === 'hist' && (
                          <div className="absolute left-0 top-full mt-1 w-80 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {pastHistoryMasterList
                              .filter((opt) => opt.toLowerCase().includes((item.condition || '').toLowerCase()))
                              .map((opt) => (
                                <div
                                  key={opt}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updatePastHistoryRow(item.id, 'condition', opt);
                                    focusNextCell('hist', item.id, 'dur');
                                  }}
                                  className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold rounded"
                                >
                                  {opt}
                                </div>
                              ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('hist', item.id, 'dur', el)}
                          type="text"
                          placeholder="e.g. 1 Year, 6 Months..."
                          value={item.duration}
                          onChange={(e) => {
                            const val = e.target.value;
                            updatePastHistoryRow(item.id, 'duration', val);
                            setActiveDropdown({ id: item.id, col: 'dur', grid: 'hist' });
                          }}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'dur', grid: 'hist' }); }}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'dur' && activeDropdown?.grid === 'hist' && (
                          <div className="absolute left-0 top-full mt-1 w-36 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {getDynamicDurationOptions(item.duration).map((d) => (
                              <div
                                key={d}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updatePastHistoryRow(item.id, 'duration', d);
                                  focusNextCell('hist', item.id, 'notes');
                                }}
                                className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-semibold rounded text-slate-800 dark:text-slate-200"
                              >
                                {d}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1">
                        <input
                          ref={(el) => setCellRef('hist', item.id, 'notes', el)}
                          type="text"
                          placeholder="Enter history note..."
                          value={item.notes}
                          onChange={(e) => updatePastHistoryRow(item.id, 'notes', e.target.value)}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-medium"
                        />
                      </td>

                      <td className="p-1 text-center">
                        {pastHistoryList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPastHistoryList(pastHistoryList.filter((h) => h.id !== item.id))}
                            className="text-rose-500 hover:text-rose-700 p-1 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Complaints Table Grid (ORANGE ACCENT) */}
        {prescriptionFieldControls?.showComplaints !== false && (
          <Card className="p-4 space-y-3 border-l-4 border-l-orange-500 relative overflow-visible">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Complaints
              </h3>
            </div>

            <div className={`w-full overflow-x-auto transition-all duration-200 ${activeDropdown?.grid === 'comp' ? 'pb-48' : ''}`}>
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 min-w-[650px]">
                <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-8 text-center">#</th>
                    <th className="p-2">Complaints</th>
                    <th className="p-2">Frequency</th>
                    <th className="p-2">Severity</th>
                    <th className="p-2">Duration</th>
                    <th className="p-2">Complaint Note / Remark</th>
                    <th className="p-2 w-8 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {complaintsList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2 font-bold text-center">{idx + 1}</td>
                      
                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('comp', item.id, 'comp', el)}
                          type="text"
                          value={item.name}
                          onChange={(e) => updateComplaintRow(item.id, 'name', e.target.value)}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'comp', grid: 'comp' }); }}
                          placeholder="Search/Select complaint..."
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'comp' && activeDropdown?.grid === 'comp' && (
                          <div className="absolute left-0 top-full mt-1 w-64 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {complaintsOptions
                              .filter((opt) => opt.toLowerCase().includes((item.name || '').toLowerCase()))
                              .map((opt) => (
                                <div
                                  key={opt}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateComplaintRow(item.id, 'name', opt);
                                    focusNextCell('comp', item.id, 'freq');
                                  }}
                                  className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-semibold rounded"
                                >
                                  {opt}
                                </div>
                              ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('comp', item.id, 'freq', el)}
                          type="text"
                          value={item.frequency}
                          onChange={(e) => updateComplaintRow(item.id, 'frequency', e.target.value)}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'freq', grid: 'comp' }); }}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'freq' && activeDropdown?.grid === 'comp' && (
                          <div className="absolute left-0 top-full mt-1 w-40 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {FREQ_OPTIONS.map((f) => (
                              <div
                                key={f}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateComplaintRow(item.id, 'frequency', f);
                                  focusNextCell('comp', item.id, 'sev');
                                }}
                                className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-semibold rounded"
                              >
                                {f}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('comp', item.id, 'sev', el)}
                          type="text"
                          value={item.severity}
                          onChange={(e) => updateComplaintRow(item.id, 'severity', e.target.value)}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'sev', grid: 'comp' }); }}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'sev' && activeDropdown?.grid === 'comp' && (
                          <div className="absolute left-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 border rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {SEVERITY_OPTIONS.map((s) => (
                              <div
                                key={s}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateComplaintRow(item.id, 'severity', s);
                                  focusNextCell('comp', item.id, 'dur');
                                }}
                                className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-semibold rounded"
                              >
                                {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('comp', item.id, 'dur', el)}
                          type="text"
                          placeholder="e.g. 3 Days, 1 Week..."
                          value={item.duration}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateComplaintRow(item.id, 'duration', val);
                            setActiveDropdown({ id: item.id, col: 'dur', grid: 'comp' });
                          }}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'dur', grid: 'comp' }); }}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'dur' && activeDropdown?.grid === 'comp' && (
                          <div className="absolute left-0 top-full mt-1 w-36 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {getDynamicDurationOptions(item.duration).map((d) => (
                              <div
                                key={d}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateComplaintRow(item.id, 'duration', d);
                                  focusNextCell('comp', item.id, 'notes');
                                }}
                                className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-semibold rounded text-slate-800 dark:text-slate-200"
                              >
                                {d}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1">
                        <input
                          ref={(el) => setCellRef('comp', item.id, 'notes', el)}
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateComplaintRow(item.id, 'notes', e.target.value)}
                          placeholder="Enter complaint note..."
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-medium"
                        />
                      </td>

                      <td className="p-1 text-center">
                        {complaintsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setComplaintsList(complaintsList.filter((c) => c.id !== item.id))}
                            className="text-rose-500 hover:text-rose-700 p-1 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Clinical Diagnosis Grid (INDIGO ACCENT) */}
        {prescriptionFieldControls?.showDiagnosis !== false && (
          <Card className="p-4 space-y-3 border-l-4 border-l-indigo-500 relative overflow-visible">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Clinical Diagnosis Grid
              </h3>
            </div>

            <div className={`w-full overflow-x-auto transition-all duration-200 ${activeDropdown?.grid === 'diag' ? 'pb-48' : ''}`}>
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 min-w-[500px]">
                <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-8 text-center">#</th>
                    <th className="p-2">Clinical Diagnosis Name</th>
                    <th className="p-2 w-36">Duration</th>
                    <th className="p-2 w-8 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {diagnosisList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2 font-bold text-center">{idx + 1}</td>
                      
                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('diag', item.id, 'diag', el)}
                          type="text"
                          value={item.name}
                          onChange={(e) => updateDiagnosisRow(item.id, 'name', e.target.value)}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'diag', grid: 'diag' }); }}
                          placeholder="Search/Select diagnosis..."
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold text-slate-900 dark:text-slate-100"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'diag' && activeDropdown?.grid === 'diag' && (
                          <div className="absolute left-0 top-full mt-1 w-72 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {diagnosisOptions
                              .filter((opt) => opt.toLowerCase().includes((item.name || '').toLowerCase()))
                              .map((opt) => (
                                <div
                                  key={opt}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateDiagnosisRow(item.id, 'name', opt);
                                    focusNextCell('diag', item.id, 'dur');
                                  }}
                                  className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold rounded"
                                >
                                  {opt}
                                </div>
                              ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('diag', item.id, 'dur', el)}
                          type="text"
                          placeholder="e.g. 1 Month, 1 Year..."
                          value={item.duration}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDiagnosisRow(item.id, 'duration', val);
                            setActiveDropdown({ id: item.id, col: 'dur', grid: 'diag' });
                          }}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'dur', grid: 'diag' }); }}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'dur' && activeDropdown?.grid === 'diag' && (
                          <div className="absolute left-0 top-full mt-1 w-36 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {getDynamicDurationOptions(item.duration).map((d) => (
                              <div
                                key={d}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateDiagnosisRow(item.id, 'duration', d);
                                  setActiveDropdown(null);
                                }}
                                className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-semibold rounded text-slate-800 dark:text-slate-200"
                              >
                                {d}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1 text-center">
                        {diagnosisList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setDiagnosisList(diagnosisList.filter((d) => d.id !== item.id))}
                            className="text-rose-500 hover:text-rose-700 p-1 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Prescribed Medication Roster (Rx Grid) (EMERALD ACCENT) */}
        {prescriptionFieldControls?.showMedicines !== false && (
          <Card className="p-4 space-y-3 border-l-4 border-l-emerald-500 relative overflow-visible">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Prescribed Medication
              </h3>
            </div>

            <div className={`w-full overflow-x-auto transition-all duration-200 ${activeDropdown?.grid === 'rx' ? 'pb-48' : ''}`}>
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 min-w-[750px]">
                <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-8 text-center">#</th>
                    <th className="p-2">Medicine Name & Formulation</th>
                    <th className="p-2">Dose</th>
                    <th className="p-2">When</th>
                    <th className="p-2">Frequency</th>
                    <th className="p-2">Duration</th>
                    <th className="p-2">Medicine Notes</th>
                    <th className="p-2 w-8 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {medicinesList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2 font-bold text-center">{idx + 1}</td>
                      
                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('rx', item.id, 'name', el)}
                          type="text"
                          value={item.name}
                          onChange={(e) => updateMedicineRow(item.id, 'name', e.target.value)}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'name', grid: 'rx' }); }}
                          placeholder="Search medicine..."
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold text-slate-900 dark:text-slate-100"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'name' && activeDropdown?.grid === 'rx' && (
                          <div className="absolute left-0 top-full mt-1 w-72 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {medicinesOptions
                              .filter((opt) => opt.toLowerCase().includes((item.name || '').toLowerCase()))
                              .map((opt) => (
                                <div
                                  key={opt}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateMedicineRow(item.id, 'name', opt);
                                    focusNextCell('rx', item.id, 'dose');
                                  }}
                                  className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold rounded"
                                >
                                  {opt}
                                </div>
                              ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('rx', item.id, 'dose', el)}
                          type="text"
                          value={item.dose}
                          onChange={(e) => updateMedicineRow(item.id, 'dose', e.target.value)}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'dose', grid: 'rx' }); }}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-mono font-bold text-emerald-700"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'dose' && activeDropdown?.grid === 'rx' && (
                          <div className="absolute left-0 top-full mt-1 w-32 bg-white dark:bg-slate-900 border rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {DOSE_OPTIONS.map((d) => (
                              <div
                                key={d}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateMedicineRow(item.id, 'dose', d);
                                  focusNextCell('rx', item.id, 'when');
                                }}
                                className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold rounded font-mono"
                              >
                                {d}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('rx', item.id, 'when', el)}
                          type="text"
                          value={item.when}
                          onChange={(e) => updateMedicineRow(item.id, 'when', e.target.value)}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'when', grid: 'rx' }); }}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'when' && activeDropdown?.grid === 'rx' && (
                          <div className="absolute left-0 top-full mt-1 w-40 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {WHEN_OPTIONS.map((w) => (
                              <div
                                key={w}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateMedicineRow(item.id, 'when', w);
                                  focusNextCell('rx', item.id, 'freq');
                                }}
                                className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-semibold rounded"
                              >
                                {w}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('rx', item.id, 'freq', el)}
                          type="text"
                          value={item.frequency}
                          onChange={(e) => updateMedicineRow(item.id, 'frequency', e.target.value)}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'freq', grid: 'rx' }); }}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'freq' && activeDropdown?.grid === 'rx' && (
                          <div className="absolute left-0 top-full mt-1 w-36 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {FREQ_OPTIONS.map((f) => (
                              <div
                                key={f}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateMedicineRow(item.id, 'frequency', f);
                                  focusNextCell('rx', item.id, 'duration');
                                }}
                                className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-semibold rounded"
                              >
                                {f}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1 relative">
                        <input
                          ref={(el) => setCellRef('rx', item.id, 'duration', el)}
                          type="text"
                          placeholder="e.g. 5 Days, 10 Days..."
                          value={item.duration}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateMedicineRow(item.id, 'duration', val);
                            setActiveDropdown({ id: item.id, col: 'duration', grid: 'rx' });
                          }}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'duration', grid: 'rx' }); }}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'duration' && activeDropdown?.grid === 'rx' && (
                          <div className="absolute left-0 top-full mt-1 w-36 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {getDynamicDurationOptions(item.duration).map((d) => (
                              <div
                                key={d}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateMedicineRow(item.id, 'duration', d);
                                  focusNextCell('rx', item.id, 'notes');
                                }}
                                className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-semibold rounded text-slate-800 dark:text-slate-200"
                              >
                                {d}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1">
                        <input
                          ref={(el) => setCellRef('rx', item.id, 'notes', el)}
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateMedicineRow(item.id, 'notes', e.target.value)}
                          placeholder="Note..."
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-medium"
                        />
                      </td>

                      <td className="p-1 text-center">
                        {medicinesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setMedicinesList(medicinesList.filter((m) => m.id !== item.id))}
                            className="text-rose-500 hover:text-rose-700 p-1 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* PRESCRIBE DIAGNOSTIC LAB SCANS (SKY ACCENT) */}
        {prescriptionFieldControls?.showLabTests !== false && (
          <Card className="p-4 space-y-3 border-l-4 border-l-sky-500 relative overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Diagnostic Lab Scans
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {/* Compact Inline Add to Master Controls */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    placeholder="Add new test to master..."
                    value={newTestInput}
                    onChange={(e) => setNewTestInput(e.target.value)}
                    className="w-36 sm:w-44 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-xs px-2 font-medium bg-white dark:bg-slate-900"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomTestOption}
                    className="h-7 text-[11px] font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-2.5 shrink-0 shadow-sm"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add to Master
                  </Button>
                </div>
              </div>
            </div>

            {/* Table Grid for Diagnostic Tests (With Notes Column) */}
            <div className={`w-full overflow-x-auto transition-all duration-200 ${activeDropdown?.grid === 'test' ? 'pb-48' : ''}`}>
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-xl min-w-[550px]">
                <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-8 text-center">#</th>
                    <th className="p-2">Diagnostic Test Name</th>
                    <th className="p-2">Special Instructions / Notes</th>
                    <th className="p-2 w-8 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {labTestsList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2 font-bold text-center">{idx + 1}</td>
                      
                      <td className="p-1 relative">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateLabTestRow(item.id, 'name', e.target.value)}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: item.id, col: 'name', grid: 'test' }); }}
                          placeholder="Search/Select diagnostic test..."
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-bold text-slate-900 dark:text-slate-100"
                        />
                        {activeDropdown?.id === item.id && activeDropdown?.col === 'name' && activeDropdown?.grid === 'test' && (
                          <div className="absolute left-0 top-full mt-1 w-80 max-h-44 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-1">
                            {labTestsMasterList
                              .filter((opt) => opt.toLowerCase().includes((item.name || '').toLowerCase()))
                              .map((opt) => (
                                <div
                                  key={opt}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateLabTestRow(item.id, 'name', opt);
                                    setActiveDropdown(null);
                                  }}
                                  className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold rounded text-slate-800 dark:text-slate-200"
                                >
                                  {opt}
                                </div>
                              ))}
                          </div>
                        )}
                      </td>

                      <td className="p-1">
                        <input
                          type="text"
                          placeholder="e.g. Fasting, Urgent, Morning sample..."
                          value={item.notes}
                          onChange={(e) => updateLabTestRow(item.id, 'notes', e.target.value)}
                          className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2 font-medium"
                        />
                      </td>

                      <td className="p-1 text-center">
                        {labTestsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setLabTestsList(labTestsList.filter((t) => t.id !== item.id))}
                            className="text-rose-500 hover:text-rose-700 p-1 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Dynamic Grid: Patient Advice & Recommended Follow-Up Schedule (BLUE ACCENT) */}
        {(prescriptionFieldControls?.showAdviceNotes !== false || prescriptionFieldControls?.showFollowUpDate !== false) && (
          <Card className="p-4 space-y-4 border-l-4 border-l-blue-500">
            <div className={`grid grid-cols-1 ${
              prescriptionFieldControls?.showAdviceNotes !== false && prescriptionFieldControls?.showFollowUpDate !== false
                ? 'md:grid-cols-2'
                : 'grid-cols-1'
            } gap-5`}>
              
              {/* Patient Advice & Master Template Dropdown */}
              {prescriptionFieldControls?.showAdviceNotes !== false && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Patient Advice & Instructions
                    </h3>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveAdviceAsTemplate}
                      className="h-8 text-[11px] font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-3 shadow-sm"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 mr-1" /> Save as New Template
                    </Button>
                  </div>

                  {/* Master Advice Template Dropdown */}
                  <div>
                    <select
                      value={selectedAdviceTemplate}
                      onChange={(e) => handleSelectAdviceTemplate(e.target.value)}
                      className="w-full h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-2.5 font-bold text-slate-900 dark:text-slate-100"
                      suppressHydrationWarning
                    >
                      <option value="">-- Choose Master Advice Template --</option>
                      {(adviceTemplatesMaster || []).map((tpl, idx) => (
                        <option key={idx} value={tpl}>
                          Template {idx + 1}: {tpl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    rows={4}
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    placeholder="Type custom patient advice, dietary instructions, do's & don'ts..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              {/* Recommended Follow-Up Schedule (Calendar Date Selection Only!) */}
              {prescriptionFieldControls?.showFollowUpDate !== false && (
                <div className="space-y-3">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Next Follow-Up Recommended Schedule
                    </h3>
                  </div>

                  <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Select Follow-Up Date from Calendar *
                      </label>
                      <input
                        type="date"
                        value={calendarFollowUpDate}
                        onChange={(e) => handleSelectCalendarDate(e.target.value)}
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Scheduled Visit Date:</span>
                      <span className="font-mono font-extrabold text-teal-700 dark:text-teal-300 text-sm">
                        {computedFollowUpDate || 'Not Selected'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </Card>
        )}

        {/* PERMANENT FORM ACTION BAR (Always visible regardless of Master Settings section toggles) */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-t-2 border-t-teal-500 flex flex-col sm:flex-row items-center justify-end gap-3 shadow-lg">
          <Button
            type="submit"
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-xl px-8 py-3 transition-all transform hover:scale-[1.01]"
          >
            <Printer className="w-4 h-4 mr-2" /> Save & Issue E-Prescription (Rx)
          </Button>
        </Card>
      </form>

      {/* View Attached Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-950/30">
              <div>
                <h3 className="text-sm font-extrabold uppercase text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-purple-600" /> Patient Attached Reports ({patientAttachedReports.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Reports attached for {selectedPatientObj?.fullname} ({selectedPatientObj?.regId})
                </p>
              </div>
              <button type="button" onClick={() => setShowReportsModal(false)} className="text-slate-400 hover:text-slate-600 p-1 font-bold">
                ✕
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {patientAttachedReports.map((r) => (
                <div key={r.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{r.fileName}</h4>
                      <p className="text-[10px] text-slate-500">{r.fileSize} • Uploaded: {r.uploadDate || 'Recent'} ({r.source || 'Local File'})</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActivePreviewReport(r)}
                    className="h-8 text-xs font-bold border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View Report
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePrescriptionPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-teal-600 font-bold text-sm">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Loading E-Prescription Creator...
        </div>
      </div>
    }>
      <PrescriptionFormContent />
    </Suspense>
  );
}
