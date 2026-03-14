import { memo } from 'react';
import { List, Section, Cell, Text } from '@telegram-apps/telegram-ui';
import {
  addToHomeScreen,
  retrieveLaunchParams,
} from '@telegram-apps/sdk-react';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';

import { Page } from '@/components/layout';
import { LanguageSwitcher } from '@/components/shared';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { hapticSelection } from '@/utils/haptic';

const SettingsPage = memo(function SettingsPage() {
  const { t } = useLocalization();
  const { themeMode } = useTheme();

  const platform = retrieveLaunchParams().tgWebAppPlatform;
  const isMobilePlatform = platform === 'android' || platform === 'ios';
  const showAddToHomeScreen =
    addToHomeScreen.isAvailable?.() && isMobilePlatform;

  return (
    <Page>
      <List>
        <Section header={t('language')}>
          <LanguageSwitcher />
        </Section>
        {showAddToHomeScreen && (
          <Section header={t('settings')}>
            <Cell
              subtitle={t('addToHomeScreenSubtitle')}
              after={<Icon24ChevronRight />}
              onClick={() => {
                hapticSelection();
                addToHomeScreen();
              }}
            >
              <Text>{t('addToHomeScreen')}</Text>
            </Cell>
          </Section>
        )}
        <Section header={t('about')}>
          <Cell
            subtitle={themeMode === 'dark' ? t('themeDark') : t('themeLight')}
          >
            <Text>{t('theme')}</Text>
          </Cell>
          <Cell subtitle={__APP_VERSION__}>
            <Text>{t('version')}</Text>
          </Cell>
        </Section>
      </List>
    </Page>
  );
});

export default SettingsPage;
