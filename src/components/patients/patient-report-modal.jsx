'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { FileUp, FileText, X, CheckCircle, Paperclip, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function PatientReportModal({ isOpen, onClose, patient, onAddReport }) {
  const [docType, setDocType] = useState('Lab Report');
  const [docName, setDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !patient) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!docName) {
        setDocName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!docName) {
      toast.error('Please enter a document title');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newReport = {
        reportId: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        gsspatid: patient.gsspatid,
        patientName: patient.fullname,
        docType: docType,
        docName: docName,
        fileName: selectedFile ? selectedFile.name : `${docName}.pdf`,
        fileSize: selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '420 KB',
        uploadedDate: formatDate(new Date()),
      };

      onAddReport(newReport);
      setLoading(false);
      setDocName('');
      setSelectedFile(null);
      onClose();
      toast.success(`Medical Report "${docName}" attached to Patient #${patient.gsspatid} successfully!`);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-teal-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-none">
                  Attach Medical Report / Document
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Patient: <span className="font-semibold text-teal-600">PT-{patient.gsspatid} ({patient.fullname})</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Document Category / Type *
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Lab Report">Pathology / Lab Test Report (PDF)</option>
                <option value="Radiology X-Ray">Radiology / X-Ray / Scan</option>
                <option value="Referral Letter">Doctor Referral Letter</option>
                <option value="Insurance ID Card">Insurance / Ayushman Card</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Consent Form">Signed Patient Consent Form</option>
              </select>
            </div>

            <Input
              label="Document Title / Report Name *"
              placeholder="e.g. Blood Test CBC Report - Aug 2026"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              required
            />

            {/* File Dropzone Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Upload File (PDF / Image) *
              </label>
              <div className="border-2 border-dashed border-teal-200 dark:border-slate-700 hover:border-teal-500 rounded-2xl p-4 text-center bg-teal-50/30 dark:bg-slate-800/30 transition-colors">
                <input
                  type="file"
                  id="reportFileInput"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="reportFileInput" className="cursor-pointer space-y-2 block">
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-teal-700 dark:text-teal-300">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click to browse or drag PDF / Image report here
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                {loading ? 'Attaching Report...' : 'Save & Attach Report'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
