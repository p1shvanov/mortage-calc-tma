import React, { createContext, useContext, useMemo } from 'react';
import { miniApp, useSignal } from '@telegram-apps/sdk-react';
import type { TelegramPalette } from '@/config/chartsTheme';
import { getTelegramPalette } from '@/config/chartsTheme';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  /** Raw Telegram palette (CSS vars resolved to colors). */
  tgPalette: TelegramPalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme from Telegram only. bindThemeParamsCssVars() in init uses theme_params from Telegram.
 * We only reflect miniApp.isDark for appearance (AppRoot).
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = useSignal(miniApp.isDark);
  const themeMode: ThemeMode = isDark ? 'dark' : 'light';
  const tgPalette = useMemo(() => getTelegramPalette(), [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, themeMode, tgPalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
