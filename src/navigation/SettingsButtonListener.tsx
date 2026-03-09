import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsButton } from '@telegram-apps/sdk-react';

/**
 * Subscribes to Telegram Settings Button click and navigates to /settings.
 * Must be rendered inside HashRouter to have access to useNavigate.
 */
export function SettingsButtonListener() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!settingsButton.onClick?.isAvailable?.()) return;
    const off = settingsButton.onClick(() => navigate('/settings'));
    return off;
  }, [navigate]);

  return null;
}
