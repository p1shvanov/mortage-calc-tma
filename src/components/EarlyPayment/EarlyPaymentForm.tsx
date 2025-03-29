import React, { useState } from 'react';
import { Section, Select, Button } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { FormField } from '@/components/form/FormField';
import { EarlyPayment } from '@/providers/MortgageProvider';
import styles from './EarlyPayment.module.css';

interface EarlyPaymentFormProps {
  onAddPayment: (payment: Omit<EarlyPayment, 'id'>) => void;
  loanTerm: number;
}

export function EarlyPaymentForm({ onAddPayment, loanTerm }: EarlyPaymentFormProps) {
  const { t } = useLocalization();
  const [payment, setPayment] = useState({
    month: 12,
    amount: 1000,
    type: 'reduceTerm' as const
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Fix for empty input fields - don't convert empty string to 0
    let numValue;
    if (name === 'type') {
      numValue = value;
    } else if (value === '') {
      numValue = '';
    } else {
      numValue = parseFloat(value) || 0;
    }
    
    setPayment(prev => ({
      ...prev,
      [name]: numValue
    }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Convert empty strings to 0 for validation
    const amount = typeof payment.amount === 'string' ? 0 : Number(payment.amount);
    const month = typeof payment.month === 'string' ? 0 : Number(payment.month);
    
    if (amount <= 0) {
      newErrors.amount = t('errorPaymentAmount');
    }
    
    if (month <= 0 || month > loanTerm * 12) {
      newErrors.month = t('errorPaymentMonth');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddPayment({
        month: Number(payment.month),
        amount: Number(payment.amount),
        type: payment.type as 'reduceTerm' | 'reducePayment'
      });
      
      // Reset amount but keep the month and type
      setPayment(prev => ({
        ...prev,
        amount: 1000
      }));
    }
  };
  
  return (
    <Section header={t('earlyPayment')}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <FormField
            label={t('earlyPaymentAmount')}
            name="amount"
            type="number"
            value={payment.amount}
            onChange={handleInputChange}
            placeholder="1000"
            error={errors.amount}
            min={0}
            step={100}
          />
          
          <FormField
            label={t('earlyPaymentMonth')}
            name="month"
            type="number"
            value={payment.month}
            onChange={handleInputChange}
            placeholder="12"
            error={errors.month}
            min={1}
            max={loanTerm * 12}
            step={1}
          />
          
          <div className={styles.formField}>
            <label className={styles.label}>{t('earlyPaymentType')}</label>
            <Select
              name="type"
              value={payment.type}
              onChange={handleInputChange}
            >
              <option value="reduceTerm">{t('typeReduceTerm')}</option>
              <option value="reducePayment">{t('typeReducePayment')}</option>
            </Select>
          </div>
        </div>
        
        <Button type="submit" className={styles.addButton}>
          {t('addEarlyPayment')}
        </Button>
      </form>
    </Section>
  );
}
