import React, { createContext, useContext, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { translations } from '@/localization/translations';

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
    // Type assertion to allow string indexing
    const langTranslations = translations[language] as Record<string, string>;
    const enTranslations = translations.en as Record<string, string>;
    
    const translation = langTranslations[key] || enTranslations[key] || key;
    
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
