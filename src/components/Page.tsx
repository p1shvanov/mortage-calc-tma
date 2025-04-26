import { memo, PropsWithChildren, useEffect } from 'react';

import { backButton, useSignal, viewport } from '@telegram-apps/sdk-react';
import { useNavigate } from 'react-router-dom';

const Page = ({
  children,
  back = true,
}: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   */
  back?: boolean;
}>) => {
  const navigate = useNavigate();

  const inset = useSignal(viewport.safeAreaInsets);
  const contentInset = useSignal(viewport.contentSafeAreaInsets);

  useEffect(() => {
    if (back) {
      backButton.show();
      return backButton.onClick(() => {
        navigate(-1);
      });
    }
    backButton.hide();
  }, [back]);

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
