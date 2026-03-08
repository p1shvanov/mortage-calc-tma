import { createFormHook, formOptions, createFormHookContexts } from '@tanstack/react-form';
import { defaultLoanDetails } from '@/types/form';
import type { LoanDetailsType } from '@/types/form';
import { unformatFormValues } from '@/utils/unformatFormValues';
import { useLocalizedFormSchemas } from '@/schemas/localizedSchemas';
import type { LoanDetailsValues, EarlyPayment, RegularPayment } from '@/providers/MortgageProvider';

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

export interface CalculationPayload {
  loanDetails: LoanDetailsValues;
  earlyPayments: EarlyPayment[];
  regularPayments: RegularPayment[];
}

export interface UseLoanFormOptions {
  onSubmit?: (payload: CalculationPayload) => void;
  /** Prefill form when navigating back from result (e.g. "Edit parameters"). */
  defaultValues?: LoanDetailsType;
}

export const useLoanForm = (options?: UseLoanFormOptions) => {
  const { formSchema } = useLocalizedFormSchemas();
  const defaultValues = options?.defaultValues ?? formOpts.defaultValues;

  return useAppForm({
    ...formOpts,
    defaultValues,
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const data = unformatFormValues(value);
        const { earlyPayments, regularPayments, ...loanDetails } = data;
        const payload: CalculationPayload = { loanDetails, earlyPayments, regularPayments };
        options?.onSubmit?.(payload);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
  });
};
