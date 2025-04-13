import { memo, useMemo } from 'react';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';

import LineChart from '@/components/LineChart';

const ChartsContainer = () => {
  const { t } = useLocalization();
  const { amortizationResult } = useMortgage();

  if (!amortizationResult || amortizationResult.schedule.length === 0) {
    return null;
  }

  const months = useMemo(() => {
    return amortizationResult.schedule.map((item) => item.month.toString());
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

  return <LineChart data={lineChartData} title={t('amortizationSchedule')} />;
};

export default memo(ChartsContainer);
