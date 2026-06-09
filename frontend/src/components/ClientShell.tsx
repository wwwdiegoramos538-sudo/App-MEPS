'use client';

import { AppIntro } from '@/components/AppIntro';

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppIntro />
      <div id="meps-app-content">{children}</div>
    </>
  );
}
