'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = {
  variant: {
    default:
      'bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm active:scale-[0.98]',
    outline:
      'btn-contrast-outline font-bold shadow-sm active:scale-[0.98]',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 font-bold',
    ghost:
      'btn-contrast-ghost font-medium',
    destructive:
      'bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm',
    link:
      'text-teal-600 dark:text-teal-400 underline-offset-4 hover:underline p-0 h-auto',
  },
  size: {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-6 text-base',
    icon: 'h-9 w-9 p-0 flex items-center justify-center',
  },
};

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          buttonVariants.variant[variant] || buttonVariants.variant.default,
          buttonVariants.size[size] || buttonVariants.size.default,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
