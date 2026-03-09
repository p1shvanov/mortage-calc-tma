import type { ComponentType, JSX } from 'react';

import { MortageResult } from '@/pages/MortageResult';
import { LoanForm } from '@/pages/LoanForm';
import { InitDataPage } from '@/pages/InitDataPage';
import { HomePage } from '@/pages/HomePage';
import { SettingsPage } from '@/pages/SettingsPage';
import OnboardingPage from '@/pages/Onboarding/OnboardingPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: HomePage },
  { path: '/settings', Component: SettingsPage },
  { path: '/onboarding', Component: OnboardingPage },
  { path: '/calculator', Component: LoanForm },
  { path: '/result', Component: MortageResult, title: 'Mortage Result' },
  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
];
