import { memo, useMemo, useState, useRef, useEffect } from 'react';
import { Modal, List, Section, Button, Snackbar } from '@telegram-apps/telegram-ui';
import { viewport, useSignal, mainButton } from '@telegram-apps/sdk-react';

import { useMainButtonAvailable } from '@/hooks/useTelegramButtonsAvailable';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useMortgage } from '@/providers/MortgageProvider';
import { useLoanForm } from '@/hooks/useLoanForm';
import { payloadToFormValues, type FormValuesLocale } from '@/utils/payloadToFormValues';
import type { LoanDetailsType } from '@/types/form';
import { hapticButton, hapticSuccess, hapticError } from '@/utils/haptic';
import EarlyPaymentsForm from '@/components/form/EarlyPaymentsForm';
import RegularPaymentsForm from '@/components/form/RegularPaymentsForm';

interface EarlyPaymentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Клавиатура считается открытой, если видимая высота заметно меньше innerHeight (типично при открытой клавиатуре). */
function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const check = () =>
      setOpen(window.visualViewport!.height < window.innerHeight - 60);
    check();
    window.visualViewport.addEventListener('resize', check);
    return () => window.visualViewport?.removeEventListener('resize', check);
  }, []);
  return open;
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
  const prevAttemptsRef = useRef(0);
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

  // Считаем defaultValues при открытой модалке И при наличии loanDetails (избегаем рендера Modal с null)
  const defaultValues = useMemo(() => {
    if (!loanDetails) return undefined;
    return payloadToFormValues({ loanDetails, earlyPayments, regularPayments }, locale);
  }, [loanDetails, earlyPayments, regularPayments, locale]);

  // При открытии: expand — развернуть мини-приложение на всю высоту (в мобильном Telegram иначе половинный BottomSheet)
  useEffect(() => {
    if (!open) return;
    if (viewport.expand?.isAvailable?.()) viewport.expand();
  }, [open]);

  // MainButton «Применить» при открытой модалке — по нажатию отправляем форму
  useEffect(() => {
    if (!open || !defaultValues || !mainButtonAvailable) return;
    mainButton.setParams({
      text: t('apply'),
      isVisible: true,
      isEnabled: true,
    });
    const off = mainButton.onClick(() => {
      hapticButton();
      submitFormRef.current?.();
    });
    return () => {
      mainButton.setParams({ isVisible: false });
      off();
    };
  }, [open, defaultValues, mainButtonAvailable, t]);

  // Modal сам скрывается по open={false}, условный return не нужен.
  // Контент рендерим только при наличии defaultValues (форма требует объект; без loanDetails будет undefined).
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
