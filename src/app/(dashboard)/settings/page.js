'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Clock, Save, ShieldCheck, Check, Calendar } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';
import { toast } from 'sonner';

const DURATION_OPTIONS = [10, 15, 20, 25, 30];
const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClinicSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { timeSlotSettings, updateTimeSlotSettings } = useClinicStore();

  const [slotDuration, setSlotDuration] = useState(15);
  const [shifts, setShifts] = useState({
    Morning: { start: '09:00', end: '13:00' },
    Afternoon: { start: '14:00', end: '17:00' },
    Evening: { start: '18:00', end: '21:00' },
  });
  const [workingDays, setWorkingDays] = useState(DAYS_LIST);

  useEffect(() => {
    setMounted(true);
    if (timeSlotSettings) {
      if (timeSlotSettings.slotDuration) setSlotDuration(timeSlotSettings.slotDuration);
      if (timeSlotSettings.shifts) setShifts(timeSlotSettings.shifts);
      if (timeSlotSettings.workingDays) setWorkingDays(timeSlotSettings.workingDays);
    }
  }, [timeSlotSettings]);

  const handleToggleDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateTimeSlotSettings({
      slotDuration,
      shifts,
      workingDays,
    });
    toast.success('Clinic Shift & Time Slot Master configuration saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Clinic Master Settings & Time Slot Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure Day-wise OPD Working Days, Shift Timings (Morning/Afternoon/Evening), and Dynamic Slot Durations.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5">
        
        {/* 1. Slot Duration Master */}
        <Card className="p-4 border-l-4 border-l-teal-500 space-y-3">
          <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-teal-900 dark:text-teal-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" /> 1. Appointment Slot Duration Master
          </CardTitle>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-400">
              Select Patient Consultation Slot Interval (Minutes)
            </label>
            <div className="flex flex-wrap gap-3">
              {DURATION_OPTIONS.map((min) => {
                const isSelected = slotDuration === min;
                return (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setSlotDuration(min)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-105'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200'
                    }`}
                  >
                    {min} Minutes
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* 2. Shift-wise Timing Setup Master */}
        <Card className="p-4 border-l-4 border-l-purple-500 space-y-4">
          <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" /> 2. Shift-wise OPD Operating Timing Master
          </CardTitle>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Morning Shift */}
            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2">
              <span className="text-xs font-extrabold uppercase text-purple-900 dark:text-purple-300">Morning Shift</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500">Start Time</span>
                  <input
                    type="time"
                    value={shifts.Morning.start}
                    onChange={(e) => setShifts({ ...shifts, Morning: { ...shifts.Morning, start: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-purple-300 px-2 font-mono font-bold bg-white text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500">End Time</span>
                  <input
                    type="time"
                    value={shifts.Morning.end}
                    onChange={(e) => setShifts({ ...shifts, Morning: { ...shifts.Morning, end: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-purple-300 px-2 font-mono font-bold bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Afternoon Shift */}
            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2">
              <span className="text-xs font-extrabold uppercase text-purple-900 dark:text-purple-300">Afternoon Shift</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500">Start Time</span>
                  <input
                    type="time"
                    value={shifts.Afternoon.start}
                    onChange={(e) => setShifts({ ...shifts, Afternoon: { ...shifts.Afternoon, start: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-purple-300 px-2 font-mono font-bold bg-white text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500">End Time</span>
                  <input
                    type="time"
                    value={shifts.Afternoon.end}
                    onChange={(e) => setShifts({ ...shifts, Afternoon: { ...shifts.Afternoon, end: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-purple-300 px-2 font-mono font-bold bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Evening Shift */}
            <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2">
              <span className="text-xs font-extrabold uppercase text-purple-900 dark:text-purple-300">Evening Shift</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500">Start Time</span>
                  <input
                    type="time"
                    value={shifts.Evening.start}
                    onChange={(e) => setShifts({ ...shifts, Evening: { ...shifts.Evening, start: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-purple-300 px-2 font-mono font-bold bg-white text-slate-900"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500">End Time</span>
                  <input
                    type="time"
                    value={shifts.Evening.end}
                    onChange={(e) => setShifts({ ...shifts, Evening: { ...shifts.Evening, end: e.target.value } })}
                    className="w-full h-8 rounded-lg border border-purple-300 px-2 font-mono font-bold bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Day-wise Working Schedule Master */}
        <Card className="p-4 border-l-4 border-l-amber-500 space-y-3">
          <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" /> 3. Day-wise Clinic Working Master
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
                    active
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {active ? `✓ ${day}` : day}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg px-6">
            <Save className="w-4 h-4 mr-2" /> Save Clinic Time Slot Master Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
