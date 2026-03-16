import { memo } from 'react';
import { Modal, Section, List, Cell, Text } from '@telegram-apps/telegram-ui';

import { useLocalization } from '@/providers/LocalizationProvider';
import { hapticSelection } from '@/utils/haptic';

const PRESET_NANOTON = [
  { labelKey: 'donateAmount001', value: 10_000_000 },
  { labelKey: 'donateAmount01', value: 100_000_000 },
  { labelKey: 'donateAmount1', value: 1_000_000_000 },
] as const;

interface DonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (amountNano: number) => void;
  sending?: boolean;
}

const DonateModal = memo(function DonateModal({
  open,
  onOpenChange,
  onSend,
  sending = false,
}: DonateModalProps) {
  const { t } = useLocalization();

  const handleAmount = (amountNano: number) => {
    hapticSelection();
    onSend(amountNano);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Section header={t('thankAuthor')}>
        <List>
          {PRESET_NANOTON.map(({ labelKey, value }) => (
            <Cell
              key={value}
              onClick={() => handleAmount(value)}
              disabled={sending}
              after={<Text weight="2">{t(labelKey)}</Text>}
            >
              <Text>{t('donateSend')}</Text>
            </Cell>
          ))}
        </List>
      </Section>
    </Modal>
  );
});

export default DonateModal;
