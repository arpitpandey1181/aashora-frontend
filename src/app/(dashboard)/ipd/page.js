'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bed, Plus, Search, UserCheck, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const initialBeds = [
  { bedNo: 'ICU-01', ward: 'ICU Ward', status: 'Occupied', patientName: 'Suresh Menon', doctorName: 'Dr. Alex Morgan', admittedDate: '2026-08-08' },
  { bedNo: 'ICU-02', ward: 'ICU Ward', status: 'Available', patientName: '-', doctorName: '-', admittedDate: '-' },
  { bedNo: 'DEL-101', ward: 'Deluxe Ward', status: 'Occupied', patientName: 'Ananya Roy', doctorName: 'Dr. Priya Sharma', admittedDate: '2026-08-09' },
  { bedNo: 'DEL-102', ward: 'Deluxe Ward', status: 'Available', patientName: '-', doctorName: '-', admittedDate: '-' },
  { bedNo: 'GEN-201', ward: 'General Ward', status: 'Occupied', patientName: 'Mahesh Babu', doctorName: 'Dr. Rajesh Patel', admittedDate: '2026-08-10' },
  { bedNo: 'GEN-202', ward: 'General Ward', status: 'Cleaning', patientName: '-', doctorName: '-', admittedDate: '-' },
];

export default function IPDManagementPage() {
  const [beds, setBeds] = useState(initialBeds);
  const [filterWard, setFilterWard] = useState('ALL');
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);

  const [admissionForm, setAdmissionForm] = useState({
    patientName: '',
    doctorName: 'Dr. Alex Morgan',
    ward: 'ICU Ward',
    bedNo: 'ICU-02',
  });

  const handleAdmission = (e) => {
    e.preventDefault();
    setBeds(
      beds.map((b) =>
        b.bedNo === admissionForm.bedNo
          ? {
              ...b,
              status: 'Occupied',
              patientName: admissionForm.patientName,
              doctorName: admissionForm.doctorName,
              admittedDate: new Date().toISOString().split('T')[0],
            }
          : b
      )
    );
    setShowAdmissionModal(false);
    toast.success(`IPD Admission completed for ${admissionForm.patientName} in Bed #${admissionForm.bedNo}!`);
  };

  const filteredBeds = beds.filter((b) => filterWard === 'ALL' || b.ward === filterWard);

  const occupiedCount = beds.filter((b) => b.status === 'Occupied').length;
  const availableCount = beds.filter((b) => b.status === 'Available').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Bed className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            IPD In-Patient & Ward Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Bed Allocation connected to `HMSBE.Models.IPD` & `patipdadmissionmodel`
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAdmissionModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> New IPD Admission
        </Button>
      </div>

      {/* Ward Occupancy KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border-l-4 border-l-teal-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total IPD Capacity</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {beds.length} Total Beds
          </h2>
        </Card>

        <Card className="p-5 border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Currently Occupied</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {occupiedCount} Beds Occupied
          </h2>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Vacant / Ready Beds</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {availableCount} Beds Available
          </h2>
        </Card>
      </div>

      {/* Bed Status Grid */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base">Live Ward & Bed Map</CardTitle>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {['ALL', 'ICU Ward', 'Deluxe Ward', 'General Ward'].map((w) => (
              <button
                key={w}
                onClick={() => setFilterWard(w)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterWard === w
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBeds.map((b) => {
              const isOccupied = b.status === 'Occupied';
              const isAvailable = b.status === 'Available';

              return (
                <motion.div
                  key={b.bedNo}
                  whileHover={{ y: -3 }}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOccupied
                      ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                      : isAvailable
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
                      : 'bg-amber-50/40 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Bed className="w-4 h-4 text-teal-600" /> #{b.bedNo}
                    </span>
                    <Badge variant={isOccupied ? 'danger' : isAvailable ? 'success' : 'warning'}>
                      {b.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 font-semibold mt-2">{b.ward}</p>

                  {isOccupied ? (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100">Patient: {b.patientName}</p>
                      <p className="text-slate-500">Doctor: {b.doctorName}</p>
                      <p className="text-[10px] text-slate-400">Admitted: {b.admittedDate}</p>
                    </div>
                  ) : (
                    <div className="mt-4 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => {
                          setAdmissionForm({ ...admissionForm, bedNo: b.bedNo, ward: b.ward });
                          setShowAdmissionModal(true);
                        }}
                      >
                        Assign Patient
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Admission Modal */}
      <AnimatePresence>
        {showAdmissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-teal-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    IPD Patient Admission
                  </h3>
                </div>
                <button onClick={() => setShowAdmissionModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdmission} className="space-y-3">
                <Input
                  label="Patient Name *"
                  placeholder="e.g. Ramesh Chandra"
                  value={admissionForm.patientName}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, patientName: e.target.value })}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Assigned Bed
                  </label>
                  <input
                    type="text"
                    value={`${admissionForm.bedNo} (${admissionForm.ward})`}
                    disabled
                    className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 text-xs font-bold text-teal-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                    Attending Doctor
                  </label>
                  <select
                    value={admissionForm.doctorName}
                    onChange={(e) => setAdmissionForm({ ...admissionForm, doctorName: e.target.value })}
                    className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Dr. Alex Morgan">Dr. Alex Morgan (Cardiology)</option>
                    <option value="Dr. Priya Sharma">Dr. Priya Sharma (Pediatrics)</option>
                    <option value="Dr. Rajesh Patel">Dr. Rajesh Patel (Orthopedics)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" type="button" onClick={() => setShowAdmissionModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                    Confirm IPD Admission
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
