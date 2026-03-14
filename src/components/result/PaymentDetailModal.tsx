import { memo } from 'react';
import { Modal, Section, Cell, Text } from '@telegram-apps/telegram-ui';
import { useSignal } from '@telegram-apps/sdk-react';
import { viewport } from '@telegram-apps/sdk-react';

import { useLocalization } from '@/providers/LocalizationProvider';
import type { AmortizationScheduleItem } from '@/services/mortgage';

interface PaymentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AmortizationScheduleItem;
  totalMonths: number;
}

const PaymentDetailModal = memo(function PaymentDetailModal({
  open,
  onOpenChange,
  item,
  totalMonths,
}: PaymentDetailModalProps) {
  const { t, formatCurrency, formatDate } = useLocalization();
  const contentInset = useSignal(viewport.contentSafeAreaInsets);
  const padding = {
    paddingLeft: (contentInset?.left ?? 0) + 12,
    paddingRight: (contentInset?.right ?? 0) + 12,
    paddingTop: (contentInset?.top ?? 0) + 12,
    paddingBottom: (contentInset?.bottom ?? 0) + 12,
  };

  const paymentRatio =
    item.payment > 0
      ? {
          p: Math.round((item.principal / item.payment) * 100),
          i: Math.round((item.interest / item.payment) * 100),
        }
      : null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <div style={padding}>
        <Section
          header={t('paymentDetailTitle', {
          n: item.month,
          total: totalMonths,
        })}
      >
        <Cell subhead={t('paymentDate')} readOnly>
          <Text>{formatDate(item.date)}</Text>
        </Cell>
        <Cell subhead={t('paymentAmount')} readOnly>
          <Text weight="2">{formatCurrency(item.payment)}</Text>
        </Cell>
        <Cell subhead={t('principal')} readOnly>
          <Text>{formatCurrency(item.principal)}</Text>
        </Cell>
        <Cell subhead={t('interest')} readOnly>
          <Text>{formatCurrency(item.interest)}</Text>
        </Cell>
        {paymentRatio && (
          <Cell subhead={t('paymentBreakdown')} readOnly>
            <Text>
              {t('paymentStructureRatio', {
                p: paymentRatio.p,
                i: paymentRatio.i,
              })}
            </Text>
          </Cell>
        )}
        <Cell subhead={t('interestToDate')} readOnly>
          <Text>{formatCurrency(item.totalInterest)}</Text>
        </Cell>
        <Cell subhead={t('remainingBalance')} readOnly>
          <Text>{formatCurrency(item.balance)}</Text>
        </Cell>
        {item.extraPayment != null && item.extraPayment > 0 && (
          <Cell
            subhead={t('extraPayment')}
            readOnly
            description={
              item.extraPaymentType
                ? item.extraPaymentType === 'reduceTerm'
                  ? t('typeReduceTerm')
                  : t('typeReducePayment')
                : undefined
            }
          >
            <Text>{formatCurrency(item.extraPayment)}</Text>
          </Cell>
        )}
      </Section>
      </div>
    </Modal>
  );
});

export default PaymentDetailModal;
