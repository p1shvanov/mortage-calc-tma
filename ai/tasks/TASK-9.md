# TASK-9: Loan Details Block Implementation

## Objective

Implement the loan details block for the mortgage calculator application. This block should allow users to input all necessary information for mortgage calculation, including home value, down payment, loan amount, interest rate, loan term, and start date. The form should include proper validation to ensure users enter correct data.

## Analysis

The loan details block is a critical component of the mortgage calculator as it collects all the necessary input data for calculations. Based on the reference design and requirements, this block should:

1. Provide input fields for all required mortgage parameters
2. Calculate the loan amount automatically based on home value and down payment
3. Include validation to prevent invalid inputs
4. Be responsive and user-friendly on both mobile and desktop
5. Support localization for different languages

## Requirements

1. Create a form with the following fields:
   - Home Value (numeric input)
   - Down Payment (numeric input)
   - Loan Amount (calculated field, read-only)
   - Interest Rate (numeric input with percentage)
   - Loan Term (select dropdown or numeric input with years)
   - Start Date (date picker)

2. Implement the following validations:
   - Home value must be greater than 0
   - Down payment must be greater than or equal to 0
   - Down payment must be less than home value
   - Interest rate must be greater than 0
   - Loan term must be greater than 0

3. Automatically calculate the loan amount as (Home Value - Down Payment)

4. Provide visual feedback for validation errors

5. Support localization for all labels and error messages

## Implementation Plan

### 1. Create the Loan Details Component

```tsx
// src/components/LoanDetails/LoanDetails.tsx
import React, { useState, useEffect } from 'react';
import { Section, Input, Select } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { FormField } from '@/components/form/FormField';
import styles from './LoanDetails.module.css';

interface LoanDetailsProps {
  onValuesChange: (values: LoanDetailsValues) => void;
}

export interface LoanDetailsValues {
  homeValue: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  startDate: string;
}

export function LoanDetails({ onValuesChange }: LoanDetailsProps) {
  const { t, formatCurrency, formatNumber } = useLocalization();
  
  // Initialize form state
  const [values, setValues] = useState<LoanDetailsValues>({
    homeValue: 300000,
    downPayment: 60000,
    loanAmount: 240000,
    interestRate: 3.5,
    loanTerm: 30,
    startDate: new Date().toISOString().split('T')[0]
  });
  
  // Initialize validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let numValue = name === 'startDate' ? value : parseFloat(value) || 0;
    
    setValues(prev => {
      const newValues = {
        ...prev,
        [name]: numValue
      };
      
      // Auto-calculate loan amount if home value or down payment changes
      if (name === 'homeValue' || name === 'downPayment') {
        const homeValue = name === 'homeValue' ? numValue : prev.homeValue;
        const downPayment = name === 'downPayment' ? numValue : prev.downPayment;
        
        newValues.loanAmount = homeValue - downPayment;
      }
      
      return newValues;
    });
  };
  
  // Validate form values
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (values.homeValue <= 0) {
      newErrors.homeValue = t('errorHomeValue');
    }
    
    if (values.downPayment < 0) {
      newErrors.downPayment = t('errorDownPayment');
    }
    
    if (values.downPayment >= values.homeValue) {
      newErrors.downPayment = t('errorDownPaymentMax');
    }
    
    if (values.interestRate <= 0) {
      newErrors.interestRate = t('errorInterestRate');
    }
    
    if (values.loanTerm <= 0) {
      newErrors.loanTerm = t('errorLoanTerm');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Notify parent component when values change
  useEffect(() => {
    if (validateForm()) {
      onValuesChange(values);
    }
  }, [values]);
  
  return (
    <Section header={t('loanDetails')}>
      <div className={styles.formGrid}>
        <FormField
          label={t('homeValue')}
          name="homeValue"
          type="number"
          value={values.homeValue}
          onChange={handleInputChange}
          placeholder="300000"
          error={errors.homeValue}
          min={0}
          step={1000}
        />
        
        <FormField
          label={t('downPayment')}
          name="downPayment"
          type="number"
          value={values.downPayment}
          onChange={handleInputChange}
          placeholder="60000"
          error={errors.downPayment}
          min={0}
          step={1000}
        />
        
        <FormField
          label={t('loanAmount')}
          name="loanAmount"
          type="number"
          value={values.loanAmount}
          onChange={() => {}} // Read-only
          placeholder="240000"
          readOnly
        />
        
        <FormField
          label={t('interestRate')}
          name="interestRate"
          type="number"
          value={values.interestRate}
          onChange={handleInputChange}
          placeholder="3.5"
          error={errors.interestRate}
          min={0}
          max={20}
          step={0.1}
          after={<div className={styles.percentSign}>%</div>}
        />
        
        <div className={styles.formField}>
          <label className={styles.label}>{t('loanTerm')}</label>
          <Select
            name="loanTerm"
            value={String(values.loanTerm)}
            onChange={(e) => handleInputChange({
              target: {
                name: 'loanTerm',
                value: e.target.value
              }
            } as React.ChangeEvent<HTMLSelectElement>)}
            options={[
              { value: '10', label: `10 ${t('years')}` },
              { value: '15', label: `15 ${t('years')}` },
              { value: '20', label: `20 ${t('years')}` },
              { value: '25', label: `25 ${t('years')}` },
              { value: '30', label: `30 ${t('years')}` }
            ]}
            status={errors.loanTerm ? 'error' : 'default'}
          />
          {errors.loanTerm && <div className={styles.error}>{errors.loanTerm}</div>}
        </div>
        
        <FormField
          label={t('startDate')}
          name="startDate"
          type="date"
          value={values.startDate}
          onChange={handleInputChange}
        />
      </div>
      
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <div className={styles.summaryLabel}>{t('downPaymentPercentage')}</div>
          <div className={styles.summaryValue}>
            {formatNumber((values.downPayment / values.homeValue) * 100)}%
          </div>
        </div>
      </div>
    </Section>
  );
}
```

### 2. Create the CSS Module for Styling

```css
/* src/components/LoanDetails/LoanDetails.module.css */
.formGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .formGrid {
    grid-template-columns: 1fr 1fr;
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

.percentSign {
  color: var(--hint-color);
  padding: 0 var(--spacing-sm);
}

.summary {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--card-border-color);
}

.summaryItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.summaryLabel {
  font-size: var(--font-size-normal);
  color: var(--hint-color);
}

.summaryValue {
  font-size: var(--font-size-normal);
  font-weight: bold;
  color: var(--text-color);
}
```

### 3. Add Translations for Loan Details

Add the following translations to the localization file:

```typescript
// src/localization/translations.ts
export const translations = {
  en: {
    // ... existing translations
    
    // Loan Details
    loanDetails: "Loan Details",
    homeValue: "Home Value",
    downPayment: "Down Payment",
    loanAmount: "Loan Amount",
    interestRate: "Interest Rate",
    loanTerm: "Loan Term",
    startDate: "Start Date",
    years: "years",
    downPaymentPercentage: "Down Payment Percentage",
    
    // Validation Errors
    errorHomeValue: "Home value must be greater than 0",
    errorDownPayment: "Down payment must be greater than or equal to 0",
    errorDownPaymentMax: "Down payment must be less than home value",
    errorInterestRate: "Interest rate must be greater than 0",
    errorLoanTerm: "Loan term must be greater than 0",
  },
  ru: {
    // ... existing translations
    
    // Loan Details
    loanDetails: "Детали кредита",
    homeValue: "Стоимость жилья",
    downPayment: "Первый взнос",
    loanAmount: "Сумма кредита",
    interestRate: "Процентная ставка",
    loanTerm: "Срок кредита",
    startDate: "Дата начала",
    years: "лет",
    downPaymentPercentage: "Процент первого взноса",
    
    // Validation Errors
    errorHomeValue: "Стоимость жилья должна быть больше 0",
    errorDownPayment: "Первый взнос должен быть больше или равен 0",
    errorDownPaymentMax: "Первый взнос должен быть меньше стоимости жилья",
    errorInterestRate: "Процентная ставка должна быть больше 0",
    errorLoanTerm: "Срок кредита должен быть больше 0",
  }
};
```

### 4. Integrate the Loan Details Component into the App

```tsx
// src/components/App.tsx
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useTheme } from '@/providers/ThemeProvider';
import { Container } from '@/components/layout/Container';
import { LoanDetails, LoanDetailsValues } from '@/components/LoanDetails/LoanDetails';
import { useState } from 'react';

export function App() {
  const lp = retrieveLaunchParams();
  const { themeMode } = useTheme();
  const [loanDetails, setLoanDetails] = useState<LoanDetailsValues | null>(null);
  
  const handleLoanDetailsChange = (values: LoanDetailsValues) => {
    setLoanDetails(values);
    // This will be used later to calculate mortgage results
  };
  
  return (
    <AppRoot
      appearance={themeMode}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <Container>
        <LoanDetails onValuesChange={handleLoanDetailsChange} />
        
        {/* Other components will be added here in future tasks */}
      </Container>
    </AppRoot>
  );
}
```

### 5. Add a Range Slider for Down Payment (Optional Enhancement)

For better user experience, we can add a range slider for the down payment:

```tsx
// Inside the LoanDetails component
<div className={styles.rangeSlider}>
  <input
    type="range"
    name="downPaymentSlider"
    min={0}
    max={values.homeValue}
    step={1000}
    value={values.downPayment}
    onChange={(e) => {
      handleInputChange({
        target: {
          name: 'downPayment',
          value: e.target.value
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }}
    className={styles.slider}
  />
  <div className={styles.rangeLabels}>
    <span>0%</span>
    <span>10%</span>
    <span>20%</span>
    <span>30%</span>
  </div>
</div>
```

Add the following CSS to the module:

```css
.rangeSlider {
  margin-top: var(--spacing-sm);
}

.slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--secondary-bg-color);
  outline: none;
  border-radius: 4px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
}

.rangeLabels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-small);
  color: var(--hint-color);
}
```

## Dependencies

- @telegram-apps/telegram-ui for UI components
- LocalizationProvider for translations
- ThemeProvider for theming
- FormField component from the design system

## Acceptance Criteria

- The loan details form includes all required fields: home value, down payment, loan amount, interest rate, loan term, and start date
- The loan amount is automatically calculated based on home value and down payment
- The form includes proper validation with error messages
- The form is responsive and works well on both mobile and desktop
- All text is properly localized
- The form is styled according to the design system
- The form data is passed to the parent component for further processing
