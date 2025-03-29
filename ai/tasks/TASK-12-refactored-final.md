# TASK-12: Payment Schedule Implementation (Final)

## Objective

Implement a payment schedule component for the mortgage calculator application. This component should display a detailed table of all payments over the life of the loan, showing how each payment is split between principal and interest, and how the loan balance decreases over time.

## Analysis

The payment schedule (amortization table) is an important feature that provides users with a detailed breakdown of each payment throughout the loan term. Based on the reference design and requirements, this component should:

1. Display a table with monthly payment details
2. Show payment number, date, payment amount, principal, interest, and remaining balance for each payment
3. Allow users to navigate through the payment schedule (pagination)
4. Be responsive and work well on both mobile and desktop
5. Support localization for different languages
6. Handle early payments and show their impact on the schedule

## Requirements

1. Create a component to display the amortization schedule as a table with the following columns:
   - Payment Number (Month)
   - Payment Date
   - Payment Amount
   - Principal Amount
   - Interest Amount
   - Extra Payment (if applicable)
   - Remaining Balance

2. Implement pagination to handle potentially hundreds of payments:
   - Show a limited number of payments per page (e.g., 12 for monthly view)
   - Provide navigation controls to move between pages
   - Display current page information (e.g., "Showing payments 1-12 of 360")

3. Use the amortization schedule utility created in TASK-11

4. Ensure the table is responsive and works well on both mobile and desktop

5. Support localization for all table headers and content

6. Support dark and light themes

7. Maximize the use of TelegramUI components for the table and pagination

## Implementation Plan

### 1. Create the Payment Schedule Component

```tsx
// src/components/PaymentSchedule/PaymentSchedule.tsx
import React, { useState } from 'react';
import { Section, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { AmortizationScheduleResult } from '@/utils/amortizationSchedule';
import styles from './PaymentSchedule.module.css';

interface PaymentScheduleProps {
  amortizationResult: AmortizationScheduleResult | null;
}

export function PaymentSchedule({ amortizationResult }: PaymentScheduleProps) {
  const { t, formatCurrency, formatDate, formatNumber } = useLocalization();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 12 months (1 year) per page
  
  if (!amortizationResult || amortizationResult.schedule.length === 0) {
    return null;
  }
  
  const schedule = amortizationResult.schedule;
  
  // Calculate pagination
  const totalPages = Math.ceil(schedule.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, schedule.length);
  const currentItems = schedule.slice(startIndex, endIndex);
  
  // Handle page navigation
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  return (
    <Section header={t('paymentSchedule')}>
      <div className={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell header>{t('month')}</TableCell>
              <TableCell header>{t('date')}</TableCell>
              <TableCell header>{t('payment')}</TableCell>
              <TableCell header>{t('principal')}</TableCell>
              <TableCell header>{t('interest')}</TableCell>
              <TableCell header>{t('extraPayment')}</TableCell>
              <TableCell header>{t('balance')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={item.month} className={item.extraPayment ? styles.earlyPaymentRow : undefined}>
                <TableCell>{formatNumber(item.month)}</TableCell>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>{formatCurrency(item.payment)}</TableCell>
                <TableCell>{formatCurrency(item.principal)}</TableCell>
                <TableCell>{formatCurrency(item.interest)}</TableCell>
                <TableCell>{item.extraPayment ? formatCurrency(item.extraPayment) : '-'}</TableCell>
                <TableCell>{formatCurrency(item.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className={styles.pagination}>
        <Button 
          size="s"
          onClick={goToPrevPage} 
          disabled={currentPage === 1}
        >
          {t('previous')}
        </Button>
        
        <div className={styles.pageInfo}>
          {t('showingPayments', {
            from: startIndex + 1,
            to: endIndex,
            total: schedule.length
          })}
        </div>
        
        <Button 
          size="s"
          onClick={goToNextPage} 
          disabled={currentPage === totalPages}
        >
          {t('next')}
        </Button>
      </div>
    </Section>
  );
}
```

### 2. Create the CSS Module for Styling

```css
/* src/components/PaymentSchedule/PaymentSchedule.module.css */
.tableContainer {
  margin-bottom: var(--spacing-md);
  overflow-x: auto;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--card-border-color);
  background-color: var(--card-bg-color);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
}

.pageInfo {
  font-size: var(--font-size-small);
  color: var(--hint-color);
}

.earlyPaymentRow {
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .pageInfo {
    order: -1;
    margin-bottom: var(--spacing-sm);
  }
}
```

### 3. Add Translations for Payment Schedule

```typescript
// src/localization/translations.ts
export const translations = {
  en: {
    // ... existing translations
    
    // Payment Schedule
    paymentSchedule: "Payment Schedule",
    month: "Month",
    date: "Date",
    payment: "Payment",
    principal: "Principal",
    interest: "Interest",
    extraPayment: "Extra Payment",
    balance: "Balance",
    previous: "Previous",
    next: "Next",
    showingPayments: "Showing payments {from}-{to} of {total}",
  },
  ru: {
    // ... existing translations
    
    // Payment Schedule
    paymentSchedule: "График платежей",
    month: "Месяц",
    date: "Дата",
    payment: "Платеж",
    principal: "Основной долг",
    interest: "Проценты",
    extraPayment: "Досрочный платеж",
    balance: "Остаток",
    previous: "Назад",
    next: "Вперед",
    showingPayments: "Платежи {from}-{to} из {total}",
  }
};
```

### 4. Create a Tab System for Better Organization

```tsx
// src/components/TabView/TabView.tsx
import React, { useState } from 'react';
import { useLocalization } from '@/providers/LocalizationProvider';
import styles from './TabView.module.css';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabViewProps {
  tabs: Tab[];
  children: React.ReactNode;
  defaultTab?: string;
}

export function TabView({ tabs, children, defaultTab }: TabViewProps) {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);
  
  // Filter children to only show the active tab
  const childrenArray = React.Children.toArray(children);
  const activeChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.props.id === activeTab
  );
  
  return (
    <div className={styles.tabView}>
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className={styles.tabContent}>
        {activeChild}
      </div>
    </div>
  );
}

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
}

export function TabPanel({ children }: TabPanelProps) {
  return <div className={styles.tabPanel}>{children}</div>;
}
```

```css
/* src/components/TabView/TabView.module.css */
.tabView {
  margin-bottom: var(--spacing-lg);
}

.tabBar {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--card-border-color);
  margin-bottom: var(--spacing-md);
  scrollbar-width: none; /* Firefox */
}

.tabBar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.tabButton {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: none;
  color: var(--hint-color);
  font-size: var(--font-size-normal);
  cursor: pointer;
  white-space: nowrap;
  transition: color var(--transition-normal);
  position: relative;
}

.tabButton.active {
  color: var(--primary-color);
}

.tabButton.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-color);
}

.tabIcon {
  margin-right: var(--spacing-xs);
}

.tabContent {
  padding: var(--spacing-md) 0;
}

.tabPanel {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### 5. Integrate the Payment Schedule Component into the App

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

1. **Pagination**: The payment schedule is paginated to limit the number of rows displayed at once, improving rendering performance.

2. **Conditional Rendering**: The component only renders when there is valid data available.

3. **Memoization**: Consider memoizing expensive calculations or components if performance becomes an issue.

## Dependencies

- @telegram-apps/telegram-ui for UI components (Table, Button, Section)
- Amortization schedule utility from TASK-11
- LocalizationProvider for translations and formatting
- ThemeProvider for theming

## Acceptance Criteria

- The payment schedule component displays a table with all required columns: month, date, payment, principal, interest, extra payment, and balance
- The table shows the correct values for each payment based on the loan details
- Pagination works correctly, allowing users to navigate through the payment schedule
- The component is responsive and works well on both mobile and desktop
- All text is properly localized
- The component adapts to the current theme (light or dark)
- The payment schedule updates automatically when loan details or early payments change
- TelegramUI components are used for the table and pagination
