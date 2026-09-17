'use client';

import { useState, useEffect } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Clock,
  Save,
  UserCheck,
  Building2,
  CreditCard,
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Check,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Stethoscope,
  DollarSign,
  Phone,
  Mail,
  DoorOpen,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';
import { toast } from 'sonner';

const DURATION_OPTIONS = [10, 15, 20, 25, 30];
const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClinicMasterSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const {
    doctorsMaster,
    departmentsMaster,
    paymentModesMaster,
    serviceChargesMaster,
    prescriptionFieldControls,
    timeSlotSettings,
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
    updateTimeSlotSettings,
  } = useClinicStore();

  // Active Main Tab State (Default: Doctor Master)
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors', 'slots', 'rxFields', 'departments', 'payments'

  // --- TAB 1: DOCTOR MASTER STATE ---
  const [docSearch, setDocSearch] = useState('');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [docForm, setDocForm] = useState({
    doctorName: '',
    department: 'Cardiology',
    specialization: '',
    phone: '',
    email: '',
    opdRoom: 'OPD-101',
    consultationFee: 500,
    status: 'Active',
  });

  // --- TAB 2: TIME SLOT MASTER STATE ---
  const [slotDuration, setSlotDuration] = useState(15);
  const [maxPatientsPerSlot, setMaxPatientsPerSlot] = useState(4);
  const [shifts, setShifts] = useState({
    Morning: { start: '09:00', end: '13:00', enabled: true },
    Afternoon: { start: '14:00', end: '17:00', enabled: true },
    Evening: { start: '18:00', end: '21:00', enabled: true },
  });
  const [workingDays, setWorkingDays] = useState(DAYS_LIST);

  // --- TAB 3: PRESCRIPTION FIELDS CONTROL STATE ---
  const [rxControls, setRxControls] = useState({
    showHeader: true,
    showDoctorDetails: true,
    showPatientVitals: true,
    showComplaints: true,
    showDiagnosis: true,
    showMedicines: true,
    showAdviceNotes: true,
    showFollowUpDate: true,
    showSignature: true,
    showFooterNotice: true,
  });

  // --- TAB 4: DEPARTMENT MASTER STATE ---
  const [isDepModalOpen, setIsDepModalOpen] = useState(false);
  const [editingDepId, setEditingDepId] = useState(null);
  const [depForm, setDepForm] = useState({
    name: '',
    code: '',
    specializationsStr: '',
    status: 'Active',
  });

  // --- TAB 5: PAYMENT MODE & CHARGE MASTER STATE ---
  const [isChgModalOpen, setIsChgModalOpen] = useState(false);
  const [editingChgId, setEditingChgId] = useState(null);
  const [chgForm, setChgForm] = useState({
    serviceName: '',
    category: 'Consultation',
    amount: 500,
    status: 'Active',
  });
  const [newPmName, setNewPmName] = useState('');
  const [newPmType, setNewPmType] = useState('Digital');

  useEffect(() => {
    setMounted(true);
    if (timeSlotSettings) {
      if (timeSlotSettings.slotDuration) setSlotDuration(timeSlotSettings.slotDuration);
      if (timeSlotSettings.maxPatientsPerSlot) setMaxPatientsPerSlot(timeSlotSettings.maxPatientsPerSlot);
      if (timeSlotSettings.shifts) setShifts(timeSlotSettings.shifts);
      if (timeSlotSettings.workingDays) setWorkingDays(timeSlotSettings.workingDays);
    }
    if (prescriptionFieldControls) {
      setRxControls(prescriptionFieldControls);
    }
  }, [timeSlotSettings, prescriptionFieldControls]);

  // --- TAB 1 HANDLERS ---
  const handleOpenDocModal = (doc = null) => {
    if (doc) {
      setEditingDocId(doc.id);
      setDocForm({
        doctorName: doc.doctorName || '',
        department: doc.department || 'Cardiology',
        specialization: doc.specialization || '',
        phone: doc.phone || '',
        email: doc.email || '',
        opdRoom: doc.opdRoom || 'OPD-101',
        consultationFee: doc.consultationFee !== undefined ? doc.consultationFee : 500,
        status: doc.status || 'Active',
      });
    } else {
      setEditingDocId(null);
      setDocForm({
        doctorName: '',
        department: departmentsMaster?.[0]?.name || 'Cardiology',
        specialization: '',
        phone: '',
        email: '',
        opdRoom: `OPD-${101 + (doctorsMaster?.length || 0)}`,
        consultationFee: 500,
        status: 'Active',
      });
    }
    setIsDocModalOpen(true);
  };

  const handleSaveDoctor = (e) => {
    e.preventDefault();
    if (!docForm.doctorName.trim()) {
      toast.error('Please enter Doctor Name');
      return;
    }
    if (docForm.phone && docForm.phone.replace(/\D/g, '').length !== 10) {
      toast.error('Contact Number must be a valid 10-digit mobile number');
      return;
    }

    const docPayload = {
      ...docForm,
      doctorName: docForm.doctorName.trim(),
      phone: docForm.phone.replace(/\D/g, ''),
      consultationFee: Number(docForm.consultationFee) || 0,
      fullName: `${docForm.doctorName.trim()} (${docForm.specialization || docForm.department})`,
    };

    if (editingDocId) {
      updateDoctorMaster(editingDocId, docPayload);
      toast.success(`Updated Doctor Master profile for ${docPayload.doctorName}`);
    } else {
      addDoctorMaster(docPayload);
      toast.success(`Added new Doctor ${docPayload.doctorName} to Master Settings!`);
    }
    setIsDocModalOpen(false);
  };

  // --- TAB 2 HANDLERS ---
  const handleToggleShift = (shiftKey) => {
    setShifts((prev) => ({
      ...prev,
      [shiftKey]: {
        ...prev[shiftKey],
        enabled: !(prev[shiftKey]?.enabled !== false),
      },
    }));
  };

  const handleToggleDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSaveTimeSlots = (e) => {
    e.preventDefault();
    updateTimeSlotSettings({
      slotDuration,
      maxPatientsPerSlot,
      shifts,
      workingDays,
    });
    toast.success('Time Slot Master configuration saved successfully!');
  };

  // --- TAB 3 HANDLERS ---
  const handleToggleRxControl = (fieldKey) => {
    const updated = { ...rxControls, [fieldKey]: !rxControls[fieldKey] };
    setRxControls(updated);
    updatePrescriptionFieldControls(updated);
    toast.success('Prescription Fields Control updated live!');
  };

  // --- TAB 4 HANDLERS ---
  const handleOpenDepModal = (dep = null) => {
    if (dep) {
      setEditingDepId(dep.id);
      setDepForm({
        name: dep.name || '',
        code: dep.code || '',
        specializationsStr: Array.isArray(dep.specializations) ? dep.specializations.join(', ') : '',
        status: dep.status || 'Active',
      });
    } else {
      setEditingDepId(null);
      setDepForm({ name: '', code: '', specializationsStr: '', status: 'Active' });
    }
    setIsDepModalOpen(true);
  };

  const handleSaveDepartment = (e) => {
    e.preventDefault();
    if (!depForm.name.trim()) {
      toast.error('Please enter Department Name');
      return;
    }
    const specsArr = depForm.specializationsStr.split(',').map((s) => s.trim()).filter(Boolean);
    const depPayload = {
      name: depForm.name.trim(),
      code: depForm.code.trim().toUpperCase() || depForm.name.substring(0, 4).toUpperCase(),
      specializations: specsArr,
      status: depForm.status || 'Active',
    };

    if (editingDepId) {
      updateDepartmentMaster(editingDepId, depPayload);
      toast.success(`Department ${depPayload.name} updated!`);
    } else {
      addDepartmentMaster(depPayload);
      toast.success(`Department ${depPayload.name} created!`);
    }
    setIsDepModalOpen(false);
  };

  // --- TAB 5 HANDLERS ---
  const handleAddPaymentMode = (e) => {
    e.preventDefault();
    if (!newPmName.trim()) return;
    addPaymentModeMaster({ name: newPmName.trim(), type: newPmType, isDefault: false, extraChargePercent: 0, status: 'Active' });
    setNewPmName('');
    toast.success(`Added Payment Mode ${newPmName.trim()}`);
  };

  const handleOpenChgModal = (chg = null) => {
    if (chg) {
      setEditingChgId(chg.id);
      setChgForm({
        serviceName: chg.serviceName || '',
        category: chg.category || 'Consultation',
        amount: chg.amount || 0,
        status: chg.status || 'Active',
      });
    } else {
      setEditingChgId(null);
      setChgForm({ serviceName: '', category: 'Consultation', amount: 500, status: 'Active' });
    }
    setIsChgModalOpen(true);
  };

  const handleSaveServiceCharge = (e) => {
    e.preventDefault();
    if (!chgForm.serviceName.trim()) {
      toast.error('Please enter Service / Charge Name');
      return;
    }
    const chgPayload = {
      serviceName: chgForm.serviceName.trim(),
      category: chgForm.category,
      amount: Number(chgForm.amount) || 0,
      status: chgForm.status || 'Active',
    };

    if (editingChgId) {
      updateServiceChargeMaster(editingChgId, chgPayload);
      toast.success(`Updated Service Charge: ${chgPayload.serviceName}`);
    } else {
      addServiceChargeMaster(chgPayload);
      toast.success(`Added Service Charge: ${chgPayload.serviceName}`);
    }
    setIsChgModalOpen(false);
  };

  // Filter Doctors
  const filteredDoctors = (doctorsMaster || []).filter(
    (d) =>
      (d.doctorName || '').toLowerCase().includes(docSearch.toLowerCase()) ||
      (d.department || '').toLowerCase().includes(docSearch.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(docSearch.toLowerCase()) ||
      (d.phone || '').includes(docSearch)
  );

  return (
    <div className="space-y-5 w-full pb-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Settings & Configuration
          </h1>
        </div>
      </div>

      {/* Sub-Navigation Master Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'doctors'
              ? 'bg-teal-600 text-white shadow-md scale-105'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
          suppressHydrationWarning
        >
          <Stethoscope className="w-4 h-4" /> Doctors ({doctorsMaster?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('slots')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'slots'
              ? 'bg-indigo-600 text-white shadow-md scale-105'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" /> Time Slots
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rxFields')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rxFields'
              ? 'bg-sky-600 text-white shadow-md scale-105'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" /> Prescription Fields Control
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'departments'
              ? 'bg-cyan-600 text-white shadow-md scale-105'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
          suppressHydrationWarning
        >
          <Building2 className="w-4 h-4" /> Departments ({departmentsMaster?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-md scale-105'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Payment Modes & Charges
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: DOCTORS                             */}
      {/* ========================================== */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <Card className="p-4 border-l-4 border-l-teal-500 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider text-teal-900 dark:text-teal-300 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" /> Doctor Roster Configuration
                </CardTitle>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search doctor, department..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 font-medium"
                  />
                </div>
                <Button onClick={() => handleOpenDocModal()} className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shrink-0">
                  <Plus className="w-4 h-4 mr-1" /> Add New Doctor
                </Button>
              </div>
            </div>

            {/* Doctors Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDoctors.map((doc) => {
                const isActive = doc.status === 'Active';
                return (
                  <div
                    key={doc.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                        : 'bg-slate-100 dark:bg-slate-950/60 border-slate-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase">{doc.id}</span>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{doc.doctorName}</h3>
                        <p className="text-xs text-purple-600 font-bold">{doc.specialization || doc.department}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDoctorStatus(doc.id)}
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                        }`}
                      >
                        {isActive ? '✓ ACTIVE' : 'INACTIVE'}
                      </button>
                    </div>

                    <div className="space-y-1 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium"><Building2 className="w-3 h-3 text-slate-400" /> Department:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{doc.department}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium"><DoorOpen className="w-3 h-3 text-slate-400" /> OPD Room:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{doc.opdRoom || 'OPD-101'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium"><DollarSign className="w-3 h-3 text-emerald-600" /> Default OPD Fee:</span>
                        <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">₹{doc.consultationFee}</span>
                      </div>
                      {doc.phone && (
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-medium"><Phone className="w-3 h-3 text-slate-400" /> Contact:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{doc.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDocModal(doc)}
                        className="h-7 text-xs font-bold rounded-lg border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 bg-white dark:bg-slate-800"
                      >
                        <Edit2 className="w-3 h-3 mr-1 text-teal-600 dark:text-teal-400" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${doc.doctorName}?`)) {
                            deleteDoctorMaster(doc.id);
                            toast.success('Doctor removed from Master');
                          }
                        }}
                        className="h-7 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ADD / EDIT DOCTOR MODAL */}
          {isDocModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl space-y-4 border border-teal-500">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" /> {editingDocId ? 'Edit Doctor Profile' : 'Add New Doctor to Master'}
                  </h3>
                  <button onClick={() => setIsDocModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>

                <form onSubmit={handleSaveDoctor} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Doctor Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Ramesh Kumar"
                        value={docForm.doctorName}
                        onChange={(e) => setDocForm({ ...docForm, doctorName: e.target.value })}
                        className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs px-3 font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Department *</label>
                      <select
                        value={docForm.department}
                        onChange={(e) => setDocForm({ ...docForm, department: e.target.value })}
                        className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs px-3 font-bold bg-white dark:bg-slate-900"
                      >
                        {(departmentsMaster || []).map((dep) => (
                          <option key={dep.id} value={dep.name}>{dep.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Specialization</label>
                      <input
                        type="text"
                        placeholder="e.g. Cardiologist / Surgeon"
                        value={docForm.specialization}
                        onChange={(e) => setDocForm({ ...docForm, specialization: e.target.value })}
                        className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs px-3 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">OPD Consultation Fee (₹) *</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="500"
                        value={docForm.consultationFee}
                        onChange={(e) => setDocForm({ ...docForm, consultationFee: e.target.value })}
                        className="w-full h-9 rounded-xl border border-teal-300 text-xs px-3 font-mono font-extrabold text-teal-800 bg-teal-50/50"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Contact Number (10 Digits)</label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={docForm.phone}
                        onChange={(e) => setDocForm({ ...docForm, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs px-3 font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">OPD Room No.</label>
                      <input
                        type="text"
                        placeholder="e.g. OPD-101"
                        value={docForm.opdRoom}
                        onChange={(e) => setDocForm({ ...docForm, opdRoom: e.target.value })}
                        className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs px-3 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Email ID</label>
                    <input
                      type="email"
                      placeholder="doctor@clinic.com"
                      value={docForm.email}
                      onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                      className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs px-3 font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button type="button" variant="ghost" onClick={() => setIsDocModalOpen(false)} className="h-8 text-xs font-bold">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-8 text-xs rounded-xl">
                      Save Doctor Master Profile
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: TIME SLOT MASTER                    */}
      {/* ========================================== */}
      {activeTab === 'slots' && (
        <form onSubmit={handleSaveTimeSlots} className="space-y-4">
          <Card className="p-4 border-l-4 border-l-indigo-500 space-y-4">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Appointment Slot Duration & Capacity Master
            </CardTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Select Patient Consultation Slot Interval (Minutes)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {DURATION_OPTIONS.map((min) => {
                    const isSelected = slotDuration === min;
                    return (
                      <button
                        key={min}
                        type="button"
                        onClick={() => setSlotDuration(min)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-105'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200'
                        }`}
                      >
                        {min} Minutes
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Max Allowed Patient Bookings Per Slot
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxPatientsPerSlot}
                  onChange={(e) => setMaxPatientsPerSlot(Number(e.target.value))}
                  className="w-full h-9 rounded-xl border border-indigo-300 dark:border-indigo-800 text-xs px-3 font-mono font-bold bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </Card>

          {/* Shift Master */}
          <Card className="p-4 border-l-4 border-l-indigo-500 space-y-4">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Shift Timings Master Setup
            </CardTitle>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Morning', 'Afternoon', 'Evening'].map((shiftKey) => {
                const isEnabled = shifts[shiftKey]?.enabled !== false;
                return (
                  <div
                    key={shiftKey}
                    className={`p-3.5 rounded-2xl border space-y-3 transition-all ${
                      isEnabled
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900'
                        : 'bg-slate-100 dark:bg-slate-850 border-slate-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-indigo-200/50 pb-2">
                      <span className="text-xs font-black uppercase text-indigo-900 dark:text-indigo-300">{shiftKey} Shift</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggleShift(shiftKey)}
                          className="w-4 h-4 rounded border-indigo-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {isEnabled ? '✓ ENABLED' : 'OFF'}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500">Start Time</span>
                        <input
                          type="time"
                          disabled={!isEnabled}
                          value={shifts[shiftKey]?.start || '09:00'}
                          onChange={(e) => setShifts({ ...shifts, [shiftKey]: { ...shifts[shiftKey], start: e.target.value } })}
                          className="w-full h-8 rounded-lg border border-indigo-300 px-2 font-mono font-bold bg-white text-slate-900 disabled:bg-slate-200 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500">End Time</span>
                        <input
                          type="time"
                          disabled={!isEnabled}
                          value={shifts[shiftKey]?.end || '13:00'}
                          onChange={(e) => setShifts({ ...shifts, [shiftKey]: { ...shifts[shiftKey], end: e.target.value } })}
                          className="w-full h-8 rounded-lg border border-indigo-300 px-2 font-mono font-bold bg-white text-slate-900 disabled:bg-slate-200 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Working Days */}
          <Card className="p-4 border-l-4 border-l-teal-500 space-y-3">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-teal-900 dark:text-teal-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" /> Day-wise Clinic Working Schedule Master
            </CardTitle>

            <div className="flex flex-wrap gap-2 pt-1">
              {DAYS_LIST.map((day) => {
                const active = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      active ? 'bg-teal-600 text-white border-teal-700 shadow-sm' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {active ? `✓ ${day}` : day}
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg px-6">
              <Save className="w-4 h-4 mr-2" /> Save Time Slot Master Configuration
            </Button>
          </div>
        </form>
      )}

      {/* ========================================== */}
      {/* TAB 3: PRESCRIPTION FIELDS CONTROL         */}
      {/* ========================================== */}
      {activeTab === 'rxFields' && (
        <Card className="p-4 border-l-4 border-l-sky-500 space-y-4">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-wider text-sky-900 dark:text-sky-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" /> Prescription Print & Form Visibility Controls
            </CardTitle>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              { key: 'showDoctorDetails', label: 'Doctor Info & Reg No.', desc: 'Display doctor qualifications & room' },
              { key: 'showPatientVitals', label: 'Patient Vitals Section', desc: 'Display BP, Pulse, Weight, Temp' },
              { key: 'showAllergiesAddictions', label: 'Allergies & Addictions', desc: 'Display patient allergy & addiction info' },
              { key: 'showPastHistory', label: 'Past Medical & Surgical History', desc: 'Display past medical & surgical history' },
              { key: 'showComplaints', label: 'Chief Complaints Grid', desc: 'Display patient symptoms and duration' },
              { key: 'showDiagnosis', label: 'Clinical Diagnosis', desc: 'Display confirmed medical diagnosis' },
              { key: 'showMedicines', label: 'Medicines & Dosage Grid', desc: 'Display prescribed medicines roster' },
              { key: 'showLabTests', label: 'Diagnostic Lab Scans', desc: 'Display prescribed lab tests & scans' },
              { key: 'showAdviceNotes', label: 'Patient Advice & Instructions', desc: 'Display dietary & lifestyle instructions' },
              { key: 'showFollowUpDate', label: 'Next Follow-Up Date', desc: 'Display scheduled revisit date' },
              { key: 'showHeader', label: 'Clinic Print Header & Logo', desc: 'Display clinic brand banner on print header' },
              { key: 'showSignature', label: 'Doctor Print Signature & Stamp', desc: 'Display digital stamp & signature on print' },
            ].map((item) => {
              const isChecked = rxControls[item.key] !== false;
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleRxControl(item.key)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{item.label}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                  </div>
                  <button type="button" className={`text-xl ${isChecked ? 'text-sky-600' : 'text-slate-400'}`}>
                    {isChecked ? <ToggleRight className="w-8 h-8 text-sky-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ========================================== */}
      {/* TAB 4: DEPARTMENT MASTER                   */}
      {/* ========================================== */}
      {activeTab === 'departments' && (
        <Card className="p-4 border-l-4 border-l-cyan-500 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-cyan-900 dark:text-cyan-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-600" /> Department & Specialization Master
              </CardTitle>
            </div>
            <Button onClick={() => handleOpenDepModal()} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shrink-0">
              <Plus className="w-4 h-4 mr-1" /> Add New Department
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(departmentsMaster || []).map((dep) => (
              <div key={dep.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-mono font-bold text-[10px]">
                    {dep.code || dep.id}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDepModal(dep)}
                      className="h-7 px-2 text-xs font-bold rounded-lg border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 bg-white dark:bg-slate-800 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete department ${dep.name}?`)) deleteDepartmentMaster(dep.id);
                      }}
                      className="h-6 w-6 p-0 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{dep.name}</h3>

                <div className="flex flex-wrap gap-1 pt-1">
                  {(dep.specializations || []).map((spec, i) => (
                    <span key={i} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ADD / EDIT DEPARTMENT MODAL */}
          {isDepModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-md bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl space-y-4 border border-cyan-500">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-600" /> {editingDepId ? 'Edit Department' : 'Add Department'}
                  </h3>
                  <button onClick={() => setIsDepModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>

                <form onSubmit={handleSaveDepartment} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Department Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ophthalmology"
                      value={depForm.name}
                      onChange={(e) => setDepForm({ ...depForm, name: e.target.value })}
                      className="w-full h-9 rounded-xl border text-xs px-3 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Department Code</label>
                    <input
                      type="text"
                      placeholder="e.g. OPTH"
                      value={depForm.code}
                      onChange={(e) => setDepForm({ ...depForm, code: e.target.value })}
                      className="w-full h-9 rounded-xl border text-xs px-3 font-mono font-bold uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Specializations (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Eye Specialist, Cataract Surgeon"
                      value={depForm.specializationsStr}
                      onChange={(e) => setDepForm({ ...depForm, specializationsStr: e.target.value })}
                      className="w-full h-9 rounded-xl border text-xs px-3 font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button type="button" variant="ghost" onClick={() => setIsDepModalOpen(false)} className="h-8 text-xs font-bold">Cancel</Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-8 text-xs rounded-xl">
                      Save Department
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </Card>
      )}

      {/* ========================================== */}
      {/* TAB 5: PAYMENT MODE & CHARGE MASTER        */}
      {/* ========================================== */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Payment Modes Master */}
          <Card className="p-4 border-l-4 border-l-emerald-500 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Active Payment Modes Master
                </CardTitle>
              </div>

              <form onSubmit={handleAddPaymentMode} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New payment mode name..."
                  value={newPmName}
                  onChange={(e) => setNewPmName(e.target.value)}
                  className="h-8 rounded-xl border border-slate-200 dark:border-slate-700 text-xs px-2.5 font-bold w-48"
                />
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs rounded-xl">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(paymentModesMaster || []).map((pm) => {
                const active = pm.status === 'Active';
                return (
                  <div key={pm.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">{pm.name}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{pm.type || 'Direct'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => togglePaymentModeStatus(pm.id)}
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-all ${
                          active ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {active ? '✓ ACTIVE' : 'OFF'}
                      </button>

                      {!pm.isDefault && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete ${pm.name}?`)) deletePaymentModeMaster(pm.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Service Charges Master */}
          <Card className="p-4 border-l-4 border-l-emerald-500 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Default Service Charges Master
                </CardTitle>
              </div>
              <Button onClick={() => handleOpenChgModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shrink-0">
                <Plus className="w-4 h-4 mr-1" /> Add Service Charge
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(serviceChargesMaster || []).map((chg) => (
                <div key={chg.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{chg.category}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenChgModal(chg)}
                        className="h-7 px-2 text-xs font-bold rounded-lg border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 bg-white dark:bg-slate-800 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteServiceChargeMaster(chg.id)} className="h-6 w-6 p-0 text-rose-500">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">{chg.serviceName}</h3>
                  <div className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400">₹{chg.amount}</div>
                </div>
              ))}
            </div>

            {/* ADD / EDIT SERVICE CHARGE MODAL */}
            {isChgModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl space-y-4 border border-emerald-500">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> {editingChgId ? 'Edit Service Charge' : 'Add Service Charge'}
                    </h3>
                    <button onClick={() => setIsChgModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                  </div>

                  <form onSubmit={handleSaveServiceCharge} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Service / Charge Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. OPD Consultation Fee"
                        value={chgForm.serviceName}
                        onChange={(e) => setChgForm({ ...chgForm, serviceName: e.target.value })}
                        className="w-full h-9 rounded-xl border text-xs px-3 font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Category</label>
                      <select
                        value={chgForm.category}
                        onChange={(e) => setChgForm({ ...chgForm, category: e.target.value })}
                        className="w-full h-9 rounded-xl border text-xs px-3 font-bold bg-white dark:bg-slate-900"
                      >
                        <option value="Consultation">Consultation</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Procedure">Procedure</option>
                        <option value="Diagnostics">Diagnostics</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">Default Amount (₹) *</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="500"
                        value={chgForm.amount}
                        onChange={(e) => setChgForm({ ...chgForm, amount: e.target.value })}
                        className="w-full h-9 rounded-xl border border-emerald-300 text-xs px-3 font-mono font-black text-emerald-800 bg-emerald-50/50"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                      <Button type="button" variant="ghost" onClick={() => setIsChgModalOpen(false)} className="h-8 text-xs font-bold">Cancel</Button>
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs rounded-xl">
                        Save Charge
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
