# TASK-23: Fix TypeScript Error in Regular Payments Form Validation

## Issue Description

There was a TypeScript error in the form validation for regular payments:

```typescript
Type 'ZodObject<{ loanAmount: ZodEffects<ZodEffects<ZodEffects<ZodEffects<ZodString, number, string>, number, string>, number, string>, number, string>; ... 6 more ...; regularPayments: ZodArray<...>; }, "strip", ZodTypeAny, { ...; }, { ...; }>' is not assignable to type 'FormValidateOrFn<LoanDetailsType> | undefined'.
```

The root cause was a type mismatch between:
- The Zod validation schema (where `endMonth` was optional)
- The TypeScript type definition (where `endMonth` was required)

Specifically, in the error message:
```
Type 'undefined' is not assignable to type 'string'.
```

This indicated that the `endMonth` field in the `RegularPaymentType` was defined as a required string, but the Zod schema allowed it to be undefined.

## Changes Made

### 1. Updated `src/schemas/regularPayment.ts`

Changed the `endMonth` field from optional to required:

```typescript
// Before
endMonth: z.string().optional().refine((date) => {
  if (!date) return true;
  const paymentDate = new Date(date);
  return !isNaN(paymentDate.getTime());
}, 'Invalid date format'),

// After
endMonth: z.string().refine((date) => {
  const paymentDate = new Date(date);
  return !isNaN(paymentDate.getTime());
}, 'Invalid date format'),
```

Also updated the refinement logic that checks if `endMonth` is after `startMonth`:

```typescript
// Before
}).refine((data) => {
  // Check that endMonth is after startMonth, if endMonth is provided
  if (!data.endMonth) return true;
  
  const startDate = new Date(data.startMonth);
  const endDate = new Date(data.endMonth);
  
  return endDate >= startDate;

// After
}).refine((data) => {
  // Check that endMonth is after startMonth
  const startDate = new Date(data.startMonth);
  const endDate = new Date(data.endMonth);
  
  return endDate >= startDate;
```

### 2. Updated `src/components/form/RegularPaymentsForm.tsx`

Modified the "Add Regular Payment" button to initialize new payments with a valid `endMonth` value:

```typescript
// Before
onClick={() =>
  field.pushValue({
    amount: '',
    startMonth: new Date().toISOString().split('T')[0],
    endMonth: '',
    id: Date.now().toString(),
    type: 'reduceTerm',
  })
}

// After
onClick={() => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  
  field.pushValue({
    amount: '',
    startMonth: today.toISOString().split('T')[0],
    endMonth: nextMonth.toISOString().split('T')[0],
    id: Date.now().toString(),
    type: 'reduceTerm',
  });
}}
```

## Result

These changes ensure that:
1. The Zod validation schema matches the TypeScript type definition
2. New regular payments are initialized with valid default values
3. The form validation works correctly without type errors

The fix maintains the data integrity by ensuring that all regular payments have both a start and end date, with the end date defaulting to one month after the start date.
