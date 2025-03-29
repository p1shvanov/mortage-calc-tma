import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot, Section } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LoanDetails } from '@/components/LoanDetails/LoanDetails';
import { ResultsDisplay } from '@/components/ResultsDisplay/ResultsDisplay';
import { Container } from '@/components/layout/Container';
import { ChartsContainer } from '@/components/charts/ChartsContainer';
import { PaymentSchedule } from '@/components/PaymentSchedule/PaymentSchedule';
import { TabView, TabPanel } from '@/components/TabView/TabView';
import { EarlyPaymentContainer } from '@/components/EarlyPayment/EarlyPaymentContainer';
import { MortgageProvider } from '@/providers/MortgageProvider';

export function App() {
  const lp = retrieveLaunchParams();
  const { themeMode } = useTheme();
  const { t } = useLocalization();

  return (
    <AppRoot
      appearance={themeMode}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <MortgageProvider>
        <Container>
          <Section header={t('appTitle')}>
            <LoanDetails />
            <EarlyPaymentContainer />
            <ResultsDisplay />
            
            <TabView
              tabs={[
                { id: 'charts', label: t('graphicalView') },
                { id: 'schedule', label: t('paymentSchedule') }
              ]}
              defaultTab="charts"
            >
              <TabPanel id="charts">
                <ChartsContainer />
              </TabPanel>
              <TabPanel id="schedule">
                <PaymentSchedule />
              </TabPanel>
            </TabView>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </Section>
        </Container>
      </MortgageProvider>
    </AppRoot>
  );
}
