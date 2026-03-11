import { memo, useMemo } from 'react';

import {
  Cell,
  Section,
  Text,
  Progress,
  Subheadline,
  Caption,
} from '@telegram-apps/telegram-ui';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';

const ResultsDisplay = () => {
  const { t, formatCurrency, formatDate } = useLocalization();
  const { mortgageResults, amortizationResult } = useMortgage();

  const hasEarlyPayments = useMemo(() => {
    if (amortizationResult?.schedule) {
      return amortizationResult.schedule.some(
        (item) => item.extraPayment !== undefined && item.extraPayment > 0
      );
    }
    return false;
  }, [amortizationResult]);

  const progressValue = useMemo(() => {
    if (!amortizationResult?.schedule?.length) return 0;
    const totalPrincipal = amortizationResult.schedule.reduce(
      (sum, row) => sum + row.principal,
      0
    );
    const totalInterest = amortizationResult.schedule.reduce(
      (sum, row) => sum + row.interest,
      0
    );
    const total = totalPrincipal + totalInterest;
    if (total <= 0) return 0;
    return Math.round((totalPrincipal / total) * 100);
  }, [amortizationResult]);

  if (!mortgageResults) {
    return null;
  }

  const { monthlyPayment, totalInterest, payoffDate } = mortgageResults;

  return (
    <Section header={t('paymentSummary')}>
      {amortizationResult?.schedule && amortizationResult.schedule.length > 0 && (
        <Cell readOnly>
          <Subheadline>{t('paidPercent')}</Subheadline>
          <Progress value={progressValue} />
          <Caption>
            {progressValue}% {t('principal')} · {100 - progressValue}% {t('interest')}
          </Caption>
        </Cell>
      )}

      <Cell subhead={t('monthlyPayment')} before="💰" readOnly>
        {hasEarlyPayments &&
        amortizationResult &&
        amortizationResult.summary.finalMonthlyPayment !== monthlyPayment ? (
          <>
            <Text>{formatCurrency(monthlyPayment)}</Text>
            <Text> → </Text>
            <Text>{formatCurrency(amortizationResult.summary.finalMonthlyPayment)}</Text>
          </>
        ) : (
          <Text>{formatCurrency(monthlyPayment)}</Text>
        )}
      </Cell>

      <Cell subhead={t('totalInterest')} before="📈" readOnly>
        {hasEarlyPayments && amortizationResult ? (
          <>
            <Text>{formatCurrency(amortizationResult.summary.originalTotalInterest)}</Text>
            <Text> → </Text>
            <Text>{formatCurrency(amortizationResult.summary.newTotalInterest)}</Text>
          </>
        ) : (
          <Text>{formatCurrency(totalInterest)}</Text>
        )}
      </Cell>

      {hasEarlyPayments && amortizationResult && (
        <Cell subhead={t('totalSavings')} before="💚" readOnly>
          <Text>{formatCurrency(amortizationResult.summary.totalSavings)}</Text>
        </Cell>
      )}

      <Cell subhead={t('loanTerm')} before="⏱️" readOnly>
        {hasEarlyPayments && amortizationResult ? (
          <>
            <Text>
              {Math.floor(amortizationResult.summary.originalTerm / 12)} {t('years')}{' '}
              {amortizationResult.summary.originalTerm % 12} {t('months')}
            </Text>
            <Text> → </Text>
            <Text>
              {Math.floor(amortizationResult.summary.newTerm / 12)} {t('years')}{' '}
              {amortizationResult.summary.newTerm % 12} {t('months')}
            </Text>
            <Caption>
              {t('monthsSaved')}: {amortizationResult.summary.originalTerm - amortizationResult.summary.newTerm}
            </Caption>
          </>
        ) : (
          <Text>
            {Math.floor(mortgageResults.loanTerm)} {t('years')}
          </Text>
        )}
      </Cell>

      <Cell subhead={t('planPayoffDate')} before="🏁" readOnly>
        {hasEarlyPayments &&
        amortizationResult?.schedule &&
        amortizationResult.schedule.length > 0 ? (
          <>
            <Text>{formatDate(payoffDate)}</Text>
            <Text> → </Text>
            <Text>{formatDate(amortizationResult.schedule[amortizationResult.schedule.length - 1].date)}</Text>
          </>
        ) : (
          <Text>{formatDate(payoffDate)}</Text>
        )}
      </Cell>

      <Cell subhead={t('paymentType')} before="💵" readOnly>
        <Text>
          {mortgageResults.paymentType === 'annuity'
            ? t('annuityPayment')
            : t('differentiatedPayment')}
        </Text>
      </Cell>
    </Section>
  );
};

export default memo(ResultsDisplay);
