import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Section,
  Button,
  Cell,
  Text,
  Placeholder,
  Skeleton,
  IconButton,
  InlineButtons,
  CompactPagination,
} from '@telegram-apps/telegram-ui';
import { Icon24ChevronRight } from '@telegram-apps/telegram-ui/dist/icons/24/chevron_right';
import { Icon24Cancel } from '@telegram-apps/telegram-ui/dist/icons/24/cancel';

import type { SavedCalculation } from '@/domain';
import { hapticButton, hapticSelection } from '@/utils/haptic';

const EMPTY_ILLUSTRATION_URL = 'https://xelene.me/telegram.gif';

export interface CalculationListSectionProps {
  loading: boolean;
  loadError: boolean;
  calculations: SavedCalculation[];
  currentItems: SavedCalculation[];
  currentPage: number;
  paginationPages: number[];
  showPagination: boolean;
  swipeHandlers: {
    onTouchStart?: (e: React.TouchEvent) => void;
    onTouchEnd?: (e: React.TouchEvent) => void;
  };
  onOpen: (calc: SavedCalculation) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  t: (key: string) => string;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  formatDate: (date: Date | string) => string;
}

const CalculationListSection = memo(function CalculationListSection({
  loading,
  loadError,
  calculations,
  currentItems,
  currentPage,
  paginationPages,
  showPagination,
  swipeHandlers,
  onOpen,
  onDelete,
  onPageChange,
  onRetry,
  t,
  formatCurrency,
  formatNumber,
  formatDate,
}: CalculationListSectionProps) {
  const navigate = useNavigate();
  const isEmpty = !loading && !loadError && calculations.length === 0;
  const listCalculations = loading ? [] : currentItems;

  const footer =
    isEmpty ? (
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
          src={EMPTY_ILLUSTRATION_URL}
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
              onRetry();
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
                onPageChange(page);
              }}
            >
              {page}
            </CompactPagination.Item>
          ))}
        </CompactPagination>
      </Section.Footer>
    ) : null;

  return (
    <Section
      header={t('calculationHistory')}
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchEnd={swipeHandlers.onTouchEnd}
      footer={footer}
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
        listCalculations.map((calc) => (
          <Cell
            key={calc.id}
            onClick={() => onOpen(calc)}
            subtitle={`${formatNumber(calc.loanDetails.interestRate)}% · ${calc.loanDetails.loanTerm} ${t('years')}`}
            after={
              <InlineButtons>
                <IconButton
                  size="s"
                  mode="plain"
                  onClick={(e) => onDelete(e, calc.id)}
                  aria-label={t('remove')}
                >
                  <Icon24Cancel />
                </IconButton>
                <IconButton
                  size="s"
                  mode="plain"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(calc);
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
  );
});

export default CalculationListSection;
