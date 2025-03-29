import React, { useState, useEffect } from 'react';
import { Section, Select, Slider } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import { FormField } from '@/components/form/FormField';
import styles from './LoanDetails.module.css';

interface LoanDetailsProps {
  onValuesChange: (values: LoanDetailsValues) => void;
}

export interface LoanDetailsValues {
  homeValue: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  startDate: string;
}

export function LoanDetails({ onValuesChange }: LoanDetailsProps) {
  const { t, formatNumber } = useLocalization();

  // Initialize form state
  const [values, setValues] = useState<LoanDetailsValues>({
    homeValue: 300000,
    downPayment: 60000,
    loanAmount: 240000,
    interestRate: 3.5,
    loanTerm: 30,
    startDate: new Date().toISOString().split('T')[0],
  });

  // Initialize validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numValue = name === 'startDate' ? value : parseFloat(value) || 0;

    setValues((prev) => {
      const newValues = {
        ...prev,
        [name]: numValue,
      };

      // Auto-calculate loan amount if home value or down payment changes
      if (name === 'homeValue' || name === 'downPayment') {
        const homeValue = name === 'homeValue' ? numValue : prev.homeValue;
        const downPayment =
          name === 'downPayment' ? numValue : prev.downPayment;

        newValues.loanAmount = Number(homeValue) - Number(downPayment);
      }

      return newValues;
    });
  };

  // Handle slider change
  const handleSliderChange = (value: number) => {
    setValues((prev) => {
      const newValues = {
        ...prev,
        downPayment: value,
      };

      newValues.loanAmount = Number(prev.homeValue) - Number(value);

      return newValues;
    });
  };

  // Validate form values
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (values.homeValue <= 0) {
      newErrors.homeValue = t('errorHomeValue');
    }

    if (values.downPayment < 0) {
      newErrors.downPayment = t('errorDownPayment');
    }

    if (values.downPayment >= values.homeValue) {
      newErrors.downPayment = t('errorDownPaymentMax');
    }

    if (values.interestRate <= 0) {
      newErrors.interestRate = t('errorInterestRate');
    }

    if (values.loanTerm <= 0) {
      newErrors.loanTerm = t('errorLoanTerm');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Notify parent component when values change
  useEffect(() => {
    if (validateForm()) {
      onValuesChange(values);
    }
  }, [values, onValuesChange]);

  return (
    <Section header={t('loanDetails')}>
      <div className={styles.formGrid}>
        <FormField
          label={t('homeValue')}
          name='homeValue'
          type='number'
          value={values.homeValue}
          onChange={handleInputChange}
          placeholder='300000'
          error={errors.homeValue}
          min={0}
          step={1000}
        />

        <FormField
          label={t('downPayment')}
          name='downPayment'
          type='number'
          value={values.downPayment}
          onChange={handleInputChange}
          placeholder='60000'
          error={errors.downPayment}
          min={0}
          step={1000}
        />

        <div className={styles.rangeSlider}>
          <Slider
            value={values.downPayment}
            min={0}
            max={values.homeValue}
            step={1000}
            onChange={handleSliderChange}
          />
          <div className={styles.rangeLabels}>
            <span>0%</span>
            <span>10%</span>
            <span>20%</span>
            <span>30%</span>
          </div>
        </div>

        <FormField
          label={t('loanAmount')}
          name='loanAmount'
          type='number'
          value={values.loanAmount}
          onChange={() => {}} // Read-only
          placeholder='240000'
          min={0}
        />

        <FormField
          label={t('interestRate')}
          name='interestRate'
          type='number'
          value={values.interestRate}
          onChange={handleInputChange}
          placeholder='3.5'
          error={errors.interestRate}
          min={0}
          max={20}
          step={0.1}
          after={<div className={styles.percentSign}>%</div>}
        />
        <Select
          id='loanTerm'
          name='loanTerm'
          header={t('loanTerm')}
          value={String(values.loanTerm)}
          onChange={handleInputChange}
        >
          <option value='10'>10 {t('years')}</option>
          <option value='15'>15 {t('years')}</option>
          <option value='20'>20 {t('years')}</option>
          <option value='25'>25 {t('years')}</option>
          <option value='30'>30 {t('years')}</option>
        </Select>
        <FormField
          label={t('startDate')}
          name='startDate'
          type='date'
          value={values.startDate}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <div className={styles.summaryLabel}>
            {t('downPaymentPercentage')}
          </div>
          <div className={styles.summaryValue}>
            {(() => {
              // Use type assertion to ensure TypeScript recognizes these as numbers
              const downPayment = Number(values.downPayment);
              const homeValue = Number(values.homeValue);
              const percentage =
                homeValue > 0 ? Math.round((downPayment / homeValue) * 100) : 0;
              return `${formatNumber(percentage)}%`;
            })()}
          </div>
        </div>
      </div>
    </Section>
  );
}
