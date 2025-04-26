import { memo, useMemo } from 'react';

import { Cell, Section, Text } from '@telegram-apps/telegram-ui';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';


const ResultsDisplay = () => {
  const { t, formatCurrency, formatDate } = useLocalization();
  const { mortgageResults, amortizationResult } = useMortgage();

  if (!mortgageResults) {
    return null;
  }

  const hasEarlyPayments = useMemo(() => {
    if (amortizationResult && amortizationResult.schedule) {
      // Check if there are any early payments in the schedule
      return amortizationResult.schedule.some(item => item.extraPayment !== undefined && item.extraPayment > 0);
    }
    return false;
  }, [amortizationResult]);

  const { monthlyPayment, totalInterest, payoffDate } = mortgageResults;

  return (
    <Section
      header={t('paymentSummary')}
      footer={
        hasEarlyPayments && (
          <Cell readOnly before={<Text>{t('totalSavings')}</Text>}>
            <Text style={{ color: 'var(--tgui--green)' }}>
              {formatCurrency(amortizationResult!.summary.totalSavings)}
            </Text>
          </Cell>
        )
      }
    >
      <Cell
        subtitle={
          hasEarlyPayments &&
          amortizationResult?.summary.finalMonthlyPayment !==
            monthlyPayment && (
            <Text style={{ color: 'var(--tgui--green)' }}>
              {t('originalPayment')}:
              {formatCurrency(monthlyPayment)}
            </Text>
          )
        }
        subhead={t('monthlyPayment')}
        before={'💰'}
        readOnly
      >
        <Text>
          {formatCurrency(
            hasEarlyPayments && amortizationResult?.summary.finalMonthlyPayment !== monthlyPayment
              ? amortizationResult!.summary.finalMonthlyPayment
              : monthlyPayment
          )}
        </Text>
      </Cell>
      <Cell
        subtitle={
          hasEarlyPayments && (
            <Text style={{ color: 'var(--tgui--green)' }}>
              {t('savings')}:
              {formatCurrency(
                amortizationResult!.summary.originalTotalInterest -
                  amortizationResult!.summary.newTotalInterest
              )}
            </Text>
          )
        }
        subhead={t('totalInterest')}
        before={'📈'}
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
              {t('monthsSaved')}:
              {amortizationResult!.summary.originalTerm -
                amortizationResult!.summary.newTerm}
            </Text>
          )
        }
        subhead={t('loanTerm')}
        before={'⏱️'}
        readOnly
      >
        <Text>
          {hasEarlyPayments
            ? `${Math.floor(amortizationResult!.summary.newTerm / 12)} ${t(
                'years'
              )} ${amortizationResult!.summary.newTerm % 12} ${t('months')}`
            : `${Math.floor(mortgageResults.loanTerm)} ${t('years')}`}
        </Text>
      </Cell>
      <Cell
        subtitle={
          hasEarlyPayments && (
            <Text style={{ color: 'var(--tgui--green)' }}>
              {t('actualPayoffDate')}:
              {formatDate(
                amortizationResult!.schedule[
                  amortizationResult!.schedule.length - 1
                ].date
              )}
            </Text>
          )
        }
        subhead={t('planPayoffDate')}
        before={'🏁'}
        readOnly
      >
        <Text>{formatDate(payoffDate)}</Text>
      </Cell>
      <Cell
        subhead={t('paymentType')}
        before={'💵'}
        readOnly
      >
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
