'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/use-appointments';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Plus, Filter, Clock } from 'lucide-react';

export default function AppointmentsPage() {
  const { appointments, statusFilter, setStatusFilter, updateAppointmentStatus, metrics } = useAppointments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Appointment Scheduler
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage doctor slots & consultation status connected to `AppointmentController.cs`
          </p>
        </div>
        <Link href="/appointments/book">
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Book New Slot
          </Button>
        </Link>
      </div>

      {/* Main Appointments Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base">Today's Appointment Roster ({appointments.length})</CardTitle>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 ml-2 text-slate-400" />
            {['ALL', 'Confirmed', 'InProgress', 'Completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === filter
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Visit ID</th>
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Assigned Doctor</th>
                  <th className="px-6 py-3">Slot Time</th>
                  <th className="px-6 py-3">Fee</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.map((apt) => (
                  <tr key={apt.opdvisitid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-teal-600 dark:text-teal-400 text-xs">
                      #{apt.opdvisitid}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {apt.fullname}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                      {apt.doctorname}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {apt.slotTime}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {formatCurrency(apt.cashamt - apt.discountamt)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={apt.status}
                        onChange={(e) => updateAppointmentStatus(apt.opdvisitid, e.target.value)}
                        className="text-xs font-semibold rounded-lg px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="InProgress">InProgress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
