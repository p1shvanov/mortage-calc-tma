import { memo, useEffect, useMemo, useState, useRef } from 'react';
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
import { useMainButton } from '@/hooks/useMainButton';
import { useMainButtonAvailable } from '@/hooks/useTelegramButtonsAvailable';
import { useMortgage } from '@/providers/MortgageProvider';
import { useLocalization } from '@/providers/LocalizationProvider';
import { getCalculationsStorage } from '@/services/storage';
import { hapticButton } from '@/utils/haptic';

/** Result page: id in URL required. All data is loaded from storage (single source of truth). */
const MortageResult = memo(function MortageResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mainButtonAvailable = useMainButtonAvailable();
  const [earlyPaymentsModalOpen, setEarlyPaymentsModalOpen] = useState(false);
  const [loadingById, setLoadingById] = useState(false);
  const [calculationNotFound, setCalculationNotFound] = useState(false);
  const {
    loanDetails,
    earlyPayments,
    regularPayments,
    setLoanDetails,
    setEarlyPayments,
    setRegularPayments,
  } = useMortgage();
  const { t } = useLocalization();

  const idFromUrl = searchParams.get('id');
  const savedId = idFromUrl;

  const hasOverpayments =
    earlyPayments.length > 0 || regularPayments.length > 0;
  const mainButtonLabel = hasOverpayments
    ? t('editEarlyPayments')
    : t('addEarlyPayments');

  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');

    if (!id) {
      loadedIdRef.current = null;
      setLoadingById(false);
      setCalculationNotFound(false);
      return;
    }

    if (loadedIdRef.current !== id) {
      loadedIdRef.current = id;
      setLoadingById(true);
      setCalculationNotFound(false);
      getCalculationsStorage()
        .getById(id)
        .then((calc) => {
          setLoadingById(false);
          if (calc) {
            setCalculationNotFound(false);
            setLoanDetails(calc.loanDetails);
            setEarlyPayments(calc.earlyPayments ?? []);
            setRegularPayments(calc.regularPayments ?? []);
          } else {
            setCalculationNotFound(true);
          }
        })
        .catch(() => {
          setLoadingById(false);
          setCalculationNotFound(true);
        });
    }
  }, [searchParams, setLoanDetails, setEarlyPayments, setRegularPayments]);

  const hasPayload = idFromUrl && loanDetails !== null && !calculationNotFound;
  const canEditEarlyPayments = hasPayload && !!loanDetails;

  const resultTabPanels = useMemo(
    () => [
      { id: 'charts', icon: '📊' as const, content: <ChartsContainer /> },
      { id: 'schedule', icon: '📅' as const, content: <PaymentSchedule /> },
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

  useEffect(() => {
    if (!savedId || !loanDetails) return;
    getCalculationsStorage()
      .update(savedId, { loanDetails, earlyPayments, regularPayments })
      .catch(() => {});
  }, [savedId, loanDetails, earlyPayments, regularPayments]);

  if (idFromUrl && loadingById) {
    return <CalculationPlaceholder state="loading" t={t} />;
  }

  if (idFromUrl && calculationNotFound) {
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

  if (!idFromUrl || !hasPayload) {
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
                  navigate(savedId ? `/calculator?id=${savedId}` : '/calculator');
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
  );
});

export default MortageResult;
