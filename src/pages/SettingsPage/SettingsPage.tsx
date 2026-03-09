import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Section, Cell, Text } from '@telegram-apps/telegram-ui';
import { addToHomeScreen } from '@telegram-apps/sdk-react';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';

import Page from '@/components/Page';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { hapticSelection } from '@/utils/haptic';

const SettingsPage = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const { themeMode } = useTheme();

  return (
    <Page>
      <List>
        <Section header={t('language')}>
          <LanguageSwitcher />
        </Section>
        <Section header={t('settings')}>
          <Cell subtitle={themeMode === 'dark' ? t('themeDark') : t('themeLight')}>
            <Text>{t('theme')}</Text>
          </Cell>
          <Cell
            subtitle={t('faq')}
            after={<Icon24ChevronRight />}
            onClick={() => {
              hapticSelection();
              navigate('/onboarding');
            }}
          >
            <Text>{t('faq')}</Text>
          </Cell>
        </Section>

        {addToHomeScreen.isAvailable?.() && (
          <Section header={t('addToHomeScreen')}>
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
      </List>
    </Page>
  );
};

export default memo(SettingsPage);
