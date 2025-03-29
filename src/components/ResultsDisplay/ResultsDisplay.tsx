import { useLocalization } from '@/providers/LocalizationProvider';
import { MortgageResults } from '@/utils/mortgageCalculator';
import styles from './ResultsDisplay.module.css';
import { Section } from '@telegram-apps/telegram-ui';

interface ResultsDisplayProps {
  results: MortgageResults | null;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const { t, formatCurrency, formatDate } = useLocalization();
  
  
  if (!results) {
    console.log('ResultsDisplay: No results, returning null');
    return null;
  }
  
  const { monthlyPayment, totalInterest, totalCost, payoffDate } = results;
  
  return (
      <Section title={t('paymentSummary')}>
      <div className={styles.resultsGrid}>
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>💰</div>
          <div className={styles.resultTitle}>{t('monthlyPayment')}</div>
          <div className={styles.resultValue}>{formatCurrency(monthlyPayment)}</div>
        </div>
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>📈</div>
          <div className={styles.resultTitle}>{t('totalInterest')}</div>
          <div className={styles.resultValue}>{formatCurrency(totalInterest)}</div>
        </div>
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>💵</div>
          <div className={styles.resultTitle}>{t('totalCost')}</div>
          <div className={styles.resultValue}>{formatCurrency(totalCost)}</div>
        </div>
      </div>
      <div className={styles.payoffDate}>
        <div className={styles.payoffDateLabel}>{t('payoffDate')}</div>
        <div className={styles.payoffDateValue}>{formatDate(payoffDate)}</div>
      </div>
      </Section>
  );
}
