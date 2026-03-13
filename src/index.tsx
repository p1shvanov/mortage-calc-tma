// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

import Root from '@/components/Root';
import EnvUnsupported from '@/components/EnvUnsupported';
import { init } from '@/init';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  const launchParams = retrieveLaunchParams();
  const platform = launchParams.tgWebAppPlatform;
  const startParam = launchParams.tgWebAppStartParam;
  const debug = import.meta.env.DEV;
  const erudaFromUrl = new URLSearchParams(window.location.search).get('eruda') === '1';
  const debugFromStartParam = startParam === 'platformer_debug';
  await init({
    debug: debug || debugFromStartParam,
    eruda:
      erudaFromUrl ||
      debugFromStartParam ||
      (debug && ['ios', 'android', 'macos'].includes(platform ?? '')),
    mockForMacOS: platform === 'macos',
  });
  root.render(<Root />);
} catch (e) {
  console.error('Bootstrap error:', e);
  root.render(<EnvUnsupported />);
}
