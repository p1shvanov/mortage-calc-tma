import { Button, IconButton } from '@telegram-apps/telegram-ui';
import { useTheme } from '@/providers/ThemeProvider';

interface ThemeSwitcherProps {
  variant?: 'icon' | 'button';
}

export function ThemeSwitcher({ variant = 'icon' }: ThemeSwitcherProps) {
  const { isDark, toggleTheme } = useTheme();
  
  if (variant === 'icon') {
    return (
      <IconButton onClick={toggleTheme} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
        {isDark ? '☀️' : '🌙'}
      </IconButton>
    );
  }
  
  return (
    <Button onClick={toggleTheme} size="s">
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </Button>
  );
}
