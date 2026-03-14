import { memo, useMemo, useState, useEffect } from 'react';

import {
  Section,
  Cell,
  IconButton,
  Pagination,
  Placeholder,
  Text,
} from '@telegram-apps/telegram-ui';
import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';
import { mainButton } from '@telegram-apps/sdk-react';

import { SCHEDULE_ITEMS_PER_PAGE } from '@/config/constants';
import { useSwipePagination } from '@/hooks/useSwipePagination';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import { hapticSelection } from '@/utils/haptic';

import PaymentDetailModal from './PaymentDetailModal';

const PaymentSchedule = memo(function PaymentSchedule() {
  const { t, formatCurrency, formatDate } = useLocalization();
  const { amortizationResult } = useMortgage();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null,
  );

  const schedule = amortizationResult?.schedule ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil(schedule.length / SCHEDULE_ITEMS_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * SCHEDULE_ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + SCHEDULE_ITEMS_PER_PAGE,
    schedule.length,
  );
  const currentItems = schedule.slice(startIndex, endIndex);
  const showPagination = schedule.length > SCHEDULE_ITEMS_PER_PAGE;

  const swipeHandlers = useSwipePagination(
    totalPages,
    currentPage,
    setCurrentPage,
    showPagination,
  );

  const selectedItem = useMemo(() => {
    if (typeof selectedItemIndex === 'number' && schedule[selectedItemIndex]) {
      return schedule[selectedItemIndex];
    }
    return null;
  }, [selectedItemIndex, schedule]);

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
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchEnd={swipeHandlers.onTouchEnd}
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
          ? item.inRecurringOverpaymentPeriod
            ? `${formatCurrency(item.extraPayment)} *`
            : formatCurrency(item.extraPayment)
          : item.inRecurringOverpaymentPeriod && item.regularPaymentMessage
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
                size="s"
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
            <Text weight="2">{formatCurrency(item.payment)}</Text>
          </Cell>
        );
      })}
      {showPagination && (
        <Section.Footer centered>
          <Pagination
            boundaryCount={0}
            siblingCount={1}
            hideNextButton
            hidePrevButton
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => {
              hapticSelection();
              setCurrentPage(page);
            }}
          />
        </Section.Footer>
      )}
      {selectedItem && (
        <PaymentDetailModal
          open={selectedItemIndex !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedItemIndex(null);
          }}
          item={selectedItem}
          totalMonths={schedule.length}
        />
      )}
    </Section>
  );
});

export default PaymentSchedule;
