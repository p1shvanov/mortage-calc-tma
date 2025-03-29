import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import styles from './ResultsDisplay.module.css';
import { Section } from '@telegram-apps/telegram-ui';

export function ResultsDisplay() {
  const { t, formatCurrency, formatDate } = useLocalization();
  const { mortgageResults, amortizationResult } = useMortgage();
  
  if (!mortgageResults) {
    return null;
  }
  
  // Check if there are early payments that affect the schedule
  const hasEarlyPayments = amortizationResult && 
                          amortizationResult.summary.newTerm < amortizationResult.summary.originalTerm;
  
  const { monthlyPayment, totalInterest, payoffDate } = mortgageResults;
  
  return (
    <Section header={t('paymentSummary')}>
      <div className={styles.resultsGrid}>
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>💰</div>
          <div className={styles.resultTitle}>{t('monthlyPayment')}</div>
          <div className={styles.resultValue}>
            {formatCurrency(monthlyPayment)}
            {hasEarlyPayments && amortizationResult?.summary.finalMonthlyPayment !== monthlyPayment && (
              <div className={styles.resultDifference}>
                {t('finalPayment')}: {formatCurrency(amortizationResult?.summary.finalMonthlyPayment)}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>📈</div>
          <div className={styles.resultTitle}>{t('totalInterest')}</div>
          <div className={styles.resultValue}>
            {formatCurrency(hasEarlyPayments ? amortizationResult?.summary.newTotalInterest : totalInterest)}
            {hasEarlyPayments && (
              <div className={styles.resultSavings}>
                {t('savings')}: {formatCurrency(amortizationResult?.summary.originalTotalInterest - amortizationResult?.summary.newTotalInterest)}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>⏱️</div>
          <div className={styles.resultTitle}>{t('loanTerm')}</div>
          <div className={styles.resultValue}>
            {hasEarlyPayments 
              ? `${Math.floor(amortizationResult?.summary.newTerm / 12)} ${t('years')} ${amortizationResult?.summary.newTerm % 12} ${t('months')}`
              : `${Math.floor(mortgageResults.loanTerm)} ${t('years')}`
            }
            {hasEarlyPayments && (
              <div className={styles.resultSavings}>
                {t('monthsSaved')}: {amortizationResult?.summary.originalTerm - amortizationResult?.summary.newTerm}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {hasEarlyPayments && (
        <div className={styles.totalSavings}>
          <div className={styles.totalSavingsLabel}>{t('totalSavings')}</div>
          <div className={styles.totalSavingsValue}>
            {formatCurrency(amortizationResult?.summary.totalSavings)}
          </div>
        </div>
      )}
      
      <div className={styles.payoffDate}>
        <div className={styles.payoffDateLabel}>{t('payoffDate')}</div>
        <div className={styles.payoffDateValue}>
          {formatDate(hasEarlyPayments 
            ? amortizationResult?.schedule[amortizationResult.schedule.length - 1].date 
            : payoffDate
          )}
        </div>
      </div>
    </Section>
  );
}
