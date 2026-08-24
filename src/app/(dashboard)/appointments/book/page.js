'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClinicStore, DOCTORS_MASTER_LIST } from '@/store/clinic-store';
import { Calendar, User, Clock, Check, ArrowLeft, Search, UserCheck, ShieldCheck, UserPlus, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

const TITLE_OPTIONS = ['Mr.', 'Mrs.', 'Miss', 'Master', 'Dr.', 'Prof.'];
const SHIFT_OPTIONS = ['Morning', 'Afternoon', 'Evening'];

// Helper to generate dynamic time slots based on shift timing & duration
function generateTimeSlots(shift, durationMinutes = 15) {
  const shiftRanges = {
    Morning: { start: '09:00', end: '13:00' },
    Afternoon: { start: '14:00', end: '17:00' },
    Evening: { start: '18:00', end: '21:00' },
  };

  const range = shiftRanges[shift] || shiftRanges.Morning;
  const [startH, startM] = range.start.split(':').map(Number);
  const [endH, endM] = range.end.split(':').map(Number);

  let current = new Date();
  current.setHours(startH, startM, 0, 0);

  const end = new Date();
  end.setHours(endH, endM, 0, 0);

  const slots = [];
  while (current < end) {
    const timeStr = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    slots.push(timeStr);
    current.setMinutes(current.getMinutes() + durationMinutes);
  }
  return slots;
}

// Check if a time slot has already passed for TODAY
function checkIsPastSlot(slotStr, appointmentDate) {
  const todayStr = new Date().toISOString().split('T')[0];
  if (appointmentDate !== todayStr) return false; // Future dates have no past slots

  const now = new Date();
  const parts = slotStr.trim().split(' ');
  if (parts.length < 2) return false;

  const [time, modifier] = parts;
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);

  return slotTime < now;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { patients, appointments, addAppointment, timeSlotSettings } = useClinicStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mode: 'new' vs 'registered'
  const [patientType, setPatientType] = useState('new'); // 'new' | 'registered'

  // Already Registered Search & Selection
  const [regSearchTerm, setRegSearchTerm] = useState('');
  const [selectedRegId, setSelectedRegId] = useState('');
  const [visitType, setVisitType] = useState('Follow-up'); // 'Follow-up' | 'Re-visit'

  // Demographics (New Patient)
  const [title, setTitle] = useState('Mr.');
  const [fullname, setFullname] = useState('');
  const [mobileno, setMobileno] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');

  // Appointment Details
  const [doctor, setDoctor] = useState(DOCTORS_MASTER_LIST[0]);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('Morning');
  const [selectedSlot, setSelectedSlot] = useState('');

  // Auto-Gender Selection based on Title
  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    if (newTitle === 'Mr.' || newTitle === 'Master') {
      setGender('Male');
    } else if (newTitle === 'Mrs.' || newTitle === 'Miss') {
      setGender('Female');
    }
  };

  // Generate Slots
  const slotDuration = timeSlotSettings?.slotDuration || 15;
  
  // 1. ALL SHIFTS TOTAL CAPACITY (Morning + Afternoon + Evening)
  const morningSlots = generateTimeSlots('Morning', slotDuration);
  const afternoonSlots = generateTimeSlots('Afternoon', slotDuration);
  const eveningSlots = generateTimeSlots('Evening', slotDuration);
  
  const allShiftsTotalSlotsCount = morningSlots.length + afternoonSlots.length + eveningSlots.length;

  // 2. ALL SHIFTS BOOKED APPOINTMENTS (All shifts for selected Doctor & Date)
  const allShiftsBookedApps = (appointments || []).filter(
    (a) =>
      a.doctor === doctor &&
      (a.date === appointmentDate || a.appointmentDate === appointmentDate)
  );
  const allShiftsBookedCount = allShiftsBookedApps.length;
  const allShiftsAvailableCount = Math.max(0, allShiftsTotalSlotsCount - allShiftsBookedCount);

  // 3. CURRENT SHIFT SPECIFIC SLOTS & BOOKINGS (Shift level)
  const currentShiftSlots = generateTimeSlots(selectedShift, slotDuration);
  const currentShiftBookedApps = (appointments || []).filter(
    (a) =>
      a.doctor === doctor &&
      (a.date === appointmentDate || a.appointmentDate === appointmentDate) &&
      (a.shift === selectedShift || !a.shift)
  );
  const currentShiftTotalCount = currentShiftSlots.length;
  const currentShiftBookedCount = currentShiftBookedApps.length;
  const currentShiftAvailableCount = Math.max(0, currentShiftTotalCount - currentShiftBookedCount);

  // Auto-select patient from registered list
  const handleSelectRegisteredPatient = (patId) => {
    setSelectedRegId(patId);
    if (!patId) return;
    const patObj = (patients || []).find((p) => p.gsspatid.toString() === patId.toString());
    if (patObj) {
      setTitle(patObj.title || 'Mr.');
      setFullname(patObj.fullname || '');
      setMobileno(patObj.mobileno || '');
      setAge(patObj.age ? patObj.age.toString() : '');
      setGender(patObj.gender || 'Male');
      toast.success(`Selected registered patient ${patObj.fullname} (${patObj.regId || `REG-${patObj.gsspatid}`})`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Global 10-Digit Mobile Validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileno)) {
      toast.error('Invalid Mobile Number! Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select an available Time Slot!');
      return;
    }

    // Double check past slot validation
    if (checkIsPastSlot(selectedSlot, appointmentDate)) {
      toast.error('Cannot book a past time slot! Please select an upcoming available slot.');
      return;
    }

    const appObj = addAppointment({
      title: patientType === 'new' ? title : (patients.find((p) => p.gsspatid.toString() === selectedRegId.toString())?.title || title),
      fullname: patientType === 'new' ? fullname : (patients.find((p) => p.gsspatid.toString() === selectedRegId.toString())?.fullname || fullname),
      mobileno,
      age: parseInt(age) || 30,
      gender,
      doctor,
      date: appointmentDate,
      shift: selectedShift,
      slotTime: selectedSlot,
      patientType,
      visitType: patientType === 'registered' ? visitType : 'New Consultation',
      regId: selectedRegId ? (patients.find((p) => p.gsspatid.toString() === selectedRegId.toString())?.regId || `REG-${selectedRegId}`) : null,
    });

    toast.success(`Consultation Appointment booked for ${fullname}! Slot: ${selectedShift} (${selectedSlot})`);
    router.push('/frontdesk');
  };

  return (
    <div className="w-full space-y-6">
      {/* Header & 3 Ultra-Compact Reduced-Width Light-Themed Metric Boxes */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl font-bold">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              Book Consultation Appointment
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dynamic Shift & Time Slot Booking Engine connected to Clinic Master Settings
            </p>
          </div>
        </div>

        {/* 3 Ultra-Compact Reduced-Width Metric Boxes (Total Slots, Booked Slots, Available Slots) */}
        <div className="grid grid-cols-3 gap-2 shrink-0" suppressHydrationWarning>
          
          {/* Box 1: Total Slots */}
          <div className="bg-teal-50/90 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-teal-200 dark:border-slate-700 shadow-sm w-24 sm:w-32 flex flex-col justify-between gap-0.5">
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase text-teal-800 dark:text-teal-300 tracking-wider truncate">
              Total Slots
            </span>
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-black font-mono text-teal-700 dark:text-teal-400">
                {mounted ? allShiftsTotalSlotsCount : 0}
              </span>
              <div className="p-0.5 rounded bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300">
                <CalendarDays className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Box 2: Booked Slots */}
          <div className="bg-rose-50/90 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-slate-700 shadow-sm w-24 sm:w-32 flex flex-col justify-between gap-0.5">
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase text-rose-800 dark:text-rose-300 tracking-wider truncate">
              Booked Slots
            </span>
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-black font-mono text-rose-700 dark:text-rose-400">
                {mounted ? allShiftsBookedCount : 0}
              </span>
              <div className="p-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                <AlertCircle className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Box 3: Available Slots */}
          <div className="bg-emerald-50/90 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-slate-700 shadow-sm w-24 sm:w-32 flex flex-col justify-between gap-0.5">
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider truncate">
              Available Slots
            </span>
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                {mounted ? allShiftsAvailableCount : 0}
              </span>
              <div className="p-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>
          </div>

        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 w-full">
        
        {/* 1. Patient Type Selector: New Patient vs Already Registered */}
        <Card className="p-4 border-l-4 border-l-purple-500 space-y-3">
          <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-600" /> 1. Select Patient Booking Category
          </CardTitle>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              patientType === 'new' ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}>
              <input
                type="radio"
                name="patType"
                checked={patientType === 'new'}
                onChange={() => setPatientType('new')}
                className="text-purple-600"
              />
              <UserPlus className="w-4 h-4 text-purple-600" /> New Patient (First Visit)
            </label>

            <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              patientType === 'registered' ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}>
              <input
                type="radio"
                name="patType"
                checked={patientType === 'registered'}
                onChange={() => setPatientType('registered')}
                className="text-purple-600"
              />
              <UserCheck className="w-4 h-4 text-purple-600" /> Already Registered Patient
            </label>
          </div>

          {/* Already Registered Patient Search System */}
          {patientType === 'registered' && (
            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 space-y-3 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase text-purple-900 dark:text-purple-300">
                    Search Registered Patient *
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Reg ID, Name, Mobile..."
                      value={regSearchTerm}
                      onChange={(e) => setRegSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-800 text-xs bg-white dark:bg-slate-900 font-medium"
                    />
                  </div>
                  {mounted && (
                    <select
                      value={selectedRegId}
                      onChange={(e) => handleSelectRegisteredPatient(e.target.value)}
                      className="w-full h-9 rounded-xl border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 text-xs p-2 font-bold text-slate-900 dark:text-slate-100 mt-1"
                      required
                      suppressHydrationWarning
                    >
                      <option value="">-- Pick Registered Patient --</option>
                      {(patients || [])
                        .filter((p) =>
                          (p.fullname || '').toLowerCase().includes(regSearchTerm.toLowerCase()) ||
                          (p.mobileno || '').includes(regSearchTerm) ||
                          (p.regId || '').toLowerCase().includes(regSearchTerm.toLowerCase())
                        )
                        .map((p) => (
                          <option key={p.gsspatid} value={p.gsspatid}>
                            {p.regId || `REG-${p.gsspatid}`} — {p.title} {p.fullname} ({p.mobileno})
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase text-purple-900 dark:text-purple-300">
                    Specify Visit Type *
                  </label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full h-9 rounded-xl border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 text-xs p-2 font-bold text-slate-900 dark:text-slate-100"
                  >
                    <option value="Follow-up">Follow-up (Checkup Visit)</option>
                    <option value="Re-visit">Re-visit (Wapas Dikhane Aaye)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 2. Patient Demographics Card */}
        <Card className="p-4 border-l-4 border-l-teal-500 space-y-4">
          <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-teal-900 dark:text-teal-300 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" /> 2. Patient Demographics & Contact
          </CardTitle>

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
          </div>
        </Card>

        {/* 3. Doctor, Date, Shift & Dynamic Time Slot Selection */}
        <Card className="p-4 border-l-4 border-l-rose-500 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-rose-900 dark:text-rose-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" /> 3. Doctor Consultation & Dynamic Time Slot Master
            </CardTitle>

            {/* Shift-Specific Real-Time Summary Count */}
            <div className="flex items-center gap-3.5 font-mono text-sm sm:text-base font-extrabold" suppressHydrationWarning>
              <span className="text-slate-700 dark:text-slate-300">Total: <strong className="text-sky-600">{currentShiftTotalCount}</strong></span>
              <span className="text-rose-600">Booked: <strong>{currentShiftBookedCount}</strong></span>
              <span className="text-emerald-600">Available: <strong>{currentShiftAvailableCount}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Select Doctor */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                Select Doctor *
              </label>
              <select
                value={doctor}
                onChange={(e) => {
                  setDoctor(e.target.value);
                  setSelectedSlot('');
                }}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 font-bold text-slate-900 dark:text-slate-100"
                required
              >
                {DOCTORS_MASTER_LIST.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Select Date */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                Appointment Date *
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setSelectedSlot('');
                }}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs px-3 font-mono font-bold text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            {/* Select Shift */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                Select Shift Master *
              </label>
              <select
                value={selectedShift}
                onChange={(e) => {
                  setSelectedShift(e.target.value);
                  setSelectedSlot('');
                }}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs p-2 font-bold text-slate-900 dark:text-slate-100"
              >
                {SHIFT_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s} Shift</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Available Time Slots Grid with Past Slot Blur/Disable Logic */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-extrabold uppercase">
              <span className="text-slate-700 dark:text-slate-300">
                DYNAMIC TIME SLOTS ({currentShiftAvailableCount} AVAILABLE / {currentShiftTotalCount} TOTAL - {slotDuration} MIN INTERVALS) *
              </span>
              {selectedSlot && (
                <span className="text-teal-600 font-extrabold font-mono text-xs">
                  ✓ Selected Slot: {selectedSlot}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {currentShiftSlots.map((slot) => {
                const isBooked = currentShiftBookedApps.some((a) => a.slotTime === slot);
                const isPast = checkIsPastSlot(slot, appointmentDate);
                const isDisabled = isBooked || isPast;
                const isSelected = selectedSlot === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                      isPast
                        ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 cursor-not-allowed opacity-40 blur-[0.3px] line-through'
                        : isBooked
                        ? 'bg-rose-50 text-rose-400 border-rose-200 cursor-not-allowed line-through opacity-70 dark:bg-rose-950/40 dark:border-rose-900'
                        : isSelected
                        ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-105'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                    }`}
                  >
                    {slot}
                    {isPast && <span className="block text-[9px] font-mono no-underline">(Passed)</span>}
                    {!isPast && isBooked && <span className="block text-[9px] font-mono no-underline">(Booked)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-lg px-8 py-2.5"
            >
              Confirm & Book Consultation Appointment
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
