import { memo } from 'react';

import {
  retrieveLaunchParams,
  useSignal,
  miniApp,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const platform = retrieveLaunchParams().tgWebAppPlatform;
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(platform) ? 'ios' : 'base'}
    >
      <Outlet />
    </AppRoot>
  );
};

export default memo(Layout);
