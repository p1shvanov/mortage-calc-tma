import { FC, memo, useEffect, useState, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  List,
  Section,
  Button,
  Cell,
  Text,
  Placeholder,
  Skeleton,
  Snackbar,
  IconButton,
  InlineButtons,
  Avatar,
} from '@telegram-apps/telegram-ui';
import { initDataState, useSignal } from '@telegram-apps/sdk-react';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { Icon24Cancel } from '@telegram-apps/telegram-ui/dist/icons/24/cancel';

import Page from '@/components/Page';
import BreadcrumbsNav from '@/components/BreadcrumbsNav';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { hapticButton, hapticSelection, hapticSuccess, hapticDestructive, hapticError } from '@/utils/haptic';
import { useLocalization } from '@/providers/LocalizationProvider';
import { getCalculationsStorage } from '@/services/storage';
import { isOnboardingCompleted } from '@/services/onboardingStorage';
import type { SavedCalculation } from '@/types/storage';

const HomePage: FC = () => {
  const { t, formatCurrency, formatDate } = useLocalization();
  const navigate = useNavigate();
  const initData = useSignal(initDataState);

  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const loadCalculations = useCallback(() => {
    setLoadError(false);
    setLoading(true);
    const storage = getCalculationsStorage();
    storage
      .getList()
      .then((list) => {
        setCalculations(list);
        setLoadError(false);
      })
      .catch(() => {
        setCalculations([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCalculations();
  }, [loadCalculations]);

  const user = initData?.user;
  const greetingName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || null
    : null;
  const greeting = greetingName ? t('greeting', { name: greetingName }) : t('greetingAnonymous');
  const userAcronym = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || undefined
    : undefined;
  // photo_url приходит только при запуске из меню вложений (Attachment Menu). При открытии по ссылке — только acronym.
  const userPhotoUrl =
    user &&
    (
      (user as { photo_url?: string }).photo_url ??
      (user as { photoUrl?: string }).photoUrl
    );

  if (!isOnboardingCompleted()) {
    return <Navigate to="/onboarding" replace />;
  }

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
    hapticDestructive();
    const storage = getCalculationsStorage();
    try {
      await storage.delete(id);
      setCalculations((prev) => prev.filter((c) => c.id !== id));
      hapticSuccess();
      setSnackbarMessage(t('removed'));
      setSnackbarOpen(true);
    } catch {
      hapticError();
      setSnackbarMessage(t('saveError'));
      setSnackbarOpen(true);
    }
  };

  return (
    <Page back={false}>
      <List>
        <Section
          header={<BreadcrumbsNav items={[{ label: t('home') }]} />}
        >
          <Placeholder
            header={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                {user && (
                  <Avatar
                    size={48}
                    src={userPhotoUrl || undefined}
                    acronym={userAcronym}
                  />
                )}
                <Text weight="2">{greeting}</Text>
              </div>
            }
          />
        </Section>

        <Section
          header={t('calculationHistory')}
          footer={
            !loading && !loadError && calculations.length === 0 ? (
              <Placeholder
                header={t('noCalculationsYet')}
                description={t('goToCalculator')}
                action={
                  <Button
                    size="m"
                    onClick={() => {
                      hapticButton();
                      navigate('/calculator');
                    }}
                  >
                    {t('newCalculation')}
                  </Button>
                }
              />
            ) : loadError ? (
              <Placeholder
                header={t('loadError')}
                description={t('retry')}
                action={
                  <Button
                    size="m"
                    onClick={() => {
                      hapticButton();
                      loadCalculations();
                    }}
                  >
                    {t('retry')}
                  </Button>
                }
              />
            ) : null
          }
        >
          {loading ? (
            <>
              <Cell>
                <Skeleton visible />
              </Cell>
              <Cell>
                <Skeleton visible />
              </Cell>
              <Cell>
                <Skeleton visible />
              </Cell>
            </>
          ) : (
            !loadError &&
            calculations.map((calc) => (
              <Cell
                key={calc.id}
                onClick={() => handleOpenCalculation(calc)}
                subtitle={`${calc.loanDetails.interestRate}% · ${calc.loanDetails.loanTerm} ${t('years')}`}
                after={
                  <InlineButtons>
                    <IconButton
                      size="s"
                      mode="plain"
                      onClick={(e) => handleDeleteCalculation(e, calc.id)}
                      aria-label={t('remove')}
                    >
                      <Icon24Cancel />
                    </IconButton>
                    <IconButton
                      size="s"
                      mode="plain"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCalculation(calc);
                      }}
                      aria-label={t('open')}
                    >
                      <Icon24ChevronRight />
                    </IconButton>
                  </InlineButtons>
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
          <Cell
            before={t('languageFlag')}
            after={<LanguageSwitcher />}
          >
            <Text>{t('language')}</Text>
          </Cell>
          <Cell
            subtitle={t('faq')}
            after={<Icon24ChevronRight />}
            onClick={() => {
              hapticSelection();
              navigate('/onboarding');
            }}
          >
            <Text>{t('faq')}</Text>
          </Cell>
        </Section>

        <Section>
          <Button
            stretched
            onClick={() => {
              hapticButton();
              navigate('/calculator');
            }}
          >
            {t('newCalculation')}
          </Button>
        </Section>
      </List>
      {snackbarOpen && (
        <Snackbar duration={3000} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Snackbar>
      )}
    </Page>
  );
};

export default memo(HomePage);
