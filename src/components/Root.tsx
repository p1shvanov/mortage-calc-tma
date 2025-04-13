import { memo } from 'react';

import ErrorBoundaryFallback from '@/components/ErrorBoundaryFallback';
import ErrorBoundary from '@/components/ErrorBoundary.tsx';
import App from '@/components/App.tsx';

import { LocalizationProvider } from '@/providers/LocalizationProvider';
import { MortgageProvider } from '@/providers/MortgageProvider';

const Root = () => {
  return (
    <ErrorBoundary fallback={ErrorBoundaryFallback}>
      <LocalizationProvider>
        <MortgageProvider>
          <App />
        </MortgageProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  );
};

export default memo(Root);
