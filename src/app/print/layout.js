export const metadata = {
  title: 'Print Medical Document - AASHORA Clinic Management',
};

export default function StandalonePrintLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans print:bg-white print:p-0 print:m-0">
      {children}
    </div>
  );
}
