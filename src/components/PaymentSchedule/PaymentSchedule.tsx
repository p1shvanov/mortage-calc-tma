import { useState } from 'react';
import { Section, Button } from '@telegram-apps/telegram-ui';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import styles from './PaymentSchedule.module.css';

export function PaymentSchedule() {
  const { t, formatCurrency, formatDate, formatNumber } = useLocalization();
  const { amortizationResult } = useMortgage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 12 months (1 year) per page
  
  if (!amortizationResult || amortizationResult.schedule.length === 0) {
    return null;
  }
  
  const schedule = amortizationResult.schedule;
  
  // Calculate pagination
  const totalPages = Math.ceil(schedule.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, schedule.length);
  const currentItems = schedule.slice(startIndex, endIndex);
  
  // Handle page navigation
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  return (
    <Section header={t('paymentSchedule')}>
      <div className={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
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
            {currentItems.map((item) => (
              <TableRow key={item.month} highlight={!!item.extraPayment}>
                <TableCell>{formatNumber(item.month)}</TableCell>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>{formatCurrency(item.payment)}</TableCell>
                <TableCell>{formatCurrency(item.principal)}</TableCell>
                <TableCell>{formatCurrency(item.interest)}</TableCell>
                <TableCell>{item.extraPayment ? formatCurrency(item.extraPayment) : '-'}</TableCell>
                <TableCell>{formatCurrency(item.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className={styles.pagination}>
        <Button 
          size="s"
          onClick={goToPrevPage} 
          disabled={currentPage === 1}
        >
          {t('previous')}
        </Button>
        
        <div className={styles.pageInfo}>
          {t('showingPayments', {
            from: startIndex + 1,
            to: endIndex,
            total: schedule.length
          })}
        </div>
        
        <Button 
          size="s"
          onClick={goToNextPage} 
          disabled={currentPage === totalPages}
        >
          {t('next')}
        </Button>
      </div>
    </Section>
  );
}
