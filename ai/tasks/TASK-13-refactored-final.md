# TASK-13: Early Payment Functionality (Final)

## Objective

Implement early payment functionality for the mortgage calculator application. This feature will allow users to add one-time early payments to their mortgage and see how these payments affect the loan term, total interest, and monthly payments.

## Analysis

Early payment functionality is a key feature that helps users understand how making additional payments can save them money and reduce their loan term. Based on the reference design and requirements, this feature should:

1. Allow users to add one-time early payments at specific months
2. Support two types of early payments: reduce term (keep the same monthly payment but pay off faster) or reduce payment (lower the monthly payment but keep the same term)
3. Recalculate the amortization schedule based on early payments
4. Show the impact of early payments on total interest, loan term, and monthly payments
5. Allow users to add, edit, and remove early payments

## Requirements

1. Create a component to add early payments with the following inputs:
   - Payment Amount: The additional amount to pay
   - Payment Month: The month when the early payment will be made
   - Payment Type: Reduce term or reduce payment

2. Create a component to display a list of scheduled early payments:
   - Show payment month, amount, and type
   - Allow users to remove payments
   - Show the total amount of early payments

3. Use the amortization schedule utility from TASK-11 to handle early payments:
   - Apply early payments at the specified months
   - Recalculate the schedule based on the payment type
   - For "reduce term" payments, keep the same monthly payment but reduce the number of payments
   - For "reduce payment" payments, recalculate the monthly payment but keep the same number of payments

4. Update the results display to show the impact of early payments:
   - Show the original vs. new loan term
   - Show the original vs. new total interest
   - Show the original vs. new monthly payment (for "reduce payment" type)

5. Update the charts to visualize the impact of early payments

6. Maximize the use of TelegramUI components for form inputs and buttons

## Implementation Plan

### 1. Create the Early Payment Form Component

```tsx
// src/components/EarlyPayment/EarlyPaymentForm.tsx
import React, { useState } from 'react';
import { Section, Input, Select, Button } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import styles from './EarlyPayment.module.css';

export interface EarlyPayment {
  id: string;
  month: number;
  amount: number;
  type: 'reduceTerm' | 'reducePayment';
}

interface EarlyPaymentFormProps {
  onAddPayment: (payment: Omit<EarlyPayment, 'id'>) => void;
  loanTerm: number;
}

export function EarlyPaymentForm({ onAddPayment, loanTerm }: EarlyPaymentFormProps) {
  const { t } = useLocalization();
  const [payment, setPayment] = useState({
    month: 12,
    amount: 1000,
    type: 'reduceTerm' as const
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let numValue = name === 'type' ? value : parseFloat(value) || 0;
    
    setPayment(prev => ({
      ...prev,
      [name]: numValue
    }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (payment.amount <= 0) {
      newErrors.amount = t('errorPaymentAmount');
    }
    
    if (payment.month <= 0 || payment.month > loanTerm * 12) {
      newErrors.month = t('errorPaymentMonth');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddPayment({
        month: payment.month,
        amount: payment.amount,
        type: payment.type
      });
      
      // Reset amount but keep the month and type
      setPayment(prev => ({
        ...prev,
        amount: 1000
      }));
    }
  };
  
  return (
    <Section header={t('earlyPayment')}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.label}>{t('earlyPaymentAmount')}</label>
            <Input
              name="amount"
              type="number"
              value={payment.amount}
              onChange={handleInputChange}
              placeholder="1000"
              min={0}
              step={100}
              status={errors.amount ? 'error' : 'default'}
            />
            {errors.amount && <div className={styles.error}>{errors.amount}</div>}
          </div>
          
          <div className={styles.formField}>
            <label className={styles.label}>{t('earlyPaymentMonth')}</label>
            <Input
              name="month"
              type="number"
              value={payment.month}
              onChange={handleInputChange}
              placeholder="12"
              min={1}
              max={loanTerm * 12}
              step={1}
              status={errors.month ? 'error' : 'default'}
            />
            {errors.month && <div className={styles.error}>{errors.month}</div>}
          </div>
          
          <div className={styles.formField}>
            <label className={styles.label}>{t('earlyPaymentType')}</label>
            <Select
              name="type"
              value={payment.type}
              onChange={handleInputChange}
              options={[
                { value: 'reduceTerm', label: t('typeReduceTerm') },
                { value: 'reducePayment', label: t('typeReducePayment') }
              ]}
            />
          </div>
        </div>
        
        <Button type="submit" className={styles.addButton}>
          {t('addEarlyPayment')}
        </Button>
      </form>
    </Section>
  );
}
```

### 2. Create the Early Payment List Component

```tsx
// src/components/EarlyPayment/EarlyPaymentList.tsx
import React from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { EarlyPayment } from './EarlyPaymentForm';
import styles from './EarlyPayment.module.css';

interface EarlyPaymentListProps {
  payments: EarlyPayment[];
  onRemovePayment: (id: string) => void;
}

export function EarlyPaymentList({ payments, onRemovePayment }: EarlyPaymentListProps) {
  const { t, formatCurrency, formatNumber } = useLocalization();
  
  if (payments.length === 0) {
    return null;
  }
  
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return (
    <div className={styles.paymentList}>
      <h3 className={styles.listTitle}>{t('earlyPaymentList')}</h3>
      
      <div className={styles.paymentItems}>
        {payments.map((payment) => (
          <div key={payment.id} className={styles.paymentItem}>
            <div className={styles.paymentInfo}>
              <div className={styles.paymentMonth}>
                {t('month')} {formatNumber(payment.month)}
              </div>
              <div className={styles.paymentAmount}>
                {formatCurrency(payment.amount)}
              </div>
              <div className={styles.paymentType}>
                {payment.type === 'reduceTerm' ? t('typeReduceTerm') : t('typeReducePayment')}
              </div>
            </div>
            <Button 
              size="s"
              mode="outline"
              onClick={() => onRemovePayment(payment.id)}
              className={styles.removeButton}
            >
              {t('remove')}
            </Button>
          </div>
        ))}
      </div>
      
      <div className={styles.totalPayments}>
        <span>{t('totalEarlyPayments')}:</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
}
```

### 3. Create the Early Payment Container Component

```tsx
// src/components/EarlyPayment/EarlyPaymentContainer.tsx
import React from 'react';
import { EarlyPaymentForm, EarlyPayment } from './EarlyPaymentForm';
import { EarlyPaymentList } from './EarlyPaymentList';
import { useMortgage } from '@/providers/MortgageProvider';
import { useLocalization } from '@/providers/LocalizationProvider';
import styles from './EarlyPayment.module.css';

export function EarlyPaymentContainer() {
  const { t } = useLocalization();
  const { loanDetails, earlyPayments, setEarlyPayments } = useMortgage();
  
  if (!loanDetails) {
    return null;
  }
  
  const handleAddPayment = (payment: Omit<EarlyPayment, 'id'>) => {
    const newPayment: EarlyPayment = {
      ...payment,
      id: Date.now().toString()
    };
    
    setEarlyPayments([...earlyPayments, newPayment]);
  };
  
  const handleRemovePayment = (id: string) => {
    setEarlyPayments(earlyPayments.filter(payment => payment.id !== id));
  };
  
  return (
    <div className={styles.container}>
      <EarlyPaymentForm 
        onAddPayment={handleAddPayment} 
        loanTerm={loanDetails.loanTerm} 
      />
      <EarlyPaymentList 
        payments={earlyPayments} 
        onRemovePayment={handleRemovePayment} 
      />
    </div>
  );
}
```

### 4. Create the CSS Module for Styling

```css
/* src/components/EarlyPayment/EarlyPayment.module.css */
.container {
  margin-bottom: var(--spacing-lg);
}

.form {
  margin-bottom: var(--spacing-md);
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .formGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.formField {
  margin-bottom: var(--spacing-md);
}

.label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-normal);
  color: var(--text-color);
}

.error {
  color: var(--error-color);
  font-size: var(--font-size-small);
  margin-top: var(--spacing-xs);
}

.addButton {
  width: 100%;
  margin-top: var(--spacing-md);
}

.paymentList {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--card-border-color);
}

.listTitle {
  font-size: var(--font-size-large);
  margin-bottom: var(--spacing-md);
  color: var(--text-color);
}

.paymentItems {
  margin-bottom: var(--spacing-md);
  max-height: 300px;
  overflow-y: auto;
}

.paymentItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--card-border-color);
}

.paymentItem:last-child {
  border-bottom: none;
}

.paymentInfo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.paymentMonth {
  font-weight: bold;
  color: var(--text-color);
}

.paymentAmount {
  color: var(--text-color);
}

.paymentType {
  color: var(--hint-color);
  font-size: var(--font-size-small);
}

.removeButton {
  flex-shrink: 0;
}

.totalPayments {
  display: flex;
  justify-content: space-between;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--card-border-color);
  font-weight: bold;
  color: var(--text-color);
}
```

### 5. Update the Results Display Component to Show Early Payment Impact

```tsx
// src/components/ResultsDisplay/ResultsDisplay.tsx
import React from 'react';
import { Section } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import styles from './ResultsDisplay.module.css';

export function ResultsDisplay() {
  const { t, formatCurrency, formatDate } = useLocalization();
  const { mortgageResults, amortizationResult } = useMortgage();
  
  if (!mortgageResults) {
    return null;
  }
  
  // Check if there are early payments that affect the schedule
  const hasEarlyPayments = amortizationResult && 
                          amortizationResult.summary.newTerm < amortizationResult.summary.originalTerm;
  
  const { monthlyPayment, totalInterest, totalCost, payoffDate } = mortgageResults;
  
  return (
    <Section header={t('paymentSummary')}>
      <div className={styles.resultsGrid}>
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>💰</div>
          <div className={styles.resultTitle}>{t('monthlyPayment')}</div>
          <div className={styles.resultValue}>
            {formatCurrency(monthlyPayment)}
            {hasEarlyPayments && amortizationResult?.summary.finalMonthlyPayment !== monthlyPayment && (
              <div className={styles.resultDifference}>
                {t('finalPayment')}: {formatCurrency(amortizationResult?.summary.finalMonthlyPayment)}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>📈</div>
          <div className={styles.resultTitle}>{t('totalInterest')}</div>
          <div className={styles.resultValue}>
            {formatCurrency(hasEarlyPayments ? amortizationResult?.summary.newTotalInterest : totalInterest)}
            {hasEarlyPayments && (
              <div className={styles.resultSavings}>
                {t('savings')}: {formatCurrency(amortizationResult?.summary.originalTotalInterest - amortizationResult?.summary.newTotalInterest)}
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.resultCard}>
          <div className={styles.resultIcon}>⏱️</div>
          <div className={styles.resultTitle}>{t('loanTerm')}</div>
          <div className={styles.resultValue}>
            {hasEarlyPayments 
              ? `${Math.floor(amortizationResult?.summary.newTerm / 12)} ${t('years')} ${amortizationResult?.summary.newTerm % 12} ${t('months')}`
              : `${Math.floor(mortgageResults.loanTerm)} ${t('years')}`
            }
            {hasEarlyPayments && (
              <div className={styles.resultSavings}>
                {t('monthsSaved')}: {amortizationResult?.summary.originalTerm - amortizationResult?.summary.newTerm}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {hasEarlyPayments && (
        <div className={styles.totalSavings}>
          <div className={styles.totalSavingsLabel}>{t('totalSavings')}</div>
          <div className={styles.totalSavingsValue}>
            {formatCurrency(amortizationResult?.summary.totalSavings)}
          </div>
        </div>
      )}
      
      <div className={styles.payoffDate}>
        <div className={styles.payoffDateLabel}>{t('payoffDate')}</div>
        <div className={styles.payoffDateValue}>
          {formatDate(hasEarlyPayments 
            ? amortizationResult?.schedule[amortizationResult.schedule.length - 1].date 
            : payoffDate
          )}
        </div>
      </div>
    </Section>
  );
}
```

### 6. Create the Mortgage Context Provider

```tsx
// src/providers/MortgageProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoanDetailsValues } from '@/components/LoanDetails/LoanDetails';
import { EarlyPayment } from '@/components/EarlyPayment/EarlyPaymentForm';
import { MortgageResults } from '@/types/mortgage';
import { AmortizationScheduleResult, generateAmortizationSchedule } from '@/utils/amortizationSchedule';

interface MortgageContextType {
  loanDetails: LoanDetailsValues | null;
  setLoanDetails: (values: LoanDetailsValues) => void;
  earlyPayments: EarlyPayment[];
  setEarlyPayments: (payments: EarlyPayment[]) => void;
  mortgageResults: MortgageResults | null;
  amortizationResult: AmortizationScheduleResult | null;
}

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export function MortgageProvider({ children }: { children: React.ReactNode }) {
  const [loanDetails, setLoanDetails] = useState<LoanDetailsValues | null>(null);
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const [mortgageResults, setMortgageResults] = useState<MortgageResults | null>(null);
  const [amortizationResult, setAmortizationResult] = useState<AmortizationScheduleResult | null>(null);

  // Calculate mortgage results when loan details change
  useEffect(() => {
    if (loanDetails) {
      // Monthly interest rate (annual rate divided by 12 and converted to decimal)
      const monthlyRate = loanDetails.interestRate / 100 / 12;
      
      // Total number of payments (years * 12 months)
      const numberOfPayments = loanDetails.loanTerm * 12;
      
      // Calculate monthly payment using the amortization formula
      const monthlyPayment = 
        (loanDetails.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      // Calculate total cost (monthly payment * number of payments)
      const totalCost = monthlyPayment * numberOfPayments;
      
      // Calculate total interest (total cost - loan amount)
      const totalInterest = totalCost - loanDetails.loanAmount;
      
      // Calculate payoff date
      const payoffDate = calculatePayoffDate(loanDetails.startDate, loanDetails.loanTerm);
      
      setMortgageResults({
        monthlyPayment,
        totalInterest,
        totalCost,
        payoffDate,
        loanTerm: loanDetails.loanTerm
      });
    }
  }, [loanDetails]);
  
  // Generate amortization schedule when loan details or early payments change
  useEffect(() => {
    if (loanDetails) {
      const result = generateAmortizationSchedule({
        loanAmount: loanDetails.loanAmount,
        interestRate: loanDetails.interestRate,
        loanTerm: loanDetails.loanTerm,
        startDate: loanDetails.startDate,
        earlyPayments
      });
      setAmortizationResult(result);
    }
  }, [loanDetails, earlyPayments]);
  
  // Helper function to calculate payoff date
  const calculatePayoffDate = (startDate: string, loanTerm: number): string => {
    const date = new Date(startDate);
    date.setFullYear(date.getFullYear() + loanTerm);
    return date.toISOString().split('T')[0];
  };

  return (
    <MortgageContext.Provider
      value={{
        loanDetails,
        setLoanDetails,
        earlyPayments,
        setEarlyPayments,
        mortgageResults,
        amortizationResult
      }}
    >
      {children}
    </MortgageContext.Provider>
  );
}

export function useMortgage() {
  const context = useContext(MortgageContext);
  if (!context) {
    throw new Error('useMortgage must be used within a MortgageProvider');
  }
  return context;
}
```

### 7. Create Mortgage Types

```typescript
// src/types/mortgage.ts
export interface MortgageResults {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  loanTerm: number;
}
```

### 8. Add Translations for Early Payments

```typescript
// src/localization/translations.ts
export const translations = {
  en: {
    // ... existing translations
    
    // Early Payments
    earlyPayment: "Early Payment",
    earlyPaymentAmount: "Payment Amount",
    earlyPaymentMonth: "Payment Month",
    earlyPaymentType: "Payment Type",
    typeReduceTerm: "Reduce Term",
    typeReducePayment: "Reduce Payment",
    addEarlyPayment: "Add Early Payment",
    earlyPaymentList: "Scheduled Early Payments",
    remove: "Remove",
    totalEarlyPayments: "Total Early Payments",
    errorPaymentAmount: "Payment amount must be greater than 0",
    errorPaymentMonth: "Payment month must be within the loan term",
    
    // Results with Early Payments
    finalPayment: "Final Payment",
    savings: "Savings",
    monthsSaved: "Months Saved",
    totalSavings: "Total Savings",
  },
  ru: {
    // ... existing translations
    
    // Early Payments
    earlyPayment: "Досрочное погашение",
    earlyPaymentAmount: "Сумма платежа",
    earlyPaymentMonth: "Месяц платежа",
    earlyPaymentType: "Тип платежа",
    typeReduceTerm: "Сократить срок",
    typeReducePayment: "Уменьшить платеж",
    addEarlyPayment: "Добавить досрочный платеж",
    earlyPaymentList: "Запланированные досрочные платежи",
    remove: "Удалить",
    totalEarlyPayments: "Всего досрочных платежей",
    errorPaymentAmount: "Сумма платежа должна быть больше 0",
    errorPaymentMonth: "Месяц платежа должен быть в пределах срока кредита",
    
    // Results with Early Payments
    finalPayment: "Итоговый платеж",
    savings: "Экономия",
    monthsSaved: "Сэкономлено месяцев",
    totalSavings: "Общая экономия",
  }
};
```

### 9. Update the App Component to Use the Mortgage Provider

```tsx
// src/components/App.tsx
import React from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useTheme } from '@/providers/ThemeProvider';
import { Container } from '@/components/layout/Container';
import { LoanDetails } from '@/components/LoanDetails/LoanDetails';
import { ResultsDisplay } from '@/components/ResultsDisplay/ResultsDisplay';
import { ChartsContainer } from '@/components/charts/ChartsContainer';
import { PaymentSchedule } from '@/components/PaymentSchedule/PaymentSchedule';
import { EarlyPaymentContainer } from '@/components/EarlyPayment/EarlyPaymentContainer';
import { TabView, TabPanel } from '@/components/TabView/TabView';
import { MortgageProvider } from '@/providers/MortgageProvider';
import { useLocalization } from '@/providers/LocalizationProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function App() {
  const { t } = useLocalization();
  const lp = retrieveLaunchParams();
  const { themeMode } = useTheme();
  
  return (
    <AppRoot
      appearance={themeMode}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <ErrorBoundary>
        <MortgageProvider>
          <Container>
            <LoanDetails />
            <EarlyPaymentContainer />
            <ResultsDisplay />
            
            <TabView
              tabs={[
                { id: 'charts', label: t('graphicalView') },
                { id: 'schedule', label: t('paymentSchedule') }
              ]}
              defaultTab="charts"
            >
              <TabPanel id="charts">
                <ChartsContainer />
              </TabPanel>
              <TabPanel id="schedule">
                <PaymentSchedule />
              </TabPanel>
            </TabView>
          </Container>
        </MortgageProvider>
      </ErrorBoundary>
    </AppRoot>
  );
}
```

## Performance Optimizations

1. **State Management**: The MortgageProvider centralizes state management, reducing prop drilling and making the application more maintainable.

2. **Conditional Rendering**: Components only render when there is valid data available.

3. **Memoization**: Consider memoizing expensive calculations or components if performance becomes an issue.

## Dependencies

- @telegram-apps/telegram-ui for UI components (Input, Select, Button, Section)
- Amortization schedule utility from TASK-11
- LocalizationProvider for translations and formatting
- ThemeProvider for theming

## Acceptance Criteria

- Users can add early payments with a specified amount, month, and type (reduce term or reduce payment)
- Users can view a list of scheduled early payments and remove them if needed
- The amortization schedule is correctly recalculated based on early payments
- The results display shows the impact of early payments on loan term, total interest, and monthly payments
- Charts and payment schedule are updated to reflect the impact of early payments
- All components are responsive and work well on both mobile and desktop
- All text is properly localized
- The components adapt to the current theme (light or dark)
- TelegramUI components are used for form inputs and buttons
