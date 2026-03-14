import { lazy, memo, Suspense, useMemo } from 'react';

import { getChartColors } from '@/config/chartsTheme';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import { Placeholder, Skeleton } from '@telegram-apps/telegram-ui';

const LineChart = lazy(() => import('@/components/charts/LineChart'));
const PieChart = lazy(() => import('@/components/charts/PieChart'));
const BarChart = lazy(() => import('@/components/charts/BarChart'));
const DoughnutChart = lazy(() => import('@/components/charts/DoughnutChart'));

const ChartsContainer = memo(function ChartsContainer() {
  const { t, formatLoanTerm } = useLocalization();
  const { tgPalette } = useTheme();
  const { amortizationResult } = useMortgage();
  const colors = getChartColors(tgPalette);

  if (!amortizationResult || amortizationResult.schedule.length === 0) {
    return (
      <Placeholder
        header={t('amortizationSchedule')}
        description={t('noCalculationsYet')}
      />
    );
  }

  const schedule = amortizationResult.schedule;

  const months = useMemo(() => {
    return schedule.map((item) => {
      const date = new Date(item.date);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
        .getFullYear()
        .toString()
        .slice(2)}`;
    });
  }, [schedule]);

  const principals = useMemo(() => schedule.map((item) => item.principal), [schedule]);
  const interests = useMemo(() => schedule.map((item) => item.interest), [schedule]);
  const balances = useMemo(() => schedule.map((item) => item.balance), [schedule]);

  const extraPaymentInfo = useMemo(() => {
    return schedule.map((item) => ({
      hasExtraPayment: !!item.extraPayment && item.extraPayment > 0,
      amount: item.extraPayment || 0,
      type: item.extraPaymentType || '',
      isRegular: item.inRecurringOverpaymentPeriod || false,
    }));
  }, [schedule]);

  const aggregateByYear = useMemo(() => schedule.length > 24, [schedule.length]);

  const lineChartData = useMemo(() => {
    if (!aggregateByYear) {
      return {
        labels: months,
        datasets: [
          {
            label: t('principal'),
            data: principals,
            borderColor: colors.principal,
            backgroundColor: colors.principalFill,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: t('interest'),
            data: interests,
            borderColor: colors.interest,
            backgroundColor: colors.interestFill,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: t('balance'),
            data: balances,
            borderColor: colors.balance,
            backgroundColor: colors.balanceFill,
            borderDash: [5, 5],
            fill: false,
            yAxisID: 'y1',
          },
        ],
      };
    }
    const years: string[] = [];
    const principalByYear: number[] = [];
    const interestByYear: number[] = [];
    const balanceByYear: number[] = [];
    const extraInfoByYear: { hasExtraPayment: boolean; amount: number; type: string; isRegular: boolean }[] = [];
    let currentYear = '';
    let yearPrincipal = 0;
    let yearInterest = 0;
    let yearExtra = 0;
    let yearExtraType = '';
    let yearExtraRegular = false;
    for (let i = 0; i < schedule.length; i++) {
      const item = schedule[i];
      const date = new Date(item.date);
      const y = date.getFullYear().toString();
      if (y !== currentYear) {
        if (currentYear !== '') {
          years.push(currentYear);
          principalByYear.push(yearPrincipal);
          interestByYear.push(yearInterest);
          balanceByYear.push(schedule[i - 1].balance);
          extraInfoByYear.push({
            hasExtraPayment: yearExtra > 0,
            amount: yearExtra,
            type: yearExtraType,
            isRegular: yearExtraRegular,
          });
        }
        currentYear = y;
        yearPrincipal = 0;
        yearInterest = 0;
        yearExtra = 0;
        yearExtraType = '';
        yearExtraRegular = false;
      }
      yearPrincipal += item.principal;
      yearInterest += item.interest;
      if (item.extraPayment && item.extraPayment > 0) {
        yearExtra += item.extraPayment;
        yearExtraType = item.extraPaymentType || '';
        yearExtraRegular = yearExtraRegular || !!item.inRecurringOverpaymentPeriod;
      }
    }
    if (currentYear !== '') {
      years.push(currentYear);
      principalByYear.push(yearPrincipal);
      interestByYear.push(yearInterest);
      balanceByYear.push(schedule[schedule.length - 1].balance);
      extraInfoByYear.push({
        hasExtraPayment: yearExtra > 0,
        amount: yearExtra,
        type: yearExtraType,
        isRegular: yearExtraRegular,
      });
    }
    return {
      labels: years,
      datasets: [
        {
          label: t('principal'),
          data: principalByYear,
          borderColor: colors.principal,
          backgroundColor: colors.principalFill,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: t('interest'),
          data: interestByYear,
          borderColor: colors.interest,
          backgroundColor: colors.interestFill,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: t('balance'),
          data: balanceByYear,
          borderColor: colors.balance,
          backgroundColor: colors.balanceFill,
          borderDash: [5, 5],
          fill: false,
          yAxisID: 'y1',
        },
      ],
    };
  }, [months, principals, interests, balances, schedule, aggregateByYear, t]);

  const lineChartExtraPaymentInfo = useMemo(() => {
    if (!aggregateByYear) return extraPaymentInfo;
    const byYear: { hasExtraPayment: boolean; amount: number; type: string; isRegular: boolean }[] = [];
    let currentYear = '';
    let yearExtra = 0;
    let yearExtraType = '';
    let yearExtraRegular = false;
    for (let i = 0; i < schedule.length; i++) {
      const item = schedule[i];
      const date = new Date(item.date);
      const y = date.getFullYear().toString();
      if (y !== currentYear) {
        if (currentYear !== '') {
          byYear.push({
            hasExtraPayment: yearExtra > 0,
            amount: yearExtra,
            type: yearExtraType,
            isRegular: yearExtraRegular,
          });
        }
        currentYear = y;
        yearExtra = 0;
        yearExtraType = '';
        yearExtraRegular = false;
      }
      if (item.extraPayment && item.extraPayment > 0) {
        yearExtra += item.extraPayment;
        yearExtraType = item.extraPaymentType || '';
        yearExtraRegular = yearExtraRegular || !!item.inRecurringOverpaymentPeriod;
      }
    }
    if (currentYear !== '') {
      byYear.push({
        hasExtraPayment: yearExtra > 0,
        amount: yearExtra,
        type: yearExtraType,
        isRegular: yearExtraRegular,
      });
    }
    return byYear;
  }, [aggregateByYear, schedule, extraPaymentInfo]);

  const comparisonPieChartData = useMemo(() => {
    if (!schedule.some((item) => item.extraPayment && item.extraPayment > 0)) {
      return null;
    }
    const originalInterest = amortizationResult.summary.originalTotalInterest;
    const newInterest = amortizationResult.summary.newTotalInterest;
    const interestSaved = originalInterest - newInterest;
    return {
      labels: [t('interestRemaining'), t('interestSaved')],
      datasets: [
        {
          data: [newInterest, interestSaved],
          backgroundColor: [colors.interest, colors.principal],
          borderColor: [colors.interest, colors.principal],
          borderWidth: 1,
        },
      ],
    };
  }, [amortizationResult, schedule, t]);

  const doughnutChartData = useMemo(() => {
    const totalPrincipal = principals.reduce((sum, value) => sum + value, 0);
    const totalInterest = amortizationResult.summary.newTotalInterest;
    const totalExtraPayments = amortizationResult.schedule.reduce(
      (sum, item) => sum + (item.extraPayment || 0),
      0
    );
    const hasExtra = totalExtraPayments > 0;

    return {
      labels: hasExtra
        ? [t('principal'), t('interest'), t('extraPayment')]
        : [t('principal'), t('interest')],
      datasets: [
        {
          data: hasExtra
            ? [totalPrincipal, totalInterest, totalExtraPayments]
            : [totalPrincipal, totalInterest],
          backgroundColor: hasExtra
            ? [colors.principal, colors.interest, colors.extraPayment]
            : [colors.principal, colors.interest],
          borderColor: hasExtra
            ? [colors.principal, colors.interest, colors.extraPayment]
            : [colors.principal, colors.interest],
          borderWidth: 1,
          hoverOffset: 10,
        },
      ],
    };
  }, [principals, amortizationResult, t]);

  const hasEarlyPayments = useMemo(
    () => schedule.some((item) => item.extraPayment && item.extraPayment > 0),
    [schedule]
  );

  const hasReducePayment = useMemo(
    () => schedule.some((item) => item.extraPaymentType === 'reducePayment'),
    [schedule]
  );

  const monthlyPaymentLineData = useMemo(() => {
    if (!hasEarlyPayments || !hasReducePayment) return null;
    if (!aggregateByYear) {
      return {
        labels: months,
        datasets: [
          {
            label: t('monthlyPayment'),
            data: schedule.map((item) => item.payment),
            borderColor: colors.principal,
            backgroundColor: colors.principalFill,
            fill: true,
            yAxisID: 'y',
          },
        ],
      };
    }
    const years: string[] = [];
    const paymentByYear: number[] = [];
    let currentYear = '';
    for (let i = 0; i < schedule.length; i++) {
      const y = new Date(schedule[i].date).getFullYear().toString();
      if (y !== currentYear) {
        if (currentYear !== '') {
          years.push(currentYear);
          paymentByYear.push(schedule[i - 1].payment);
        }
        currentYear = y;
      }
    }
    if (currentYear !== '') {
      years.push(currentYear);
      paymentByYear.push(schedule[schedule.length - 1].payment);
    }
    return {
      labels: years,
      datasets: [
        {
          label: t('monthlyPayment'),
          data: paymentByYear,
          borderColor: colors.principal,
          backgroundColor: colors.principalFill,
          fill: true,
          yAxisID: 'y',
        },
      ],
    };
  }, [
    hasEarlyPayments,
    hasReducePayment,
    aggregateByYear,
    months,
    schedule,
    t,
    colors.principal,
    colors.principalFill,
  ]);

  const comparisonBarTermData = useMemo(() => {
    if (!hasEarlyPayments) return null;
    const s = amortizationResult.summary;
    return {
      labels: [t('original'), t('withEarlyPayments')],
      datasets: [
        {
          label: t('loanTerm'),
          data: [s.originalTerm, s.newTerm],
          backgroundColor: [colors.original, colors.withEarlyPayments],
        },
      ],
    };
  }, [amortizationResult.summary, hasEarlyPayments, t]);

  const comparisonBarInterestData = useMemo(() => {
    if (!hasEarlyPayments) return null;
    const s = amortizationResult.summary;
    return {
      labels: [t('original'), t('withEarlyPayments')],
      datasets: [
        {
          label: t('totalInterest'),
          data: [s.originalTotalInterest, s.newTotalInterest],
          backgroundColor: [colors.original, colors.withEarlyPayments],
        },
      ],
    };
  }, [amortizationResult.summary, hasEarlyPayments, t]);

  return (
    <>
      <Suspense fallback={<Skeleton visible />}>
        <LineChart
          data={lineChartData}
          title={t('amortizationSchedule')}
          extraPaymentInfo={lineChartExtraPaymentInfo}
        />
      </Suspense>

      <Suspense fallback={<Skeleton visible />}>
        <DoughnutChart
          data={doughnutChartData}
          title={t('totalPaymentBreakdown')}
        />
      </Suspense>

      {comparisonBarTermData && comparisonBarInterestData && (
        <>
          <Suspense fallback={<Skeleton visible />}>
            <BarChart
              data={comparisonBarTermData}
              title={t('mortgageComparison')}
              valueFormatter={(value) => formatLoanTerm(value)}
            />
          </Suspense>
          <Suspense fallback={<Skeleton visible />}>
            <BarChart
              data={comparisonBarInterestData}
              title={t('totalInterest')}
            />
          </Suspense>
          {monthlyPaymentLineData && (
            <Suspense fallback={<Skeleton visible />}>
              <LineChart
                data={monthlyPaymentLineData}
                title={t('monthlyPayment')}
                extraPaymentInfo={lineChartExtraPaymentInfo}
              />
            </Suspense>
          )}
        </>
      )}

      {comparisonPieChartData && (
        <Suspense fallback={<Skeleton visible />}>
          <PieChart
            data={comparisonPieChartData}
            title={t('interestSavings')}
          />
        </Suspense>
      )}
    </>
  );
});

export default ChartsContainer;
