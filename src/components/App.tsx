import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot, Section } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LoanDetails, LoanDetailsValues } from '@/components/LoanDetails/LoanDetails';
import { ResultsDisplay } from '@/components/ResultsDisplay/ResultsDisplay';
import { Container } from '@/components/layout/Container';
import { calculateMortgage, MortgageResults } from '@/utils/mortgageCalculator';
import { generateAmortizationSchedule, AmortizationScheduleResult } from '@/utils/amortizationSchedule';
import { ChartsContainer } from '@/components/charts/ChartsContainer';
import { PaymentSchedule } from '@/components/PaymentSchedule/PaymentSchedule';
import { TabView, TabPanel } from '@/components/TabView/TabView';
import { useState, useEffect } from 'react';

export function App() {
  const lp = retrieveLaunchParams();
  const { themeMode } = useTheme();
  const { t } = useLocalization();
  const [loanValues, setLoanValues] = useState<LoanDetailsValues | null>(null);
  const [mortgageResults, setMortgageResults] = useState<MortgageResults | null>(null);
  const [amortizationResult, setAmortizationResult] = useState<AmortizationScheduleResult | null>(null);
  
  const handleLoanDetailsChange = (values: LoanDetailsValues) => {
    setLoanValues(values);
  };
  
  // Calculate mortgage results and amortization schedule when loan details change
  useEffect(() => {
    if (loanValues) {
      console.log('Loan values changed:', loanValues);
      try {
        const results = calculateMortgage(loanValues);
        setMortgageResults(results);
        
        // Generate amortization schedule
        const amortization = generateAmortizationSchedule({
          loanAmount: loanValues.loanAmount,
          interestRate: loanValues.interestRate,
          loanTerm: loanValues.loanTerm,
          startDate: loanValues.startDate,
          earlyPayments: []
        });
        console.log('Generated amortization schedule:', amortization);
        setAmortizationResult(amortization);
      } catch (error) {
        console.error('Error calculating mortgage results:', error);
      }
    }
  }, [loanValues]);


  return (
    <AppRoot
      appearance={themeMode}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
        <Container>
          <Section header={t('appTitle')}>
            <LoanDetails onValuesChange={handleLoanDetailsChange} />
            <ResultsDisplay results={mortgageResults} />
            
            <TabView
              tabs={[
                { id: 'charts', label: t('graphicalView') },
                { id: 'schedule', label: t('paymentSchedule') }
              ]}
              defaultTab="charts"
            >
              <TabPanel id="charts">
                <ChartsContainer amortizationResult={amortizationResult} />
              </TabPanel>
              <TabPanel id="schedule">
                <PaymentSchedule amortizationResult={amortizationResult} />
              </TabPanel>
            </TabView>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </Section>
        </Container>
    </AppRoot>
  );
}
