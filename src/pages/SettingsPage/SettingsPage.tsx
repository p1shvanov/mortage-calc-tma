import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Section, Cell, Text, Switch } from '@telegram-apps/telegram-ui';
import { addToHomeScreen, viewport, useSignal, retrieveLaunchParams } from '@telegram-apps/sdk-react';
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
  const isFullscreen = useSignal(viewport.isFullscreen);
  const fullscreenAvailable = viewport.requestFullscreen?.isAvailable?.() && viewport.exitFullscreen?.isAvailable?.();

  const platform = retrieveLaunchParams().tgWebAppPlatform;
  const isMobilePlatform = platform === 'android' || platform === 'ios';
  const showAddToHomeScreen = addToHomeScreen.isAvailable?.() && isMobilePlatform;

  const handleFullscreenToggle = () => {
    hapticSelection();
    if (isFullscreen) {
      void viewport.exitFullscreen?.();
    } else {
      void viewport.requestFullscreen?.();
    }
  };

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
          {fullscreenAvailable && (
            <Cell
              subtitle={isFullscreen ? t('fullscreenOn') : t('fullscreenOff')}
              after={
                <Switch
                  checked={isFullscreen}
                  onChange={handleFullscreenToggle}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              onClick={handleFullscreenToggle}
            >
              <Text>{t('fullscreen')}</Text>
            </Cell>
          )}
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

        {showAddToHomeScreen && (
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

        <Section header={t('about')}>
          <Cell subtitle={__APP_VERSION__}>
            <Text>{t('version')}</Text>
          </Cell>
        </Section>
      </List>
    </Page>
  );
};

export default memo(SettingsPage);
