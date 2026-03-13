import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { List, Button, Placeholder, Section } from '@telegram-apps/telegram-ui';
import { mainButton } from '@telegram-apps/sdk-react';

import { useMainButtonAvailable } from '@/hooks/useTelegramButtonsAvailable';
import BackButton from '@/components/BackButton';
import BreadcrumbsNav from '@/components/BreadcrumbsNav';
import ChartsContainer from '@/components/ChartsContainer';
import EarlyPaymentsModal from '@/components/EarlyPaymentsModal';
import PaymentSchedule from '@/components/PaymentSchedule';
import ResultsDisplay from '@/components/ResultsDisplay';
import TabPanel from '@/components/TabPanel';
import TabView from '@/components/TabView';
import Page from '@/components/Page';
import { useMortgage } from '@/providers/MortgageProvider';
import { useLocalization } from '@/providers/LocalizationProvider';
import { getCalculationsStorage } from '@/services/storage';
import { hapticButton } from '@/utils/haptic';

const tabs = [
  { id: 'charts', icon: '📊' },
  { id: 'schedule', icon: '📅' },
];

/** Result page: id in URL required. All data is loaded from storage (single source of truth). */
const MortageResult = () => {
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

  useEffect(() => {
    if (!savedId || !loanDetails) return;
    getCalculationsStorage()
      .update(savedId, { loanDetails, earlyPayments, regularPayments })
      .catch(() => {});
  }, [savedId, loanDetails, earlyPayments, regularPayments]);

  useEffect(() => {
    if (!canEditEarlyPayments || !mainButtonAvailable || earlyPaymentsModalOpen) return;
    mainButton.setParams({
      text: mainButtonLabel,
      isVisible: true,
      isEnabled: true,
      hasShineEffect: true,
    });
    const off = mainButton.onClick(() => {
      hapticButton();
      setEarlyPaymentsModalOpen(true);
    });
    return () => {
      mainButton.setParams({ isVisible: false });
      off();
    };
  }, [
    canEditEarlyPayments,
    mainButtonAvailable,
    t,
    mainButtonLabel,
    earlyPaymentsModalOpen,
  ]);

  useEffect(() => {
    if (!earlyPaymentsModalOpen && canEditEarlyPayments && mainButtonAvailable) {
      mainButton.setParams({
        text: mainButtonLabel,
        isVisible: true,
        isEnabled: true,
        hasShineEffect: true,
      });
    }
  }, [
    earlyPaymentsModalOpen,
    canEditEarlyPayments,
    mainButtonAvailable,
    mainButtonLabel,
  ]);

  if (idFromUrl && loadingById) {
    return (
      <Page>
        <List>
          <Placeholder header={t('loading')} description={t('loadingCalculation')} />
        </List>
      </Page>
    );
  }

  if (idFromUrl && calculationNotFound) {
    return (
      <Page>
        <List>
          <Placeholder
            header={t('calculationNotFound')}
            description={t('goToCalculator')}
            action={
              <Button
                size='m'
                onClick={() => {
                  hapticButton();
                  navigate('/');
                }}
              >
                {t('goToHome')}
              </Button>
            }
          />
        </List>
      </Page>
    );
  }

  if (!idFromUrl || !hasPayload) {
    return (
      <Page>
        <List>
          <Placeholder
            header={t('noCalculationsYet')}
            description={t('goToCalculator')}
            action={
              <Button
                size="m"
                onClick={() => {
                  hapticButton();
                  navigate('/calculator');
                }}
              >
                {t('goToCalculator')}
              </Button>
            }
          />
        </List>
      </Page>
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
        <TabView tabs={tabs} defaultTab='charts'>
          <TabPanel id='charts'>
            <ChartsContainer />
          </TabPanel>
          <TabPanel id='schedule'>
            <PaymentSchedule />
          </TabPanel>
        </TabView>
      </List>
    </Page>
  );
};

export default MortageResult;
