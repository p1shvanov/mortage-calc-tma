import { useMemo } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';

import Router from '@/navigation/Router';
import { useTheme } from '@/providers/ThemeProvider';

const App = () => {
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const { isDark, themeMode } = useTheme();

  return (
    <AppRoot
      key={themeMode}
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <Router />
    </AppRoot>
  );
};

export default App;

