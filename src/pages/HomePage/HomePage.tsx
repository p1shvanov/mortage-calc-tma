import { FC, memo, useEffect, useState, useCallback, useRef } from 'react';
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
  CompactPagination,
} from '@telegram-apps/telegram-ui';
import { initDataState, mainButton, useSignal } from '@telegram-apps/sdk-react';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { Icon24Cancel } from '@telegram-apps/telegram-ui/dist/icons/24/cancel';

import Page from '@/components/Page';
import BreadcrumbsNav from '@/components/BreadcrumbsNav';
import { useMainButtonAvailable } from '@/hooks/useTelegramButtonsAvailable';
import { hapticButton, hapticSelection, hapticSuccess, hapticDestructive, hapticError } from '@/utils/haptic';
import { useLocalization } from '@/providers/LocalizationProvider';
import { getCalculationsStorage } from '@/services/storage';
import { isOnboardingCompleted } from '@/services/onboardingStorage';
import type { SavedCalculation } from '@/types/storage';

const ITEMS_PER_PAGE = 5;

const HomePage: FC = () => {
  const { t, formatCurrency, formatDate } = useLocalization();
  const navigate = useNavigate();
  const initData = useSignal(initDataState);
  const mainButtonAvailable = useMainButtonAvailable();

  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(calculations.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = calculations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const showPagination = !loading && !loadError && calculations.length > ITEMS_PER_PAGE;

  const touchStartRef = useRef({ x: 0, y: 0 });
  const handleSwipeEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!showPagination || totalPages <= 1) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const minSwipe = 60;
      if (Math.abs(dx) >= minSwipe && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          setCurrentPage((p) => Math.min(totalPages, p + 1));
        } else {
          setCurrentPage((p) => Math.max(1, p - 1));
        }
        hapticSelection();
      }
    },
    [showPagination, totalPages],
  );

  const paginationPages = (() => {
    if (!showPagination || totalPages <= 0) return [];
    const show = 5;
    let from = Math.max(1, currentPage - Math.floor(show / 2));
    const to = Math.min(totalPages, from + show - 1);
    from = Math.max(1, to - show + 1);
    const pages: number[] = [];
    for (let i = from; i <= to; i++) pages.push(i);
    return pages;
  })();

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

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setCurrentPage(totalPages);
    }
  }, [calculations.length, totalPages, currentPage]);

  const showList = !loading && !loadError && calculations.length > 0;
  useEffect(() => {
    if (!mainButtonAvailable) return;
    if (showList) {
      mainButton.setParams({ text: t('newCalculation'), isVisible: true, isEnabled: true, hasShineEffect: true });
      const off = mainButton.onClick(() => {
        hapticButton();
        navigate('/calculator');
      });
      return () => {
        mainButton.setParams({ isVisible: false });
        off();
      };
    }
    mainButton.setParams({ isVisible: false });
  }, [mainButtonAvailable, showList, t, navigate]);

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
              <>
                {user && (
                  <Avatar
                    size={48}
                    src={userPhotoUrl || undefined}
                    acronym={userAcronym}
                  />
                )}
                <Text weight="2">{greeting}</Text>
              </>
            }
          />
        </Section>

        <Section
          header={t('calculationHistory')}
          onTouchStart={
            showPagination
              ? (e) => {
                  touchStartRef.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                  };
                }
              : undefined
          }
          onTouchEnd={showPagination ? handleSwipeEnd : undefined}
          footer={
            !loading && !loadError && calculations.length === 0 ? (
              <Placeholder
                header={t('noCalculationsYet')}
                description={t('goToCalculator')}
                action={
                  <Button
                    size="m"
                    mode="filled"
                    onClick={() => {
                      hapticButton();
                      navigate('/calculator');
                    }}
                  >
                    {t('newCalculation')}
                  </Button>
                }
              >
                <img
                  alt=""
                  src="https://xelene.me/telegram.gif"
                  style={{ display: 'block', width: 144, height: 144 }}
                />
              </Placeholder>
            ) : loadError ? (
              <Placeholder
                header={t('loadError')}
                description={t('retry')}
                action={
                  <Button
                    size="m"
                    mode="filled"
                    onClick={() => {
                      hapticButton();
                      loadCalculations();
                    }}
                  >
                    {t('retry')}
                  </Button>
                }
              />
            ) : showPagination ? (
              <Section.Footer centered>
                <CompactPagination mode="ambient">
                  {paginationPages.map((page) => (
                    <CompactPagination.Item
                      key={page}
                      selected={page === currentPage}
                      onClick={() => {
                        hapticSelection();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </CompactPagination.Item>
                  ))}
                </CompactPagination>
              </Section.Footer>
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
            currentItems.map((calc) => (
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
