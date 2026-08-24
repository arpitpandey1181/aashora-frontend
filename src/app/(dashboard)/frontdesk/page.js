'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Inbox, UserPlus, Calendar, Search, CheckCircle, Clock, Activity, Check, ArrowRight, Users, Stethoscope, Sparkles, Zap } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';
import { toast } from 'sonner';

export default function FrontDeskInboxPage() {
  const { currentUser, patients, sendForVitals, checkInPatient } = useClinicStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendForVitals = (patId, name) => {
    sendForVitals(patId);
    toast.success(`Patient ${name} routed to Vitals Inbox! Status updated to Pending Vitals.`);
  };

  const handleCheckInPatient = (patId, name) => {
    checkInPatient(patId);
    toast.success(`Patient ${name} Checked-In! Patient is now visible in Doctor Prescription Queue.`);
  };

  const filteredPatients = (patients || []).filter((p) => {
    const docRef = (p.doctorRef || '').toLowerCase();
    const curDocName = (currentUser?.doctorName || '').toLowerCase();
    const curFirstName = (currentUser?.doctorName || '').replace(/^dr\.\s*/i, '').trim().split(' ')[0].toLowerCase();

    // Doctor Isolation Filter:
    const belongsToDoctor = !p.doctorRef || docRef.includes(curDocName) || docRef.includes(curFirstName);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Front Desk Inbox & Patient Queue Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Flexible Pipeline: Register ➔ Send to Vitals OR Check-In ➔ Doctor E-Prescription Queue
          </p>
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
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Registration ID</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Mobile No</th>
                  <th className="p-3">Doctor Ref</th>
                  <th className="p-3">Payment Status</th>
                  <th className="p-3">Live Pipeline Status</th>
                  <th className="p-3 text-right">Front Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {mounted && filteredPatients.map((p) => {
                  const status = p.checkInStatus || 'Registered';

                  return (
                    <tr key={p.gsspatid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold font-mono text-teal-600 dark:text-teal-400" suppressHydrationWarning>{p.regId || `REG-${p.gsspatid}`}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white" suppressHydrationWarning>{p.title} {p.fullname} ({p.gender}, {p.age}Y)</td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300" suppressHydrationWarning>{p.mobileno}</td>
                      <td className="p-3 font-semibold text-purple-700 dark:text-purple-300" suppressHydrationWarning>{p.doctorRef || 'General'}</td>
                      
                      {/* Payment Status (Paid vs Unpaid ONLY - Sleek Compact Badge) */}
                      <td className="p-3" suppressHydrationWarning>
                        {Number(p.paidAmount) > 0 ? (
                          <span className="w-16 h-6.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold flex items-center justify-center">
                            ✓ Paid
                          </span>
                        ) : (
                          <span className="w-16 h-6.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold flex items-center justify-center">
                            Unpaid
                          </span>
                        )}
                      </td>
                      
                      {/* Short Clean Status Badges */}
                      <td className="p-3" suppressHydrationWarning>
                        {(status === 'Registered' || !status) && (
                          <Badge variant="outline" className="w-28 h-6.5 border-amber-400 text-amber-700 bg-amber-50 font-bold text-[10px] flex items-center justify-center">
                            Registered
                          </Badge>
                        )}
                        {status === 'Pending Vitals' && (
                          <Badge variant="outline" className="w-28 h-6.5 border-rose-400 text-rose-700 bg-rose-50 font-bold text-[10px] flex items-center justify-center">
                            ⏳ Pending Vitals
                          </Badge>
                        )}
                        {status === 'Vitals Completed' && (
                          <Badge className="w-28 h-6.5 bg-emerald-600 text-white font-extrabold text-[10px] shadow-sm flex items-center justify-center">
                            ✓ Vitals Done
                          </Badge>
                        )}
                        {status === 'Checked-In' && (
                          <Badge className="w-28 h-6.5 bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                            ✓ Checked-In
                          </Badge>
                        )}
                        {status === 'Checked-Out' && (
                          <Badge variant="secondary" className="w-28 h-6.5 bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                            Checked-Out
                          </Badge>
                        )}
                      </td>

                      {/* FRONT DESK ACTION BUTTONS */}
                      <td className="p-3 text-right">
                        {status === 'Checked-Out' ? (
                          <Badge variant="secondary" className="w-24 h-6.5 bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center ml-auto">
                            Checked-Out
                          </Badge>
                        ) : status === 'Checked-In' ? (
                          <Badge className="w-24 h-6.5 bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center ml-auto">
                            ✓ Checked-In
                          </Badge>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Vitals Button: ONLY SHOW IF PATIENT STATUS IS INITIAL 'Registered' */}
                            {(status === 'Registered' || !status) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendForVitals(p.gsspatid, p.fullname)}
                                className="h-6.5 px-2 text-[10px] font-bold rounded-lg border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center justify-center gap-1"
                              >
                                <Activity className="w-3 h-3 text-purple-600" /> Vitals
                              </Button>
                            )}

                            {/* Check-In Button: ALWAYS SHOWN UNTIL CHECKED-IN */}
                            <Button
                              size="sm"
                              onClick={() => handleCheckInPatient(p.gsspatid, p.fullname)}
                              className="h-6.5 px-2.5 text-[10px] font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center justify-center gap-1"
                            >
                              <Zap className="w-3 h-3" /> Check-In
                            </Button>
                          </div>
                        )}
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
