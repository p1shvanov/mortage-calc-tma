# TASK-24: Adding Localization to Validation Schemas

## Problem

The application had validation schemas with hardcoded English error messages. While the application supported localization for UI elements, the validation error messages were not localized, resulting in an inconsistent user experience.

## Solution

Implemented a comprehensive solution to add localization support to the validation schemas:

### 1. Created a Localized Schema Factory

Created a utility function in `src/validation/createLocalizedSchemas.ts` that generates Zod schemas with localized error messages. This function:
- Takes the translation function and language as parameters
- Creates a custom Zod error map for common validation errors
- Provides factory functions for creating schemas with localized error messages

```typescript
export const createLocalizedSchemas = (t: TranslationFunction, language: SupportedLanguage) => {
  // Create a custom error map for Zod
  const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
    // Use the default error map as fallback
    const defaultError = z.defaultErrorMap(issue, ctx);
    
    // Return localized error messages based on error code
    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        if (issue.expected === 'number') {
          return { message: t('validation.invalidNumber') };
        }
        break;
      // Other cases...
    }
    
    return defaultError;
  };

  // Set the error map for this instance
  z.setErrorMap(customErrorMap);

  // Factory functions for common schema patterns
  return {
    createNumberSchema: (options: { fieldName: string; min?: number; max?: number; }) => {
      // Implementation...
    },
    createDateSchema: (options: { fieldName: string; }) => {
      // Implementation...
    },
    // Other factory functions...
  };
};
```

### 2. Added Translation Keys

Added validation-related translation keys to `src/localization/translations.ts` for both English and Russian languages:

```typescript
validation: {
  mustBeNumber: "{field} must be a number",
  mustBeGreaterThan: "{field} must be greater than {value}",
  mustBeLessThan: "{field} must be less than or equal to {value}",
  invalidDate: "{field} has an invalid date format",
  endDateAfterStart: "{endField} must be after {startField}",
  invalidNumber: "Must be a valid number",
  mustBePositive: "Must be a positive number",
  dayOfMonth: "Day must be between 1 and 31"
}
```

### 3. Created a Hook for Localized Schemas

Created a hook in `src/hooks/useLocalizedSchemas.ts` that provides access to the localized schema factory functions:

```typescript
export const useLocalizedSchemas = () => {
  const { t, language } = useLocalization();
  
  // Create localized schemas using the current language
  const schemas = useMemo(() => {
    return createLocalizedSchemas(t, language);
  }, [t, language]);
  
  return schemas;
};
```

### 4. Implemented Localized Form Schemas

Created a new file `src/schemas/localizedSchemas.ts` that exports localized schemas using the useLocalizedSchemas hook. This includes:
- Loan details schema
- Early payment schema
- Regular payment schema
- Regular early payment schema
- Main form schema

```typescript
export const useLocalizedFormSchemas = () => {
  const schemas = useLocalizedSchemas();
  
  // Loan details schema
  const loanDetailsSchema = z.object({
    loanAmount: schemas.createNumberSchema({
      fieldName: 'loanAmount',
      min: 0,
      max: 1000000000
    }),
    // Other fields...
  });
  
  // Other schemas...
  
  // Main form schema
  const formSchema = z.object({
    loanAmount: loanDetailsSchema.shape.loanAmount,
    // Other fields...
  });
  
  return {
    loanDetailsSchema,
    earlyPaymentSchema,
    regularPaymentSchema,
    regularEarlyPaymentSchema,
    formSchema
  };
};
```

### 5. Updated Form Validation

Updated the `useLoanForm` hook to use the localized schemas:

```typescript
export const useLoanForm = () => {
  const { setLoanDetails, setEarlyPayments, setRegularPayments } = useMortgage();
  const navigate = useNavigate();
  const { formSchema } = useLocalizedFormSchemas();
  
  return useAppForm({
    ...formOpts,
    validators: {
      onChange: formSchema,
    },
    // Rest of the code...
  });
};
```

## How It Works

1. When the form is initialized, it gets the localized schemas based on the current language
2. The schemas use the translation function to display error messages in the user's language
3. When the language changes, the schemas are recreated with the new language
4. Validation errors are now displayed in the user's selected language

## Benefits

1. **Consistent User Experience**: All validation error messages are now properly localized, providing a consistent experience throughout the application.
2. **Maintainability**: Centralized translation keys make it easy to update or add new validation messages.
3. **Flexibility**: The factory pattern allows for easy creation of new schemas with localized error messages.
4. **Reactivity**: Error messages automatically update when the user changes the language.

## Files Changed

1. Created `src/validation/createLocalizedSchemas.ts`
2. Created `src/hooks/useLocalizedSchemas.ts`
3. Created `src/schemas/localizedSchemas.ts`
4. Updated `src/localization/translations.ts`
5. Updated `src/hooks/useLoanForm.ts`
