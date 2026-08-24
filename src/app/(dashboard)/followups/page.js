'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, Filter, Phone, MessageSquare, Send, User, FileText, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function FollowUpPatientsPage() {
  const { currentUser, prescriptions, patients } = useClinicStore();
  const [mounted, setMounted] = useState(false);
  const [filterTab, setFilterTab] = useState('All'); // 'All', 'Today', 'Upcoming', 'Overdue'
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Aggregate all Follow-Up records from prescriptions and patients (Doctor Isolated!)
  const followUpList = (prescriptions || [])
    .filter((rx) => rx.followUpDate || rx.nextFollowUpDate)
    .filter((rx) => {
      const rxDoc = (rx.doctor || '').toLowerCase();
      const curDocName = (currentUser?.doctorName || '').toLowerCase();
      const curFirstName = (currentUser?.doctorName || '').replace(/^dr\.\s*/i, '').trim().split(' ')[0].toLowerCase();
      return !rx.doctor || rxDoc.includes(curDocName) || rxDoc.includes(curFirstName);
    })
    .map((rx) => {
      const pat = (patients || []).find(
        (p) => p.regId === rx.regId || p.gsspatid?.toString() === rx.gsspatid?.toString() || p.fullname === rx.fullname
      );
      const targetDate = rx.followUpDate || rx.nextFollowUpDate || todayStr;

      // Calculate Days Status
      let status = 'Upcoming';
      if (targetDate === todayStr) {
        status = 'Today';
      } else if (targetDate < todayStr) {
        status = 'Overdue';
      }

      return {
        id: rx.rxNo || rx.id,
        rxNo: rx.rxNo || 'RX-0001',
        regId: rx.regId || pat?.regId || `REG-${rx.gsspatid || 1001}`,
        fullname: rx.fullname || pat?.fullname || 'Patient',
        mobileno: rx.mobile || rx.mobileno || pat?.mobileno || '',
        whatsappno: rx.whatsappno || pat?.whatsappno || rx.mobile || rx.mobileno || '',
        doctor: rx.doctor || pat?.doctorRef || currentUser?.fullName || 'Dr. Arpit Pandey (M.D. Cardiology)',
        lastVisitDate: rx.date || todayStr,
        followUpDate: targetDate,
        status,
        diagnosis: rx.diagnosis || 'General Follow-up',
      };
    });

  const displayList = followUpList;

  // Filtered List based on Tab selection
  const filteredList = displayList.filter((item) => {
    const matchesSearch =
      item.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mobileno.includes(searchQuery) ||
      item.regId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rxNo.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === 'Today') return matchesSearch && item.status === 'Today';
    if (filterTab === 'Upcoming') return matchesSearch && item.status === 'Upcoming';
    if (filterTab === 'Overdue') return matchesSearch && item.status === 'Overdue';
    return matchesSearch; // 'All'
  });

  const handleSendWhatsAppReminder = (item) => {
    const mobile = item.whatsappno || item.mobileno;
    const msg = `Hello ${item.fullname}, this is a gentle reminder from AASHORA Clinic for your scheduled Follow-Up visit on ${item.followUpDate} with ${item.doctor}. Please visit the clinic or call us for slot booking!`;
    window.open(`https://wa.me/91${mobile}?text=${encodeURIComponent(msg)}`, '_blank');
    toast.success(`WhatsApp follow-up reminder sent to +91 ${mobile}!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Follow-Up Patients Directory & Reminders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track scheduled follow-up dates given in E-Prescriptions & send instant WhatsApp visit reminders.
          </p>
        </div>

        {/* Status Count Badges */}
        <div className="flex items-center gap-2">
          <Badge className="bg-teal-600 text-white font-extrabold text-xs px-3 py-1">
            Total Follow-Ups: {mounted ? displayList.length : 0}
          </Badge>
          <Badge className="bg-amber-500 text-white font-extrabold text-xs px-3 py-1">
            Today: {mounted ? displayList.filter(d => d.status === 'Today').length : 0}
          </Badge>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          
          {/* Quick Filter Tabs: Short & Clean Names (No 1, 2, 3, 4 numbers!) */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'Today', label: 'Today', icon: '📅' },
              { id: 'Upcoming', label: 'Upcoming', icon: '⏰' },
              { id: 'All', label: 'All Visits', icon: '📋' },
              { id: 'Overdue', label: 'Overdue', icon: '⚠️' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  filterTab === tab.id
                    ? 'bg-teal-600 text-white shadow-md scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Reg ID, Patient, Mobile..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

        </div>

        {/* Follow-Up Roster Table */}
        <div className="overflow-x-auto">
          {mounted && filteredList.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Follow-Up Records Found for ({filterTab})</p>
              <p className="text-[11px] text-slate-400">Follow-up dates given during E-Prescription creation will appear here automatically.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Reg ID / Rx No</th>
                  <th className="p-3">Patient Name & Details</th>
                  <th className="p-3">Doctor Reference</th>
                  <th className="p-3">Last Visit Date</th>
                  <th className="p-3">Scheduled Follow-Up</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Follow-Up Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {mounted && filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold font-mono text-teal-600 dark:text-teal-400">
                      <div>{item.regId}</div>
                      <span className="text-[10px] text-slate-400 font-normal">({item.rxNo})</span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{item.fullname}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.mobileno}</div>
                    </td>
                    <td className="p-3 font-semibold text-purple-700 dark:text-purple-300">
                      {item.doctor}
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {item.lastVisitDate}
                    </td>
                    <td className="p-3 font-mono font-bold text-teal-700 dark:text-teal-300">
                      {item.followUpDate}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={`font-mono text-[11px] font-extrabold ${
                          item.status === 'Today'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                            : item.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.status} ({item.followUpDate})
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSendWhatsAppReminder(item)}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-xl shadow-sm h-8"
                      >
                        <Send className="w-3 h-3 mr-1" /> WhatsApp Reminder
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
