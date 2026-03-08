import { memo, useState } from 'react';
import { Accordion, Badge, Button, Cell, List, Section, Text } from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import InputNumberFormat from '@/components/ui/InputNumberFormat';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { formOpts, withForm } from '@/hooks/useLoanForm';
import { regularPaymentSchema } from '@/schemas/regularPayment';
import { loanDetailsSchema } from '@/schemas/loanDetails';
import { hapticImpact, hapticNotification, hapticSelection } from '@/utils/haptic';

const typeLabels: Record<string, string> = {
  reduceTerm: 'typeReduceTerm',
  reducePayment: 'typeReducePayment',
};

function isRegularPaymentItemValid(
  item: {
    amount?: string;
    startMonth?: string;
    endMonth?: string;
    type?: string;
    id?: string;
  } | null
): boolean {
  if (!item) return false;
  const result = regularPaymentSchema.safeParse({
    id: item.id ?? '',
    amount: item.amount ?? '',
    startMonth: item.startMonth ?? '',
    endMonth: item.endMonth ?? '',
    type: item.type ?? 'reduceTerm',
  });
  return result.success;
}

/**
 * Form component for regular payments.
 * Section always visible; "+ Add" at top; each item is a compact row (tap to expand) or full form.
 */
const RegularPaymentsForm = withForm({
  ...formOpts,
  render: function Render({ form }) {
    const [sectionOpen, setSectionOpen] = useState(true);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const { t, formatCurrency, formatDate } = useLocalization();

    return (
      <form.Subscribe
        selector={(state) => ({
          loanAmount: state.values.loanAmount,
          interestRate: state.values.interestRate,
          loanTerm: state.values.loanTerm,
          startDate: state.values.startDate,
          paymentType: state.values.paymentType,
          paymentDay: state.values.paymentDay,
        })}
      >
        {(loanDetails) => {
          const isLoanDetailsValid = loanDetailsSchema.safeParse(loanDetails).success;
          return (
            <Section>
              <Accordion
                expanded={sectionOpen && isLoanDetailsValid}
                onChange={() => isLoanDetailsValid && setSectionOpen((prev) => !prev)}
              >
                <Accordion.Summary>
                  <>
                    {t('regularPayment')}
                    <form.Field name='regularPayments' mode='array'>
                      {(field) =>
                        field.state.value.length > 0 ? (
                          <Badge large type='dot'>
                            {field.state.value.length}
                          </Badge>
                        ) : null
                      }
                    </form.Field>
                  </>
                </Accordion.Summary>
                <Accordion.Content style={{ background: 'transparent' }}>
                  <form.Field name='regularPayments' mode='array'>
                {(field) => {
                  const expandedItem =
                    expandedIndex !== null ? field.state.value[expandedIndex] ?? null : null;
                  const isExpandedItemValid = isRegularPaymentItemValid(expandedItem);
                  const canAdd =
                    isLoanDetailsValid &&
                    (expandedIndex === null || isExpandedItemValid);

                  return (
                    <List>
                      <div style={{ padding: '4px 0' }}>
                        <Button
                          size='s'
                          mode='plain'
                          before='+'
                          disabled={!canAdd}
                    onClick={() => {
                    const today = new Date();
                    const nextMonth = new Date(today);
                    nextMonth.setMonth(today.getMonth() + 1);
                    hapticImpact('light');
                    field.pushValue({
                      amount: '',
                      startMonth: today.toISOString().split('T')[0],
                      endMonth: nextMonth.toISOString().split('T')[0],
                      id: Date.now().toString(),
                      type: 'reduceTerm',
                    });
                    setExpandedIndex(field.state.value.length - 1);
                  }}
                >
                  {t('addRegularPayment')}
                </Button>
              </div>
              {field.state.value.map((item, i) => {
                const isExpanded = expandedIndex === i;
                const amountStr = item?.amount ?? '';
                const amountNum = parseFloat(String(amountStr).replace(/\s/g, '') || '0');
                const startStr = item?.startMonth ?? '';
                const endStr = item?.endMonth ?? '';
                const typeStr = item?.type ?? 'reduceTerm';
                const isItemValid = isRegularPaymentItemValid(item);

                return (
                  <div key={item?.id ?? i}>
                    {isExpanded ? (
                      <div style={{ padding: '8px 0' }}>
                        <form.Field
                          name={`regularPayments[${i}].amount`}
                          children={(f) => (
                            <InputNumberFormat
                              header={t('regularPaymentAmount')}
                              placeholder={t('regularPaymentAmount')}
                              field={f}
                              inputMode='decimal'
                              maximumFractionDigits={2}
                            />
                          )}
                        />
                        <form.Field
                          name={`regularPayments[${i}].startMonth`}
                          children={(f) => (
                            <Input
                              header={t('startMonth')}
                              placeholder={t('startMonth')}
                              field={f}
                              type='date'
                            />
                          )}
                        />
                        <form.Field
                          name={`regularPayments[${i}].endMonth`}
                          children={(f) => (
                            <Input
                              header={t('endMonth')}
                              placeholder={t('endMonth')}
                              field={f}
                              type='date'
                            />
                          )}
                        />
                        <form.Field
                          name={`regularPayments[${i}].type`}
                          children={(f) => (
                            <Select
                              header={t('earlyPaymentType')}
                              field={f}
                              options={[
                                { label: t('typeReduceTerm'), value: 'reduceTerm' },
                                { label: t('typeReducePayment'), value: 'reducePayment' },
                              ]}
                            />
                          )}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <Button
                            size='s'
                            mode='outline'
                            disabled={!isItemValid}
                            onClick={() => {
                              hapticNotification('success');
                              setExpandedIndex(null);
                            }}
                          >
                            {t('done')}
                          </Button>
                          <Button
                            size='s'
                            mode='outline'
                            onClick={() => {
                              hapticImpact('light');
                              field.removeValue(i);
                              setExpandedIndex(null);
                            }}
                          >
                            {t('remove')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Cell
                        onClick={() => {
                          hapticSelection();
                          setExpandedIndex(i);
                        }}
                        after={
                          <Button
                            size='s'
                            mode='plain'
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              hapticImpact('light');
                              field.removeValue(i);
                              setExpandedIndex(
                                expandedIndex === i
                                  ? null
                                  : expandedIndex !== null && expandedIndex > i
                                    ? expandedIndex - 1
                                    : expandedIndex
                              );
                            }}
                          >
                            {t('remove')}
                          </Button>
                        }
                      >
                        <Text>
                          {amountStr ? formatCurrency(amountNum) : '—'} ·{' '}
                          {startStr ? formatDate(startStr) : '—'}
                          {endStr ? ` – ${formatDate(endStr)}` : ''} ·{' '}
                          {t(typeLabels[typeStr] ?? typeStr)}
                        </Text>
                      </Cell>
                    )}
                  </div>
                );
              })}
            </List>
                  );
                }}
              </form.Field>
                </Accordion.Content>
              </Accordion>
            </Section>
          );
        }}
      </form.Subscribe>
    );
  },
});

export default memo(RegularPaymentsForm);
