import { createFormHook, formOptions, createFormHookContexts } from '@tanstack/react-form';
import type { ZodError } from 'zod';
import { defaultLoanDetails } from '@/types/form';
import type { LoanDetailsType } from '@/types/form';
import type { CalculationData } from '@/domain';
import { unformatFormValues } from '@/utils/unformatFormValues';
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

/** Convert Zod path array to TanStack Form field path (e.g. ['earlyPayments', 0, 'amount'] → 'earlyPayments[0].amount') */
function zodPathToFieldKey(path: (string | number)[]): string {
  if (path.length === 0) return '';
  return path
    .map((segment, i) =>
      typeof segment === 'number' ? `[${segment}]` : i > 0 ? `.${segment}` : segment
    )
    .join('');
}

/** Convert ZodError to TanStack Form global error shape { fields: { [fieldKey]: message } } */
function zodErrorToFormError(error: ZodError): { fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = zodPathToFieldKey(issue.path);
    if (!key || !issue.message) continue;
    if (!fields[key]) fields[key] = issue.message;
  }
  return { fields };
}

export interface UseLoanFormOptions {
  onSubmit?: (payload: CalculationData) => void;
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
      onChange: ({ value }) => {
        const result = formSchema.safeParse(value);
        if (result.success) return undefined;
        return zodErrorToFormError(result.error);
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = unformatFormValues(value);
        options?.onSubmit?.(payload);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
  });
};
