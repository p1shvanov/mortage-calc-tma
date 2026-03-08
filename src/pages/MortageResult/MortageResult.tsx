import { useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { List, Button, Placeholder, Section } from '@telegram-apps/telegram-ui';
import { mainButton } from '@telegram-apps/sdk-react';

import ChartsContainer from '@/components/ChartsContainer';
import PaymentSchedule from '@/components/PaymentSchedule';
import ResultsDisplay from '@/components/ResultsDisplay';
import TabPanel from '@/components/TabPanel';
import TabView from '@/components/TabView';
import Page from '@/components/Page';
import { useMortgage } from '@/providers/MortgageProvider';
import { useLocalization } from '@/providers/LocalizationProvider';
import { getCalculationsStorage } from '@/services/storage';
import { hapticImpact } from '@/utils/haptic';
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
  const {
    loanDetails,
    earlyPayments,
    regularPayments,
    setLoanDetails,
    setEarlyPayments,
    setRegularPayments,
  } = useMortgage();
  const { t } = useLocalization();

  useEffect(() => {
    const state = location.state;
    if (isCalculationPayload(state)) {
      setLoanDetails(state.loanDetails);
      setEarlyPayments(state.earlyPayments);
      setRegularPayments(state.regularPayments);
      return;
    }
    const id = searchParams.get('id');
    if (id) {
      getCalculationsStorage()
        .getById(id)
        .then((calc) => {
          if (calc) {
            setLoanDetails(calc.loanDetails);
            setEarlyPayments(calc.earlyPayments);
            setRegularPayments(calc.regularPayments);
          }
        })
        .catch(() => {});
    }
  }, [location.state, searchParams, setLoanDetails, setEarlyPayments, setRegularPayments]);

  const stateSavedId =
    location.state && typeof location.state === 'object' && 'savedId' in location.state
      ? (location.state as { savedId?: string }).savedId
      : undefined;

  const hasPayload = isCalculationPayload(location.state) || searchParams.get('id');

  useEffect(() => {
    if (!hasPayload) return;
    mainButton.setParams({
      text: t('editParameters'),
      isVisible: true,
      isEnabled: true,
    });
    const off = mainButton.onClick(() => {
      hapticImpact('light');
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
    });
    return () => {
      mainButton.setParams({ isVisible: false });
      off();
    };
  }, [hasPayload, t, loanDetails, earlyPayments, regularPayments, stateSavedId, navigate]);

  if (!hasPayload) {
    return (
      <Page>
        <List>
          <Placeholder
            header={t('noCalculationsYet')}
            description={t('goToCalculator')}
            action={
              <Button size='m' onClick={() => navigate('/calculator')}>
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
        <Section>
          <Button
            size='s'
            mode='plain'
            before={<span style={{ marginRight: 4 }}>←</span>}
            onClick={() => {
              hapticImpact('light');
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
          </Button>
        </Section>
        <ResultsDisplay />
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
