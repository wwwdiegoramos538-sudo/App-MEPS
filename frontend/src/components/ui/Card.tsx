import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'elevated' | 'soft';
}

export function Card({ children, className, hover, variant = 'default' }: CardProps) {
  const variants = {
    default:
      'bg-[var(--surface)]/95 border-2 border-black shadow-brutal dark:shadow-brutal-cyan',
    elevated:
      'bg-white border-2 border-black shadow-soft-lg dark:bg-gray-900/95 dark:shadow-brutal-cyan',
    soft:
      'bg-meps-cream/90 dark:bg-gray-900/80 border-2 border-black/80 shadow-brutal-sm',
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-5 sm:p-6 backdrop-blur-sm transition-all duration-200',
        variants[variant],
        hover &&
          'hover:-translate-y-0.5 hover:shadow-brutal-lg dark:hover:shadow-[6px_6px_0_#00D4FF] cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
