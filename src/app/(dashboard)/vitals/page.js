'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VITALS_FIELD_CONFIG } from '@/config/vitals-config';
import { Activity, Stethoscope, Search, Save, History, CheckCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ClinicalVitalsPage() {
  const [patientId, setPatientId] = useState('1001');
  const [patientName, setPatientName] = useState('Rajesh Kumar');

  const [vitals, setVitals] = useState({
    height: '175',
    weight: '72',
    bmi: '23.5',
    bpSys: '120',
    bpDia: '80',
    temp: '98.6',
    pulse: '72',
    rr: '18',
    hc: '22',
    spo2: '99',
    painScore: '2',
    lmp: '10/08/2026',
    fbps: '95',
    pps: '130',
    rbs: '110',
  });

  const [clinicalNotes, setClinicalNotes] = useState({
    chiefComplaint: 'Mild fever and dry cough for 2 days',
    pastMedical: 'Known hypertensive on regular medication',
    surgicalHistory: 'Appendectomy (2018)',
    familyHistory: 'Father had Type 2 Diabetes',
    allergyHistory: 'No known drug allergies (NKDA)',
    addictionTobacco: false,
    addictionAlcohol: false,
    addictionSmoke: false,
    addictionOther: false,
  });

  const handleCalculateBMI = (h, w) => {
    if (h > 0 && w > 0) {
      const heightInMeters = h / 100;
      const bmiVal = (w / (heightInMeters * heightInMeters)).toFixed(1);
      return bmiVal;
    }
    return '';
  };

  const handleHeightWeightChange = (field, val) => {
    const updated = { ...vitals, [field]: val };
    if (field === 'height' || field === 'weight') {
      const h = parseFloat(field === 'height' ? val : vitals.height) || 0;
      const w = parseFloat(field === 'weight' ? val : vitals.weight) || 0;
      updated.bmi = handleCalculateBMI(h, w);
    }
    setVitals(updated);
  };

  const handleSaveVitals = (e) => {
    e.preventDefault();
    toast.success(`Clinical Examination & Vitals saved for Patient PT-${patientId} (${patientName})!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
            Vitals Intake
          </h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSaveVitals} className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md">
            <Save className="w-4 h-4 mr-1.5" /> Save Vital Record
          </Button>
        </div>
      </div>

      {/* Patient Header Banner */}
      <Card className="p-4 bg-teal-50/60 dark:bg-slate-900 border-teal-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span className="text-slate-600 dark:text-slate-400">PATIENT:</span>
            <span className="text-teal-700 dark:text-teal-300 font-extrabold">PT-{patientId} - {patientName}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
            <span>AGE / GENDER: <strong className="text-slate-900 dark:text-slate-100">42 Yrs / Male</strong></span>
            <span>VISIT ID: <strong className="text-slate-900 dark:text-slate-100">DSO2026001</strong></span>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSaveVitals} className="space-y-6">
        
        {/* Section 1: Vital Data Inputs (Matching Screenshot Exact Fields) */}
        <Card className="border-teal-200/80 dark:border-slate-800 shadow-md">
          <CardHeader className="bg-slate-100/80 dark:bg-slate-800/80 py-3 border-b border-slate-200 dark:border-slate-700 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Vital Data Record
            </CardTitle>
            <History className="w-4 h-4 text-slate-400 cursor-pointer hover:text-teal-600" />
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
              
              {VITALS_FIELD_CONFIG.showHeight && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Height (Cm)</label>
                  <input
                    type="number"
                    value={vitals.height}
                    onChange={(e) => handleHeightWeightChange('height', e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showWeight && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Weight (Kg)</label>
                  <input
                    type="number"
                    value={vitals.weight}
                    onChange={(e) => handleHeightWeightChange('weight', e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showBMI && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">BMI</label>
                  <input
                    type="text"
                    value={vitals.bmi}
                    readOnly
                    className="w-full h-9 rounded-xl border border-teal-200 dark:border-slate-700 bg-teal-50 dark:bg-teal-950 px-2.5 font-extrabold text-teal-700 dark:text-teal-300 mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showBPSys && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">BP (Sys)</label>
                  <input
                    type="text"
                    value={vitals.bpSys}
                    onChange={(e) => setVitals({ ...vitals, bpSys: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showBPDia && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">BP (Dia)</label>
                  <input
                    type="text"
                    value={vitals.bpDia}
                    onChange={(e) => setVitals({ ...vitals, bpDia: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showTemp && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Temp (°F)</label>
                  <input
                    type="text"
                    value={vitals.temp}
                    onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center text-amber-600"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showPulse && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Pulse (bpm)</label>
                  <input
                    type="text"
                    value={vitals.pulse}
                    onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showRR && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">R.R.</label>
                  <input
                    type="text"
                    value={vitals.rr}
                    onChange={(e) => setVitals({ ...vitals, rr: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showHC && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">H.C. (In Inch)</label>
                  <input
                    type="text"
                    value={vitals.hc}
                    onChange={(e) => setVitals({ ...vitals, hc: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showSpO2 && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">SpO₂ (%)</label>
                  <input
                    type="text"
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-extrabold mt-1 text-center text-emerald-600"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showPainScore && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Pain Score</label>
                  <input
                    type="text"
                    value={vitals.painScore}
                    onChange={(e) => setVitals({ ...vitals, painScore: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showLMP && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">LMP Date</label>
                  <input
                    type="text"
                    value={vitals.lmp}
                    onChange={(e) => setVitals({ ...vitals, lmp: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showFBPS && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">FBPS</label>
                  <input
                    type="text"
                    value={vitals.fbps}
                    onChange={(e) => setVitals({ ...vitals, fbps: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showPPS && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">PPS</label>
                  <input
                    type="text"
                    value={vitals.pps}
                    onChange={(e) => setVitals({ ...vitals, pps: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

              {VITALS_FIELD_CONFIG.showRBS && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">RBS</label>
                  <input
                    type="text"
                    value={vitals.rbs}
                    onChange={(e) => setVitals({ ...vitals, rbs: e.target.value })}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-bold mt-1 text-center"
                  />
                </div>
              )}

            </div>
          </CardContent>
        </Card>

        {/* Section 2: Clinical History Breakdown (Matching Screenshot) */}
        <div className="space-y-4">
          
          {VITALS_FIELD_CONFIG.showChiefComplaint && (
            <Card className="border-teal-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  CHIEF COMPLAINT
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <input
                  type="text"
                  value={clinicalNotes.chiefComplaint}
                  onChange={(e) => setClinicalNotes({ ...clinicalNotes, chiefComplaint: e.target.value })}
                  placeholder="Search Chief Complaint..."
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs"
                />
              </CardContent>
            </Card>
          )}

          {VITALS_FIELD_CONFIG.showPastMedicalHistory && (
            <Card className="border-teal-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  PAST MEDICAL HISTORY
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <input
                  type="text"
                  value={clinicalNotes.pastMedical}
                  onChange={(e) => setClinicalNotes({ ...clinicalNotes, pastMedical: e.target.value })}
                  placeholder="Search Past Medical..."
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs"
                />
              </CardContent>
            </Card>
          )}

          {VITALS_FIELD_CONFIG.showSurgicalHistory && (
            <Card className="border-teal-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  SURGICAL HISTORY
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <input
                  type="text"
                  value={clinicalNotes.surgicalHistory}
                  onChange={(e) => setClinicalNotes({ ...clinicalNotes, surgicalHistory: e.target.value })}
                  placeholder="Search Surgical History..."
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs"
                />
              </CardContent>
            </Card>
          )}

          {VITALS_FIELD_CONFIG.showFamilyHistory && (
            <Card className="border-teal-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  FAMILY HISTORY
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <input
                  type="text"
                  value={clinicalNotes.familyHistory}
                  onChange={(e) => setClinicalNotes({ ...clinicalNotes, familyHistory: e.target.value })}
                  placeholder="Search Family History..."
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs"
                />
              </CardContent>
            </Card>
          )}

          {VITALS_FIELD_CONFIG.showAllergyHistory && (
            <Card className="border-teal-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  ALLERGY HISTORY
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <input
                  type="text"
                  value={clinicalNotes.allergyHistory}
                  onChange={(e) => setClinicalNotes({ ...clinicalNotes, allergyHistory: e.target.value })}
                  placeholder="Search Allergy..."
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs"
                />
              </CardContent>
            </Card>
          )}

          {VITALS_FIELD_CONFIG.showAddictionHistory && (
            <Card className="border-teal-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  ADDICTION HISTORY
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-wrap gap-6 text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clinicalNotes.addictionTobacco}
                    onChange={(e) => setClinicalNotes({ ...clinicalNotes, addictionTobacco: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span>TOBACCO</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clinicalNotes.addictionAlcohol}
                    onChange={(e) => setClinicalNotes({ ...clinicalNotes, addictionAlcohol: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span>ALCOHOL</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clinicalNotes.addictionSmoke}
                    onChange={(e) => setClinicalNotes({ ...clinicalNotes, addictionSmoke: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span>SMOKE</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clinicalNotes.addictionOther}
                    onChange={(e) => setClinicalNotes({ ...clinicalNotes, addictionOther: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span>OTHER</span>
                </label>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6">
            <Save className="w-4 h-4 mr-1.5" /> Save Record
          </Button>
        </div>
      </form>
    </div>
  );
}
