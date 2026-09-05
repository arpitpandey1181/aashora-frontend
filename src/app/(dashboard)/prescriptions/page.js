'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Printer, Search, Send, Clock, CheckCircle2, UserCheck, ArrowRight, Activity } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';
import { toast } from 'sonner';

export default function PrescriptionsListPage() {
  const { currentUser, prescriptions, patients } = useClinicStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('checked-in'); // 'checked-in' vs 'issued'

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkedInPatientsList = (patients || [])
    .filter((p) => p.checkInStatus === 'Checked-In')
    .filter((p) => {
      if (currentUser?.username === 'admin') return true;
      const docRef = (p.doctorRef || '').toLowerCase();
      const curDocName = (currentUser?.doctorName || '').toLowerCase();
      const curFirstName = (currentUser?.doctorName || '').replace(/^dr\.\s*/i, '').trim().split(' ')[0].toLowerCase();
      return !p.doctorRef || docRef.includes(curDocName) || docRef.includes(curFirstName) || curDocName.includes(docRef);
    });

  const issuedRxList = (prescriptions || []).filter((rx) => {
    if (currentUser?.username === 'admin') return true;
    const rxDoc = (rx.doctor || '').toLowerCase();
    const curDocName = (currentUser?.doctorName || '').toLowerCase();
    const curFirstName = (currentUser?.doctorName || '').replace(/^dr\.\s*/i, '').trim().split(' ')[0].toLowerCase();
    return !rx.doctor || rxDoc.includes(curDocName) || rxDoc.includes(curFirstName) || curDocName.includes(rxDoc);
  });

  const filteredCheckedIn = checkedInPatientsList.filter(
    (p) =>
      (p.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.mobileno || '').includes(searchQuery) ||
      (p.gsspatid || '').toString().includes(searchQuery) ||
      (p.regId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIssuedRx = issuedRxList.filter(
    (rx) =>
      (rx.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rx.rxNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rx.diagnosis || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendWhatsApp = (phone, fullname, rxNo) => {
    const mobile = phone || '9876543210';
    const msg = encodeURIComponent(
      `Hello ${fullname}, your E-Prescription (${rxNo || 'Rx'}) from AASHORA Clinic is ready! View & Print: https://aashoraclinic.com/print/prescriptions/${rxNo || 'RX-0001'}`
    );
    window.open(`https://api.whatsapp.com/send?phone=91${mobile}&text=${msg}`, '_blank');
    toast.success(`WhatsApp prescription link sent to ${mobile}!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
            Prescriptions (Rx)
          </h1>
        </div>

        <Link href="/prescriptions/create">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md text-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Create New Rx
          </Button>
        </Link>
      </div>

      {/* 2 MAIN TABS: 1. Checked-In Patients Queue | 2. Issued Prescriptions Roster */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('checked-in')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'checked-in'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Checked-In Patients Queue ({mounted ? checkedInPatientsList.length : 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('issued')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'issued'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Checked-Out / Issued Rx History ({mounted ? issuedRxList.length : 0})
        </button>
      </div>

      {/* TAB 1: CHECKED-IN PATIENTS QUEUE (ROW ACTION: CREATE RX) */}
      {activeTab === 'checked-in' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 p-4">
            <div>
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" /> Front Desk Checked-In Queue ({mounted ? filteredCheckedIn.length : 0})
              </CardTitle>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Reg ID, Patient..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {mounted && filteredCheckedIn.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Checked-In Patients Waiting</p>
                <p className="text-[11px] text-slate-400">Go to Front Desk Inbox to Check-In waiting counter patients.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Registration ID</th>
                      <th className="p-3">Patient Name</th>
                      <th className="p-3">Mobile No</th>
                      <th className="p-3">Check-In Time</th>
                      <th className="p-3">Source</th>
                      <th className="p-3 text-right">Consultation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {mounted && filteredCheckedIn.map((p) => (
                      <tr key={p.gsspatid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold font-mono text-teal-600 dark:text-teal-400" suppressHydrationWarning>{p.regId || `REG-${p.gsspatid}`}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white" suppressHydrationWarning>{p.title} {p.fullname} ({p.gender}, {p.age}Y)</td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300" suppressHydrationWarning>{p.mobileno}</td>
                        <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400" suppressHydrationWarning>{p.checkInTime || 'Live'}</td>
                        <td className="p-3 font-semibold text-purple-700 dark:text-purple-300" suppressHydrationWarning>{p.source || 'Counter'}</td>
                        <td className="p-3 text-right">
                          <Link href={`/prescriptions/create?patId=${p.gsspatid}`}>
                            <Button size="sm" className="h-8 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                              <Plus className="w-3.5 h-3.5 mr-1" /> Create Rx
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: ISSUED PRESCRIPTIONS ROSTER (ROW ACTIONS: PRINT RX + SEND VIA WHATSAPP) */}
      {activeTab === 'issued' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 p-4">
            <div>
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Issued Prescriptions Roster ({mounted ? filteredIssuedRx.length : 0})
              </CardTitle>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Rx No, Patient..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {mounted && filteredIssuedRx.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Prescriptions Issued Yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Rx Number</th>
                      <th className="p-3">Patient Name</th>
                      <th className="p-3">Prescribing Doctor</th>
                      <th className="p-3">Medicines</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {mounted && filteredIssuedRx.map((rx) => (
                      <tr key={rx.rxNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold font-mono text-teal-600 dark:text-teal-400" suppressHydrationWarning>{rx.rxNo}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white" suppressHydrationWarning>{rx.fullname} ({rx.ageGender})</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300" suppressHydrationWarning>{rx.doctor}</td>
                      <td className="p-3 font-mono font-bold text-purple-700 dark:text-purple-300" suppressHydrationWarning>{(rx.medicines || []).length} Medicines</td>
                      <td className="p-3 font-mono text-slate-500" suppressHydrationWarning>{rx.date}</td>
                      <td className="p-3 text-right flex items-center justify-end gap-2">
                        
                        {/* 1. PRINT RX BUTTON */}
                        <a href={`/print/prescriptions/${rx.rxNo}`} target="_blank" rel="noreferrer">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-bold rounded-xl border-teal-300 text-teal-700 dark:border-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-slate-800 dark:hover:text-teal-200 shadow-sm"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" /> Print Rx
                          </Button>
                        </a>

                        {/* 2. SEND VIA WHATSAPP BUTTON */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendWhatsApp(rx.mobile, rx.fullname, rx.rxNo)}
                          className="h-8 text-xs font-bold rounded-xl border-emerald-400 text-emerald-800 dark:border-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 dark:hover:text-emerald-200 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" /> Send via WhatsApp
                        </Button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
