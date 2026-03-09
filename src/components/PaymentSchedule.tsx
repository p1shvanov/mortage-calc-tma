import { memo, useMemo, useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react';

import {
  Section,
  List,
  Cell,
  IconButton,
  Modal,
  Skeleton,
  CompactPagination,
  Placeholder,
  Title,
  Text,
  Caption,
} from '@telegram-apps/telegram-ui';
import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';
import { useSignal, viewportState, mainButton } from '@telegram-apps/sdk-react';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import { hapticSelection } from '@/utils/haptic';

const PieChart = lazy(() => import('@/components/charts/PieChart'));

const itemsPerPage = 12;

const PaymentSchedule = () => {
  const { height } = useSignal(viewportState);
  const { t, formatCurrency, formatDate, formatNumber } = useLocalization();
  const { amortizationResult } = useMortgage();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const schedule = amortizationResult?.schedule ?? [];
  const totalPages = Math.max(1, Math.ceil(schedule.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, schedule.length);
  const currentItems = schedule.slice(startIndex, endIndex);
  const showPagination = schedule.length > itemsPerPage;

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
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        },
      ],
    };
  }, [firstPayment, t]);

  const handleIconClick = (index: number) => {
    hapticSelection();
    setSelectedItemIndex(index);
  };

  const paginationItems = useMemo(() => {
    const pages: number[] = [];
    const show = 5;
    let from = Math.max(1, currentPage - Math.floor(show / 2));
    const to = Math.min(totalPages, from + show - 1);
    from = Math.max(1, to - show + 1);
    for (let i = from; i <= to; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

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
      {pieChartData && (
        <Modal
          onOpenChange={(open) => {
            if (!open) setSelectedItemIndex(null);
          }}
          open={selectedItemIndex !== null}
          nested
          style={{ height: height * 0.6 }}
        >
          <Suspense fallback={<Skeleton visible />}>
            <PieChart data={pieChartData} title={t('paymentBreakdown')} />
          </Suspense>
        </Modal>
      )}

      <Section.Header>
        <Title>
          {t('showingPayments', {
            from: startIndex + 1,
            to: endIndex,
            total: schedule.length,
          })}
        </Title>
      </Section.Header>

      <List style={{ paddingTop: 4 }}>
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
              onClick={() => handleIconClick(globalIndex)}
              before={
                <IconButton
                  size="s"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIconClick(globalIndex);
                  }}
                  aria-label={t('paymentBreakdown')}
                >
                  <Icon28Stats />
                </IconButton>
              }
              after={
                <div style={{ textAlign: 'right' }}>
                  <Text weight="2">{formatCurrency(item.payment)}</Text>
                  <Caption
                    style={{
                      display: 'block',
                      color: item.extraPayment
                        ? 'var(--tgui--green)'
                        : item.isRegularPayment && item.regularPaymentMessage
                          ? 'var(--tgui--destructive_text_color)'
                          : undefined,
                    }}
                  >
                    {extraLabel ?? '—'}
                  </Caption>
                </div>
              }
              subtitle={`${t('date')}: ${formatDate(item.date)} · ${t('balance')}: ${formatCurrency(item.balance)}`}
              style={
                item.isRegularPayment
                  ? { backgroundColor: 'var(--tgui--tertiary_bg_color)' }
                  : undefined
              }
            >
              <Text>
                {t('month')} {formatNumber(item.month)}
              </Text>
              <Caption>
                {t('principal')}: {formatCurrency(item.principal)} · {t('interest')}: {formatCurrency(item.interest)}
              </Caption>
            </Cell>
          );
        })}
      </List>

      {showPagination && (
        <Section.Footer centered>
          <CompactPagination mode="ambient">
            {paginationItems.map((page) => (
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
      )}
    </Section>
  );
};

export default memo(PaymentSchedule);
