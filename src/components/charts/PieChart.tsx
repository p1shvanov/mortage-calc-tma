import { memo } from 'react';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Section } from '@telegram-apps/telegram-ui';
import { Pie } from 'react-chartjs-2';
import { useLocalization } from '@/providers/LocalizationProvider';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
  title?: string;
}

const PieChart = ({ data, title }: PieChartProps) => {
  const { formatCurrency } = useLocalization();
  
  return (
    <Section header={title}>
      <Pie
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          // aspectRatio: width / height,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          },
        }}
      />
    </Section>
  );
};

export default memo(PieChart);
