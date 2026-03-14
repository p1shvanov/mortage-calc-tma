import { memo, useRef } from 'react';

import { Bar } from 'react-chartjs-2';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useChartResize } from '@/hooks/useChartResize';
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
      backgroundColor: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  title?: string;
  stacked?: boolean;
  /** Format tooltip value (e.g. term as years/months). If not set, uses currency. */
  valueFormatter?: (value: number) => string;
}

const chartWrapperStyle = {
  position: 'relative' as const,
  width: '100%',
  minHeight: 220,
};

const BarChart = ({ data, title, stacked = false, valueFormatter }: BarChartProps) => {
  const { formatCurrency, t } = useLocalization();
  const formatValue = valueFormatter ?? ((v: number) => formatCurrency(v));
  const containerRef = useRef<HTMLDivElement>(null);
  useChartResize(containerRef);

  return (
    <Section header={title}>
      <div ref={containerRef} style={chartWrapperStyle}>
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
                    label += formatValue(context.parsed.y);
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
      </div>
    </Section>
  );
};

export default memo(BarChart);
