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
import { useState, useEffect } from 'react';

export function App() {
  const lp = retrieveLaunchParams();
  const { themeMode } = useTheme();
  const { t } = useLocalization();
  const [loanValues, setLoanValues] = useState<LoanDetailsValues | null>(null);
  const [mortgageResults, setMortgageResults] = useState<MortgageResults | null>(null);
  
  const handleLoanDetailsChange = (values: LoanDetailsValues) => {
    setLoanValues(values);
  };
  
  // Calculate mortgage results when loan details change
  useEffect(() => {
    if (loanValues) {
      try {
        const results = calculateMortgage(loanValues);
        setMortgageResults(results);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </Section>
        </Container>
    </AppRoot>
  );
}
