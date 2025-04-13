import { memo, useMemo } from 'react';

import {
  Cell,
  IconButton,
  List,
  Section,
  Text,
} from '@telegram-apps/telegram-ui';
import { Icon16Cancel } from '@telegram-apps/telegram-ui/dist/icons/16/cancel';

import { useLocalization } from '@/providers/LocalizationProvider';
import { EarlyPayment } from '@/providers/MortgageProvider';

interface EarlyPaymentListProps {
  payments: EarlyPayment[];
  onRemovePayment: (id: string) => void;
}

const EarlyPaymentList = ({
  payments,
  onRemovePayment,
}: EarlyPaymentListProps) => {
  const { t, formatCurrency, formatNumber } = useLocalization();

  const totalAmount = useMemo(() => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  if (payments.length === 0) {
    return null;
  }

  return (
    <Section
      header={t('earlyPaymentList')}
      footer={
        <Cell readOnly before={<Text>{t('totalEarlyPayments')}:</Text>}>
          <Text>{formatCurrency(totalAmount)}</Text>
        </Cell>
      }
    >
      <List>
        {payments.map((payment) => (
          <Cell
            readOnly
            before={
              <Text>
                {t('month')} {formatNumber(payment.month)}
              </Text>
            }
            after={
              <IconButton size='s' onClick={() => onRemovePayment(payment.id)}>
                <Icon16Cancel />
              </IconButton>
            }
            subtitle={
              <Text>
                {payment.type === 'reduceTerm'
                  ? t('typeReduceTerm')
                  : t('typeReducePayment')}
              </Text>
            }
            key={payment.id}
          >
            <Text>{formatCurrency(payment.amount)}</Text>
          </Cell>
        ))}
      </List>
    </Section>
  );
};

export default memo(EarlyPaymentList);
