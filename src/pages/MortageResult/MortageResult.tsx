import { useEffect, useState, useRef } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
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
import type { CalculationPayload } from '@/hooks/useLoanForm';

const tabs = [
  { id: 'charts', icon: '📊' },
  { id: 'schedule', icon: '📅' },
];

function isCalculationPayload(state: unknown): state is CalculationPayload {
  return (
    typeof state === 'object' &&
    state !== null &&
    'loanDetails' in state &&
    typeof (state as CalculationPayload).loanDetails === 'object'
  );
}

const MortageResult = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mainButtonAvailable = useMainButtonAvailable();
  const [earlyPaymentsModalOpen, setEarlyPaymentsModalOpen] = useState(false);
  const {
    loanDetails,
    earlyPayments,
    regularPayments,
    setLoanDetails,
    setEarlyPayments,
    setRegularPayments,
  } = useMortgage();
  const { t } = useLocalization();

  const hasOverpayments =
    earlyPayments.length > 0 || regularPayments.length > 0;
  const mainButtonLabel = hasOverpayments
    ? t('editEarlyPayments')
    : t('addEarlyPayments');

  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    const state = location.state;
    const id = searchParams.get('id');
    if (isCalculationPayload(state)) {
      if (!initialLoadDoneRef.current) {
        initialLoadDoneRef.current = true;
        setLoanDetails(state.loanDetails);
        setEarlyPayments(state.earlyPayments ?? []);
        setRegularPayments(state.regularPayments ?? []);
      }
      return;
    }
    if (id) {
      if (!initialLoadDoneRef.current) {
        initialLoadDoneRef.current = true;
        getCalculationsStorage()
          .getById(id)
          .then((calc) => {
            if (calc) {
              setLoanDetails(calc.loanDetails);
              setEarlyPayments(calc.earlyPayments ?? []);
              setRegularPayments(calc.regularPayments ?? []);
            }
          })
          .catch(() => {});
      }
    } else {
      initialLoadDoneRef.current = false;
    }
  }, [location.state, searchParams, setLoanDetails, setEarlyPayments, setRegularPayments]);

  const stateSavedId =
    location.state &&
    typeof location.state === 'object' &&
    'savedId' in location.state
      ? (location.state as { savedId?: string }).savedId
      : undefined;

  const savedId = stateSavedId ?? searchParams.get('id') ?? null;

  useEffect(() => {
    if (!savedId || !loanDetails) return;
    getCalculationsStorage()
      .update(savedId, { loanDetails, earlyPayments, regularPayments })
      .catch(() => {});
  }, [savedId, loanDetails, earlyPayments, regularPayments]);

  const hasPayload =
    isCalculationPayload(location.state) || searchParams.get('id');
  const canEditEarlyPayments = hasPayload && !!loanDetails;

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

  if (!hasPayload) {
    return (
      <Page>
        <List>
          <Placeholder
            header={t('noCalculationsYet')}
            description={t('goToCalculator')}
            action={
              <Button
                size='m'
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
                  if (loanDetails) {
                    navigate('/calculator', {
                      state: {
                        loanDetails,
                        earlyPayments,
                        regularPayments,
                        savedId: stateSavedId,
                      },
                    });
                  } else {
                    navigate('/calculator');
                  }
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
