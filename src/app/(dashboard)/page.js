'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Paperclip,
  FlaskConical,
  Pill,
  ShieldCheck,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const topNavModules = [
  { label: 'Front Desk Inbox', href: '/frontdesk', icon: Users, color: 'text-teal-600 dark:text-teal-400' },
  { label: 'Vitals Inbox', href: '/vitals-inbox', icon: HeartPulseIcon, color: 'text-rose-500' },
  { label: 'E-Prescriptions (Rx)', href: '/prescriptions/create', icon: FileText, color: 'text-sky-600 dark:text-sky-400' },
  { label: 'Patient Registration', href: '/patients', icon: UserCheck, color: 'text-amber-500' },
  { label: 'Follow-Up Patients', href: '/followups', icon: Calendar, color: 'text-indigo-500' },
  { label: 'Billing Dashboard', href: '/billing', icon: LayoutDashboard, color: 'text-teal-600 dark:text-teal-400' },
  { label: 'Pharmacy Stock', href: '/pharmacy', icon: Pill, color: 'text-emerald-600' },
  { label: 'Clinic Reports', href: '/reports', icon: FlaskConical, color: 'text-purple-600' },
];

function HeartPulseIcon(props) {
  return <Stethoscope {...props} />;
}

const weeklySchedule = [
  { day: 'Mon', date: '10/08/2026', slots: ['10:00 AM (Confirmed)', '11:30 AM (Available)'] },
  { day: 'Tue', date: '11/08/2026', slots: ['09:30 AM (Confirmed)', '10:30 AM (Confirmed)', '02:00 PM (Available)'] },
  { day: 'Wed', date: '12/08/2026', slots: ['10:00 AM (Available)', '11:00 AM (Available)'] },
  { day: 'Thu', date: '13/08/2026', slots: ['10:30 AM (Confirmed)', '03:00 PM (Available)'] },
  { day: 'Fri', date: '14/08/2026', slots: ['10:00 AM (Available)', '04:00 PM (Available)'] },
  { day: 'Sat', date: '15/08/2026', slots: ['09:00 AM (Special Consultation)'] },
];

export default function DashboardPage() {
  const [activeFollowTab, setActiveFollowTab] = useState('FOLLOW_UP_INBOX');
  const [filterDate, setFilterDate] = useState('18/08/2026');
  const [consultant, setConsultant] = useState('DR. BM JAYSWAL');

  return (
    <div className="space-y-6">
      {/* Sub-Header AI & HIPAA Compliance Banner */}
      <div className="p-4.5 rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-sky-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/20">
            <Sparkles className="w-5 h-5 text-emerald-300 animate-spin" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              AASHORA Clinic Management OS
              <span className="text-xs font-semibold text-teal-200 italic">(सर्वे सन्तु निरामयाः)</span>
            </h2>
            <p className="text-xs text-teal-100 mt-0.5">
              Strict Clinic Pipeline: Register ➔ Take Vitals ➔ Front Desk Check-In ➔ E-Prescription ➔ Checkout
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-xs font-bold text-emerald-200 border border-white/20 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>HIPAA-Compliant Practices Followed</span>
        </div>
      </div>

      {/* Top Quick Module Grid (8 Icons) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {topNavModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.label} href={mod.href}>
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center flex flex-col items-center justify-center transition-all cursor-pointer h-24"
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 mb-1.5">
                  <Icon className={`w-5 h-5 ${mod.color}`} />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {mod.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Follow Up Details Inbox & Weekly Doctor Roster */}
      <Card className="border-teal-200/80 dark:border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <CardTitle className="text-sm font-extrabold uppercase text-slate-800 dark:text-slate-200 mb-3">
            Follow Up Details & Weekly Doctor Consultation Timetable
          </CardTitle>

          <div className="flex flex-wrap border-b border-slate-100 dark:border-slate-800 gap-1 pb-2">
            {[
              { id: 'FOLLOW_UP_INBOX', label: 'Follow Up Inbox' },
              { id: 'WEEKLY_SCHEDULE', label: 'Weekly Doctor Timetable' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFollowTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFollowTab === tab.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {activeFollowTab === 'FOLLOW_UP_INBOX' ? (
            <div className="p-6 rounded-2xl bg-teal-50/50 dark:bg-slate-800/40 border border-teal-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-extrabold text-teal-900 dark:text-teal-200">
                  Follow-Up Patients Directory & Reminders
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  View scheduled follow-up dates given in E-Prescriptions & send instant WhatsApp reminders.
                </p>
              </div>

              <Link href="/followups">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center gap-1.5 shrink-0">
                  Open Follow-Up Directory <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Doctor & Date Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Target Date</label>
                  <input
                    type="text"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-900 dark:text-slate-100 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Consultant Doctor</label>
                  <select
                    value={consultant}
                    onChange={(e) => setConsultant(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-900 dark:text-slate-100 mt-1"
                  >
                    <option value="DR. BM JAYSWAL">DR. BM JAYSWAL (General Physician)</option>
                    <option value="DR. ALEX MORGAN">DR. ALEX MORGAN (Cardiologist)</option>
                    <option value="DR. PRIYA SHARMA">DR. PRIYA SHARMA (Pediatrician)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white w-full font-bold h-9">
                    Filter Roster
                  </Button>
                </div>
              </div>

              {/* Weekly Timetable Grid */}
              <div className="overflow-x-auto rounded-2xl border border-teal-200 dark:border-slate-800">
                <div className="grid grid-cols-7 min-w-[700px] text-center font-sans">
                  <div className="bg-teal-700 text-white p-3 font-bold text-xs border-r border-teal-600">
                    Time Slot
                  </div>
                  {weeklySchedule.map((day) => (
                    <div key={day.day} className="bg-teal-700 text-white p-3 border-r border-teal-600">
                      <p className="font-bold text-xs">{day.day}</p>
                      <p className="text-[10px] text-teal-200 font-mono mt-0.5">{day.date}</p>
                    </div>
                  ))}

                  {/* Time Rows */}
                  <div className="p-4 border-t border-r border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center">
                    Morning Session
                  </div>
                  {weeklySchedule.map((day) => (
                    <div key={`m-${day.day}`} className="p-3 border-t border-r border-slate-200 dark:border-slate-800 space-y-1 bg-white dark:bg-slate-900">
                      {day.slots.map((s, i) => (
                        <span
                          key={i}
                          className="block p-1.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 text-[10px] font-semibold border border-teal-100 dark:border-teal-900"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
