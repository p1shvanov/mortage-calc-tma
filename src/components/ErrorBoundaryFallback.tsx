import { memo, useEffect } from 'react';

import { Caption, List, Section } from '@telegram-apps/telegram-ui';
import { isDebugAlertsEnabled } from '@/utils/debugAlerts';

const ErrorBoundaryFallback = ({ error }: { error: unknown }) => {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
  const stack = error instanceof Error ? error.stack : undefined;

  useEffect(() => {
    if (isDebugAlertsEnabled() && error != null) {
      const detail = stack ? `${message}\n\n${stack}` : message;
      try {
        alert(`Ошибка (Error Boundary):\n\n${detail}`);
      } catch {
        console.error('ErrorBoundary:', message, stack);
      }
    }
  }, [error, message, stack]);

  return (
    <List>
      <Section header="Произошла ошибка">
        <Caption style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{message}</Caption>
        {stack && isDebugAlertsEnabled() && (
          <pre style={{ fontSize: 12, overflow: 'auto', maxHeight: 200 }}>{stack}</pre>
        )}
      </Section>
    </List>
  );
};

export default memo(ErrorBoundaryFallback);
