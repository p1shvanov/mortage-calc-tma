import { useState, useEffect, memo } from 'react';

import {
  List,
  Section,
  Select,
  Slider,
  Text,
} from '@telegram-apps/telegram-ui';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';

import FormField from '@/components/FormField';

export interface LoanDetailsValues {
  homeValue: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  startDate: string;
}

const LoanDetails = () => {
  const { t } = useLocalization();
  const { setLoanDetails } = useMortgage();

  // Initialize form state
  const [values, setValues] = useState<LoanDetailsValues>({
    homeValue: 7900000,
    downPayment: 2500000,
    loanAmount: 5400000,
    interestRate: 18.75,
    loanTerm: 20,
    startDate: new Date().toISOString().split('T')[0],
  });

  // Initialize validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Fix for empty input fields - don't convert empty string to 0
    let numValue;
    if (name === 'startDate') {
      numValue = value;
    } else if (value === '') {
      numValue = '';
    } else {
      numValue = parseFloat(value) || 0;
    }

    setValues((prev) => {
      const newValues = {
        ...prev,
        [name]: numValue,
      };

      // Auto-calculate loan amount if home value or down payment changes
      if (name === 'homeValue' || name === 'downPayment') {
        const homeValue =
          name === 'homeValue'
            ? numValue === ''
              ? 0
              : numValue
            : prev.homeValue;
        const downPayment =
          name === 'downPayment'
            ? numValue === ''
              ? 0
              : numValue
            : prev.downPayment;

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

    // Convert empty strings to 0 for validation
    const homeValue =
      typeof values.homeValue === 'string' ? 0 : Number(values.homeValue);
    const downPayment =
      typeof values.downPayment === 'string' ? 0 : Number(values.downPayment);
    const interestRate =
      typeof values.interestRate === 'string' ? 0 : Number(values.interestRate);
    const loanTerm =
      typeof values.loanTerm === 'string' ? 0 : Number(values.loanTerm);

    if (homeValue <= 0) {
      newErrors.homeValue = t('errorHomeValue');
    }

    if (downPayment < 0) {
      newErrors.downPayment = t('errorDownPayment');
    }

    if (downPayment >= homeValue && homeValue > 0) {
      newErrors.downPayment = t('errorDownPaymentMax');
    }

    if (interestRate <= 0) {
      newErrors.interestRate = t('errorInterestRate');
    }

    if (loanTerm <= 0) {
      newErrors.loanTerm = t('errorLoanTerm');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Notify MortgageProvider when values change
  useEffect(() => {
    if (validateForm()) {
      setLoanDetails(values);
    }
  }, [values, setLoanDetails]);

  return (
    <Section header={t('loanDetails')}>
      <List>
        <FormField
          label={t('homeValue')}
          name='homeValue'
          type='number'
          value={values.homeValue}
          onChange={handleInputChange}
          placeholder={t('homeValue')}
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
          placeholder={t('downPayment')}
          error={errors.downPayment}
          min={0}
          step={1000}
        />
        <Slider
          value={values.downPayment}
          min={0}
          max={values.homeValue}
          step={1000}
          onChange={handleSliderChange}
          before={<Text>0%</Text>}
          after={<Text>100%</Text>}
        />
        <FormField
          label={t('loanAmount')}
          name='loanAmount'
          type='number'
          value={values.loanAmount}
          onChange={() => {}} // Read-only
          placeholder={t('loanAmount')}
          min={0}
        />
        <FormField
          label={t('interestRate')}
          name='interestRate'
          type='number'
          value={values.interestRate}
          onChange={handleInputChange}
          placeholder={t('interestRate')}
          error={errors.interestRate}
          min={0}
          max={20}
          step={0.1}
          after={<Text>%</Text>}
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
          placeholder={t('startDate')}
          value={values.startDate}
          onChange={handleInputChange}
        />
      </List>
    </Section>
  );
};

export default memo(LoanDetails);
