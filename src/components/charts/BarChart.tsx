import { memo } from 'react';

import { Bar } from 'react-chartjs-2';
import { useLocalization } from '@/providers/LocalizationProvider';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Section } from '@telegram-apps/telegram-ui';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  title?: string;
  stacked?: boolean;
}

const BarChart = ({ data, title, stacked = false }: BarChartProps) => {
  const { formatCurrency, t } = useLocalization();

  return (
    <Section header={title}>
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: true,
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
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += formatCurrency(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              stacked: stacked,
            },
            y: {
              stacked: stacked,
              beginAtZero: true,
              title: {
                display: true,
                text: t('paymentAmount')
              },
            },
          },
        }}
      />
    </Section>
  );
};

export default memo(BarChart);
