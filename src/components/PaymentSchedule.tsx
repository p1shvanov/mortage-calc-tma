import { memo, useMemo, useState, useRef, useCallback, useEffect } from 'react';

import {
  Section,
  Cell,
  IconButton,
  Modal,
  Pagination,
  Placeholder,
  Text,
} from '@telegram-apps/telegram-ui';
import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';
import { mainButton } from '@telegram-apps/sdk-react';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import { hapticSelection } from '@/utils/haptic';

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

  const paymentRatio = useMemo(() => {
    if (!firstPayment || firstPayment.payment <= 0) return null;
    const pPct = Math.round((firstPayment.principal / firstPayment.payment) * 100);
    const iPct = Math.round((firstPayment.interest / firstPayment.payment) * 100);
    return { p: pPct, i: iPct };
  }, [firstPayment]);

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
      {firstPayment && (
        <Modal
          onOpenChange={(open) => {
            if (!open) setSelectedItemIndex(null);
          }}
          open={selectedItemIndex !== null}
        >
          <Section
            header={t('paymentDetailTitle', {
              n: firstPayment.month,
              total: schedule.length,
            })}
          >
            <Cell subhead={t('paymentDate')} readOnly>
              <Text>{formatDate(firstPayment.date)}</Text>
            </Cell>
            <Cell subhead={t('paymentAmount')} readOnly>
              <Text weight="2">{formatCurrency(firstPayment.payment)}</Text>
            </Cell>
            <Cell subhead={t('principal')} readOnly>
              <Text>{formatCurrency(firstPayment.principal)}</Text>
            </Cell>
            <Cell subhead={t('interest')} readOnly>
              <Text>{formatCurrency(firstPayment.interest)}</Text>
            </Cell>
            {paymentRatio && (
              <Cell subhead={t('paymentBreakdown')} readOnly>
                <Text>
                  {t('paymentStructureRatio', {
                    p: paymentRatio.p,
                    i: paymentRatio.i,
                  })}
                </Text>
              </Cell>
            )}
            <Cell subhead={t('interestToDate')} readOnly>
              <Text>{formatCurrency(firstPayment.totalInterest)}</Text>
            </Cell>
            <Cell subhead={t('remainingBalance')} readOnly>
              <Text>{formatCurrency(firstPayment.balance)}</Text>
            </Cell>
            {firstPayment.extraPayment != null && firstPayment.extraPayment > 0 && (
              <Cell
                subhead={t('extraPayment')}
                readOnly
                description={
                  firstPayment.extraPaymentType
                    ? firstPayment.extraPaymentType === 'reduceTerm'
                      ? t('typeReduceTerm')
                      : t('typeReducePayment')
                    : undefined
                }
              >
                <Text>{formatCurrency(firstPayment.extraPayment)}</Text>
              </Cell>
            )}
          </Section>
        </Modal>
      )}
    </Section>
  );
};

export default memo(PaymentSchedule);
