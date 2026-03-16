import { memo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Section, Cell, Text, Snackbar } from '@telegram-apps/telegram-ui';
import {
  addToHomeScreen,
  retrieveLaunchParams,
} from '@telegram-apps/sdk-react';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from '@tonconnect/ui-react';

import DonateModal from '@/components/settings/DonateModal';
import { Page } from '@/components/layout';
import { LanguageSwitcher } from '@/components/shared';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { hapticSelection } from '@/utils/haptic';

const DONATION_ADDRESS = import.meta.env.VITE_DONATION_ADDRESS as
  | string
  | undefined;

const SettingsPage = memo(function SettingsPage() {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const platform = retrieveLaunchParams().tgWebAppPlatform;
  const isMobilePlatform = platform === 'android' || platform === 'ios';
  const showAddToHomeScreen =
    addToHomeScreen.isAvailable?.() && isMobilePlatform;
  const showThankAuthor = Boolean(DONATION_ADDRESS?.trim());

  const handleThankAuthorClick = useCallback(() => {
    hapticSelection();
    if (!wallet) {
      tonConnectUI.openModal();
      return;
    }
    setDonateModalOpen(true);
  }, [wallet, tonConnectUI]);

  const handleDonateSend = useCallback(
    async (amountNano: number) => {
      if (!DONATION_ADDRESS || sending) return;
      setSending(true);
      try {
        await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 300,
          messages: [
            {
              address: DONATION_ADDRESS,
              amount: String(amountNano),
            },
          ],
        });
        setSnackbarMessage(t('donateSuccess'));
        setSnackbarOpen(true);
      } catch {
        setSnackbarMessage(t('donateError'));
        setSnackbarOpen(true);
      } finally {
        setSending(false);
      }
    },
    [tonConnectUI, sending, t],
  );

  return (
    <Page onBack={() => navigate('/')}>
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
        {showThankAuthor && (
          <Section header={t('thankAuthor')}>
            <Cell
              subtitle={t('thankAuthorSubtitle')}
              after={<Icon24ChevronRight />}
              onClick={handleThankAuthorClick}
            >
              <Text>{t('thankAuthor')}</Text>
            </Cell>
          </Section>
        )}
         <TonConnectButton />
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
      <DonateModal
        open={donateModalOpen}
        onOpenChange={setDonateModalOpen}
        onSend={handleDonateSend}
        sending={sending}
      />
      {snackbarOpen && (
        <Snackbar duration={3000} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Snackbar>
      )}
    </Page>
  );
});

export default SettingsPage;
