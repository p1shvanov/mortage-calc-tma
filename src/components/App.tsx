import { miniApp, retrieveLaunchParams, useSignal } from '@telegram-apps/sdk-react';
import { AppRoot, Section, Text } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function App() {
  const lp = retrieveLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const { t } = useLocalization();

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <Section header={t('appTitle')}>
        <Text>{t('loanDetails')}</Text>
        <LanguageSwitcher />
      </Section>
    </AppRoot>
  );
}
