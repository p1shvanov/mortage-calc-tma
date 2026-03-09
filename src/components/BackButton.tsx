import { memo } from 'react';
import { Button, IconContainer } from '@telegram-apps/telegram-ui';
import { Icon24ChevronLeft } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_left';

interface BackButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

/**
 * In-app back navigation when Telegram's native BackButton is not available (e.g. in browser).
 * Uses telegram-ui Button and Icon24ChevronLeft.
 */
const BackButton = ({ onClick, children }: BackButtonProps) => (
  <Button
    size="s"
    mode="plain"
    before={
      <IconContainer>
        <Icon24ChevronLeft />
      </IconContainer>
    }
    onClick={onClick}
  >
    {children}
  </Button>
);

export default memo(BackButton);
