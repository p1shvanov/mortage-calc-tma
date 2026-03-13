import { FC, memo, useMemo, useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { List, Section, Button, Snackbar, Placeholder } from '@telegram-apps/telegram-ui';
import { mainButton } from '@telegram-apps/sdk-react';

import LoanDetailsForm from '@/components/form/LoanDetailsForm';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useLoanForm } from '@/hooks/useLoanForm';
import { useMainButtonAvailable, useBackButtonAvailable } from '@/hooks/useTelegramButtonsAvailable';
import { getCalculationsStorage } from '@/services/storage';
import { payloadToFormValues } from '@/utils/payloadToFormValues';
import { hapticButton, hapticSuccess, hapticError } from '@/utils/haptic';
import Page from '@/components/Page';
import BackButton from '@/components/BackButton';
import BreadcrumbsNav from '@/components/BreadcrumbsNav';
import type { SavedCalculation } from '@/types/storage';

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

const LoanForm: FC = () => {
  const { t, language } = useLocalization();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const mainButtonAvailable = useMainButtonAvailable();
  const backButtonAvailable = useBackButtonAvailable();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadedForEdit, setLoadedForEdit] = useState<SavedCalculation | null>(null);
  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editId) {
      setLoadedForEdit(null);
      loadedIdRef.current = null;
      return;
    }
    if (loadedIdRef.current === editId) return;
    loadedIdRef.current = editId;
    setLoadingEdit(true);
    getCalculationsStorage()
      .getById(editId)
      .then((calc) => {
        setLoadedForEdit(calc);
        setLoadingEdit(false);
      })
      .catch(() => {
        setLoadedForEdit(null);
        setLoadingEdit(false);
      });
  }, [editId]);

  const defaultValues = useMemo(() => {
    if (loadedForEdit) return payloadToFormValues(loadedForEdit, language);
    return undefined;
  }, [loadedForEdit, language]);

  const form = useLoanForm({
    defaultValues,
    onSubmit: async (payload) => {
      if (mainButtonAvailable) {
        mainButton.setParams({ isLoaderVisible: true });
      }
      try {
        hapticSuccess();
        const storage = getCalculationsStorage();
        let id: string;
        if (editId) {
          await storage.update(editId, payload);
          id = editId;
        } else {
          const saved = await storage.save(payload);
          id = saved.id;
        }
        navigate(`/result?id=${id}`);
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

  if (editId && loadingEdit) {
    return (
      <Page>
        <List>
          <Placeholder header={t('loading')} description={t('loadingCalculation')} />
        </List>
      </Page>
    );
  }

  if (editId && !loadingEdit && !loadedForEdit) {
    return (
      <Page>
        <List>
          <Placeholder
            header={t('calculationNotFound')}
            description={t('goToCalculator')}
            action={
              <Button
                size="m"
                onClick={() => {
                  hapticButton();
                  navigate('/');
                }}
              >
                {t('goToHome')}
              </Button>
            }
          />
        </List>
      </Page>
    );
  }

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
        <BreadcrumbsNav items={[{ label: t('home'), path: '/' }, { label: t('calculator') }]} />
        <Section>
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
