import { memo } from 'react';

import App from '@/components/App';
import {
  ErrorBoundary,
  ErrorBoundaryFallback,
} from '@/components/shared';

import { LocalizationProvider } from '@/providers/LocalizationProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

const Root = () => {
  return (
    <ErrorBoundary fallback={ErrorBoundaryFallback}>
      <LocalizationProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  );
};

export default memo(Root);
