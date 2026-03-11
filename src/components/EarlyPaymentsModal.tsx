import { memo, useMemo, useState, useRef } from 'react';
import { Modal, List, Section, Button, Snackbar } from '@telegram-apps/telegram-ui';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import { useLoanForm } from '@/hooks/useLoanForm';
import { payloadToFormValues } from '@/utils/payloadToFormValues';
import type { LoanDetailsType } from '@/types/form';
import { hapticButton, hapticSuccess, hapticError } from '@/utils/haptic';
import EarlyPaymentsForm from '@/components/form/EarlyPaymentsForm';
import RegularPaymentsForm from '@/components/form/RegularPaymentsForm';

interface EarlyPaymentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EarlyPaymentsModalContentProps {
  defaultValues: LoanDetailsType;
  onClose: () => void;
}

const EarlyPaymentsModalContent = memo(function EarlyPaymentsModalContent({
  defaultValues,
  onClose,
}: EarlyPaymentsModalContentProps) {
  const { t } = useLocalization();
  const { setEarlyPayments, setRegularPayments } = useMortgage();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const prevAttemptsRef = useRef(0);

  const form = useLoanForm({
    defaultValues,
    onSubmit: async (payload) => {
      hapticSuccess();
      setEarlyPayments(payload.earlyPayments);
      setRegularPayments(payload.regularPayments);
      onClose();
    },
  });

  return (
    <>
      <form.Subscribe
        selector={(s) => ({ submissionAttempts: s.submissionAttempts, canSubmit: s.canSubmit })}
      >
        {({ submissionAttempts, canSubmit }) => {
          if (submissionAttempts > prevAttemptsRef.current && !canSubmit) {
            prevAttemptsRef.current = submissionAttempts;
            hapticError();
            setSnackbarMessage(t('fixFormErrors'));
            setSnackbarOpen(true);
          } else {
            prevAttemptsRef.current = submissionAttempts;
          }
          return null;
        }}
      </form.Subscribe>
      <List>
        <EarlyPaymentsForm form={form} />
        <RegularPaymentsForm form={form} />
        <Section>
          <Button
            stretched
            size="m"
            onClick={() => {
              hapticButton();
              form.handleSubmit();
            }}
          >
            {t('apply')}
          </Button>
        </Section>
      </List>
      {snackbarOpen && (
        <Snackbar duration={3000} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Snackbar>
      )}
    </>
  );
});

const EarlyPaymentsModal = memo(function EarlyPaymentsModal({ open, onOpenChange }: EarlyPaymentsModalProps) {
  const { loanDetails, earlyPayments, regularPayments } = useMortgage();

  const defaultValues = useMemo(() => {
    if (!open || !loanDetails) return undefined;
    return payloadToFormValues({ loanDetails, earlyPayments, regularPayments });
  }, [open, loanDetails, earlyPayments, regularPayments]);

  if (!open) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange} snapPoints={[1]}>
      {defaultValues ? (
        <EarlyPaymentsModalContent
          defaultValues={defaultValues}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
    </Modal>
  );
});

export default EarlyPaymentsModal;
