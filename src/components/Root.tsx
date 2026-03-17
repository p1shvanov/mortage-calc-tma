import { memo } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

import App from '@/components/App';
import {
  ErrorBoundary,
  ErrorBoundaryFallback,
} from '@/components/shared';
import { publicUrl } from '@/helpers/publicUrl';
import { LocalizationProvider } from '@/providers/LocalizationProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

const Root = () => {
  return (
    <TonConnectUIProvider manifestUrl={publicUrl('tonconnect-manifest.json')}>
      <LocalizationProvider>
        <ErrorBoundary fallback={ErrorBoundaryFallback}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ErrorBoundary>
      </LocalizationProvider>
    </TonConnectUIProvider>
  );
};

export default memo(Root);
