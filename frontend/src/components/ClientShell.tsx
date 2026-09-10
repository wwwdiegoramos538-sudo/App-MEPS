'use client';

import { AppIntro } from '@/components/AppIntro';
import { OnboardingTutorial } from '@/components/onboarding/OnboardingTutorial';

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppIntro />
      <OnboardingTutorial />
      <div id="meps-app-content">{children}</div>
    </>
  );
}
