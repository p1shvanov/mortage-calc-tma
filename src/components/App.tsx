import { lazy, memo, Suspense, useMemo, useState } from 'react';
import {
  isMiniAppDark,
  retrieveLaunchParams,
  useSignal,
} from '@telegram-apps/sdk-react';
import { AppRoot, Modal, Spinner } from '@telegram-apps/telegram-ui';

import MortageForm from '@/components/MortageForm';

const MortageResult = lazy(() => import('@/components/MortageResult'));

const App = () => {
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
  const isDark = useSignal(isMiniAppDark);
  const lp = useMemo(() => retrieveLaunchParams(), []);


  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <MortageForm setIsModalOpened={setIsModalOpened} />
      <Modal
        open={isModalOpened}
        onOpenChange={(open: boolean) => setIsModalOpened(open)}
      >
        <Suspense fallback={<Spinner size='l' />}>
          <MortageResult />
        </Suspense>
      </Modal>
    </AppRoot>
  );
};

export default memo(App);
