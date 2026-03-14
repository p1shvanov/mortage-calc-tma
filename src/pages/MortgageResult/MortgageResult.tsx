import { memo, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { List, Button, Section } from '@telegram-apps/telegram-ui';

import {
  BackButton,
  BreadcrumbsNav,
  Page,
} from '@/components/layout';
import {
  ChartsContainer,
  EarlyPaymentsModal,
  PaymentSchedule,
  ResultsDisplay,
  TabView,
} from '@/components/result';
import { CalculationPlaceholder } from '@/components/shared';
import { useCalculationWithResults } from '@/hooks/useCalculationWithResults';
import { useMainButton } from '@/hooks/useMainButton';
import { useMainButtonAvailable } from '@/hooks/useTelegramButtonsAvailable';
import { MortgageContextProvider } from '@/providers/MortgageProvider';
import { useLocalization } from '@/providers/LocalizationProvider';
import { hapticButton } from '@/utils/haptic';

/** Result page: id in URL required. Data is loaded from storage (single source of truth). */
const MortgageResult = memo(function MortgageResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mainButtonAvailable = useMainButtonAvailable();
  const [earlyPaymentsModalOpen, setEarlyPaymentsModalOpen] = useState(false);
  const { t } = useLocalization();

  const idFromUrl = searchParams.get('id');
  const { status, value } = useCalculationWithResults(idFromUrl);

  const hasOverpayments = value
    ? value.earlyPayments.length > 0 || value.regularPayments.length > 0
    : false;
  const mainButtonLabel = hasOverpayments
    ? t('editEarlyPayments')
    : t('addEarlyPayments');
  const canEditEarlyPayments = value?.loanDetails != null;

  const resultTabPanels = useMemo(
    () => [
      { id: 'charts' as const, icon: '📊' as const, content: <ChartsContainer /> },
      { id: 'schedule' as const, icon: '📅' as const, content: <PaymentSchedule /> },
    ],
    []
  );

  useMainButton(
    canEditEarlyPayments && !earlyPaymentsModalOpen
      ? {
          text: mainButtonLabel,
          isEnabled: true,
          hasShineEffect: true,
          onClick: () => setEarlyPaymentsModalOpen(true),
        }
      : null
  );

  if (idFromUrl && status === 'loading') {
    return <CalculationPlaceholder state="loading" t={t} />;
  }

  if (idFromUrl && status === 'notFound') {
    return (
      <CalculationPlaceholder
        state="notFound"
        t={t}
        notFoundAction={{
          label: t('goToHome'),
          onClick: () => navigate('/'),
        }}
      />
    );
  }

  if (!idFromUrl || status !== 'ready' || !value) {
    return (
      <CalculationPlaceholder
        state="empty"
        t={t}
        emptyAction={{
          label: t('goToCalculator'),
          onClick: () => navigate('/calculator'),
        }}
      />
    );
  }

  return (
    <MortgageContextProvider value={value}>
      <Page>
        <List>
          <BreadcrumbsNav
            items={[
              { label: t('home'), path: '/' },
              { label: t('calculator'), path: '/calculator' },
              { label: t('resultTitle') },
            ]}
          />
          <Section>
            {!mainButtonAvailable && (
              <>
                <BackButton
                  onClick={() => {
                    hapticButton();
                    navigate(idFromUrl ? `/calculator?id=${idFromUrl}` : '/calculator');
                  }}
                >
                  {t('editParameters')}
                </BackButton>
                {canEditEarlyPayments && (
                  <Button
                    size='s'
                    mode='plain'
                    onClick={() => {
                      hapticButton();
                      setEarlyPaymentsModalOpen(true);
                    }}
                  >
                    {mainButtonLabel}
                  </Button>
                )}
              </>
            )}
          </Section>
          <ResultsDisplay />
          <EarlyPaymentsModal
            open={earlyPaymentsModalOpen}
            onOpenChange={setEarlyPaymentsModalOpen}
          />
          <TabView panels={resultTabPanels} defaultTab='charts' />
        </List>
      </Page>
    </MortgageContextProvider>
  );
});

export default MortgageResult;
