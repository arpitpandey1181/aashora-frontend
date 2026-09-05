'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, CheckCircle, Search, Paperclip, Send, User, Upload, Trash2, FileText, Check, ArrowLeft, CheckSquare } from 'lucide-react';
import { useClinicStore } from '@/store/clinic-store';
import { toast } from 'sonner';

export default function VitalsInboxPage() {
  const { patients, saveVitalsAndCheckIn, addPatientReport } = useClinicStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Full Page Vitals Form State
  const [activePatient, setActivePatient] = useState(null);

  const fileInputRef = useRef(null);
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Vitals State
  const [vitals, setVitals] = useState({
    bp: '120/80 mmHg',
    pulse: '72 bpm',
    temp: '98.6 °F',
    weight: '70 kg',
    height: '175 cm',
    spo2: '99 %',
    rbs: '110 mg/dL',
    rr: '18 /min',
    painScore: '0/10',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const pendingVitalsQueue = (patients || []).filter((p) => p.checkInStatus === 'Pending Vitals');

  const filteredQueue = pendingVitalsQueue.filter(
    (p) =>
      (p.fullname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.mobileno || '').includes(searchQuery) ||
      (p.gsspatid || '').toString().includes(searchQuery) ||
      (p.regId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open Full Page Form for Vitals Intake
  const handleOpenVitalsPage = (patient) => {
    setActivePatient(patient);
    setAttachedFiles([]);
    setVitals(
      patient.vitals || {
        bp: '120/80 mmHg',
        pulse: '72 bpm',
        temp: '98.6 °F',
        weight: '70 kg',
        height: '175 cm',
        spo2: '99 %',
        rbs: '110 mg/dL',
        rr: '18 /min',
        painScore: '0/10',
      }
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newFiles = files.map((f) => ({
      id: Date.now() + Math.random(),
      fileName: f.name,
      fileSize: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: f.type.includes('image') ? 'image' : 'document',
      source: 'Vitals Inbox Staff',
      uploadDate: new Date().toLocaleDateString('en-GB'),
    }));
    setAttachedFiles([...attachedFiles, ...newFiles]);
  };

  const handleRemoveFile = (id) => {
    setAttachedFiles(attachedFiles.filter((f) => f.id !== id));
  };

  // Send WhatsApp Link for Vitals / Report Upload
  const handleSendWhatsAppLink = () => {
    if (!activePatient) return;
    const patNo = activePatient.whatsappno || activePatient.mobileno;
    const link = `https://aashoraclinic.com/vitals-upload?patId=${activePatient.gsspatid}`;
    const msg = `Hello ${activePatient.fullname}, please upload your medical lab reports / vitals info using this link: ${link}`;

    window.open(`https://wa.me/91${patNo}?text=${encodeURIComponent(msg)}`, '_blank');
    toast.success(`WhatsApp vitals link sent to +91 ${patNo}!`);
  };

  const handleSubmitVitals = (e) => {
    e.preventDefault();
    if (!activePatient) return;

    // Save Vitals & Mark Status as Vitals Completed
    saveVitalsAndCheckIn(activePatient.gsspatid, vitals);

    // Save attached reports if any
    attachedFiles.forEach((file) => {
      addPatientReport({
        gsspatid: activePatient.gsspatid,
        patientName: activePatient.fullname,
        ...file,
      });
    });

    toast.success(`Vitals completed for ${activePatient.fullname}! Marked as "Vitals Completed" (Ready for Front Desk Check-In).`);
    setActivePatient(null);
  };

  return (
    <div className="space-y-6">
      
      {/* IF A PATIENT IS SELECTED, SHOW FULL PAGE FORM VIEW! */}
      {activePatient ? (
        <div className="space-y-5 max-w-4xl mx-auto animate-in fade-in-50">
          
          {/* Header with Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setActivePatient(null)} className="rounded-xl font-bold border-slate-300">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                  <Activity className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  Take Vitals Form — {activePatient.fullname}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Registration ID: <strong className="text-teal-600 font-mono">{activePatient.regId || `REG-${activePatient.gsspatid}`}</strong> | Mobile: {activePatient.mobileno}
                </p>
              </div>
            </div>

            <Badge className="bg-rose-600 text-white font-bold text-xs px-3 py-1">
              Active Vitals Intake Mode
            </Badge>
          </div>

          <form onSubmit={handleSubmitVitals} className="space-y-5">
            
            {/* 1. Full Page Clinical Vitals Assessment Form Grid */}
            <Card className="p-4 border-l-4 border-l-rose-500 space-y-4">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-rose-900 dark:text-rose-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600" /> 1. Clinical Vitals Assessment Form
              </CardTitle>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                <Input label="BP (mmHg)" value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })} className="h-9 text-xs font-bold" />
                <Input label="Pulse (bpm)" value={vitals.pulse} onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })} className="h-9 text-xs font-bold" />
                <Input label="Temp (°F)" value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} className="h-9 text-xs font-bold" />
                <Input label="Weight (kg)" value={vitals.weight} onChange={(e) => setVitals({ ...vitals, weight: e.target.value })} className="h-9 text-xs font-bold" />
                <Input label="Height (cm)" value={vitals.height} onChange={(e) => setVitals({ ...vitals, height: e.target.value })} className="h-9 text-xs font-bold" />
                <Input label="SpO2 (%)" value={vitals.spo2} onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })} className="h-9 text-xs font-bold" />
                <Input label="RBS (mg/dL)" value={vitals.rbs} onChange={(e) => setVitals({ ...vitals, rbs: e.target.value })} className="h-9 text-xs font-bold" />
                <Input label="RR (/min)" value={vitals.rr} onChange={(e) => setVitals({ ...vitals, rr: e.target.value })} className="h-9 text-xs font-bold" />
                <Input label="Pain (0-10)" value={vitals.painScore} onChange={(e) => setVitals({ ...vitals, painScore: e.target.value })} className="h-9 text-xs font-bold" />
              </div>
            </Card>

            {/* 2. Attach Reports (Local Upload + WhatsApp Link) */}
            <Card className="p-4 border-l-4 border-l-purple-500 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-purple-600" /> 2. Attach Medical Reports & WhatsApp Link
                </CardTitle>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload System File
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSendWhatsAppLink}
                    className="h-8 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Send WhatsApp Link
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {attachedFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachedFiles.map((f) => (
                    <div key={f.id} className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-purple-600" /> {f.fileName} ({f.fileSize})
                      </span>
                      <button type="button" onClick={() => handleRemoveFile(f.id)} className="text-rose-500 hover:text-rose-700 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Action Bar */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setActivePatient(null)} className="rounded-xl font-bold">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg px-8 py-2.5">
                <CheckCircle className="w-4 h-4 mr-2" /> Complete Vitals Intake (Mark Ready for Check-In)
              </Button>
            </div>
          </form>

        </div>
      ) : (
        /* OTHERWISE SHOW QUEUE ROSTER TABLE */
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-400" />
                Vitals Inbox
              </h1>
            </div>

            <span className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 font-extrabold text-xs" suppressHydrationWarning>
              Pending Vitals Queue: ({mounted ? pendingVitalsQueue.length : 0})
            </span>
          </div>

          {/* Queue Directory Card */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 p-4">
              <div>
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-600" /> Patients Routed for Vitals Intake
                </CardTitle>
              </div>

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
            </CardHeader>

            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {mounted && filteredQueue.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Patients Pending Vitals</p>
                  <p className="text-[11px] text-slate-400">Front Desk can route registered patients using &quot;Send for Vitals&quot;.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Registration ID</th>
                      <th className="p-3">Patient Name</th>
                      <th className="p-3">Mobile No</th>
                      <th className="p-3">Routed Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Vitals Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {mounted && filteredQueue.map((p) => (
                      <tr key={p.gsspatid} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold font-mono text-teal-600 dark:text-teal-400" suppressHydrationWarning>{p.regId || `REG-${p.gsspatid}`}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white" suppressHydrationWarning>{p.title} {p.fullname} ({p.gender}, {p.age}Y)</td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300" suppressHydrationWarning>{p.mobileno}</td>
                        <td className="p-3 font-mono font-semibold text-rose-600 dark:text-rose-400" suppressHydrationWarning>{p.sendForVitalsTime || 'Live'}</td>
                        <td className="p-3" suppressHydrationWarning>
                          <Badge variant="outline" className="border-rose-400 text-rose-700 bg-rose-50 font-bold text-[10px]">
                            Pending Vitals Intake
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            onClick={() => handleOpenVitalsPage(p)}
                            className="h-8 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1 ml-auto"
                          >
                            <Activity className="w-3.5 h-3.5" /> Take Vitals
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
