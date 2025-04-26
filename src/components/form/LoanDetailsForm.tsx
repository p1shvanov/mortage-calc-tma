import { memo } from 'react';
import { List, Section } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import InputNumberFormat from '@/components/ui/InputNumberFormat';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { formOpts, withForm } from '@/hooks/useLoanForm';

const LoanDetailsForm = withForm({
  ...formOpts,
  render: function Render({ form }) {
    const { t, language } = useLocalization();

    return (
      <Section header={t('loanDetails')}>
        <List>
          <form.Field
            name={'loanAmount'}
            children={(field) => (
              <InputNumberFormat
                header={t('loanAmount')}
                placeholder={t('loanAmount')}
                field={field}
                inputMode='decimal'
                maximumFractionDigits={2}
              />
            )}
          />
          <form.Field
            name={'interestRate'}
            children={(field) => (
              <InputNumberFormat
                header={t('interestRate')}
                placeholder={t('interestRate')}
                field={field}
                format='percent'
                inputMode='decimal'
                maximumFractionDigits={2}
              />
            )}
          />
          <form.Field
            name={'loanTerm'}
            children={(field) => (
              <InputNumberFormat
                format='unit'
                unit='year'
                locales={language}
                header={t('loanTerm')}
                placeholder={t('loanTerm')}
                field={field}
                inputMode='numeric'
                maximumIntegerDigits={2}
              />
            )}
          />
          <form.Field
            name={'startDate'}
            children={(field) => (
              <Input
                header={t('startDate')}
                placeholder={t('startDate')}
                field={field}
                type='date'
              />
            )}
          />
          <form.Field
            name={'paymentType'}
            children={(field) => (
              <Select
                header={t('paymentType')}
                field={field}
                options={[
                  {
                    label: t('annuityPayment'),
                    value: 'annuity',
                  },
                  {
                    label: t('differentiatedPayment'),
                    value: 'differentiated',
                  },
                ]}
              />
            )}
          />
          <form.Field
            name={'paymentDay'}
            children={(field) => (
              <Select
                header={t('paymentDay')}
                field={field}
                options={Array.from({ length: 31 }, (_, i) => i + 1).map(
                  (day) => ({
                    label: String(day),
                    value: String(day),
                  })
                )}
              />
            )}
          />
        </List>
      </Section>
    );
  },
});

export default memo(LoanDetailsForm);
