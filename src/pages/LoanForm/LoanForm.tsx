import { FC, memo, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { List, Section, Button } from '@telegram-apps/telegram-ui';
import { mainButton } from '@telegram-apps/sdk-react';

import LoanDetailsForm from '@/components/form/LoanDetailsForm';
import EarlyPaymentsForm from '@/components/form/EarlyPaymentsForm';
import RegularPaymentsForm from '@/components/form/RegularPaymentsForm';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useLoanForm, type CalculationPayload } from '@/hooks/useLoanForm';
import { getCalculationsStorage } from '@/services/storage';
import { payloadToFormValues } from '@/utils/payloadToFormValues';
import { hapticImpact, hapticNotification } from '@/utils/haptic';
import Page from '@/components/Page';

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
      hapticNotification('success');
      const storage = getCalculationsStorage();
      let id = savedId;
      if (id) {
        await storage.update(id, payload).catch(() => {});
      } else {
        const saved = await storage.save(payload).catch(() => null);
        if (saved) id = saved.id;
      }
      navigate('/result', { state: { ...payload, savedId: id ?? undefined } });
    },
  });

  useEffect(() => {
    mainButton.setParams({ text: t('calculate'), isVisible: true, isEnabled: form.state.canSubmit });
    const off = mainButton.onClick(() => {
      hapticImpact('light');
      form.handleSubmit();
    });
    return () => {
      mainButton.setParams({ isVisible: false });
      off();
    };
  }, [t]);

  return (
    <Page>
      <MainButtonSync form={form} />
      <List
        Component='form'
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Section>
          <Button
            size='s'
            mode='plain'
            before={<span style={{ marginRight: 4 }}>←</span>}
            onClick={() => navigate('/')}
          >
            {t('backToHome')}
          </Button>
        </Section>
        <LoanDetailsForm form={form} />
        <EarlyPaymentsForm form={form} />
        <RegularPaymentsForm form={form} />
        <Section>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type='submit'
                stretched
                disabled={!canSubmit}
                loading={isSubmitting}
                onClick={() => hapticImpact('light')}
              >
                {t('calculate')}
              </Button>
            )}
          />
        </Section>
      </List>
    </Page>
  );
};

export default memo(LoanForm);
