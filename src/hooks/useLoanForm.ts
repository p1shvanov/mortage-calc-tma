import { createFormHook, formOptions, createFormHookContexts } from '@tanstack/react-form';
import { defaultLoanDetails } from '@/types/form';
import { unformatFormValues } from '@/utils/unformatFormValues';
import { useMortgage } from '@/providers/MortgageProvider';
import { useNavigate } from 'react-router-dom';
import { useLocalizedFormSchemas } from '@/schemas/localizedSchemas';

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

export const formOpts = formOptions({
  defaultValues: defaultLoanDetails,
});

export const useLoanForm = () => {
  const { setLoanDetails, setEarlyPayments, setRegularPayments } = useMortgage();
  const navigate = useNavigate();
  const { formSchema } = useLocalizedFormSchemas();
  
  return useAppForm({
    ...formOpts,
  validators: {
    onChange: formSchema,
  },
    onSubmit: async ({ value }) => {
      try {
        const loanDetails = unformatFormValues(value);
        const { earlyPayments, regularPayments, ...rest } = loanDetails;
        setLoanDetails(rest);
        setEarlyPayments(earlyPayments);
        setRegularPayments(regularPayments);
        navigate('result');
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
  });
};
