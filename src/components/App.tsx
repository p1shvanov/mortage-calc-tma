import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot, Section } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LoanDetails, LoanDetailsValues } from '@/components/LoanDetails/LoanDetails';
import { Container } from '@/components/layout/Container';
import { useState } from 'react';

export function App() {
  const lp = retrieveLaunchParams();
  const { themeMode } = useTheme();
  const { t } = useLocalization();
  // We'll use this state in future tasks for mortgage calculations
  const [loanValues, setLoanValues] = useState<LoanDetailsValues | null>(null);

  console.log(loanValues, 'loanValues');
  
  const handleLoanDetailsChange = (values: LoanDetailsValues) => {
    setLoanValues(values);
    // This will be used later to calculate mortgage results
    console.log('Loan details updated:', values);
  };

  return (
    <AppRoot
      appearance={themeMode}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
        <Container>
          <Section header={t('appTitle')}>
            <LoanDetails onValuesChange={handleLoanDetailsChange} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </Section>
        </Container>
    </AppRoot>
  );
}
