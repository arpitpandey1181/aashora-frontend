'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, Check, DollarSign, CreditCard, Calendar, User, ArrowLeft, Paperclip, Send, Upload, FileText, CheckCircle2, MessageSquare, CheckSquare, Edit, RefreshCw, Filter, Percent, Printer, Sparkles, ChevronDown, Layers, X } from 'lucide-react';
import { useClinicStore, DOCTORS_MASTER_LIST } from '@/store/clinic-store';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const TITLE_OPTIONS = ['Mr.', 'Mrs.', 'Miss', 'Master', 'Dr.', 'Prof.'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const PAYMENT_MODES = ['Cash', 'UPI / QR Code', 'Card / POS', 'Net Banking', 'Due / Credit'];
const VISIT_TYPES = ['First Visit', 'Appointment', 'Follow-Up'];

export default function PatientRegistrationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { currentUser, patients, addPatient, updatePatient, appointments, addPatientReport } = useClinicStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Search & Date Filter States (Default to Today)
  const [importSearchTerm, setImportSearchTerm] = useState('');
  const [rosterSearchTerm, setRosterSearchTerm] = useState('');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);

  // 1. Patient Form State
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [importedAppId, setImportedAppId] = useState('');
  const [visitType, setVisitType] = useState('First Visit'); // 'First Visit', 'Appointment', 'Follow-Up'
  const [title, setTitle] = useState('Mr.');
  const [fullname, setFullname] = useState('');
  const [mobileno, setMobileno] = useState('');
  const [isSameWhatsApp, setIsSameWhatsApp] = useState(true);
  const [whatsappno, setWhatsappno] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [remark, setRemark] = useState('');

  // 2. Draft / Saved Patient Reference & Collapsible Grid Show/Hide Toggle States
  const [savedPatient, setSavedPatient] = useState(null);
  const [showPaymentGrid, setShowPaymentGrid] = useState(false);
  const [showReportsGrid, setShowReportsGrid] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  // 3. Payment & Billing State with Discount %, Discount Amount, Payment Mode, Doctor Ref & Payment Note (Default 0)
  const [regFee, setRegFee] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [doctorRef, setDoctorRef] = useState(DOCTORS_MASTER_LIST[0]);
  const [paymentNote, setPaymentNote] = useState('');

  // Handle Discount Percent Change
  const handleDiscountPercentChange = (val) => {
    const pct = Math.min(100, Math.max(0, Number(val)));
    setDiscountPercent(pct);
    const amt = Math.round((regFee * pct) / 100);
    setDiscountAmount(amt);
  };

  // Handle Discount Amount Change
  const handleDiscountAmountChange = (val) => {
    const amt = Math.min(regFee, Math.max(0, Number(val)));
    setDiscountAmount(amt);
    const pct = regFee > 0 ? parseFloat(((amt / regFee) * 100).toFixed(1)) : 0;
    setDiscountPercent(pct);
  };

  // Handle Reg Fee Change
  const handleRegFeeChange = (val) => {
    const fee = Math.max(0, Number(val));
    setRegFee(fee);
    const amt = Math.round((fee * discountPercent) / 100);
    setDiscountAmount(amt);
  };

  // 4. Attach Report Local State & Remove Report Handler
  const [attachedReportsList, setAttachedReportsList] = useState([]);

  const handleRemoveReport = (reportId) => {
    setAttachedReportsList(attachedReportsList.filter((r) => r.id !== reportId));
    toast.info('Report removed.');
  };

  // Auto-fill WhatsApp Number when Mobile Number changes if checkbox is checked
  useEffect(() => {
    if (isSameWhatsApp) {
      setWhatsappno(mobileno);
    }
  }, [mobileno, isSameWhatsApp]);

  // Calculated Net & Due Amount
  const netAmount = Math.max(0, regFee - discountAmount);
  const dueAmount = Math.max(0, netAmount - paidAmount);

  // Auto-Gender Selection based on Title
  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    if (newTitle === 'Mr.' || newTitle === 'Master') {
      setGender('Male');
    } else if (newTitle === 'Mrs.' || newTitle === 'Miss') {
      setGender('Female');
    }
  };

  // Import Pre-Booked Appointment OR Previous Registered Patient Details
  const handleImportRecord = (selectedKey) => {
    if (!selectedKey) return;

    if (selectedKey.startsWith('APP-')) {
      const appId = selectedKey.replace('APP-', '');
      setImportedAppId(appId);
      setVisitType('Appointment');
      const appObj = (appointments || []).find((a) => a.id.toString() === appId.toString());
      if (appObj) {
        setTitle(appObj.title || 'Mr.');
        setFullname(appObj.fullname || '');
        setMobileno(appObj.mobileno || '');
        setWhatsappno(appObj.mobileno || '');
        setAge(appObj.age ? appObj.age.toString() : '');
        setGender(appObj.gender || 'Male');
        if (appObj.doctor) setDoctorRef(appObj.doctor);
        toast.success(`Imported appointment details for ${appObj.fullname} (Visit Type: Appointment)`);
      }
    } else if (selectedKey.startsWith('PAT-')) {
      const patId = selectedKey.replace('PAT-', '');
      setVisitType('Follow-Up');
      const patObj = (patients || []).find((p) => p.gsspatid.toString() === patId.toString());
      if (patObj) {
        setTitle(patObj.title || 'Mr.');
        setFullname(patObj.fullname || '');
        setMobileno(patObj.mobileno || '');
        setWhatsappno(patObj.whatsappno || patObj.mobileno || '');
        setIsSameWhatsApp(patObj.whatsappno === patObj.mobileno || !patObj.whatsappno);
        setAge(patObj.age ? patObj.age.toString() : '');
        setGender(patObj.gender || 'Male');
        setAddress(patObj.address || '');
        setRemark(patObj.remark || '');
        if (patObj.doctorRef) setDoctorRef(patObj.doctorRef);
        if (patObj.paymentNote) setPaymentNote(patObj.paymentNote);
        toast.success(`Imported previous registration record for ${patObj.fullname} (Visit Type: Follow-Up)`);
      }
    }
  };

  // Filter appointments for import dropdown (Defaults to TODAY'S APPOINTMENTS, or filters by search query!)
  const todayAppointments = (appointments || []).filter(
    (a) => a.date === todayStr || a.appointmentDate === todayStr || !a.date
  );

  const importAppointmentsList = importSearchTerm.trim()
    ? (appointments || []).filter(
        (a) =>
          (a.fullname || '').toLowerCase().includes(importSearchTerm.toLowerCase()) ||
          (a.mobileno || '').includes(importSearchTerm) ||
          (a.id || '').toString().includes(importSearchTerm) ||
          (a.regId || '').toLowerCase().includes(importSearchTerm.toLowerCase())
      )
    : todayAppointments;

  // Handle Edit Patient Click from Table
  const handleEditPatient = (pat) => {
    setEditingPatientId(pat.gsspatid);
    setSavedPatient(pat);
    setIsFinalized(true);
    setShowPaymentGrid(true);
    setShowReportsGrid(true);
    setVisitType(pat.visitType || 'First Visit');
    setTitle(pat.title || 'Mr.');
    setFullname(pat.fullname || '');
    setMobileno(pat.mobileno || '');
    setWhatsappno(pat.whatsappno || pat.mobileno || '');
    setIsSameWhatsApp(pat.whatsappno === pat.mobileno || !pat.whatsappno);
    setAge(pat.age ? pat.age.toString() : '');
    setGender(pat.gender || 'Male');
    setAddress(pat.address || '');
    setRemark(pat.remark || '');
    setRegFee(pat.registrationFee !== undefined ? pat.registrationFee : 0);
    setDiscountAmount(pat.discount || 0);
    setPaidAmount(pat.paidAmount !== undefined ? pat.paidAmount : 0);
    if (pat.paymentMode) setPaymentMode(pat.paymentMode);
    if (pat.doctorRef) setDoctorRef(pat.doctorRef);
    if (pat.paymentNote) setPaymentNote(pat.paymentNote);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info(`Edit Mode activated for ${pat.fullname} (${pat.regId})`);
  };

  // Clear / Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditingPatientId(null);
    setSavedPatient(null);
    setIsFinalized(false);
    setVisitType('First Visit');
    setFullname('');
    setMobileno('');
    setWhatsappno('');
    setAge('');
    setAddress('');
    setRemark('');
    setPaymentNote('');
    toast.info('Cleared edit mode.');
  };

  // Step 1: Save Patient Details (Unlocks Payment & Reports Grid below)
  const handleSavePatientDetails = (e) => {
    e.preventDefault();

    // Global 10-Digit Mobile Validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileno)) {
      toast.error('Invalid Mobile Number! Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    const finalWhatsApp = isSameWhatsApp ? mobileno : whatsappno;
    if (!mobileRegex.test(finalWhatsApp)) {
      toast.error('Invalid WhatsApp Number! Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    const nextId = (patients || []).length > 0 ? Math.max(...patients.map((p) => p.gsspatid)) + 1 : 1001;
    const tempRegId = editingPatientId ? savedPatient?.regId : `REG-${nextId}`;

    const tempSavedObj = {
      gsspatid: editingPatientId || nextId,
      regId: tempRegId,
      title,
      fullname,
      mobileno,
      whatsappno: finalWhatsApp,
      age: parseInt(age) || 30,
      gender,
      address,
      remark,
      visitType,
      importedAppId,
    };

    setSavedPatient(tempSavedObj);
    setIsFinalized(false);
    setShowPaymentGrid(false);
    setShowReportsGrid(false);
    toast.success(`Patient Details Saved for ${fullname}! Click "Payment & Billing Details" or "Attach Medical Reports" below to open grid.`);
  };

  // Upload Report from System
  const handleUploadLocalReport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const patObj = savedPatient;
    if (!patObj) {
      toast.error('Please save patient details first!');
      return;
    }

    const newReport = {
      id: Date.now(),
      gsspatid: patObj.gsspatid,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      fileType: file.type.includes('image') ? 'image' : 'pdf',
      source: 'System Local Upload',
      uploadDate: formatDate(new Date()),
    };

    addPatientReport(newReport);
    setAttachedReportsList([...attachedReportsList, newReport]);
    toast.success(`Uploaded report "${file.name}" for ${patObj.fullname}`);
  };

  // Send WhatsApp Upload Link
  const handleSendWhatsAppUploadLink = () => {
    if (!savedPatient) return;
    const patNo = savedPatient.whatsappno || savedPatient.mobileno;
    const uploadLink = `https://aashoraclinic.com/upload-report?patId=${savedPatient.gsspatid}`;
    const msg = `Hello ${savedPatient.fullname}, please upload your medical lab reports using this secure link: ${uploadLink}`;

    window.open(`https://wa.me/91${patNo}?text=${encodeURIComponent(msg)}`, '_blank');
    toast.success(`WhatsApp upload link sent to +91 ${patNo}!`);
  };

  // Finalize Registration & Payment Completion (STRICT DUE AMOUNT DOCTOR REF VALIDATION!)
  const handleFinalizeRegistration = () => {
    if (!savedPatient) return;

    // STRICT CHECK: IF DUE AMOUNT > 0, DOCTOR REFERENCE MUST NOT BE EMPTY!
    if (dueAmount > 0 && (!doctorRef || doctorRef.trim() === '')) {
      toast.error('STRICT VALIDATION: Doctor Reference (Due Reference) is MANDATORY whenever there is a Due Payment Amount!');
      return;
    }

    const finalWhatsApp = isSameWhatsApp ? mobileno : whatsappno;

    if (editingPatientId) {
      // UPDATE EXISTING PATIENT
      updatePatient(editingPatientId, {
        title,
        fullname,
        mobileno,
        whatsappno: finalWhatsApp,
        age: parseInt(age) || 30,
        gender,
        address,
        remark,
        visitType,
        registrationFee: regFee,
        discountPercent,
        discount: discountAmount,
        netAmount,
        paidAmount,
        dueAmount,
        paymentMode,
        doctorRef,
        paymentNote,
        isFinalized: true,
      });
      toast.success(`Updated patient details & payment for ${fullname} (${savedPatient.regId})!`);
    } else {
      // CREATE NEW FINALIZED PATIENT (Now added to Roster Store & Payments)
      const newPat = addPatient({
        title,
        fullname,
        mobileno,
        whatsappno: finalWhatsApp,
        age: parseInt(age) || 30,
        gender,
        address,
        remark,
        visitType,
        registrationFee: regFee,
        discountPercent,
        discount: discountAmount,
        netAmount,
        paidAmount,
        dueAmount,
        paymentMode,
        doctorRef,
        paymentNote,
        importedAppId,
        status: 'Registered',
        checkInStatus: 'Registered',
        registrationdate: todayStr,
        isFinalized: true,
      });

      setSavedPatient(newPat);
      toast.success(`Registration & Payment completed for ${newPat.fullname}! Reg ID: ${newPat.regId}. You can now print the payment receipt.`);
    }

    setIsFinalized(true);
  };

  // Filter Registered Patients Roster (Doctor Data Isolation + Date Filter)
  const filteredRoster = (patients || [])
    .filter((p) => p.isFinalized !== false)
    .filter((p) => {
      const docRef = (p.doctorRef || '').toLowerCase();
      const curDocName = (currentUser?.doctorName || '').toLowerCase();
      const curFirstName = (currentUser?.doctorName || '').replace(/^dr\.\s*/i, '').trim().split(' ')[0].toLowerCase();

      const belongsToDoctor = !p.doctorRef || docRef.includes(curDocName) || docRef.includes(curFirstName);
      if (!belongsToDoctor) return false;

      const regDate = p.registrationdate || p.date || todayStr;
      const isWithinDate = (!fromDate || regDate >= fromDate) && (!toDate || regDate <= toDate);
      const isMatchingSearch =
        (p.fullname || '').toLowerCase().includes(rosterSearchTerm.toLowerCase()) ||
        (p.mobileno || '').includes(rosterSearchTerm) ||
        (p.gsspatid || '').toString().includes(rosterSearchTerm) ||
        (p.regId || '').toLowerCase().includes(rosterSearchTerm.toLowerCase());
      return isWithinDate && isMatchingSearch;
    });

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      
      {/* Top Header with Back to Front Desk Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/frontdesk')} className="rounded-xl font-bold border-slate-300">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              Patient Registration & Counter Billing
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              First Visit, Appointment & Follow-Up Registration with Payment Receipt Generation
            </p>
          </div>
        </div>

        {editingPatientId && (
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1 animate-pulse">
              Editing Mode ({savedPatient?.regId})
            </Badge>
            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 text-xs font-bold text-slate-600">
              Cancel Edit
            </Button>
          </div>
        )}
      </div>

      {/* 1. Search & Import Pre-Booked Appointment OR Previous Registration Record (DEFAULTS TO TODAY'S APPOINTMENTS!) */}
      <Card className="p-3.5 border-l-4 border-l-purple-500 space-y-2.5">
        <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" /> 1. Search & Import Pre-Booked Appointment / Previous Registration
        </CardTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
              Type Patient Name / Mobile Number / ID to Filter
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Type name, mobile, or Reg ID..."
                value={importSearchTerm}
                onChange={(e) => setImportSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-800 text-xs bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
              Select Record to Import Details (Default: Today&apos;s Appointments)
            </label>
            {mounted && (
              <select
                onChange={(e) => handleImportRecord(e.target.value)}
                className="w-full h-9 rounded-xl border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 text-xs p-2 font-bold text-slate-900 dark:text-slate-100"
                suppressHydrationWarning
              >
                <option value="">-- Choose Appointment or Previous Registration Record --</option>
                
                <optgroup label="📅 Pre-Booked Appointments (Today / Filtered)">
                  {importAppointmentsList.map((a) => (
                    <option key={`APP-${a.id}`} value={`APP-${a.id}`}>
                      Appointment: {a.fullname} ({a.mobileno}) - {a.doctor} ({a.slotTime}) [{a.date || 'Today'}]
                    </option>
                  ))}
                </optgroup>

                <optgroup label="👤 Previous Registered Patients">
                  {(patients || [])
                    .filter((p) =>
                      (p.fullname || '').toLowerCase().includes(importSearchTerm.toLowerCase()) ||
                      (p.mobileno || '').includes(importSearchTerm) ||
                      (p.regId || '').toLowerCase().includes(importSearchTerm.toLowerCase())
                    )
                    .map((p) => (
                      <option key={`PAT-${p.gsspatid}`} value={`PAT-${p.gsspatid}`}>
                        Registered Patient: {p.regId || `REG-${p.gsspatid}`} - {p.fullname} ({p.mobileno})
                      </option>
                    ))}
                </optgroup>
              </select>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Patient Registration Form (Step 1: Patient Demographics) */}
      <form onSubmit={handleSavePatientDetails}>
        <Card className="p-4 border-l-4 border-l-teal-500 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-teal-900 dark:text-teal-300 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" /> 2. Patient Demographics & Contact Info
            </CardTitle>
            {savedPatient && (
              <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                Draft Saved ({savedPatient.regId})
              </Badge>
            )}
          </div>

          {/* Visit Type Dropdown */}
          <div className="flex flex-col gap-1 max-w-xs">
            <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
              Registration Visit Type *
            </label>
            <select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 font-extrabold text-slate-900 dark:text-slate-100"
            >
              {VISIT_TYPES.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Title & Full Name */}
            <div className="flex flex-col gap-1 lg:col-span-2">
              <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                Title & Full Patient Name *
              </label>
              <div className="flex gap-2">
                <select
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-24 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 font-extrabold text-slate-900 dark:text-slate-100"
                >
                  {TITLE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Enter full patient name..."
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 font-bold text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            {/* Mobile (10-Digit Validation) */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                Mobile Number (10 Digits) *
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number..."
                value={mobileno}
                onChange={(e) => setMobileno(e.target.value.replace(/\D/g, ''))}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            {/* WhatsApp Number with Same Checkbox */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                  WhatsApp Number
                </label>
                <label className="flex items-center gap-1 text-[10px] text-teal-700 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSameWhatsApp}
                    onChange={(e) => setIsSameWhatsApp(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  Same as Mobile
                </label>
              </div>
              <input
                type="tel"
                maxLength={10}
                disabled={isSameWhatsApp}
                placeholder="10-digit WhatsApp number..."
                value={whatsappno}
                onChange={(e) => setWhatsappno(e.target.value.replace(/\D/g, ''))}
                className={`h-9 rounded-xl border text-xs p-2.5 font-mono font-bold ${
                  isSameWhatsApp
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200'
                }`}
              />
            </div>

            {/* Age */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                Age (Years) *
              </label>
              <input
                type="number"
                min={1}
                max={120}
                placeholder="Age..."
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 font-bold text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 font-bold text-slate-900 dark:text-slate-100"
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Address (EXTENDED WIDE SPAN TO FILL THE ROW RIGHT TO THE SIDE!) */}
            <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-2">
              <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                City / Address
              </label>
              <input
                type="text"
                placeholder="Enter city or address details..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 font-medium text-slate-900 dark:text-slate-100 w-full"
              />
            </div>
          </div>

          {/* Remark / Patient Note Text Box */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" /> Patient Remark / Note Box
            </label>
            <input
              type="text"
              placeholder="Enter patient notes, clinical remark, or special requirements..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 font-medium text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end pt-1 gap-2">
            {editingPatientId && (
              <Button type="button" variant="outline" onClick={handleCancelEdit} className="rounded-xl font-bold">
                Cancel Edit
              </Button>
            )}
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg px-6">
              <CheckSquare className="w-4 h-4 mr-2" />
              Save Patient Details (Unlock Payment & Reports)
            </Button>
          </div>
        </Card>
      </form>

      {/* 2 Full-Width Grid Cards Stacked Vertically with Collapsible Headers (Revealed after Save Patient Details is clicked!) */}
      {savedPatient && (
        <div className="space-y-4 animate-in fade-in-50">
          
          {/* Grid Card 1: Registration Payment & Billing Grid (Light Rose Theme with Thin Red Left Accent Line!) */}
          <Card className="border-l-4 border-l-rose-500 bg-rose-50/20 dark:bg-slate-900 shadow-sm overflow-hidden animate-in fade-in-50">
            <button
              type="button"
              onClick={() => setShowPaymentGrid(!showPaymentGrid)}
              className="w-full p-4 flex items-center justify-between border-b border-rose-100 dark:border-slate-800 text-left hover:bg-rose-50/40 transition-all cursor-pointer"
            >
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-rose-900 dark:text-rose-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-600" /> Payment & Billing Details
              </CardTitle>
              <ChevronDown className={`w-4 h-4 text-rose-600 transition-transform ${showPaymentGrid ? 'rotate-180' : ''}`} />
            </button>

            {showPaymentGrid && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  
                  {/* Registration Fee */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">Reg. Fee (₹)</label>
                    <input
                      type="number"
                      value={regFee}
                      onChange={(e) => handleRegFeeChange(e.target.value)}
                      className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Discount % */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-rose-600" /> Discount (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => handleDiscountPercentChange(e.target.value)}
                      placeholder="0%"
                      className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Discount Amount (₹) - ReadOnly */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">Discount (₹)</label>
                    <input
                      type="number"
                      readOnly
                      value={discountAmount}
                      className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs p-2.5 font-mono font-bold text-slate-600 dark:text-slate-300 cursor-not-allowed"
                    />
                  </div>

                  {/* Paid Amount */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">Paid Amount (₹)</label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2.5 font-mono font-bold text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Mode of Payment Dropdown */}
                  <div className="flex flex-col gap-1 lg:col-span-2">
                    <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">Mode of Payment *</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 font-bold text-slate-900 dark:text-slate-100"
                    >
                      {PAYMENT_MODES.map((mode) => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Side-By-Side Doctor Reference (Due Reference) & Payment Note / Billing Remark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Doctor Reference */}
                  <div className={`p-2.5 rounded-xl border flex flex-col gap-1 justify-between transition-all ${
                    dueAmount > 0 ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-300' : 'bg-white dark:bg-slate-900 border-rose-200'
                  }`}>
                    <label className="text-[11px] font-extrabold uppercase flex items-center justify-between">
                      <span className={dueAmount > 0 ? 'text-rose-900 dark:text-rose-200' : 'text-slate-700 dark:text-slate-300'}>
                        Doctor Reference (Due Reference) *
                      </span>
                      {dueAmount > 0 && (
                        <Badge className="bg-rose-600 text-white font-extrabold text-[9px]">
                          MANDATORY (DUE ₹{dueAmount})
                        </Badge>
                      )}
                    </label>
                    {mounted && (
                      <select
                        value={doctorRef}
                        onChange={(e) => setDoctorRef(e.target.value)}
                        className={`w-full h-9 rounded-xl border text-xs p-2 font-bold ${
                          dueAmount > 0 ? 'border-rose-400 bg-white text-rose-900 font-extrabold focus:ring-2 focus:ring-rose-500' : 'border-rose-200 bg-white text-slate-900 dark:text-slate-100'
                        }`}
                        required={dueAmount > 0}
                      >
                        <option value="">-- Choose Doctor Reference --</option>
                        {DOCTORS_MASTER_LIST.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Payment Note / Billing Remark */}
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 flex flex-col gap-1 justify-between">
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-rose-600" /> Payment Note / Billing Remark
                    </label>
                    <input
                      type="text"
                      placeholder="Enter billing remark or payment note..."
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 font-medium text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Calculated Summary Bar */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 flex flex-wrap items-center justify-between text-xs shadow-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Billing Summary:</span>
                  <div className="flex items-center gap-4 font-mono font-extrabold">
                    <span>Fee: ₹{regFee}</span>
                    <span>Discount: ₹{discountAmount} ({discountPercent}%)</span>
                    <span>Net Payable: ₹{netAmount}</span>
                    <span className={dueAmount > 0 ? 'text-rose-600 text-sm font-black' : 'text-emerald-600'}>
                      Due Amount: ₹{dueAmount}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Grid Card 2: Attach Patient Medical Reports Grid (Light Sky Theme!) */}
          <Card className="border-l-4 border-l-sky-500 bg-sky-50/20 dark:bg-slate-900 shadow-sm overflow-hidden animate-in fade-in-50">
            <button
              type="button"
              onClick={() => setShowReportsGrid(!showReportsGrid)}
              className="w-full p-4 flex items-center justify-between border-b border-sky-100 dark:border-slate-800 text-left hover:bg-sky-50/40 transition-all cursor-pointer"
            >
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-sky-900 dark:text-sky-300 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-sky-600" /> Attach Medical Reports
              </CardTitle>
              <ChevronDown className={`w-4 h-4 text-sky-600 transition-transform ${showReportsGrid ? 'rotate-180' : ''}`} />
            </button>

            {showReportsGrid && (
              <div className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-extrabold text-sky-900 dark:text-sky-300">
                    Upload Lab Reports / Previous Prescriptions
                  </span>

                  {/* Compact Inline Action Buttons */}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-all">
                      <Upload className="w-3.5 h-3.5" /> Upload Local Report
                      <input type="file" onChange={handleUploadLocalReport} className="hidden" accept="image/*,.pdf" />
                    </label>

                    <Button
                      size="sm"
                      onClick={handleSendWhatsAppUploadLink}
                      className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Send WhatsApp Link
                    </Button>
                  </div>
                </div>

                {/* Attached Files List with REMOVE ('X') Button */}
                {attachedReportsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {attachedReportsList.map((r) => (
                      <span key={r.id} className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-200 text-[11px] font-bold border border-sky-300 dark:border-sky-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-700" />
                        {r.fileName} ({r.fileSize})
                        <button
                          type="button"
                          onClick={() => handleRemoveReport(r.id)}
                          className="ml-1 text-rose-500 hover:text-rose-700 font-bold p-0.5 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-full transition-colors"
                          title="Remove Report"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium pt-1">
                    No medical reports attached yet. Click &quot;Upload Local Report&quot; or send WhatsApp link to attach patient lab files.
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Final Save Registration & Receipt Print Action Bar */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            
            {/* Print Payment Receipt Button */}
            {isFinalized && savedPatient && (
              <Button
                type="button"
                onClick={() => window.open(`/print/billing/${savedPatient.regId || `REG-${savedPatient.gsspatid}`}`, '_blank')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg px-6 py-2.5 flex items-center gap-1.5 animate-in zoom-in-95"
              >
                <Printer className="w-4 h-4" /> Print Payment Receipt (A4)
              </Button>
            )}

            {/* Final Save Button */}
            <Button
              onClick={handleFinalizeRegistration}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xl px-8 py-2.5 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isFinalized ? 'Update & Finalize Registration' : 'Final Save Registration & Complete Payment'}
            </Button>
          </div>

        </div>
      )}

      {/* 3. Registered Patients Roster */}
      <Card className="p-4 space-y-4 border-l-4 border-l-sky-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          
          {/* LEFT GROUP: Header Title + INLINE DATE RANGE CONTROLS (MOVED TO LEFT SIDE!) */}
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-sky-600" /> Registered Patients Roster ({mounted ? filteredRoster.length : 0})
            </CardTitle>

            {/* INLINE DATE RANGE CONTROLS (NO POPUP DROPDOWN!) */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <Filter className="w-3.5 h-3.5 text-teal-600 ml-1" />
              
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 font-mono font-bold text-[11px] text-slate-900 dark:text-slate-100 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 font-mono font-bold text-[11px] text-slate-900 dark:text-slate-100 shadow-sm"
                />
              </div>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => { setFromDate(todayStr); setToDate(todayStr); }}
                className="h-7 px-2.5 text-[10px] font-extrabold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-lg"
              >
                Reset Today
              </Button>
            </div>
          </div>

          {/* RIGHT GROUP: SEARCH BAR */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={rosterSearchTerm}
              onChange={(e) => setRosterSearchTerm(e.target.value)}
              placeholder="Search Reg ID, Name..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {mounted && filteredRoster.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-slate-500">
            No registered patients found for the selected date range. Complete patient registration and payment above to see records here.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[260px] overflow-y-auto border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-2.5">Reg ID</th>
                <th className="p-2.5">Patient Name</th>
                <th className="p-2.5">Visit Type</th>
                <th className="p-2.5">Mobile / WhatsApp</th>
                <th className="p-2.5">Doctor Ref</th>
                <th className="p-2.5">Payment Status</th>
                <th className="p-2.5">Routing Status</th>
                <th className="p-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {mounted && filteredRoster.map((p) => (
                <tr key={p.gsspatid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-bold font-mono text-teal-600">{p.regId || `REG-${p.gsspatid}`}</td>
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">{p.title} {p.fullname} ({p.gender}, {p.age}Y)</td>
                  <td className="p-2.5">
                    <Badge className={
                      p.visitType === 'Appointment'
                        ? 'bg-purple-600 text-white font-bold text-[10px]'
                        : p.visitType === 'Follow-Up'
                        ? 'bg-teal-600 text-white font-bold text-[10px]'
                        : 'bg-blue-600 text-white font-bold text-[10px]'
                    }>
                      {p.visitType || 'First Visit'}
                    </Badge>
                  </td>
                  <td className="p-2.5 font-mono">{p.mobileno} {p.whatsappno && <span className="text-[10px] text-teal-600 font-extrabold">(WA: {p.whatsappno})</span>}</td>
                  <td className="p-2.5 font-semibold text-purple-700">{p.doctorRef || 'General'}</td>
                  
                  {/* Payment Status (Paid vs Unpaid ONLY - No amounts) */}
                  <td className="p-2.5" suppressHydrationWarning>
                    {Number(p.paidAmount) > 0 ? (
                      <span className="w-24 h-6.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold flex items-center justify-center">
                        ✓ Paid
                      </span>
                    ) : (
                      <span className="w-24 h-6.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold flex items-center justify-center">
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="p-2.5">
                    <Badge className={
                      p.checkInStatus === 'Checked-Out'
                        ? 'bg-emerald-600 text-white'
                        : p.checkInStatus === 'Checked-In'
                        ? 'bg-teal-600 text-white'
                        : p.checkInStatus === 'Vitals Completed'
                        ? 'bg-teal-600 text-white'
                        : 'bg-amber-500 text-white'
                    }>
                      {p.checkInStatus || 'Registered'}
                    </Badge>
                  </td>
                  <td className="p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPatient(p)}
                        className="h-7 px-2.5 text-[11px] font-bold text-amber-700 border-amber-300 hover:bg-amber-50 rounded-lg flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3 text-amber-600" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/print/billing/${p.regId || `REG-${p.gsspatid}`}`, '_blank')}
                        className="h-7 px-2.5 text-[11px] font-bold text-purple-700 border-purple-300 hover:bg-purple-50 rounded-lg flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-purple-600" /> Receipt
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    </div>
  );
}
