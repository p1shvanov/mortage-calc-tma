import { memo } from 'react';

import { Caption, List, Section } from '@telegram-apps/telegram-ui';

import { useLocalization } from '@/providers/LocalizationProvider';

const ErrorBoundaryFallback = ({ error }: { error: unknown }) => {
  const { t } = useLocalization();
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);

  return (
    <List>
      <Section header={t('errorOccurred')}>
        <Caption style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {message}
        </Caption>
      </Section>
    </List>
  );
};

export default memo(ErrorBoundaryFallback);
