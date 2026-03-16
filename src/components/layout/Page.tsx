import { memo, PropsWithChildren, useEffect } from 'react';

import { backButton, useSignal, viewport } from '@telegram-apps/sdk-react';
import { useNavigate } from 'react-router-dom';
import { hapticButton } from '@/utils/haptic';

const Page = ({
  children,
  back = true,
  onBack,
}: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   */
  back?: boolean;
  /**
   * Custom handler for back button. When provided, used instead of navigate(-1).
   */
  onBack?: () => void;
}>) => {
  const navigate = useNavigate();

  const inset = useSignal(viewport.safeAreaInsets);
  const contentInset = useSignal(viewport.contentSafeAreaInsets);

  useEffect(() => {
    if (!backButton.isSupported()) return;
    if (back) {
      backButton.show();
      return backButton.onClick(() => {
        hapticButton();
        if (onBack) {
          onBack();
        } else {
          navigate(-1);
        }
      });
    }
    backButton.hide();
  }, [back, navigate, onBack]);

  return (
    <div
      style={{
        paddingTop: inset.top + contentInset.top,
        paddingLeft: inset.left,
        paddingRight: inset.right,
      }}
    >
      {children}
    </div>
  );
};

export default memo(Page);
