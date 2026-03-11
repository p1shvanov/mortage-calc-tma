import { memo, useState, Fragment } from 'react';
import {
  Accordion,
  Badge,
  Button,
  Cell,
  List,
  Section,
  Text,
} from '@telegram-apps/telegram-ui';
import { useLocalization } from '@/providers/LocalizationProvider';
import InputNumberFormat from '@/components/ui/InputNumberFormat';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { popup } from '@telegram-apps/sdk-react';
import { formOpts, withForm } from '@/hooks/useLoanForm';
import { earlyPaymentSchema } from '@/schemas/earlyPayment';
import { loanDetailsSchema } from '@/schemas/loanDetails';
import {
  hapticButton,
  hapticSuccess,
  hapticSelection,
  hapticDestructive,
  hapticWarning,
} from '@/utils/haptic';

const typeLabels: Record<string, string> = {
  reduceTerm: 'typeReduceTerm',
  reducePayment: 'typeReducePayment',
};

function isEarlyPaymentItemValid(
  item: { amount?: string; date?: string; type?: string } | null,
): boolean {
  if (!item) return false;
  const result = earlyPaymentSchema.safeParse({
    amount: item.amount ?? '',
    date: item.date ?? '',
    type: item.type ?? 'reduceTerm',
  });
  return result.success;
}

const EarlyPaymentsForm = withForm({
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
          const isLoanDetailsValid =
            loanDetailsSchema.safeParse(loanDetails).success;
          return (
            <Section>
              <Accordion
                expanded={sectionOpen && isLoanDetailsValid}
                onChange={() => {
                  if (isLoanDetailsValid) {
                    hapticSelection();
                    setSectionOpen((prev) => !prev);
                  } else {
                    hapticWarning();
                    if (popup.isSupported()) {
                      popup.show({ message: t('fillLoanDetailsFirst') });
                    }
                  }
                }}
              >
                <Accordion.Summary>
                  <>
                    {t('earlyPayment')}
                    <form.Field name='earlyPayments' mode='array'>
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
                <Accordion.Content>
                  <form.Field name='earlyPayments' mode='array'>
                    {(field) => {
                      const expandedItem =
                        expandedIndex !== null
                          ? (field.state.value[expandedIndex] ?? null)
                          : null;
                      const isExpandedItemValid =
                        isEarlyPaymentItemValid(expandedItem);
                      const canAdd =
                        isLoanDetailsValid &&
                        (expandedIndex === null || isExpandedItemValid);

                      return (
                        <List>
                          <Button
                            size='s'
                            mode='plain'
                            before='+'
                            disabled={!canAdd}
                            onClick={() => {
                              hapticButton();
                              const nextIndex = field.state.value.length;
                              field.pushValue({
                                amount: '',
                                date: new Date().toISOString().split('T')[0],
                                id: Date.now().toString(),
                                type: 'reduceTerm',
                              });
                              setExpandedIndex(nextIndex);
                            }}
                          >
                            {t('addEarlyPayment')}
                          </Button>
                          {field.state.value.map((item, i) => {
                            const isExpanded = expandedIndex === i;
                            const amountStr = item?.amount ?? '';
                            const amountNum = parseFloat(
                              String(amountStr).replace(/\s/g, '') || '0',
                            );
                            const dateStr = item?.date ?? '';
                            const typeStr = item?.type ?? 'reduceTerm';
                            const isItemValid = isEarlyPaymentItemValid(item);

                            return (
                              <Fragment key={item?.id ?? i}>
                                {isExpanded ? (
                                  <List>
                                    <form.Field
                                      name={`earlyPayments[${i}].amount`}
                                      children={(f) => (
                                        <InputNumberFormat
                                          header={t('earlyPaymentAmount')}
                                          placeholder={t('earlyPaymentAmount')}
                                          field={f}
                                          inputMode='decimal'
                                          maximumFractionDigits={2}
                                        />
                                      )}
                                    />
                                    <form.Field
                                      name={`earlyPayments[${i}].date`}
                                      children={(f) => (
                                        <Input
                                          header={t('earlyPaymentDate')}
                                          placeholder={t('earlyPaymentDate')}
                                          field={f}
                                          type='date'
                                        />
                                      )}
                                    />
                                    <form.Field
                                      name={`earlyPayments[${i}].type`}
                                      children={(f) => (
                                        <Select
                                          header={t('earlyPaymentType')}
                                          field={f}
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
                                    <List>
                                      <Button
                                        size='s'
                                        mode='outline'
                                        disabled={!isItemValid}
                                        onClick={() => {
                                          hapticSuccess();
                                          setExpandedIndex(null);
                                        }}
                                      >
                                        {t('done')}
                                      </Button>
                                      <Button
                                        size='s'
                                        mode='outline'
                                        onClick={() => {
                                          hapticDestructive();
                                          field.removeValue(i);
                                          setExpandedIndex(null);
                                        }}
                                      >
                                        {t('remove')}
                                      </Button>
                                    </List>
                                  </List>
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
                                          hapticDestructive();
                                          field.removeValue(i);
                                          setExpandedIndex(
                                            expandedIndex === i
                                              ? null
                                              : expandedIndex !== null &&
                                                  expandedIndex > i
                                                ? expandedIndex - 1
                                                : expandedIndex,
                                          );
                                        }}
                                      >
                                        {t('remove')}
                                      </Button>
                                    }
                                  >
                                    <Text>
                                      {amountStr
                                        ? formatCurrency(amountNum)
                                        : '—'}{' '}
                                      · {dateStr ? formatDate(dateStr) : '—'} ·{' '}
                                      {t(typeLabels[typeStr] ?? typeStr)}
                                    </Text>
                                  </Cell>
                                )}
                              </Fragment>
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

export default memo(EarlyPaymentsForm);
