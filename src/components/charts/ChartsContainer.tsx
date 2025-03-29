import { Section } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import { PieChart } from './PieChart';
import { LineChart } from './LineChart';

export function ChartsContainer() {
  const { t } = useLocalization();
  const { amortizationResult } = useMortgage();
  
  if (!amortizationResult || amortizationResult.schedule.length === 0) {
    return null;
  }
  
  // Get the first payment for the pie chart
  const firstPayment = amortizationResult.schedule[0];
  
  // Prepare data for the pie chart
  const pieChartData = {
    labels: [t('principal'), t('interest')],
    datasets: [
      {
        data: [firstPayment.principal, firstPayment.interest],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for the line chart
  const months = amortizationResult.schedule.map(item => item.month.toString());
  const principals = amortizationResult.schedule.map(item => item.principal);
  const interests = amortizationResult.schedule.map(item => item.interest);
  const balances = amortizationResult.schedule.map(item => item.balance);
  
  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: t('principal'),
        data: principals,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        yAxisID: 'y',
      },
      {
        label: t('interest'),
        data: interests,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        yAxisID: 'y',
      },
      {
        label: t('balance'),
        data: balances,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderDash: [5, 5],
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };
  
  return (
    <Section header={t('graphicalView')}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
        <PieChart 
          data={pieChartData} 
          title={t('paymentBreakdown')}
        />
        
        <LineChart 
          data={lineChartData} 
          title={t('amortizationSchedule')}
        />
      </div>
    </Section>
  );
}
