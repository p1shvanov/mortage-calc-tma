import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot, Section, Text, Button } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Card } from '@/components/Card';
import { DesignSystem } from '@/components/DesignSystem';
import { useState } from 'react';

export function App() {
  const lp = retrieveLaunchParams();
  const { themeMode } = useTheme();
  const { t } = useLocalization();
  const [showDesignSystem, setShowDesignSystem] = useState(false);

  return (
    <AppRoot
      appearance={themeMode}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      {showDesignSystem ? (
        <>
          <Button 
            mode="outline" 
            onClick={() => setShowDesignSystem(false)}
            style={{ margin: 'var(--spacing-md)' }}
          >
            Back to App
          </Button>
          <DesignSystem />
        </>
      ) : (
        <Section header={t('appTitle')}>
        <Card title={t('loanDetails')}>
          <Text>{t('loanDetails')}</Text>
        </Card>
        
        <Card title="Theme Example">
          <Text>This card demonstrates the use of theme variables.</Text>
          <div style={{ 
            padding: 'var(--spacing-sm)',
            backgroundColor: 'var(--primary-color)',
            color: 'var(--primary-text-color)',
            borderRadius: 'var(--border-radius-sm)',
            marginTop: 'var(--spacing-sm)'
          }}>
            Primary color block
          </div>
          <div style={{ 
            padding: 'var(--spacing-sm)',
            backgroundColor: 'var(--secondary-bg-color)',
            color: 'var(--text-color)',
            borderRadius: 'var(--border-radius-sm)',
            marginTop: 'var(--spacing-sm)'
          }}>
            Secondary background color block
          </div>
        </Card>
        
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
          
          <Button 
            style={{ marginTop: 'var(--spacing-md)' }}
            onClick={() => setShowDesignSystem(true)}
          >
            View Design System
          </Button>
        </Section>
      )}
    </AppRoot>
  );
}
