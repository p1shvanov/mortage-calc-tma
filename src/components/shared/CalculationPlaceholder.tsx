import { memo, ReactNode } from 'react';
import { List, Placeholder, Button } from '@telegram-apps/telegram-ui';

import { Page } from '@/components/layout';
import { hapticButton } from '@/utils/haptic';

export type CalculationPlaceholderState = 'loading' | 'notFound' | 'empty' | 'error';

export interface CalculationPlaceholderAction {
  label: string;
  onClick: () => void;
}

export interface CalculationPlaceholderProps {
  state: CalculationPlaceholderState;
  /** Translation function */
  t: (key: string) => string;
  /** For loading: optional custom content (e.g. Skeleton). Default: none. */
  loadingContent?: ReactNode;
  /** For notFound: button with label and onClick. */
  notFoundAction?: CalculationPlaceholderAction;
  /** For empty: button with label and onClick. */
  emptyAction?: CalculationPlaceholderAction;
  /** For error: retry button. */
  errorAction?: CalculationPlaceholderAction;
}

const CalculationPlaceholder = memo(function CalculationPlaceholder({
  state,
  t,
  loadingContent,
  notFoundAction,
  emptyAction,
  errorAction,
}: CalculationPlaceholderProps) {
  const wrapClick = (onClick: () => void) => () => {
    hapticButton();
    onClick();
  };

  const renderAction = (action: CalculationPlaceholderAction) => (
    <Button size="m" mode="filled" onClick={wrapClick(action.onClick)}>
      {action.label}
    </Button>
  );

  const content = (() => {
    switch (state) {
      case 'loading':
        return (
          <Placeholder
            header={t('loading')}
            description={t('loadingCalculation')}
          >
            {loadingContent}
          </Placeholder>
        );
      case 'notFound':
        return (
          <Placeholder
            header={t('calculationNotFound')}
            description={t('goToCalculator')}
            action={
              notFoundAction ? renderAction(notFoundAction) : undefined
            }
          />
        );
      case 'empty':
        return (
          <Placeholder
            header={t('noCalculationsYet')}
            description={t('goToCalculator')}
            action={
              emptyAction ? renderAction(emptyAction) : undefined
            }
          />
        );
      case 'error':
        return (
          <Placeholder
            header={t('loadError')}
            description={t('retry')}
            action={
              errorAction ? renderAction(errorAction) : undefined
            }
          />
        );
      default:
        return null;
    }
  })();

  return (
    <Page>
      <List>{content}</List>
    </Page>
  );
});

export default CalculationPlaceholder;
