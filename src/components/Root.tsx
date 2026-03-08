import { memo } from 'react';

import ErrorBoundaryFallback from '@/components/ErrorBoundaryFallback';
import ErrorBoundary from '@/components/ErrorBoundary.tsx';
import App from '@/components/App.tsx';

import { LocalizationProvider } from '@/providers/LocalizationProvider';
import { MortgageProvider } from '@/providers/MortgageProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

const Root = () => {
  return (
    <ErrorBoundary fallback={ErrorBoundaryFallback}>
      <LocalizationProvider>
        <ThemeProvider>
          <MortgageProvider>
            <App />
          </MortgageProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  );
};

export default memo(Root);
