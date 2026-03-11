import {
  memo,
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
  lazy,
  Suspense,
} from 'react';

import {
  Section,
  Cell,
  IconButton,
  Modal,
  Skeleton,
  Pagination,
  Placeholder,
  Text,
} from '@telegram-apps/telegram-ui';
import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';
import { mainButton } from '@telegram-apps/sdk-react';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import { hapticSelection } from '@/utils/haptic';

const PieChart = lazy(() => import('@/components/charts/PieChart'));

const ITEMS_PER_PAGE = 12;

const PaymentSchedule = () => {
  const { t, formatCurrency, formatDate } = useLocalization();
  const { amortizationResult } = useMortgage();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null,
  );

  const schedule = amortizationResult?.schedule ?? [];
  const totalPages = Math.max(1, Math.ceil(schedule.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, schedule.length);
  const currentItems = schedule.slice(startIndex, endIndex);
  const showPagination = schedule.length > ITEMS_PER_PAGE;

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

  const firstPayment = useMemo(() => {
    if (typeof selectedItemIndex === 'number' && schedule[selectedItemIndex]) {
      return schedule[selectedItemIndex];
    }
    return null;
  }, [selectedItemIndex, schedule]);

  const pieChartData = useMemo(() => {
    if (!firstPayment) return null;
    return {
      labels: [t('principal'), t('interest')],
      datasets: [
        {
          data: [firstPayment.principal, firstPayment.interest],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        },
      ],
    };
  }, [firstPayment, t]);

  const handleCellClick = (index: number) => {
    hapticSelection();
    setSelectedItemIndex(index);
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setCurrentPage(totalPages);
    }
  }, [schedule.length, totalPages, currentPage]);

  useEffect(() => {
    if (selectedItemIndex !== null) {
      mainButton.setParams({ isVisible: false });
      return () => {
        mainButton.setParams({ isVisible: true });
      };
    }
  }, [selectedItemIndex]);

  if (!amortizationResult) {
    return null;
  }

  if (schedule.length === 0) {
    return (
      <Section>
        <Placeholder
          header={t('paymentSchedule')}
          description={t('noCalculationsYet')}
        />
      </Section>
    );
  }

  return (
    <Section
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
    >
      <Section.Header>
        {t('showingPayments', {
          from: startIndex + 1,
          to: endIndex,
          total: schedule.length,
        })}
      </Section.Header>
      {currentItems.map((item, index) => {
        const globalIndex = startIndex + index;
        const extraLabel = item.extraPayment
          ? item.isRegularPayment
            ? `${formatCurrency(item.extraPayment)} *`
            : formatCurrency(item.extraPayment)
          : item.isRegularPayment && item.regularPaymentMessage
            ? t('insufficientPayment')
            : null;
        return (
          <Cell
            key={item.month}
            onClick={() => handleCellClick(globalIndex)}
            subhead={formatDate(item.date)}
            subtitle={
              extraLabel
                ? `${t('principal')}: ${formatCurrency(item.principal)} · ${extraLabel}`
                : `${t('principal')}: ${formatCurrency(item.principal)}`
            }
            description={`${t('interest')}: ${formatCurrency(item.interest)}`}
            after={
              <IconButton
                size='s'
                onClick={(e) => {
                  e.stopPropagation();
                  handleCellClick(globalIndex);
                }}
                aria-label={t('paymentBreakdown')}
              >
                <Icon28Stats />
              </IconButton>
            }
          >
            <Text weight='2'>{formatCurrency(item.payment)}</Text>
          </Cell>
        );
      })}
      {showPagination && (
        <Section.Footer centered>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => {
              hapticSelection();
              setCurrentPage(page);
            }}
          />
        </Section.Footer>
      )}
      {pieChartData && (
        <Modal
          onOpenChange={(open) => {
            if (!open) setSelectedItemIndex(null);
          }}
          open={selectedItemIndex !== null}
        >
          <Suspense fallback={<Skeleton visible />}>
            <PieChart data={pieChartData} title={t('paymentBreakdown')} />
          </Suspense>
        </Modal>
      )}
    </Section>
  );
};

export default memo(PaymentSchedule);
