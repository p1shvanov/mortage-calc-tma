import { memo, useMemo } from 'react';

import { Cell, Section, Text, Caption } from '@telegram-apps/telegram-ui';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';

const accentStyle = { color: 'var(--tg-theme-link-color)' };

const ResultsDisplay = memo(function ResultsDisplay() {
  const { t, formatCurrency, formatDate } = useLocalization();
  const { mortgageResults, amortizationResult } = useMortgage();

  const hasEarlyPayments = useMemo(() => {
    if (amortizationResult?.schedule) {
      return amortizationResult.schedule.some(
        (item) => item.extraPayment !== undefined && item.extraPayment > 0,
      );
    }
    return false;
  }, [amortizationResult]);

  const principal = useMemo(() => {
    if (!mortgageResults) return 0;
    return mortgageResults.totalCost - mortgageResults.totalInterest;
  }, [mortgageResults]);

  const overpaymentPercent = useMemo(() => {
    if (!mortgageResults || principal <= 0) return null;
    const interest =
      hasEarlyPayments && amortizationResult
        ? amortizationResult.summary.newTotalInterest
        : mortgageResults.totalInterest;
    return Math.round((interest / principal) * 100);
  }, [mortgageResults, hasEarlyPayments, amortizationResult, principal]);

  const originalOverpaymentPercent = useMemo(() => {
    if (!mortgageResults || !amortizationResult || principal <= 0) return null;
    return Math.round(
      (amortizationResult.summary.originalTotalInterest / principal) * 100,
    );
  }, [mortgageResults, amortizationResult, principal]);

  const totalPayout = useMemo(() => {
    if (amortizationResult?.schedule?.length) {
      return amortizationResult.schedule.reduce(
        (sum, row) => sum + row.payment + (row.extraPayment ?? 0),
        0,
      );
    }
    return mortgageResults?.totalCost ?? 0;
  }, [mortgageResults, amortizationResult]);

  if (!mortgageResults) {
    return null;
  }

  const { monthlyPayment, totalInterest, payoffDate } = mortgageResults;

  return (
    <Section header={t('paymentSummary')}>
      <Cell subhead={t('monthlyPayment')} before="💰" readOnly>
        {hasEarlyPayments &&
        amortizationResult &&
        amortizationResult.summary.finalMonthlyPayment !== monthlyPayment ? (
          <>
            <Text>{formatCurrency(monthlyPayment)}</Text>
            <Text> → </Text>
            <Text style={accentStyle}>
              {formatCurrency(amortizationResult.summary.finalMonthlyPayment)}
            </Text>
          </>
        ) : (
          <Text>{formatCurrency(monthlyPayment)}</Text>
        )}
      </Cell>

      <Cell subhead={t('accruedInterest')} before="📈" readOnly>
        {hasEarlyPayments && amortizationResult ? (
          <>
            <Text>
              {formatCurrency(amortizationResult.summary.originalTotalInterest)}
            </Text>
            <Text> → </Text>
            <Text style={accentStyle}>
              {formatCurrency(amortizationResult.summary.newTotalInterest)}
            </Text>
          </>
        ) : (
          <Text>{formatCurrency(totalInterest)}</Text>
        )}
      </Cell>

      {overpaymentPercent != null && (
        <Cell subhead={t('overpaymentPercent')} before="📊" readOnly>
          {hasEarlyPayments &&
          amortizationResult &&
          originalOverpaymentPercent != null &&
          originalOverpaymentPercent !== overpaymentPercent ? (
            <>
              <Text>{originalOverpaymentPercent}%</Text>
              <Text> → </Text>
              <Text style={accentStyle}>{overpaymentPercent}%</Text>
            </>
          ) : (
            <Text>{overpaymentPercent}%</Text>
          )}
        </Cell>
      )}

      <Cell subhead={t('totalPayout')} before="💳" readOnly>
        {hasEarlyPayments &&
        amortizationResult &&
        totalPayout !== mortgageResults.totalCost ? (
          <>
            <Text>{formatCurrency(mortgageResults.totalCost)}</Text>
            <Text> → </Text>
            <Text style={accentStyle}>{formatCurrency(totalPayout)}</Text>
          </>
        ) : (
          <Text>{formatCurrency(totalPayout)}</Text>
        )}
      </Cell>

      {hasEarlyPayments && amortizationResult && (
        <Cell subhead={t('totalSavings')} before="💙" readOnly>
          <Text style={accentStyle}>
            {formatCurrency(amortizationResult.summary.totalSavings)}
          </Text>
        </Cell>
      )}

      <Cell subhead={t('loanTerm')} before="⏱️" readOnly>
        {hasEarlyPayments && amortizationResult ? (
          <>
            <Text>
              {Math.floor(amortizationResult.summary.originalTerm / 12)}{' '}
              {t('years')} {amortizationResult.summary.originalTerm % 12}{' '}
              {t('months')}
            </Text>
            <Text> → </Text>
            <Text style={accentStyle}>
              {Math.floor(amortizationResult.summary.newTerm / 12)} {t('years')}{' '}
              {amortizationResult.summary.newTerm % 12} {t('months')}
            </Text>
            <Caption style={accentStyle}>
              {t('monthsSaved')}:{' '}
              {amortizationResult.summary.originalTerm -
                amortizationResult.summary.newTerm}
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
            <Text style={accentStyle}>
              {formatDate(
                amortizationResult.schedule[
                  amortizationResult.schedule.length - 1
                ].date,
              )}
            </Text>
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
});

export default ResultsDisplay;
