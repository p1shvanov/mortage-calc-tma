// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

import Root from '@/components/Root';
import EnvUnsupported from '@/components/EnvUnsupported';
import { init } from '@/init';
import { isDebugAlertsEnabled } from '@/utils/debugAlerts';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

function showErrorAlert(title: string, message: string): void {
  if (!isDebugAlertsEnabled()) return;
  try {
    alert(`${title}\n\n${message}`);
  } catch {
    console.error(title, message);
  }
}

window.addEventListener('error', (event) => {
  const msg = event.error instanceof Error ? `${event.error.message}\n${event.error.stack ?? ''}` : String(event.message);
  console.error('Global error:', event.error ?? event.message);
  showErrorAlert('Ошибка приложения', msg);
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason instanceof Error ? `${event.reason.message}\n${event.reason.stack ?? ''}` : String(event.reason);
  console.error('Unhandled rejection:', event.reason);
  showErrorAlert('Необработанный Promise', msg);
});

try {
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  const debug =
    (launchParams.tgWebAppStartParam || '').includes('platformer_debug') ||
    import.meta.env.DEV;

  await init({
    debug,
    eruda: debug && ['ios', 'android', 'macos'].includes(platform),
    mockForMacOS: platform === 'macos',
  }).then(() => {
    root.render(<Root />);
  });
} catch (e) {
  console.error('Bootstrap error:', e);
  const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e);
  showErrorAlert('Ошибка запуска', msg);
  root.render(<EnvUnsupported />);
}
