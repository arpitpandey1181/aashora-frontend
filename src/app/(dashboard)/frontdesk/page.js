'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Inbox, UserPlus, Calendar, Search, CheckCircle, Clock, Activity, Check, ArrowRight, Users, Stethoscope, Sparkles, Zap } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';
import { patientService } from '@/services/patientService';
import { toast } from 'sonner';

export default function FrontDeskInboxPage() {
  const { currentUser, patients, setDbPatients, appointments, sendForVitals, checkInPatient, checkOutPatient } = useClinicStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [activeLocation, setActiveLocation] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('softycare_user');
      if (stored) {
        try {
          setUserInfo(JSON.parse(stored));
        } catch { }
      }

      const activeLocStr = localStorage.getItem('softycare_active_location');
      if (activeLocStr) {
        try { setActiveLocation(JSON.parse(activeLocStr)); } catch { }
      }

      const handleLocChange = (e) => {
        if (e.detail) {
          setActiveLocation(e.detail);
        }
      };

      window.addEventListener('softycare_location_changed', handleLocChange);

      // Live DB Patients fetch from backend API
      patientService.getAllPatients()
        .then((livePatients) => {
          if (livePatients && livePatients.length > 0) {
            setDbPatients(livePatients);
          }
        })
        .catch(() => {});

      return () => window.removeEventListener('softycare_location_changed', handleLocChange);
    }
  }, []);

  const loggedInEmpName = userInfo?.empname || userInfo?.empName || currentUser?.doctorName || 'CONSULTANT DOCTOR';
  const loggedInLocation = activeLocation?.locationname || userInfo?.locationname || userInfo?.locationName || 'MAIN BRANCH';
  const loggedInRole = userInfo?.proftype || userInfo?.designation || currentUser?.role || 'CONSULTANT DOCTOR';

  const handleSendForVitals = (patId, name) => {
    sendForVitals(patId);
    toast.success(`Patient ${name} routed to Vitals Inbox! Status updated to Pending Vitals.`);
  };

  const handleCheckInPatient = (patId, name) => {
    checkInPatient(patId);
    toast.success(`Patient ${name} Checked-In! Patient is now visible in Doctor Prescription Queue.`);
  };

  const handleCheckOutPatient = (patId, name) => {
    checkOutPatient(patId);
    toast.success(`Patient ${name} Checked-Out!`);
  };

  const filteredPatients = (patients || []).filter((p) => {
    if (activeLocation?.locationid && p.locationid) {
      if (String(p.locationid) !== String(activeLocation.locationid)) {
        return false;
      }
    }

    const docRef = (p.doctorRef || '').toLowerCase();
    const curDocName = (currentUser?.doctorName || '').toLowerCase();
    const curFirstName = (currentUser?.doctorName || '').replace(/^dr\.\s*/i, '').trim().split(' ')[0].toLowerCase();

    const belongsToDoctor =
      currentUser?.username === 'admin' ||
      !p.doctorRef ||
      docRef.includes(curDocName) ||
      docRef.includes(curFirstName) ||
      curDocName.includes(docRef);
    if (!belongsToDoctor) return false;

    const matchesSearch =
      (p.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.mobileno || '').includes(searchQuery) ||
      (p.gsspatid || '').toString().includes(searchQuery) ||
      (p.regId || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
            Front Desk
          </h1>
        </div>

        {/* 2 Primary Buttons: New Registration & Book Appointment */}
        <div className="flex items-center gap-3">
          <Link href="/patients">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md text-xs">
              <UserPlus className="w-4 h-4 mr-1.5" />
              New Registration
            </Button>
          </Link>

          <Link href="/appointments/book">
            <Button variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50 font-bold rounded-xl text-xs">
              <Calendar className="w-4 h-4 mr-1.5 text-teal-600" />
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Patient Queue Directory with Context-Aware Action Buttons */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 p-4">
          <div>
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" /> Registered Patient Roster ({mounted ? filteredPatients.length : 0})
            </CardTitle>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, Reg ID, Mobile..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 max-h-[260px] overflow-y-auto">
          {mounted && filteredPatients.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Patients in Queue</p>
              <p className="text-[11px] text-slate-400">Click &quot;New Registration&quot; above to register counter patients.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs align-middle">
              <thead className="bg-slate-100/90 dark:bg-slate-800/90 uppercase font-extrabold text-[10px] tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
                <tr>
                  <th className="p-2.5">Reg ID</th>
                  <th className="p-2.5">Patient</th>
                  <th className="p-2.5">Contact</th>
                  <th className="p-2.5">Doctor</th>
                  <th className="p-2.5 text-center">Slot</th>
                  <th className="p-2.5 text-center">Payment</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                {mounted && filteredPatients.map((p) => {
                  const status = p.checkInStatus || 'Registered';
                  const patApp = (appointments || []).find(
                    (a) =>
                      (a.regId && a.regId === p.regId) ||
                      (a.gsspatid && a.gsspatid.toString() === p.gsspatid.toString()) ||
                      (a.mobileno && a.mobileno === p.mobileno)
                  );
                  const allocatedSlot = patApp ? (patApp.slotTime || patApp.time) : null;

                  return (
                    <tr key={p.gsspatid} className="hover:bg-teal-50/30 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-2.5 font-bold font-mono text-teal-600 dark:text-teal-400" suppressHydrationWarning>{p.regId || `REG-${p.gsspatid}`}</td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white" suppressHydrationWarning>
                        {p.title} {p.fullname} ({p.gender}, {p.age}Y)
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 dark:text-slate-300" suppressHydrationWarning>{p.mobileno}</td>
                      <td className="p-2.5 font-semibold text-purple-700 dark:text-purple-300" suppressHydrationWarning>{p.doctorRef || 'General'}</td>
                      
                      {/* Allocated Time Slot Column */}
                      <td className="p-2.5 text-center" suppressHydrationWarning>
                        {allocatedSlot ? (
                          <span
                            className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-900 text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer hover:bg-teal-100 transition-all whitespace-nowrap"
                            onClick={() => window.location.href = `/appointments/book?patId=${p.gsspatid}`}
                            title={`Assigned Slot: ${allocatedSlot} (${patApp.shift || 'Shift'}). Click to edit.`}
                          >
                            <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                            {allocatedSlot}
                          </span>
                        ) : (
                          <Link
                            href={`/appointments/book?patId=${p.gsspatid}`}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 text-slate-500 text-[10px] font-semibold border border-slate-200 dark:border-slate-700 transition-all inline-flex items-center gap-1 whitespace-nowrap"
                            title="Click to assign time slot"
                          >
                            + Give Slot
                          </Link>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="p-2.5 text-center" suppressHydrationWarning>
                        {Number(p.paidAmount) > 0 ? (
                          <span className="w-20 h-6.5 mx-auto rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900 text-[10px] font-extrabold flex items-center justify-center shadow-2xs">
                            ✓ Paid
                          </span>
                        ) : (
                          <span className="w-20 h-6.5 mx-auto rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900 text-[10px] font-extrabold flex items-center justify-center shadow-2xs">
                            Unpaid
                          </span>
                        )}
                      </td>
                      
                      {/* Status Badges */}
                      <td className="p-2.5 text-center" suppressHydrationWarning>
                        {(status === 'Registered' || !status) && (
                          <Badge variant="outline" className="w-24 h-6.5 mx-auto border-amber-400 text-amber-700 bg-amber-50 font-bold text-[10px] flex items-center justify-center">
                            Registered
                          </Badge>
                        )}
                        {status === 'Pending Vitals' && (
                          <Badge variant="outline" className="w-24 h-6.5 mx-auto border-rose-400 text-rose-700 bg-rose-50 font-bold text-[10px] flex items-center justify-center">
                            ⏳ Vitals
                          </Badge>
                        )}
                        {status === 'Vitals Completed' && (
                          <Badge className="w-24 h-6.5 mx-auto bg-emerald-600 text-white font-extrabold text-[10px] shadow-2xs flex items-center justify-center">
                            ✓ Vitals Done
                          </Badge>
                        )}
                        {status === 'Checked-In' && (
                          <Badge className="w-24 h-6.5 mx-auto bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                            ✓ Checked-In
                          </Badge>
                        )}
                        {status === 'Checked-Out' && (
                          <Badge variant="secondary" className="w-24 h-6.5 mx-auto bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                            Checked-Out
                          </Badge>
                        )}
                      </td>

                      {/* Front Desk Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(status === 'Registered' || !status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendForVitals(p.gsspatid, p.fullname)}
                              className="h-7 px-2.5 text-[10px] font-bold rounded-xl border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center justify-center gap-1"
                              title="Send for Vitals Pre-Assessment"
                            >
                              <Activity className="w-3.5 h-3.5 text-purple-600" /> Vitals
                            </Button>
                          )}

                          {(status === 'Registered' || !status || status === 'Pending Vitals' || status === 'Vitals Completed') && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckInPatient(p.gsspatid, p.fullname)}
                              className="h-7 px-3 text-[10px] font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center justify-center gap-1"
                              title="Check-In Patient to Doctor Queue"
                            >
                              <Zap className="w-3.5 h-3.5" /> Check-In
                            </Button>
                          )}

                          {status === 'Checked-In' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckOutPatient(p.gsspatid, p.fullname)}
                              className="h-7 px-3 text-[10px] font-bold rounded-xl border-emerald-400 text-emerald-700 hover:bg-emerald-50 flex items-center justify-center gap-1"
                              title="Mark Patient Consultation Completed / Check-Out"
                            >
                              Check-Out
                            </Button>
                          )}

                          {status === 'Checked-Out' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCheckInPatient(p.gsspatid, p.fullname)}
                              className="h-7 px-2.5 text-[10px] font-bold rounded-xl border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1"
                              title="Re Check-In Patient"
                            >
                              Re Check-In
                            </Button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
