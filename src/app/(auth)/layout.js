export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-10 transition-colors duration-300">
      <div className="w-full max-w-6xl">{children}</div>
    </div>
  );
}
