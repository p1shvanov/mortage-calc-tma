import React, { memo, useState, useEffect } from 'react';

import { Select, Button, List, Section } from '@telegram-apps/telegram-ui';

import { useLocalization } from '@/providers/LocalizationProvider';
import { EarlyPayment, useMortgage } from '@/providers/MortgageProvider';

import FormField from '@/components/FormField';

interface EarlyPaymentFormProps {
  onAddPayment: (payment: Omit<EarlyPayment, 'id'>) => void;
  loanTerm: number;
}

const EarlyPaymentForm = ({
  onAddPayment,
  loanTerm,
}: EarlyPaymentFormProps) => {
  const { t } = useLocalization();
  const { loanDetails } = useMortgage();
  const [payment, setPayment] = useState({
    date: '',
    amount: 1000000,
    type: 'reduceTerm' as const,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default date to 2 months from start date when loan details change
  useEffect(() => {
    if (loanDetails?.startDate) {
      const startDate = new Date(loanDetails.startDate);
      startDate.setMonth(startDate.getMonth() + 2);
      setPayment(prev => ({
        ...prev,
        date: startDate.toISOString().split('T')[0]
      }));
    }
  }, [loanDetails?.startDate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Fix for empty input fields - don't convert empty string to 0
    let processedValue;
    if (name === 'type' || name === 'date') {
      processedValue = value;
    } else if (value === '') {
      processedValue = '';
    } else {
      processedValue = parseFloat(value) || 0;
    }

    setPayment((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Convert empty strings to 0 for validation
    const amount =
      typeof payment.amount === 'string' ? 0 : Number(payment.amount);

    if (amount <= 0) {
      newErrors.amount = t('errorPaymentAmount');
    }

    if (!payment.date) {
      newErrors.date = t('errorPaymentDate');
    } else {
      // Validate date is within loan term
      const paymentDate = new Date(payment.date);
      const startDate = new Date(loanDetails?.startDate || '');
      
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + loanTerm);
      
      if (paymentDate < startDate || paymentDate > endDate) {
        newErrors.date = t('errorPaymentDate');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onAddPayment({
        date: payment.date,
        amount: Number(payment.amount),
        type: payment.type as 'reduceTerm' | 'reducePayment',
      });

      // Reset amount but keep the date and type
      setPayment((prev) => ({
        ...prev,
        amount: 1000,
      }));
    }
  };

  return (
    <Section>
      <List Component={'form'} onSubmit={handleSubmit}>
        <FormField
          label={t('earlyPaymentAmount')}
          name='amount'
          type='number'
          value={payment.amount}
          onChange={handleInputChange}
          placeholder='1000'
          error={errors.amount}
          min={0}
          step={100}
        />
        <FormField
          label={t('earlyPaymentDate')}
          name='date'
          type='date'
          value={payment.date}
          onChange={handleInputChange}
          error={errors.date}
        />
        <Select
          name='type'
          value={payment.type}
          onChange={handleInputChange}
          header={t('earlyPaymentType')}
        >
          <option value='reduceTerm'>{t('typeReduceTerm')}</option>
          <option value='reducePayment'>{t('typeReducePayment')}</option>
        </Select>
        <Button stretched type='submit'>
          {t('addEarlyPayment')}
        </Button>
      </List>
    </Section>
  );
};

export default memo(EarlyPaymentForm);
