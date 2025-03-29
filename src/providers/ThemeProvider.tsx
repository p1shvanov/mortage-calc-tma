import React, { createContext, useContext, useState, useEffect } from 'react';
import { miniApp, useSignal } from '@telegram-apps/sdk-react';

// Define theme types
export type ThemeMode = 'light' | 'dark';

// Define the context interface
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  themeMode: ThemeMode;
  resetTheme: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create a hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Create the provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the Telegram SDK's isDark signal
  const isDark = useSignal(miniApp.isDark);
  
  // Local state to override Telegram theme if needed
  const [overrideTheme, setOverrideTheme] = useState<ThemeMode | null>(null);
  
  // Toggle theme function
  const toggleTheme = () => {
    // If we're currently using Telegram's theme, set override to the opposite
    if (overrideTheme === null) {
      setOverrideTheme(isDark ? 'light' : 'dark');
    } else {
      // If we're already overriding, toggle between light and dark
      setOverrideTheme(overrideTheme === 'light' ? 'dark' : 'light');
    }
  };
  
  // Reset to Telegram's theme
  const resetTheme = () => {
    setOverrideTheme(null);
  };
  
  // The effective theme is either the override or Telegram's theme
  const effectiveTheme: ThemeMode = overrideTheme !== null ? overrideTheme : (isDark ? 'dark' : 'light');
  
  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [effectiveTheme]);
  
  return (
    <ThemeContext.Provider
      value={{
        isDark: effectiveTheme === 'dark',
        toggleTheme,
        themeMode: effectiveTheme,
        resetTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
