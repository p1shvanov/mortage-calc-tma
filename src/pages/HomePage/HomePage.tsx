import { FC, memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Section, Button, Cell, Text, Placeholder } from '@telegram-apps/telegram-ui';

import Page from '@/components/Page';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { hapticImpact, hapticSelection } from '@/utils/haptic';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { getCalculationsStorage } from '@/services/storage';
import type { SavedCalculation } from '@/types/storage';

const HomePage: FC = () => {
  const { t, formatCurrency, formatDate } = useLocalization();
  const { themeMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storage = getCalculationsStorage();
    storage
      .getList()
      .then(setCalculations)
      .catch(() => setCalculations([]))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenCalculation = (calc: SavedCalculation) => {
    hapticSelection();
    navigate('/result', {
      state: {
        loanDetails: calc.loanDetails,
        earlyPayments: calc.earlyPayments,
        regularPayments: calc.regularPayments,
        savedId: calc.id,
      },
    });
  };

  const handleDeleteCalculation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    hapticImpact('light');
    const storage = getCalculationsStorage();
    try {
      await storage.delete(id);
      setCalculations((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <Page back={false}>
      <List>
        <Section
          header={t('calculationHistory')}
          footer={
            !loading && calculations.length === 0 ? (
              <Placeholder
                header={t('noCalculationsYet')}
                description={t('goToCalculator')}
                action={
                  <Button
                    size='m'
                    onClick={() => {
                      hapticImpact('light');
                      navigate('/calculator');
                    }}
                  >
                    {t('newCalculation')}
                  </Button>
                }
              />
            ) : null
          }
        >
          {loading ? (
            <Cell>
              <Text>...</Text>
            </Cell>
          ) : (
            calculations.map((calc) => (
              <Cell
                key={calc.id}
                onClick={() => handleOpenCalculation(calc)}
                subtitle={`${calc.loanDetails.interestRate}% · ${calc.loanDetails.loanTerm} ${t('years')}`}
                after={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Button
                      size='s'
                      mode='plain'
                      onClick={(e) => handleDeleteCalculation(e, calc.id)}
                    >
                      {t('remove')}
                    </Button>
                    <Text style={{ color: 'var(--tgui--link_color)' }}>
                      {t('open')}
                    </Text>
                  </div>
                }
              >
                <Text>
                  {formatCurrency(calc.loanDetails.loanAmount)} ·{' '}
                  {formatDate(calc.createdAt)}
                </Text>
              </Cell>
            ))
          )}
        </Section>

        <Section header={t('settings')}>
          <Cell after={<LanguageSwitcher />}>
            <Text>{t('language')}</Text>
          </Cell>
          <Cell
            subtitle={themeMode}
            after={
              <Button size='s' mode='plain' onClick={toggleTheme}>
                {themeMode === 'dark' ? '☀️' : '🌙'}
              </Button>
            }
          >
            <Text>{t('theme')}</Text>
          </Cell>
          <Cell subtitle={t('faq')}>
            <Text>{t('faq')}</Text>
            <Text style={{ opacity: 0.7, fontSize: 12 }}> — {t('comingSoon')}</Text>
          </Cell>
        </Section>

        <Section>
          <Button
            stretched
            onClick={() => {
              hapticImpact('light');
              navigate('/calculator');
            }}
          >
            {t('newCalculation')}
          </Button>
        </Section>
      </List>
    </Page>
  );
};

export default memo(HomePage);
