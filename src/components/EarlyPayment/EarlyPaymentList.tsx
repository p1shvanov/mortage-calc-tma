import { Button } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { EarlyPayment } from '@/providers/MortgageProvider';
import styles from './EarlyPayment.module.css';

interface EarlyPaymentListProps {
  payments: EarlyPayment[];
  onRemovePayment: (id: string) => void;
}

export function EarlyPaymentList({ payments, onRemovePayment }: EarlyPaymentListProps) {
  const { t, formatCurrency, formatNumber } = useLocalization();
  
  if (payments.length === 0) {
    return null;
  }
  
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return (
    <div className={styles.paymentList}>
      <h3 className={styles.listTitle}>{t('earlyPaymentList')}</h3>
      
      <div className={styles.paymentItems}>
        {payments.map((payment) => (
          <div key={payment.id} className={styles.paymentItem}>
            <div className={styles.paymentInfo}>
              <div className={styles.paymentMonth}>
                {t('month')} {formatNumber(payment.month)}
              </div>
              <div className={styles.paymentAmount}>
                {formatCurrency(payment.amount)}
              </div>
              <div className={styles.paymentType}>
                {payment.type === 'reduceTerm' ? t('typeReduceTerm') : t('typeReducePayment')}
              </div>
            </div>
            <Button 
              size="s"
              onClick={() => onRemovePayment(payment.id)}
              className={styles.removeButton}
            >
              {t('remove')}
            </Button>
          </div>
        ))}
      </div>
      
      <div className={styles.totalPayments}>
        <span>{t('totalEarlyPayments')}:</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
}
