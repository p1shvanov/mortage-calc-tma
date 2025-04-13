import { memo, useCallback, useState } from 'react';

import { Accordion, Section } from '@telegram-apps/telegram-ui';

import { useMortgage, EarlyPayment } from '@/providers/MortgageProvider';
import { useLocalization } from '@/providers/LocalizationProvider';

import EarlyPaymentForm from '@/components/EarlyPaymentForm';
import EarlyPaymentList from '@/components/EarlyPaymentList';

const EarlyPaymentContainer = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const { t } = useLocalization();
  const { loanDetails, earlyPayments, setEarlyPayments } = useMortgage();

  const handleAddPayment = useCallback(
    (payment: Omit<EarlyPayment, 'id'>) => {
      const newPayment: EarlyPayment = {
        ...payment,
        id: Date.now().toString(),
      };

      setEarlyPayments([...earlyPayments, newPayment]);
    },
    [earlyPayments]
  );

  const handleRemovePayment = useCallback(
    (id: string) => {
      setEarlyPayments(earlyPayments.filter((payment) => payment.id !== id));
    },
    [earlyPayments]
  );

  if (!loanDetails) {
    return null;
  }

  return (
    <Section>
      <Accordion
        expanded={isAccordionOpen}
        onChange={() => setIsAccordionOpen((prev) => !prev)}
      >
        <Accordion.Summary>{t('earlyPayment')}</Accordion.Summary>
        <Accordion.Content>
          <EarlyPaymentForm
            onAddPayment={handleAddPayment}
            loanTerm={loanDetails.loanTerm}
          />
        </Accordion.Content>
        <EarlyPaymentList
          payments={earlyPayments}
          onRemovePayment={handleRemovePayment}
        />
      </Accordion>
    </Section>
  );
};

export default memo(EarlyPaymentContainer);
