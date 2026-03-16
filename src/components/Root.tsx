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
    <ErrorBoundary fallback={ErrorBoundaryFallback}>
      <TonConnectUIProvider manifestUrl={publicUrl('tonconnect-manifest.json')}>
        <LocalizationProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LocalizationProvider>
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
};

export default memo(Root);
