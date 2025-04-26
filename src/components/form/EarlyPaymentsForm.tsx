import { memo, useState } from 'react';
import { Accordion, Badge, Button, List, Section } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import InputNumberFormat from '@/components/ui/InputNumberFormat';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { formOpts, withForm } from '@/hooks/useLoanForm';

const EarlyPaymentsForm = withForm({
  ...formOpts,
  render: function Render({ form }) {
    const [open, setOpen] = useState(false);
    const { t } = useLocalization();

    return (
      <Section>
        <form.Field name='earlyPayments' mode='array'>
          {(field) => {
            return (
              <Accordion
                expanded={open}
                onChange={() => setOpen((prev) => !prev)}
              >
                <Accordion.Summary>
                  {t('earlyPayment')}
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
                            name={`earlyPayments[${i}].amount`}
                            children={(field) => (
                              <InputNumberFormat
                                header={t('earlyPaymentAmount')}
                                placeholder={t('earlyPaymentAmount')}
                                field={field}
                                inputMode='decimal'
                                maximumFractionDigits={2}
                              />
                            )}
                          />
                          <form.Field
                            name={`earlyPayments[${i}].date`}
                            children={(field) => (
                              <Input
                                header={t('earlyPaymentDate')}
                                placeholder={t('earlyPaymentDate')}
                                field={field}
                                type='date'
                              />
                            )}
                          />
                          <form.Field
                            name={`earlyPayments[${i}].type`}
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
                              date: new Date().toISOString().split('T')[0],
                              id: Date.now().toString(),
                              type: 'reduceTerm',
                            })
                          }
                        >
                          {t('addEarlyPayment')}
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

export default memo(EarlyPaymentsForm); 