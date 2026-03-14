import { FC, memo, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Snackbar } from '@telegram-apps/telegram-ui';
import { initDataState, useSignal } from '@telegram-apps/sdk-react';

import { HomeGreeting, CalculationListSection } from '@/components/home';
import { BreadcrumbsNav, Page } from '@/components/layout';
import { HOME_CALCULATIONS_PER_PAGE } from '@/config/constants';
import type { SavedCalculation } from '@/domain';
import { useMainButton } from '@/hooks/useMainButton';
import { useSwipePagination } from '@/hooks/useSwipePagination';
import { useLocalization } from '@/providers/LocalizationProvider';
import { getCalculationsStorage } from '@/services/storage';
import {
  hapticSelection,
  hapticSuccess,
  hapticDestructive,
  hapticError,
} from '@/utils/haptic';

const PAGINATION_VISIBLE_PAGES = 5;

const HomePage: FC = () => {
  const { t, formatCurrency, formatDate } = useLocalization();
  const navigate = useNavigate();
  const initData = useSignal(initDataState);

  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(calculations.length / HOME_CALCULATIONS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * HOME_CALCULATIONS_PER_PAGE;
  const currentItems = calculations.slice(
    startIndex,
    startIndex + HOME_CALCULATIONS_PER_PAGE,
  );
  const showPagination =
    !loading &&
    !loadError &&
    calculations.length > HOME_CALCULATIONS_PER_PAGE;

  const swipeHandlers = useSwipePagination(
    totalPages,
    currentPage,
    setCurrentPage,
    showPagination,
  );

  const paginationPages = (() => {
    if (!showPagination || totalPages <= 0) return [];
    let from = Math.max(1, currentPage - Math.floor(PAGINATION_VISIBLE_PAGES / 2));
    const to = Math.min(totalPages, from + PAGINATION_VISIBLE_PAGES - 1);
    from = Math.max(1, to - PAGINATION_VISIBLE_PAGES + 1);
    const pages: number[] = [];
    for (let i = from; i <= to; i++) pages.push(i);
    return pages;
  })();

  const showList = !loading && !loadError && calculations.length > 0;
  useMainButton(
    showList
      ? {
          text: t('newCalculation'),
          isEnabled: true,
          hasShineEffect: true,
          onClick: () => navigate('/calculator'),
        }
      : null,
  );

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

  const user = initData?.user;
  const greetingName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') ||
      user.username ||
      null
    : null;
  const greeting = greetingName
    ? t('greeting', { name: greetingName })
    : t('greetingAnonymous');
  const userAcronym = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() ||
      undefined
    : undefined;
  const userPhotoUrl =
    user &&
    ((user as { photo_url?: string }).photo_url ??
      (user as { photoUrl?: string }).photoUrl);

  const handleOpenCalculation = (calc: SavedCalculation) => {
    hapticSelection();
    navigate(`/result?id=${calc.id}`);
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
        <BreadcrumbsNav items={[{ label: t('home') }]} />
        <HomeGreeting
          greeting={greeting}
          userPhotoUrl={userPhotoUrl || undefined}
          userAcronym={userAcronym}
        />
        <CalculationListSection
          loading={loading}
          loadError={loadError}
          calculations={calculations}
          currentItems={currentItems}
          currentPage={currentPage}
          paginationPages={paginationPages}
          showPagination={showPagination}
          swipeHandlers={swipeHandlers}
          onOpen={handleOpenCalculation}
          onDelete={handleDeleteCalculation}
          onPageChange={setCurrentPage}
          onRetry={loadCalculations}
          t={t}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
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
