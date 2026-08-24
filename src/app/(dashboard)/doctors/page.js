'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, Plus } from 'lucide-react';

export default function DoctorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Doctors Roster & Consultation Slots
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Doctor availability schedules & consultation fees
          </p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Doctor
        </Button>
      </div>

      <Card className="p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
          <Stethoscope className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold">Doctor Management Module</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Connected to DoctorController.cs. Manage schedules, departments, and consultation limits.
        </p>
      </Card>
    </div>
  );
}
