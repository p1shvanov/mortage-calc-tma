import { memo } from 'react';

import { Radar } from 'react-chartjs-2';
import { useLocalization } from '@/providers/LocalizationProvider';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Section } from '@telegram-apps/telegram-ui';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth?: number;
      pointBackgroundColor?: string;
      pointBorderColor?: string;
      pointHoverBackgroundColor?: string;
      pointHoverBorderColor?: string;
    }[];
  };
  title?: string;
}

const RadarChart = ({ data, title }: RadarChartProps) => {
  const { formatCurrency, t } = useLocalization();

  return (
    <Section header={title}>
      <Radar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              beginAtZero: true,
              ticks: {
                display: false, // Hide the numerical values
              }
            },
          },
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
                  if (context.parsed.r !== null) {
                    // Format based on the label type
                    const labelType = context.label?.toLowerCase() || '';
                    if (labelType.includes('term') || labelType.includes('months')) {
                      // For term-related values, show as months/years
                      const months = context.parsed.r;
                      const years = Math.floor(months / 12);
                      const remainingMonths = months % 12;
                      if (years > 0 && remainingMonths > 0) {
                        label += `${years} ${t('years')} ${remainingMonths} ${t('months')}`;
                      } else if (years > 0) {
                        label += `${years} ${t('years')}`;
                      } else {
                        label += `${months} ${t('months')}`;
                      }
                    } else if (labelType.includes('rate')) {
                      // For rate-related values, show as percentage
                      label += `${context.parsed.r.toFixed(2)}%`;
                    } else {
                      // For monetary values, use currency formatting
                      label += formatCurrency(context.parsed.r);
                    }
                  }
                  return label;
                }
              }
            }
          },
        }}
      />
    </Section>
  );
};

export default memo(RadarChart);
