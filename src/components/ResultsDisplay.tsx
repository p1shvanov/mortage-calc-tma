import { memo, useMemo } from 'react';

import {
  Cell,
  Section,
  Text,
  Card,
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
    <Card>
      <Section
        header={t('paymentSummary')}
        footer={
          hasEarlyPayments && amortizationResult && (
            <Cell readOnly before={<Text>{t('totalSavings')}</Text>}>
              <Text style={{ color: 'var(--tgui--green)' }}>
                {formatCurrency(amortizationResult.summary.totalSavings)}
              </Text>
            </Cell>
          )
        }
      >
        {amortizationResult?.schedule && amortizationResult.schedule.length > 0 && (
          <Cell readOnly>
            <Subheadline>{t('paidPercent')}</Subheadline>
            <Progress value={progressValue} />
            <Caption>
              {progressValue}% {t('principal')} · {100 - progressValue}% {t('interest')}
            </Caption>
          </Cell>
        )}

        <Cell
          subtitle={
            hasEarlyPayments &&
            amortizationResult?.summary.finalMonthlyPayment !== monthlyPayment && (
              <Text style={{ color: 'var(--tgui--green)' }}>
                {t('originalPayment')}: {formatCurrency(monthlyPayment)}
              </Text>
            )
          }
          subhead={t('monthlyPayment')}
          before="💰"
          readOnly
        >
          <Text>
            {formatCurrency(
              hasEarlyPayments &&
                amortizationResult &&
                amortizationResult.summary.finalMonthlyPayment !== monthlyPayment
                ? amortizationResult.summary.finalMonthlyPayment
                : monthlyPayment
            )}
          </Text>
        </Cell>
        <Cell
          subtitle={
            hasEarlyPayments && (
              <Text style={{ color: 'var(--tgui--green)' }}>
                {t('savings')}:{' '}
                {formatCurrency(
                  amortizationResult!.summary.originalTotalInterest -
                    amortizationResult!.summary.newTotalInterest
                )}
              </Text>
            )
          }
          subhead={t('totalInterest')}
          before="📈"
          readOnly
        >
          <Text>
            {formatCurrency(
              hasEarlyPayments
                ? amortizationResult!.summary.newTotalInterest
                : totalInterest
            )}
          </Text>
        </Cell>
        <Cell
          subtitle={
            hasEarlyPayments && (
              <Text style={{ color: 'var(--tgui--green)' }}>
                {t('monthsSaved')}:{' '}
                {amortizationResult!.summary.originalTerm -
                  amortizationResult!.summary.newTerm}
              </Text>
            )
          }
          subhead={t('loanTerm')}
          before="⏱️"
          readOnly
        >
          <Text>
            {hasEarlyPayments
              ? `${Math.floor(amortizationResult!.summary.newTerm / 12)} ${t('years')} ${amortizationResult!.summary.newTerm % 12} ${t('months')}`
              : `${Math.floor(mortgageResults.loanTerm)} ${t('years')}`}
          </Text>
        </Cell>
        <Cell
          subtitle={
            hasEarlyPayments &&
            amortizationResult?.schedule &&
            amortizationResult.schedule.length > 0 && (
              <Text style={{ color: 'var(--tgui--green)' }}>
                {t('actualPayoffDate')}:{' '}
                {formatDate(
                  amortizationResult.schedule[
                    amortizationResult.schedule.length - 1
                  ].date
                )}
              </Text>
            )
          }
          subhead={t('planPayoffDate')}
          before="🏁"
          readOnly
        >
          <Text>{formatDate(payoffDate)}</Text>
        </Cell>
        <Cell subhead={t('paymentType')} before="💵" readOnly>
          <Text>
            {mortgageResults.paymentType === 'annuity'
              ? t('annuityPayment')
              : t('differentiatedPayment')}
          </Text>
        </Cell>
      </Section>
    </Card>
  );
};

export default memo(ResultsDisplay);
