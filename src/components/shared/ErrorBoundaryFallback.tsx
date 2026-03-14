import { memo } from 'react';

import { Caption, List, Section } from '@telegram-apps/telegram-ui';

const ErrorBoundaryFallback = ({ error }: { error: unknown }) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);

  return (
    <List>
      <Section header="Произошла ошибка">
        <Caption style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {message}
        </Caption>
      </Section>
    </List>
  );
};

export default memo(ErrorBoundaryFallback);
