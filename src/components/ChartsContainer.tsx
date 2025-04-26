import { lazy, memo, Suspense, useMemo } from 'react';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import { Skeleton } from '@telegram-apps/telegram-ui';

const LineChart = lazy(() => import('@/components/charts/LineChart'));
const PieChart = lazy(() => import('@/components/charts/PieChart'));
const BarChart = lazy(() => import('@/components/charts/BarChart'));
const DoughnutChart = lazy(() => import('@/components/charts/DoughnutChart'));
const RadarChart = lazy(() => import('@/components/charts/RadarChart'));

const ChartsContainer = () => {
  const { t } = useLocalization();
  const { amortizationResult } = useMortgage();

  if (!amortizationResult || amortizationResult.schedule.length === 0) {
    return null;
  }

  const months = useMemo(() => {
    return amortizationResult.schedule.map((item) => {
      const date = new Date(item.date);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
        .getFullYear()
        .toString()
        .slice(2)}`;
    });
  }, [amortizationResult.schedule.length]);

  const principals = useMemo(() => {
    return amortizationResult.schedule.map((item) => item.principal);
  }, [amortizationResult.schedule.length]);
  const interests = useMemo(() => {
    return amortizationResult.schedule.map((item) => item.interest);
  }, [amortizationResult.schedule.length]);
  const balances = useMemo(() => {
    return amortizationResult.schedule.map((item) => item.balance);
  }, [amortizationResult.schedule.length]);

  // Extract early payment information for tooltips
  const extraPaymentInfo = useMemo(() => {
    return amortizationResult.schedule.map((item) => ({
      hasExtraPayment: !!item.extraPayment && item.extraPayment > 0,
      amount: item.extraPayment || 0,
      type: item.extraPaymentType || '',
      isRegular: item.isRegularPayment || false, // Add flag for regular payments
    }));
  }, [amortizationResult.schedule]);

  const lineChartData = useMemo(() => {
    return {
      labels: months,
      datasets: [
        {
          label: t('principal'),
          data: principals,
          borderColor: '#4bc0c0',
          // https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4
          backgroundColor: '#4bc0c033',
          fill: true,
          yAxisID: 'y',
        },
        {
          label: t('interest'),
          data: interests,
          borderColor: '#ff6384',
          // https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4
          backgroundColor: '#ff638433',
          fill: true,
          yAxisID: 'y',
        },
        {
          label: t('balance'),
          data: balances,
          borderColor: '#36a2eb',
          // https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4
          backgroundColor: '#36a2eb33',
          borderDash: [5, 5],
          fill: false,
          yAxisID: 'y1',
        },
      ],
    };
  }, [principals.length, balances.length, interests.length]);

  // Calculate total principal and interest for pie chart
  const pieChartData = useMemo(() => {
    const totalPrincipal = principals.reduce((sum, value) => sum + value, 0);
    const totalInterest = amortizationResult.summary.newTotalInterest;

    return {
      labels: [t('principal'), t('interest')],
      datasets: [
        {
          data: [totalPrincipal, totalInterest],
          backgroundColor: ['#4bc0c0', '#ff6384'],
          borderColor: ['#4bc0c0', '#ff6384'],
          borderWidth: 1,
        },
      ],
    };
  }, [principals, amortizationResult.summary.newTotalInterest, t]);

  // Add comparison pie chart for early payments impact
  const comparisonPieChartData = useMemo(() => {
    // Only show comparison if there are early payments
    if (
      !amortizationResult.schedule.some(
        (item) => item.extraPayment && item.extraPayment > 0
      )
    ) {
      return null;
    }

    const originalInterest = amortizationResult.summary.originalTotalInterest;
    const newInterest = amortizationResult.summary.newTotalInterest;
    const interestSaved = originalInterest - newInterest;

    return {
      labels: [t('newTotalInterest'), t('interestSaved')],
      datasets: [
        {
          data: [newInterest, interestSaved],
          backgroundColor: ['#36a2eb', '#4bc0c0'],
          borderColor: ['#36a2eb', '#4bc0c0'],
          borderWidth: 1,
        },
      ],
    };
  }, [amortizationResult, t]);

  // Bar chart data for monthly principal vs interest
  const barChartData = useMemo(() => {
    // Only show a subset of months for better visibility
    const interval = Math.max(1, Math.floor(months.length / 12));
    const filteredMonths = months.filter((_, i) => i % interval === 0);
    const filteredPrincipals = principals.filter((_, i) => i % interval === 0);
    const filteredInterests = interests.filter((_, i) => i % interval === 0);

    return {
      labels: filteredMonths,
      datasets: [
        {
          label: t('principal'),
          data: filteredPrincipals,
          backgroundColor: '#4bc0c0',
        },
        {
          label: t('interest'),
          data: filteredInterests,
          backgroundColor: '#ff6384',
        },
      ],
    };
  }, [months, principals, interests, t]);

  // Doughnut chart data for total payment breakdown
  const doughnutChartData = useMemo(() => {
    const totalPrincipal = principals.reduce((sum, value) => sum + value, 0);
    const totalInterest = amortizationResult.summary.newTotalInterest;
    const totalExtraPayments = amortizationResult.schedule.reduce(
      (sum, item) => sum + (item.extraPayment || 0),
      0
    );

    return {
      labels: [t('principal'), t('interest'), t('extraPayment')],
      datasets: [
        {
          data: [totalPrincipal, totalInterest, totalExtraPayments],
          backgroundColor: ['#4bc0c0', '#ff6384', '#ffcd56'],
          borderColor: ['#4bc0c0', '#ff6384', '#ffcd56'],
          borderWidth: 1,
          hoverOffset: 10,
        },
      ],
    };
  }, [principals, amortizationResult, t]);

  // Radar chart data for comparing mortgage metrics before and after early payments
  const radarChartData = useMemo(() => {
    // Only show if there are early payments
    if (
      !amortizationResult.schedule.some(
        (item) => item.extraPayment && item.extraPayment > 0
      )
    ) {
      return null;
    }

    // Scale values to be comparable on the same chart
    const originalTerm = amortizationResult.summary.originalTerm;
    const newTerm = amortizationResult.summary.newTerm;
    const originalInterest = amortizationResult.summary.originalTotalInterest;
    const newInterest = amortizationResult.summary.newTotalInterest;
    const originalPayment = amortizationResult.summary.originalMonthlyPayment;
    const finalPayment = amortizationResult.summary.finalMonthlyPayment;

    // Normalize values to percentages of the original values
    const normalizedNewTerm = (newTerm / originalTerm) * 100;
    const normalizedNewInterest = (newInterest / originalInterest) * 100;
    const normalizedFinalPayment = (finalPayment / originalPayment) * 100;

    return {
      labels: [t('loanTerm'), t('totalInterest'), t('monthlyPayment')],
      datasets: [
        {
          label: t('original'),
          data: [100, 100, 100], // Original values as baseline (100%)
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          pointBackgroundColor: 'rgb(255, 99, 132)',
        },
        {
          label: t('withEarlyPayments'),
          data: [
            normalizedNewTerm,
            normalizedNewInterest,
            normalizedFinalPayment,
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          pointBackgroundColor: 'rgb(54, 162, 235)',
        },
      ],
    };
  }, [amortizationResult, t]);

  return (
    <>
      {/* Line chart showing amortization schedule */}
      <Suspense fallback={<Skeleton visible />}>
        <LineChart
          data={lineChartData}
          title={t('amortizationSchedule')}
          extraPaymentInfo={extraPaymentInfo}
        />
      </Suspense>

      {/* Bar chart showing principal vs interest over time */}
      <Suspense fallback={<Skeleton visible />}>
        <BarChart data={barChartData} title={t('monthlyPaymentBreakdown')} />
      </Suspense>

      {/* Pie chart showing payment distribution */}
      <Suspense fallback={<Skeleton visible />}>
        <PieChart data={pieChartData} title={t('paymentDistribution')} />
      </Suspense>

      {/* Doughnut chart showing total payment breakdown including extra payments */}
      <Suspense fallback={<Skeleton visible />}>
        <DoughnutChart
          data={doughnutChartData}
          title={t('totalPaymentBreakdown')}
        />
      </Suspense>

      {/* Conditional charts that only appear when early payments exist */}
      {comparisonPieChartData && (
        <Suspense fallback={<Skeleton visible />}>
          <PieChart
            data={comparisonPieChartData}
            title={t('interestSavings')}
          />
        </Suspense>
      )}

      {radarChartData && (
        <Suspense fallback={<Skeleton visible />}>
          <RadarChart data={radarChartData} title={t('mortgageComparison')} />
        </Suspense>
      )}
    </>
  );
};

export default memo(ChartsContainer);
