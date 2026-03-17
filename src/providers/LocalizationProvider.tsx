import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { translations } from '@/localization/translations';
import {
  type SupportedLanguage,
  getLocaleFromTelegram,
  LOCALE_INTL,
  LOCALE_CURRENCY,
} from '@/localization/locales';

export type { SupportedLanguage };

// Define the context interface
interface LocalizationContextType {
  language: SupportedLanguage;
  /** Full BCP 47 locale for Intl (e.g. 'ru-RU'). Use for form inputs and number/date formatting. */
  intlLocale: string;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  /** Format a display percentage (0–100) with locale-appropriate decimal separator and % symbol. */
  formatPercent: (value: number, options?: { maximumFractionDigits?: number }) => string;
  formatDate: (date: Date | string) => string;
  /** Format term in months as "X years" or "X years Y months" (months omitted when 0). */
  formatLoanTerm: (totalMonths: number) => string;
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
      const userLang = launchParams.tgWebAppData?.user?.language_code;
      return getLocaleFromTelegram(userLang);
    } catch (error) {
      console.error('Error retrieving user language:', error);
      return 'en';
    }
  };

  // Initialize language state
  const [language, setLanguage] = useState<SupportedLanguage>(getUserLanguage());

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const langTranslations = translations[language] as Record<string, string>;
      const enTranslations = translations.en as Record<string, string>;
      const translation = langTranslations[key] || enTranslations[key] || key;
      if (params) {
        return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
          return acc.replace(`{${paramKey}}`, String(paramValue));
        }, translation);
      }
      return translation;
    },
    [language]
  );

  const intlLocale = LOCALE_INTL[language];

  const formatCurrency = useCallback(
    (value: number): string => {
      const currency = LOCALE_CURRENCY[language];
      return new Intl.NumberFormat(intlLocale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    },
    [language, intlLocale]
  );

  const formatNumber = useCallback(
    (value: number): string => {
      return new Intl.NumberFormat(intlLocale).format(value);
    },
    [intlLocale]
  );

  const formatPercent = useCallback(
    (value: number, options?: { maximumFractionDigits?: number }): string => {
      return new Intl.NumberFormat(intlLocale, {
        style: 'percent',
        maximumFractionDigits: options?.maximumFractionDigits ?? 1,
        minimumFractionDigits: 0,
      }).format(value / 100);
    },
    [intlLocale]
  );

  const formatDate = useCallback(
    (date: Date | string): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString(intlLocale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    },
    [intlLocale]
  );

  const formatLoanTerm = useCallback(
    (totalMonths: number): string => {
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      const yearsPart = `${formatNumber(years)} ${t('years')}`;
      if (months === 0) return yearsPart;
      return `${yearsPart} ${formatNumber(months)} ${t('months')}`;
    },
    [t, formatNumber]
  );

  const value = useMemo(
    () => ({
      language,
      intlLocale,
      setLanguage,
      t,
      formatCurrency,
      formatNumber,
      formatPercent,
      formatDate,
      formatLoanTerm,
    }),
    [
      language,
      intlLocale,
      t,
      formatCurrency,
      formatNumber,
      formatPercent,
      formatDate,
      formatLoanTerm,
    ]
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};
