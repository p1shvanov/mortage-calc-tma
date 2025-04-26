import { memo } from 'react';
import { Skeleton } from '@telegram-apps/telegram-ui';

const LoadingFallback = () => {
  return <Skeleton visible style={{ height: '100vh' }} />;
};

export default memo(LoadingFallback);
