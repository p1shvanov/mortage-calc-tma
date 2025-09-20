import { FC, memo } from 'react';

import { List, Section, Button } from '@telegram-apps/telegram-ui';

import LoanDetailsForm from '@/components/form/LoanDetailsForm';
import EarlyPaymentsForm from '@/components/form/EarlyPaymentsForm';
import RegularPaymentsForm from '@/components/form/RegularPaymentsForm';

import { useLocalization } from '@/providers/LocalizationProvider';
import { useLoanForm } from '@/hooks/useLoanForm';
import Page from '@/components/Page';

const LoanForm: FC = () => {
  const { t } = useLocalization();
  const form = useLoanForm();

  return (
    <Page back={false}>
      <List
        Component='form'
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
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
