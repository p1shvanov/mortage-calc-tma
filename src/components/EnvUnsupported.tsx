import { memo } from 'react';

import { retrieveLaunchParams, useSignal, miniApp } from '@telegram-apps/sdk-react';
import { Placeholder, AppRoot } from '@telegram-apps/telegram-ui';

const EnvUnsupported = () => {
  const platform = retrieveLaunchParams().tgWebAppPlatform;
  const isDark = useSignal(miniApp.isDark)

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(platform) ? 'ios' : 'base'}
    >
      <Placeholder
        header="Oops"
        description="You are using too old Telegram client to run this application"
      >
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{ display: 'block', width: '144px', height: '144px' }}
        />
      </Placeholder>
    </AppRoot>
  );
};

export default memo(EnvUnsupported);