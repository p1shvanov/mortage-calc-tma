import { FC, memo, useMemo, useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { List, Section, Button, Snackbar } from '@telegram-apps/telegram-ui';

import {
  BackButton,
  BreadcrumbsNav,
  Page,
} from '@/components/layout';
import LoanDetailsForm from '@/components/form/LoanDetailsForm';
import {
  CalculationPlaceholder,
  ValidationSnackbarSync,
} from '@/components/shared';
import {
  useBackButtonAvailable,
  useMainButtonAvailable,
} from '@/hooks/useTelegramButtonsAvailable';
import { useLoanForm } from '@/hooks/useLoanForm';
import { useMainButton } from '@/hooks/useMainButton';
import { useLocalization } from '@/providers/LocalizationProvider';
import { getCalculationsStorage } from '@/services/storage';
import type { SavedCalculation } from '@/domain';
import { payloadToFormValues } from '@/utils/payloadToFormValues';
import { hapticButton, hapticSuccess, hapticError } from '@/utils/haptic';

function LoanFormMainButton({
  form,
  t,
}: {
  form: ReturnType<typeof useLoanForm>;
  t: (key: string) => string;
}) {
  return (
    <form.Subscribe
      selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
    >
      {({ canSubmit, isSubmitting }) => (
        <LoanFormMainButtonInner
          form={form}
          t={t}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </form.Subscribe>
  );
}

function LoanFormMainButtonInner({
  form,
  t,
  canSubmit,
  isSubmitting,
}: {
  form: ReturnType<typeof useLoanForm>;
  t: (key: string) => string;
  canSubmit: boolean;
  isSubmitting: boolean;
}) {
  useMainButton({
    text: t('calculate'),
    isEnabled: canSubmit,
    hasShineEffect: true,
    isLoading: isSubmitting,
    onClick: () => form.handleSubmit(),
  });
  return null;
}

const LoanForm: FC = () => {
  const { t, language } = useLocalization();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const backButtonAvailable = useBackButtonAvailable();
  const mainButtonAvailable = useMainButtonAvailable();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadedForEdit, setLoadedForEdit] = useState<SavedCalculation | null>(
    null,
  );
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
      }
    },
  });

  if (editId && loadingEdit) {
    return (
      <CalculationPlaceholder
        state="loading"
        t={t}
      />
    );
  }

  if (editId && !loadingEdit && !loadedForEdit) {
    return (
      <CalculationPlaceholder
        state="notFound"
        t={t}
        notFoundAction={{
          label: t('goToHome'),
          onClick: () => navigate('/'),
        }}
      />
    );
  }

  return (
    <Page>
      {mainButtonAvailable && <LoanFormMainButton form={form} t={t} />}
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
