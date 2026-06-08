import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizes = { sm: 40, md: 56, lg: 80 };

export function Logo({ size = 'md', showText = true, href = '/', className }: LogoProps) {
  const dim = sizes[size];

  const content = (
    <div className={cn('flex items-center gap-3', className)} suppressHydrationWarning>
      <Image
        src="/logo.png"
        alt="MEPS - Traduciendo el Futuro"
        width={dim}
        height={dim}
        className="rounded-lg border-2 border-black shadow-[2px_2px_0_#000]"
        priority
      />
      {showText && (
        <div className="hidden sm:block">
          <p className="font-display font-bold text-lg leading-tight text-meps-dark dark:text-meps-cyan">
            MEPS
          </p>
          <p className="text-xs font-medium text-meps-primary dark:text-meps-light italic">
            Traduciendo el Futuro
          </p>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
