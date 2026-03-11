import { FC, memo, useMemo, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { List, Section, Button, Snackbar } from '@telegram-apps/telegram-ui';
import { mainButton } from '@telegram-apps/sdk-react';

import LoanDetailsForm from '@/components/form/LoanDetailsForm';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useLoanForm, type CalculationPayload } from '@/hooks/useLoanForm';
import { useMainButtonAvailable, useBackButtonAvailable } from '@/hooks/useTelegramButtonsAvailable';
import { getCalculationsStorage } from '@/services/storage';
import { payloadToFormValues } from '@/utils/payloadToFormValues';
import { hapticButton, hapticSuccess, hapticError } from '@/utils/haptic';
import Page from '@/components/Page';
import BackButton from '@/components/BackButton';
import BreadcrumbsNav from '@/components/BreadcrumbsNav';

function MainButtonSync({
  form,
}: {
  form: ReturnType<typeof useLoanForm>;
}) {
  return (
    <form.Subscribe selector={(s) => s.canSubmit}>
      {(canSubmit) => <MainButtonEnabled canSubmit={canSubmit} />}
    </form.Subscribe>
  );
}

function MainButtonEnabled({ canSubmit }: { canSubmit: boolean }) {
  useEffect(() => {
    mainButton.setParams({ isEnabled: canSubmit });
  }, [canSubmit]);
  return null;
}

function ValidationSnackbarSync({
  form,
  setSnackbarOpen,
  setSnackbarMessage,
  t,
}: {
  form: ReturnType<typeof useLoanForm>;
  setSnackbarOpen: (open: boolean) => void;
  setSnackbarMessage: (msg: string) => void;
  t: (key: string) => string;
}) {
  const prevAttemptsRef = useRef(0);
  return (
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
  );
}

function isCalculationPayload(state: unknown): state is CalculationPayload {
  return (
    typeof state === 'object' &&
    state !== null &&
    'loanDetails' in state &&
    typeof (state as CalculationPayload).loanDetails === 'object'
  );
}

const LoanForm: FC = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const location = useLocation();
  const mainButtonAvailable = useMainButtonAvailable();
  const backButtonAvailable = useBackButtonAvailable();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const defaultValues = useMemo(() => {
    if (isCalculationPayload(location.state)) return payloadToFormValues(location.state);
    return undefined;
  }, [location.state]);

  const savedId = location.state && typeof location.state === 'object' && 'savedId' in location.state
    ? (location.state as { savedId?: string }).savedId
    : undefined;

  const form = useLoanForm({
    defaultValues,
    onSubmit: async (payload) => {
      if (mainButtonAvailable) {
        mainButton.setParams({ isLoaderVisible: true });
      }
      try {
        hapticSuccess();
        const storage = getCalculationsStorage();
        let id = savedId;
        if (id) {
          await storage.update(id, payload);
        } else {
          const saved = await storage.save(payload);
          if (saved) id = saved.id;
        }
        navigate('/result', { state: { ...payload, savedId: id ?? undefined } });
      } catch {
        hapticError();
        setSnackbarMessage(t('saveError'));
        setSnackbarOpen(true);
      } finally {
        if (mainButtonAvailable) {
          mainButton.setParams({ isLoaderVisible: false });
        }
      }
    },
  });

  useEffect(() => {
    if (!mainButtonAvailable) return;
    mainButton.setParams({ text: t('calculate'), isVisible: true, isEnabled: form.state.canSubmit, hasShineEffect: true });
    const off = mainButton.onClick(() => {
      hapticButton();
      form.handleSubmit();
    });
    return () => {
      mainButton.setParams({ isVisible: false });
      off();
    };
  }, [t, mainButtonAvailable]);

  return (
    <Page>
      {mainButtonAvailable && <MainButtonSync form={form} />}
      <ValidationSnackbarSync
        form={form}
        setSnackbarOpen={setSnackbarOpen}
        setSnackbarMessage={setSnackbarMessage}
        t={t}
      />
      <List
        Component="form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Section header={<BreadcrumbsNav items={[{ label: t('home'), path: '/' }, { label: t('calculator') }]} />}>
          {!backButtonAvailable && (
            <BackButton
              onClick={() => {
                hapticButton();
                navigate('/');
              }}
            >
              {t('backToHome')}
            </BackButton>
          )}
        </Section>
        <LoanDetailsForm form={form} />
        {!mainButtonAvailable && (
          <Section>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type='submit'
                  stretched
                  disabled={!canSubmit}
                  loading={isSubmitting}
                  onClick={() => hapticButton()}
                >
                  {t('calculate')}
                </Button>
              )}
            />
          </Section>
        )}
      </List>
      {snackbarOpen && (
        <Snackbar duration={3000} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Snackbar>
      )}
    </Page>
  );
};

export default memo(LoanForm);
