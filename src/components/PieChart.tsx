import { memo } from 'react';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Section } from '@telegram-apps/telegram-ui';
import { Pie } from 'react-chartjs-2';

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
          },
        }}
      />
    </Section>
  );
};

export default memo(PieChart);
