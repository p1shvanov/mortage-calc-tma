# TASK-11: Graphical Display Implementation (Final)

## Objective

Implement graphical visualizations for the mortgage calculator application using Chart.js. Create pie charts and line charts to help users better understand their mortgage data through visual representation.

## Analysis

Visual representations of mortgage data can significantly enhance user understanding and decision-making. Based on the reference design and requirements, the graphical display should include:

1. A pie chart showing the payment breakdown (principal vs. interest)
2. A line chart showing the amortization schedule over time (principal, interest, and remaining balance)

These visualizations will help users understand how their payments are allocated and how their loan balance decreases over time.

## Requirements

1. Install and configure Chart.js with react-chartjs-2 for React integration

2. Create a pie chart component to display the payment breakdown:
   - Show the proportion of principal vs. interest in the first payment
   - Use appropriate colors and labels
   - Include a legend for clarity

3. Create a line chart component to display the amortization schedule:
   - Show how principal and interest payments change over time
   - Show how the loan balance decreases over time
   - Use appropriate colors, labels, and scales
   - Include a legend and axis labels

4. Ensure charts are responsive and work well on both mobile and desktop

5. Support dark and light themes by using theme-appropriate colors

6. Support localization for all chart labels and tooltips

7. Maximize the use of TelegramUI components for layout and structure

## Implementation Plan

### 1. Install Chart.js and React-Chartjs-2

```bash
npm install chart.js react-chartjs-2
```

### 2. Create the Amortization Schedule Utility

```typescript
// src/utils/amortizationSchedule.ts
export interface AmortizationScheduleItem {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  totalInterest: number;
  balance: number;
  extraPayment?: number;
  extraPaymentType?: 'reduceTerm' | 'reducePayment';
}

export interface AmortizationScheduleParams {
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in years
  startDate: string;
  earlyPayments?: Array<{
    id: string;
    month: number;
    amount: number;
    type: 'reduceTerm' | 'reducePayment';
  }>;
}

export interface AmortizationScheduleResult {
  schedule: AmortizationScheduleItem[];
  summary: {
    originalTerm: number; // in months
    newTerm: number; // in months
    originalTotalInterest: number;
    newTotalInterest: number;
    originalMonthlyPayment: number;
    finalMonthlyPayment: number;
    totalSavings: number;
  };
}

/**
 * Generate an amortization schedule for a loan, including early payments
 */
export function generateAmortizationSchedule(
  params: AmortizationScheduleParams
): AmortizationScheduleResult {
  const { loanAmount, interestRate, loanTerm, startDate, earlyPayments = [] } = params;
  
  // Monthly interest rate (annual rate divided by 12 and converted to decimal)
  const monthlyRate = interestRate / 100 / 12;
  
  // Total number of payments (years * 12 months)
  const numberOfPayments = loanTerm * 12;
  
  // Calculate original monthly payment using the amortization formula
  const originalMonthlyPayment = 
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  // Sort early payments by month
  const sortedEarlyPayments = [...earlyPayments].sort((a, b) => a.month - b.month);
  
  // Generate the amortization schedule
  const schedule: AmortizationScheduleItem[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let currentMonthlyPayment = originalMonthlyPayment;
  let earlyPaymentIndex = 0;
  const startDateObj = new Date(startDate);
  
  // Calculate original total interest (without early payments)
  const originalTotalInterest = (originalMonthlyPayment * numberOfPayments) - loanAmount;
  
  for (let month = 1; month <= numberOfPayments; month++) {
    // Check if there's an early payment for this month
    let extraPayment = 0;
    let extraPaymentType: 'reduceTerm' | 'reducePayment' | undefined;
    
    if (earlyPaymentIndex < sortedEarlyPayments.length && 
        sortedEarlyPayments[earlyPaymentIndex].month === month) {
      const earlyPayment = sortedEarlyPayments[earlyPaymentIndex];
      extraPayment = earlyPayment.amount;
      extraPaymentType = earlyPayment.type;
      earlyPaymentIndex++;
    }
    
    // Calculate interest for this month
    const interest = balance * monthlyRate;
    
    // Calculate principal for this month
    const principal = currentMonthlyPayment - interest;
    
    // Update the balance
    let newBalance = balance - principal;
    
    // Apply extra payment
    if (extraPayment > 0) {
      newBalance -= extraPayment;
      
      // If payment type is to reduce payment, recalculate the monthly payment
      if (extraPaymentType === 'reducePayment' && newBalance > 0) {
        const remainingPayments = numberOfPayments - month;
        
        // Recalculate monthly payment for the remaining term
        currentMonthlyPayment = 
          (newBalance * monthlyRate * Math.pow(1 + monthlyRate, remainingPayments)) / 
          (Math.pow(1 + monthlyRate, remainingPayments) - 1);
      }
    }
    
    // Update total interest
    totalInterest += interest;
    
    // Calculate the date for this payment
    const date = new Date(startDateObj);
    date.setMonth(startDateObj.getMonth() + month - 1);
    
    // Add this month to the schedule
    schedule.push({
      month,
      date: date.toISOString().split('T')[0],
      payment: currentMonthlyPayment,
      principal,
      interest,
      totalInterest,
      balance: Math.max(0, newBalance),
      extraPayment: extraPayment > 0 ? extraPayment : undefined,
      extraPaymentType: extraPayment > 0 ? extraPaymentType : undefined
    });
    
    // Update balance for next iteration
    balance = newBalance;
    
    // If balance is effectively zero, we're done
    if (balance <= 0.01) {
      break;
    }
  }
  
  // Calculate summary statistics
  const newTerm = schedule.length;
  const newTotalInterest = totalInterest;
  const finalMonthlyPayment = schedule[schedule.length - 1].payment;
  const totalSavings = (originalTotalInterest - newTotalInterest) + 
                       (numberOfPayments - newTerm) * originalMonthlyPayment;
  
  return {
    schedule,
    summary: {
      originalTerm: numberOfPayments,
      newTerm,
      originalTotalInterest,
      newTotalInterest,
      originalMonthlyPayment,
      finalMonthlyPayment,
      totalSavings
    }
  };
}
```

### 3. Create a Base Chart Component

```tsx
// src/components/charts/BaseChart.tsx
import React, { useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from '@/providers/ThemeProvider';
import styles from './Chart.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface BaseChartProps {
  title?: string;
  children: React.ReactNode;
  height?: number;
}

export function BaseChart({ title, children, height = 300 }: BaseChartProps) {
  const { isDark } = useTheme();
  
  // Set global Chart.js options based on theme
  useEffect(() => {
    ChartJS.defaults.color = isDark ? '#f5f5f5' : '#333333';
    ChartJS.defaults.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  }, [isDark]);
  
  return (
    <div className={styles.chartContainer}>
      {title && <h3 className={styles.chartTitle}>{title}</h3>}
      <div className={styles.chart} style={{ height: `${height}px` }}>
        {children}
      </div>
    </div>
  );
}
```

### 4. Create a CSS Module for Charts

```css
/* src/components/charts/Chart.module.css */
.chartContainer {
  margin-bottom: var(--spacing-lg);
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  border: 1px solid var(--card-border-color);
}

.chartTitle {
  font-size: var(--font-size-large);
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
  text-align: center;
}

.chart {
  position: relative;
  width: 100%;
  height: 300px;
}

@media (min-width: 768px) {
  .chart {
    height: 400px;
  }
}
```

### 5. Create the Payment Breakdown Pie Chart

```tsx
// src/components/charts/PaymentBreakdownChart.tsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { useLocalization } from '@/providers/LocalizationProvider';
import { BaseChart } from './BaseChart';

interface PaymentBreakdownChartProps {
  principal: number;
  interest: number;
}

export function PaymentBreakdownChart({ principal, interest }: PaymentBreakdownChartProps) {
  const { t, formatCurrency } = useLocalization();
  
  const data: ChartData<'pie'> = {
    labels: [t('principal'), t('interest')],
    datasets: [
      {
        data: [principal, interest],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };
  
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };
  
  return (
    <BaseChart title={t('paymentBreakdown')}>
      <Pie data={data} options={options} />
    </BaseChart>
  );
}
```

### 6. Create the Amortization Schedule Line Chart

```tsx
// src/components/charts/AmortizationChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { useLocalization } from '@/providers/LocalizationProvider';
import { BaseChart } from './BaseChart';
import { AmortizationScheduleItem } from '@/utils/amortizationSchedule';

interface AmortizationChartProps {
  schedule: AmortizationScheduleItem[];
}

export function AmortizationChart({ schedule }: AmortizationChartProps) {
  const { t, formatCurrency } = useLocalization();
  
  // Prepare data for the chart
  const months = schedule.map(item => item.month);
  const principals = schedule.map(item => item.principal);
  const interests = schedule.map(item => item.interest);
  const balances = schedule.map(item => item.balance);
  
  // Determine max values for scaling
  const maxPayment = Math.max(...principals.map((p, i) => p + interests[i]));
  const maxBalance = Math.max(...balances);
  
  const data: ChartData<'line'> = {
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
  
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw as number;
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: t('month'),
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: t('payment'),
        },
        min: 0,
        max: maxPayment * 1.1, // Add 10% padding
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: t('balance'),
        },
        min: 0,
        max: maxBalance * 1.1, // Add 10% padding
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };
  
  return (
    <BaseChart title={t('amortizationSchedule')} height={400}>
      <Line data={data} options={options} />
    </BaseChart>
  );
}
```

### 7. Create the Charts Container Component

```tsx
// src/components/charts/ChartsContainer.tsx
import React from 'react';
import { Section } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { PaymentBreakdownChart } from './PaymentBreakdownChart';
import { AmortizationChart } from './AmortizationChart';
import { AmortizationScheduleResult } from '@/utils/amortizationSchedule';
import styles from './ChartsContainer.module.css';

interface ChartsContainerProps {
  amortizationResult: AmortizationScheduleResult | null;
}

export function ChartsContainer({ amortizationResult }: ChartsContainerProps) {
  const { t } = useLocalization();
  
  if (!amortizationResult || amortizationResult.schedule.length === 0) {
    return null;
  }
  
  // Get the first payment for the pie chart
  const firstPayment = amortizationResult.schedule[0];
  
  return (
    <Section header={t('graphicalView')}>
      <div className={styles.chartsGrid}>
        <PaymentBreakdownChart 
          principal={firstPayment.principal} 
          interest={firstPayment.interest} 
        />
        
        <AmortizationChart schedule={amortizationResult.schedule} />
      </div>
    </Section>
  );
}
```

```css
/* src/components/charts/ChartsContainer.module.css */
.chartsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
}

@media (min-width: 992px) {
  .chartsGrid {
    grid-template-columns: 1fr 2fr;
  }
}
```

### 8. Add Translations for Charts

```typescript
// src/localization/translations.ts
export const translations = {
  en: {
    // ... existing translations
    
    // Charts
    graphicalView: "Graphical View",
    paymentBreakdown: "Payment Breakdown",
    amortizationSchedule: "Amortization Schedule",
    principal: "Principal",
    interest: "Interest",
    balance: "Balance",
    month: "Month",
    payment: "Payment",
  },
  ru: {
    // ... existing translations
    
    // Charts
    graphicalView: "Графическое представление",
    paymentBreakdown: "Структура платежа",
    amortizationSchedule: "График погашения",
    principal: "Основной долг",
    interest: "Проценты",
    balance: "Остаток",
    month: "Месяц",
    payment: "Платеж",
  }
};
```

## Dependencies

- chart.js for creating charts
- react-chartjs-2 for React integration with Chart.js
- @telegram-apps/telegram-ui for UI components
- LocalizationProvider for translations and formatting
- ThemeProvider for theming

## Acceptance Criteria

- Chart.js and react-chartjs-2 are properly installed and configured
- The payment breakdown pie chart correctly displays the proportion of principal vs. interest
- The amortization schedule line chart correctly displays how payments and balance change over time
- Charts are responsive and work well on both mobile and desktop
- Charts adapt to the current theme (light or dark)
- All chart labels and tooltips are properly localized
- Charts update automatically when loan details change
- TelegramUI components are used for layout and structure
