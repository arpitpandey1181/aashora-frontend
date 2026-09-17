import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className={cn('w-full caption-bottom text-sm text-left', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead className={cn('bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn('divide-y divide-slate-100 dark:divide-slate-800/80', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 data-[state=selected]:bg-slate-100 dark:data-[state=selected]:bg-slate-800',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={cn(
        'h-11 px-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 align-middle',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td className={cn('p-4 align-middle text-slate-700 dark:text-slate-200', className)} {...props}>
      {children}
    </td>
  );
}

export function TableEmptyState({ colSpan = 5, message = 'No data available' }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-32 text-center text-slate-400 dark:text-slate-500 font-medium">
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-xl">🔍</span>
          <span>{message}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
