import { memo } from 'react';

import { Line } from 'react-chartjs-2';
import { useLocalization } from '@/providers/LocalizationProvider';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Section } from '@telegram-apps/telegram-ui';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill?: boolean;
      yAxisID?: string;
      borderDash?: number[];
      /** Per-point radius (e.g. markers at extra payment months). */
      pointRadius?: number | number[];
      pointBackgroundColor?: string;
      showLine?: boolean;
    }[];
  };
  title?: string;
  /** When true, only left Y-axis is shown (e.g. for balance-only chart). */
  singleYAxis?: boolean;
  /** Left axis title. Default: paymentAmount. Used as only axis title when singleYAxis. */
  leftAxisTitle?: string;
  extraPaymentInfo?: {
    hasExtraPayment: boolean;
    amount: number;
    type: string;
    isRegular?: boolean;
  }[];
}

const LineChart = ({
  data,
  title,
  singleYAxis = false,
  leftAxisTitle,
  extraPaymentInfo,
}: LineChartProps) => {
  const { formatCurrency, t } = useLocalization();
  const yTitle = leftAxisTitle ?? t('paymentAmount');

  return (
    <Section header={title}>
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            mode: 'index',
            intersect: false,
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
                  if (context.parsed.y !== null) {
                    label += formatCurrency(context.parsed.y);
                  }
                  return label;
                },
                afterBody: function(tooltipItems) {
                  if (!extraPaymentInfo) return [];
                  const index = tooltipItems[0].dataIndex;
                  const info = extraPaymentInfo[index];
                  if (info && info.hasExtraPayment) {
                    const typeLabel = info.type === 'reduceTerm' ? t('typeReduceTerm') : t('typeReducePayment');
                    const tooltipLines = [
                      `${t('extraPayment')}: ${formatCurrency(info.amount)}`,
                      `${t('earlyPaymentType')}: ${typeLabel}`,
                    ];
                    if (info.isRegular) {
                      tooltipLines.push(`${t('regularPayment')}: ${t('yes')}`);
                    }
                    return tooltipLines;
                  }
                  return [];
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                maxTicksLimit: 12,
                maxRotation: -45,
                minRotation: -45,
                autoSkip: true,
              },
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: yTitle,
              },
              beginAtZero: true,
            },
            ...(singleYAxis
              ? {}
              : {
                  y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    title: {
                      display: true,
                      text: t('balance'),
                    },
                    beginAtZero: true,
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                }),
          },
        }}
      />
    </Section>
  );
};

export default memo(LineChart);
