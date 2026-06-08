'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary:
        'bg-meps-dark hover:bg-meps-primary text-white border-2 border-black shadow-brutal-sm hover:shadow-brutal',
      secondary:
        'bg-meps-cyan hover:bg-cyan-300 text-black border-2 border-black shadow-brutal-sm',
      outline:
        'bg-white dark:bg-transparent border-2 border-black text-current hover:bg-meps-sky/60 dark:hover:bg-meps-light/20 shadow-brutal-sm',
      ghost:
        'bg-transparent hover:bg-meps-sky/50 dark:hover:bg-white/10 border-2 border-transparent hover:border-black/20',
      danger: 'bg-red-600 hover:bg-red-700 text-white border-2 border-black shadow-brutal-sm',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[40px]',
      md: 'px-5 py-2.5 text-sm min-h-[44px]',
      lg: 'px-8 py-3.5 text-base min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
