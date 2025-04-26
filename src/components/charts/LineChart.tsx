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


// Register Chart.js components
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
    }[];
  };
  title?: string;
  extraPaymentInfo?: {
    hasExtraPayment: boolean;
    amount: number;
    type: string;
  }[];
}

const LineChart = ({ data, title, extraPaymentInfo }: LineChartProps) => {
  const { formatCurrency, t } = useLocalization();

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
                    return [
                      `${t('extraPayment')}: ${formatCurrency(info.amount)}`,
                      `${t('earlyPaymentType')}: ${typeLabel}`
                    ];
                  }
                  return [];
                }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: t('paymentAmount')
              },
              beginAtZero: true,
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: t('balance')
              },
              beginAtZero: true,
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        }}
      />
    </Section>
  );
};

export default memo(LineChart);
