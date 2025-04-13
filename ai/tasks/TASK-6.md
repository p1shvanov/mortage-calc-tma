# TASK-6: Localization Implementation

## Objective

Implement a localization (i18n) system for the mortgage calculator application to support users from different countries. The system should automatically detect the user's language from Telegram and provide translations for all UI elements.

## Analysis

Since the application is expected to be used by users worldwide, localization is a critical feature. The user's language can be accessed through the Telegram Web App data, specifically from `tgWebAppData.user.language_code`.

There are two approaches to implementing localization:

1. **Using a third-party library** like i18next, react-intl, or react-i18next
2. **Creating a custom solution** tailored to our specific needs

Given that this is a relatively small application with a focused purpose, a custom solution might be more appropriate to keep the bundle size small and avoid unnecessary dependencies.

## Requirements

1. Support for multiple languages, starting with English and Russian
2. Automatic language detection from Telegram user settings
3. Fallback to English if the user's language is not supported
4. Ability to manually switch languages
5. Support for formatting numbers, currencies, and dates according to locale
6. Proper handling of pluralization rules

## Implementation Plan

### 1. Create a Localization Context

Create a React context to provide localization functionality throughout the application:

```typescript
// src/providers/LocalizationProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

// Define supported languages
export type SupportedLanguage = 'en' | 'ru';

// Define the context interface
interface LocalizationContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  formatDate: (date: Date | string) => string;
}

// Create the context
const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Create a hook for using the localization context
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

// Create the provider component
export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the user's language from Telegram
  const getUserLanguage = (): SupportedLanguage => {
    try {
      const launchParams = retrieveLaunchParams();
      const userLang = launchParams.tgWebAppData?.user?.language_code || 'en';
      
      // Check if the language is supported, otherwise fallback to English
      return userLang === 'ru' ? 'ru' : 'en';
    } catch (error) {
      console.error('Error retrieving user language:', error);
      return 'en';
    }
  };

  // Initialize language state
  const [language, setLanguage] = useState<SupportedLanguage>(getUserLanguage());

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[language][key] || translations.en[key] || key;
    
    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(`{${paramKey}}`, String(paramValue));
      }, translation);
    }
    
    return translation;
  };

  // Format currency based on language
  const formatCurrency = (value: number): string => {
    if (language === 'ru') {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format number based on language
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US').format(value);
  };

  // Format date based on language
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US');
  };

  return (
    <LocalizationContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatCurrency,
        formatNumber,
        formatDate
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};
```

### 2. Create Translation Files

Create a separate file for translations:

```typescript
// src/localization/translations.ts
export const translations = {
  en: {
    // App
    appTitle: "Mortgage Calculator",
    
    // Loan Details
    loanDetails: "Loan Details",
    homeValue: "Home Value",
    downPayment: "Down Payment",
    loanAmount: "Loan Amount",
    interestRate: "Interest Rate",
    loanTerm: "Loan Term (years)",
    startDate: "Start Date",
    
    // Results
    paymentSummary: "Payment Summary",
    monthlyPayment: "Monthly Payment",
    totalInterest: "Total Interest",
    totalCost: "Total Cost",
    payoffDate: "Payoff Date",
    
    // Early Payment
    earlyPayment: "Early Payment",
    earlyPaymentAmount: "Additional Amount",
    earlyPaymentMonth: "Month of Payment",
    addEarlyPayment: "Add Early Payment",
    paymentHistory: "Early Payments",
    totalEarlyPayments: "Total Early Payments",
    
    // Payment Schedule
    amortization: "Amortization Schedule",
    month: "Month",
    date: "Date",
    payment: "Payment",
    principal: "Principal",
    interest: "Interest",
    balance: "Balance",
    
    // Validation
    errorHomeValue: "Home value must be greater than 0",
    errorDownPayment: "Down payment must be greater than 0",
    errorDownPaymentMax: "Down payment must be less than home value",
    errorInterestRate: "Interest rate must be greater than 0",
    errorLoanTerm: "Loan term must be greater than 0",
    
    // Common
    calculate: "Calculate",
    reset: "Reset",
    years: "years",
    months: "months"
  },
  ru: {
    // App
    appTitle: "Ипотечный калькулятор",
    
    // Loan Details
    loanDetails: "Детали кредита",
    homeValue: "Стоимость недвижимости",
    downPayment: "Первоначальный взнос",
    loanAmount: "Сумма кредита",
    interestRate: "Процентная ставка",
    loanTerm: "Срок кредита (лет)",
    startDate: "Дата начала",
    
    // Results
    paymentSummary: "Сводка по платежам",
    monthlyPayment: "Ежемесячный платеж",
    totalInterest: "Общий процент",
    totalCost: "Общая стоимость",
    payoffDate: "Дата погашения",
    
    // Early Payment
    earlyPayment: "Досрочное погашение",
    earlyPaymentAmount: "Дополнительная сумма",
    earlyPaymentMonth: "Месяц платежа",
    addEarlyPayment: "Добавить досрочный платеж",
    paymentHistory: "Досрочные платежи",
    totalEarlyPayments: "Всего досрочных платежей",
    
    // Payment Schedule
    amortization: "График платежей",
    month: "Месяц",
    date: "Дата",
    payment: "Платеж",
    principal: "Основной долг",
    interest: "Проценты",
    balance: "Остаток",
    
    // Validation
    errorHomeValue: "Стоимость недвижимости должна быть больше 0",
    errorDownPayment: "Первоначальный взнос должен быть больше 0",
    errorDownPaymentMax: "Первоначальный взнос должен быть меньше стоимости жилья",
    errorInterestRate: "Процентная ставка должна быть больше 0",
    errorLoanTerm: "Срок кредита должен быть больше 0",
    
    // Common
    calculate: "Рассчитать",
    reset: "Сбросить",
    years: "лет",
    months: "месяцев"
  }
};
```

### 3. Add the Provider to the Application

Wrap the application with the LocalizationProvider:

```tsx
// src/components/Root.tsx
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { publicUrl } from '@/helpers/publicUrl.ts';
import { LocalizationProvider } from '@/providers/LocalizationProvider';

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <LocalizationProvider>
        <TonConnectUIProvider
          manifestUrl={publicUrl('tonconnect-manifest.json')}
        >
          <App/>
        </TonConnectUIProvider>
      </LocalizationProvider>
    </ErrorBoundary>
  );
}
```

### 4. Use the Localization in Components

Example usage in a component:

```tsx
// src/components/LoanDetailsForm.tsx
import { useLocalization } from '@/providers/LocalizationProvider';
import { Input, Section } from '@telegram-apps/telegram-ui';

export function LoanDetailsForm() {
  const { t, formatCurrency } = useLocalization();
  
  return (
    <Section header={t('loanDetails')}>
      <Input
        header={t('homeValue')}
        placeholder={formatCurrency(300000)}
        // ... other props
      />
      {/* ... other form fields */}
    </Section>
  );
}
```

### 5. Add Language Switcher (Optional)

Create a component to allow users to manually switch languages:

```tsx
// src/components/LanguageSwitcher.tsx
import { useLocalization, SupportedLanguage } from '@/providers/LocalizationProvider';
import { Button } from '@telegram-apps/telegram-ui';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLocalization();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };
  
  return (
    <Button onClick={toggleLanguage}>
      {language === 'en' ? 'RU' : 'EN'}
    </Button>
  );
}
```

## Dependencies

- React Context API for state management
- Intl API for formatting numbers, currencies, and dates

## Acceptance Criteria

- The application automatically detects the user's language from Telegram
- All UI elements are properly translated based on the selected language
- Numbers, currencies, and dates are formatted according to the locale
- Users can manually switch between supported languages
- The application falls back to English for unsupported languages
- The localization system is modular and easy to extend with additional languages
