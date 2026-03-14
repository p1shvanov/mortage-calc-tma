import { memo, useMemo, useState, useRef, useEffect } from 'react';
import { Modal, List, Section, Button, Snackbar } from '@telegram-apps/telegram-ui';
import { viewport, useSignal } from '@telegram-apps/sdk-react';

import EarlyPaymentsForm from '@/components/form/EarlyPaymentsForm';
import RegularPaymentsForm from '@/components/form/RegularPaymentsForm';
import { ValidationSnackbarSync } from '@/components/shared';
import { useKeyboardOpen } from '@/hooks/useKeyboardOpen';
import { useLoanForm } from '@/hooks/useLoanForm';
import { useMainButton } from '@/hooks/useMainButton';
import { useMainButtonAvailable } from '@/hooks/useTelegramButtonsAvailable';
import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import type { LoanDetailsType } from '@/types/form';
import { payloadToFormValues, type FormValuesLocale } from '@/utils/payloadToFormValues';
import { hapticButton, hapticSuccess } from '@/utils/haptic';

interface EarlyPaymentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EarlyPaymentsModalContentProps {
  defaultValues: LoanDetailsType;
  onClose: () => void;
  submitFormRef: React.MutableRefObject<(() => void) | null>;
  mainButtonAvailable: boolean;
}

const EarlyPaymentsModalContent = memo(function EarlyPaymentsModalContent({
  defaultValues,
  onClose,
  submitFormRef,
  mainButtonAvailable,
}: EarlyPaymentsModalContentProps) {
  const { t } = useLocalization();
  const { setEarlyPayments, setRegularPayments } = useMortgage();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const keyboardOpen = useKeyboardOpen();
  const contentInset = useSignal(viewport.contentSafeAreaInsets);
  const insetBottom = contentInset?.bottom ?? 0;

  const form = useLoanForm({
    defaultValues,
    onSubmit: async (payload) => {
      hapticSuccess();
      setEarlyPayments(payload.earlyPayments);
      setRegularPayments(payload.regularPayments);
      onClose();
    },
  });

  useEffect(() => {
    submitFormRef.current = () => form.handleSubmit();
    return () => {
      submitFormRef.current = null;
    };
  }, [form, submitFormRef]);

  return (
    <>
      <ValidationSnackbarSync
        form={form}
        setSnackbarOpen={setSnackbarOpen}
        setSnackbarMessage={setSnackbarMessage}
        t={t}
      />
      <div
        style={
          keyboardOpen && insetBottom > 0
            ? { marginBottom: -insetBottom }
            : undefined
        }
      >
        <List>
          <EarlyPaymentsForm form={form} />
          <RegularPaymentsForm form={form} />
          {!mainButtonAvailable && (
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
          )}
        </List>
      </div>
      {snackbarOpen && (
        <Snackbar duration={3000} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Snackbar>
      )}
    </>
  );
});

const EarlyPaymentsModal = memo(function EarlyPaymentsModal({ open, onOpenChange }: EarlyPaymentsModalProps) {
  const { language, t } = useLocalization();
  const { loanDetails, earlyPayments, regularPayments } = useMortgage();
  const locale: FormValuesLocale = language;
  const mainButtonAvailable = useMainButtonAvailable();
  const submitFormRef = useRef<(() => void) | null>(null);

  const defaultValues = useMemo(() => {
    if (!loanDetails) return undefined;
    return payloadToFormValues({ loanDetails, earlyPayments, regularPayments }, locale);
  }, [loanDetails, earlyPayments, regularPayments, locale]);

  useEffect(() => {
    if (!open) return;
    if (viewport.expand?.isAvailable?.()) viewport.expand();
  }, [open]);

  useMainButton(
    open && defaultValues && mainButtonAvailable
      ? {
          text: t('apply'),
          isEnabled: true,
          onClick: () => submitFormRef.current?.(),
        }
      : null
  );

  return (
    <Modal open={open} onOpenChange={onOpenChange} snapPoints={[1]} preventScrollRestoration>
      {defaultValues ? (
        <EarlyPaymentsModalContent
          key={`${defaultValues.loanAmount}-${defaultValues.interestRate}-${defaultValues.loanTerm}`}
          defaultValues={defaultValues}
          onClose={() => onOpenChange(false)}
          submitFormRef={submitFormRef}
          mainButtonAvailable={mainButtonAvailable}
        />
      ) : null}
    </Modal>
  );
});

export default EarlyPaymentsModal;
