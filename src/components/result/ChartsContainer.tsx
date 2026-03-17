import { lazy, memo, Suspense, useMemo } from 'react';

import { getThemeColors } from '@/config/themeColors';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import { generateAmortizationSchedule } from '@/utils/amortizationSchedule';
import { Placeholder, Skeleton } from '@telegram-apps/telegram-ui';

const LineChart = lazy(() => import('@/components/charts/LineChart'));
const PieChart = lazy(() => import('@/components/charts/PieChart'));
const BarChart = lazy(() => import('@/components/charts/BarChart'));
const DoughnutChart = lazy(() => import('@/components/charts/DoughnutChart'));

const ChartsContainer = memo(function ChartsContainer() {
  const { t, formatLoanTerm, intlLocale } = useLocalization();
  const { tgPalette } = useTheme();
  const { amortizationResult, loanDetails } = useMortgage();
  const colors = getThemeColors(tgPalette);

  if (!amortizationResult || amortizationResult.schedule.length === 0) {
    return (
      <Placeholder
        header={t('amortizationSchedule')}
        description={t('noCalculationsYet')}
      />
    );
  }

  const schedule = amortizationResult.schedule;

  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale, {
        month: 'short',
        year: '2-digit',
      }),
    [intlLocale]
  );

  const months = useMemo(() => {
    return schedule.map((item) => {
      const date = new Date(item.date);
      return monthFormatter.format(date);
    });
  }, [schedule, monthFormatter]);

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

  const paymentStructureChartData = useMemo(
    () => ({
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
      ],
    }),
    [months, principals, interests, t, colors]
  );

  const hasEarlyPayments = useMemo(
    () => schedule.some((item) => item.extraPayment && item.extraPayment > 0),
    [schedule]
  );

  const plannedBalances = useMemo(() => {
    if (!hasEarlyPayments || !loanDetails) return null;
    const planned = generateAmortizationSchedule({
      loanAmount: loanDetails.loanAmount,
      interestRate: loanDetails.interestRate,
      loanTerm: loanDetails.loanTerm,
      startDate: loanDetails.startDate,
      paymentType: loanDetails.paymentType,
      paymentDay: loanDetails.paymentDay,
      earlyPayments: [],
      regularPayments: [],
    });
    return schedule.map((_, i) => planned.schedule[i]?.balance ?? 0);
  }, [hasEarlyPayments, loanDetails, schedule]);

  const balanceChartData = useMemo(() => {
    const datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
      yAxisID?: string;
      borderDash?: number[];
      pointRadius?: number | number[];
      pointBackgroundColor?: string;
      showLine?: boolean;
    }[] = [];

    if (plannedBalances && plannedBalances.length > 0) {
      datasets.push({
        label: t('chartBalancePlanned'),
        data: plannedBalances,
        borderColor: colors.balancePlanned,
        backgroundColor: colors.balancePlanned,
        borderDash: [4, 4],
        fill: false,
        yAxisID: 'y',
      });
    }

    datasets.push({
      label: plannedBalances ? t('chartBalanceActual') : t('balance'),
      data: balances,
      borderColor: colors.balance,
      backgroundColor: colors.balanceFill,
      borderDash: [5, 5],
      fill: true,
      yAxisID: 'y',
    });

    if (hasEarlyPayments) {
      datasets.push({
        label: t('chartBalanceExtraMarkers'),
        data: balances,
        borderColor: colors.extraPayment,
        backgroundColor: colors.extraPayment,
        fill: false,
        showLine: false,
        pointRadius: schedule.map((item) =>
          item.extraPayment && item.extraPayment > 0 ? 6 : 0
        ),
        pointBackgroundColor: colors.extraPayment,
        yAxisID: 'y',
      });
    }

    return { labels: months, datasets };
  }, [
    months,
    balances,
    plannedBalances,
    hasEarlyPayments,
    schedule,
    t,
    colors,
  ]);

  const lineChartExtraPaymentInfo = extraPaymentInfo;

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

  const hasReducePayment = useMemo(
    () => schedule.some((item) => item.extraPaymentType === 'reducePayment'),
    [schedule]
  );

  const monthlyPaymentLineData = useMemo(() => {
    if (!hasEarlyPayments || !hasReducePayment) return null;
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
  }, [hasEarlyPayments, hasReducePayment, months, schedule, t, colors.principal, colors.principalFill]);

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
          data={paymentStructureChartData}
          title={t('chartPaymentStructure')}
          extraPaymentInfo={lineChartExtraPaymentInfo}
        />
      </Suspense>
      <Suspense fallback={<Skeleton visible />}>
        <LineChart
          data={balanceChartData}
          title={t('chartBalanceDecrease')}
          singleYAxis
          leftAxisTitle={t('balance')}
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
