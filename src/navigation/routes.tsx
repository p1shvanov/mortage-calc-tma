import type { ComponentType, JSX } from 'react';

import { MortgageResult } from '@/pages/MortgageResult';
import { LoanForm } from '@/pages/LoanForm';
import { HomePage } from '@/pages/HomePage';
import { SettingsPage } from '@/pages/SettingsPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: HomePage },
  { path: '/settings', Component: SettingsPage },
  { path: '/calculator', Component: LoanForm },
  { path: '/result', Component: MortgageResult, title: 'Mortgage Result' },
];
