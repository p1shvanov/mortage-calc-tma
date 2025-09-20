import type { ComponentType, JSX } from 'react';

import { MortageResult } from '@/pages/MortageResult';
import { LoanForm } from '@/pages/LoanForm';
import { InitDataPage } from '@/pages/InitDataPage';
import { ThemeParamsPage } from '@/pages/ThemeParamsPage';
import { LaunchParamsPage } from '@/pages/LaunchParamsPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: LoanForm },
  { path: '/result', Component: MortageResult, title: 'Mortage Result' },
  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
  { path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params' },
  {
    path: '/launch-params',
    Component: LaunchParamsPage,
    title: 'Launch Params',
  },
];
