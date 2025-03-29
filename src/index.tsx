import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { createRoot } from 'react-dom/client';

import { Root } from './components/Root.tsx';
import { EnvUnsupported } from './components/EnvUnsupported.tsx';

import { init } from './init';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

const root = createRoot(document.getElementById('root')!);

try {
  init(retrieveLaunchParams().startParam === 'debug' || import.meta.env.DEV);

  root.render(<Root />);
} catch (error) {
  root.render(<EnvUnsupported />);
}