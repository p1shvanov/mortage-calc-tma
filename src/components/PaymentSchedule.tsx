import { memo, useMemo, useState } from 'react';

import {
  Section,
  Pagination,
  IconButton,
  Modal,
} from '@telegram-apps/telegram-ui';
import { Icon28Stats } from '@telegram-apps/telegram-ui/dist/icons/28/stats';
import { useSignal, viewportState } from '@telegram-apps/sdk-react';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/Table';
import PieChart from '@/components/PieChart';

const itemsPerPage = 12; // Show 12 months (1 year) per page

const PaymentSchedule = () => {
  const { height } = useSignal(viewportState);
  const { t, formatCurrency, formatDate, formatNumber } = useLocalization();
  const { amortizationResult } = useMortgage();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(
    null
  );
  const [isModalOpened, setIsModalOpened] = useState(false);

  if (!amortizationResult || amortizationResult.schedule.length === 0) {
    return null;
  }

  const schedule = amortizationResult.schedule;

  // Get the first payment for the pie chart

  const handleIconClick = (index: number) => {
    setSelectedItemIndex(index);
    setIsModalOpened(true);
  };

  const firstPayment = useMemo(() => {
    if (typeof selectedItemIndex === 'number') {
      return amortizationResult.schedule[selectedItemIndex];
    }
    return null;
  }, [selectedItemIndex]);

  // Prepare data for the pie chart
  const pieChartData = useMemo(() => {
    if (firstPayment) {
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
    }
    return null;
  }, [selectedItemIndex]);

  // Calculate pagination
  const totalPages = Math.ceil(schedule.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, schedule.length);
  const currentItems = schedule.slice(startIndex, endIndex);

  const handlePageChange = (_: unknown, value: number) => {
    setCurrentPage(value);
  };

  return (
    <Section>
      {pieChartData && (
        <Modal
          onOpenChange={(open) => {
            if (!open) {
              setSelectedItemIndex(null);
            }
          }}
          open={isModalOpened}
          nested
          style={{ height: height * 0.6 }}
        >
          <PieChart data={pieChartData} title={t('paymentBreakdown')} />
        </Modal>
      )}
      <Section.Header large>
        {t('showingPayments', {
          from: startIndex + 1,
          to: endIndex,
          total: schedule.length,
        })}
      </Section.Header>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell header>&nbsp;</TableCell>
            <TableCell header>{t('month')}</TableCell>
            <TableCell header>{t('date')}</TableCell>
            <TableCell header>{t('payment')}</TableCell>
            <TableCell header>{t('principal')}</TableCell>
            <TableCell header>{t('interest')}</TableCell>
            <TableCell header>{t('extraPayment')}</TableCell>
            <TableCell header>{t('balance')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentItems.map((item, index) => (
            <TableRow key={item.month} highlight={Boolean(item.extraPayment)}>
              <TableCell>
                <IconButton
                  size='s'
                  onClick={() => handleIconClick(startIndex + index)}
                >
                  <Icon28Stats />
                </IconButton>
              </TableCell>
              <TableCell>{formatNumber(item.month)}</TableCell>
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell>{formatCurrency(item.payment)}</TableCell>
              <TableCell>{formatCurrency(item.principal)}</TableCell>
              <TableCell>{formatCurrency(item.interest)}</TableCell>
              <TableCell>
                {item.extraPayment ? formatCurrency(item.extraPayment) : '-'}
              </TableCell>
              <TableCell>{formatCurrency(item.balance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Section.Footer centered>
        <Pagination
          siblingCount={0}
          boundaryCount={1}
          page={currentPage}
          count={totalPages}
          onChange={handlePageChange}
        />
      </Section.Footer>
    </Section>
  );
};

export default memo(PaymentSchedule);
