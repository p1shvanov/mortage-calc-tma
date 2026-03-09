import { memo } from 'react';
import { Skeleton } from '@telegram-apps/telegram-ui';

const LoadingFallback = () => {
  return <Skeleton visible style={{ minHeight: '100vh' }} />;
};

export default memo(LoadingFallback);
