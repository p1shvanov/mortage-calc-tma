# TASK-7: Theming and Palette Initialization

## Objective

Properly initialize theming and color palette for the mortgage calculator application using Telegram's CSS variables. Implement a theme switching mechanism to support both light and dark themes.

## Analysis

Telegram Mini Apps provide CSS variables that can be used to style the application according to the user's Telegram theme. These variables are automatically injected into the application when using the Telegram SDK.

The current implementation in `src/init.ts` already includes the necessary code to bind CSS variables:

```typescript
miniApp.mount().then(() => {
  // Define components-related CSS variables.
  miniApp.bindCssVars();
  themeParams.bindCssVars();
});
```

And the `App.tsx` component uses the `miniApp.isDark` signal to determine the current theme:

```typescript
const isDark = useSignal(miniApp.isDark);

return (
  <AppRoot
    appearance={isDark ? 'dark' : 'light'}
    platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
  >
    hi
  </AppRoot>
);
```

However, we need to expand on this to create a more comprehensive theming system that:

1. Uses Telegram's CSS variables consistently throughout the application
2. Provides a theme switching mechanism
3. Defines additional custom theme variables for our specific needs

## Requirements

1. Use Telegram's CSS variables for all styling
2. Support both light and dark themes
3. Implement a theme switching mechanism
4. Define additional custom theme variables for specific components
5. Ensure consistent styling across all components

## Implementation Plan

### 1. Create a Theme Context

Create a React context to manage the theme state and provide theme-related utilities:

```typescript
// src/providers/ThemeProvider.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { miniApp, useSignal } from '@telegram-apps/sdk-react';

// Define theme types
export type ThemeMode = 'light' | 'dark';

// Define the context interface
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  themeMode: ThemeMode;
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
  
  // Toggle theme function
  const toggleTheme = () => {
    // This will update the Telegram theme if supported
    if (miniApp.setTheme.isAvailable()) {
      miniApp.setTheme(isDark ? 'light' : 'dark');
    }
  };
  
  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        themeMode: isDark ? 'dark' : 'light'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
```

### 2. Define CSS Variables

Create a CSS file with additional custom variables that extend Telegram's theme:

```css
/* src/styles/theme.css */

:root {
  /* Base colors from Telegram */
  --primary-color: var(--tg-theme-button-color, #3390ec);
  --primary-text-color: var(--tg-theme-button-text-color, #ffffff);
  --bg-color: var(--tg-theme-bg-color, #ffffff);
  --text-color: var(--tg-theme-text-color, #000000);
  --hint-color: var(--tg-theme-hint-color, #999999);
  --link-color: var(--tg-theme-link-color, #3390ec);
  --secondary-bg-color: var(--tg-theme-secondary-bg-color, #f0f0f0);
  
  /* Custom colors for our application */
  --card-bg-color: var(--tg-theme-secondary-bg-color, #f0f0f0);
  --card-border-color: rgba(0, 0, 0, 0.1);
  --success-color: #4caf50;
  --error-color: #f44336;
  --warning-color: #ff9800;
  --info-color: #2196f3);
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  --font-size-small: 12px;
  --font-size-normal: 14px;
  --font-size-large: 16px;
  --font-size-xlarge: 18px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border radius */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 0.1s;
  --transition-normal: 0.2s;
  --transition-slow: 0.3s;
}

/* Dark theme overrides */
[data-theme="dark"] {
  --card-bg-color: var(--tg-theme-secondary-bg-color, #2c2c2c);
  --card-border-color: rgba(255, 255, 255, 0.1);
}
```

### 3. Add the Theme Provider to the Application

Wrap the application with the ThemeProvider:

```tsx
// src/components/Root.tsx
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { publicUrl } from '@/helpers/publicUrl.ts';
import { LocalizationProvider } from '@/providers/LocalizationProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

// Import the theme CSS
import '@/styles/theme.css';

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
      <ThemeProvider>
        <LocalizationProvider>
          <TonConnectUIProvider
            manifestUrl={publicUrl('tonconnect-manifest.json')}
          >
            <App/>
          </TonConnectUIProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

### 4. Update the App Component

Update the App component to use the theme context:

```tsx
// src/components/App.tsx
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useTheme } from '@/providers/ThemeProvider';

export function App() {
  const lp = retrieveLaunchParams();
  const { themeMode } = useTheme();

  return (
    <AppRoot
      appearance={themeMode}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      {/* App content */}
    </AppRoot>
  );
}
```

### 5. Create a Theme Switcher Component

Create a component to allow users to manually switch themes:

```tsx
// src/components/ThemeSwitcher.tsx
import { useTheme } from '@/providers/ThemeProvider';
import { Button, IconButton } from '@telegram-apps/telegram-ui';

export function ThemeSwitcher() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <IconButton onClick={toggleTheme}>
      {isDark ? '☀️' : '🌙'}
    </IconButton>
  );
}
```

### 6. Use Theme Variables in Components

Example of using theme variables in a component:

```tsx
// src/components/Card.tsx
import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
}

export function Card({ children, title }: CardProps) {
  return (
    <div className={styles.card}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
```

```css
/* src/components/Card.module.css */
.card {
  background-color: var(--card-bg-color);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--card-border-color);
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.title {
  color: var(--text-color);
  font-size: var(--font-size-large);
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
}

.content {
  color: var(--text-color);
}
```

## Dependencies

- @telegram-apps/sdk-react for accessing Telegram theme variables
- CSS Modules for component-specific styling

## Acceptance Criteria

- The application correctly uses Telegram's CSS variables for styling
- The application supports both light and dark themes
- The theme automatically matches the user's Telegram theme
- Users can manually switch between light and dark themes
- The application has a consistent look and feel across all components
- Custom theme variables are defined for application-specific styling needs
- Theme changes are applied smoothly with appropriate transitions
