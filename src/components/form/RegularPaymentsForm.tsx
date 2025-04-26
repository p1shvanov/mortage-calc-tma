import { memo, useState } from 'react';
import { Accordion, Badge, Button, List, Section } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import InputNumberFormat from '@/components/ui/InputNumberFormat';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { formOpts, withForm } from '@/hooks/useLoanForm';

/**
 * Form component for regular payments
 * Allows users to set up recurring monthly payments with a specified amount,
 * date range, and recalculation type (reduce term or reduce payment)
 */
const RegularPaymentsForm = withForm({
  ...formOpts,
  render: function Render({ form }) {
    const [open, setOpen] = useState(false);
    const { t } = useLocalization();

    return (
      <Section>
        <form.Field name='regularPayments' mode='array'>
          {(field) => {
            return (
              <Accordion
                expanded={open}
                onChange={() => setOpen((prev) => !prev)}
              >
                <Accordion.Summary>
                  {t('regularPayment')}
                  {Boolean(field.state.value.length) && (
                    <Badge large type='dot'>
                      {field.state.value.length}
                    </Badge>
                  )}
                </Accordion.Summary>
                <Accordion.Content style={{ background: 'transparent' }}>
                  <Section>
                    {field.state.value.map((_, i) => {
                      return (
                        <List key={i}>
                          <form.Field
                            name={`regularPayments[${i}].amount`}
                            children={(field) => (
                              <InputNumberFormat
                                header={t('regularPaymentAmount')}
                                placeholder={t('regularPaymentAmount')}
                                field={field}
                                inputMode='decimal'
                                maximumFractionDigits={2}
                              />
                            )}
                          />
                          <form.Field
                            name={`regularPayments[${i}].startMonth`}
                            children={(field) => (
                              <Input
                                header={t('startMonth')}
                                placeholder={t('startMonth')}
                                field={field}
                                type='date'
                              />
                            )}
                          />
                          <form.Field
                            name={`regularPayments[${i}].endMonth`}
                            children={(field) => (
                              <Input
                                header={t('endMonth')}
                                placeholder={t('endMonth')}
                                field={field}
                                type='date'
                              />
                            )}
                          />
                          <form.Field
                            name={`regularPayments[${i}].type`}
                            children={(field) => (
                              <Select
                                header={t('earlyPaymentType')}
                                field={field}
                                options={[
                                  {
                                    label: t('typeReduceTerm'),
                                    value: 'reduceTerm',
                                  },
                                  {
                                    label: t('typeReducePayment'),
                                    value: 'reducePayment',
                                  },
                                ]}
                              />
                            )}
                          />
                          <form.Subscribe
                            selector={(state) => [
                              state.isFieldsValid,
                              state.isValid,
                            ]}
                            children={([isFieldsValid, isValid]) => (
                              <Button
                                size='s'
                                mode='outline'
                                disabled={!isFieldsValid || !isValid}
                                stretched
                                onClick={() => field.removeValue(i)}
                              >
                                {t('remove')}
                              </Button>
                            )}
                          />
                        </List>
                      );
                    })}
                    <form.Subscribe
                      selector={(state) => [state.isFieldsValid, state.isValid]}
                      children={([isFieldsValid, isValid]) => (
                        <Button
                          disabled={!isFieldsValid || !isValid}
                          stretched
                          onClick={() =>
                            field.pushValue({
                              amount: '',
                              startMonth: new Date().toISOString().split('T')[0],
                              endMonth: '',
                              id: Date.now().toString(),
                              type: 'reduceTerm',
                            })
                          }
                        >
                          {t('addRegularPayment')}
                        </Button>
                      )}
                    />
                  </Section>
                </Accordion.Content>
              </Accordion>
            );
          }}
        </form.Field>
      </Section>
    );
  },
});

export default memo(RegularPaymentsForm);
