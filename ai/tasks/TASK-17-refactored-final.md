# TASK-17: Add Payment Types and Payment Day Selection

## Task Description
Add ANNUITY and DIFFERENTIATED payment types and a selector for when the user will pay the mortgage - monthly payment or payment on a specific day of the month (e.g., every 10th or 31st day). If the selected day is greater than the number of days in a month, use the last day of that month.

## Implementation Details

### 1. Payment Types

#### What was implemented:
- Added support for two payment types:
  - **ANNUITY**: Fixed total payment throughout the loan term (principal portion increases over time, interest portion decreases)
  - **DIFFERENTIATED**: Fixed principal portion throughout the loan term (total payment decreases over time as the interest portion decreases)
- Migrated from enum to union type for `PaymentType` for better type safety
- Added a `PAYMENT_TYPE` constant object for type-safe access to payment type values
- Added a dropdown selector in the loan details form to choose between payment types

#### Key files modified:
- `src/utils/financialMath.ts`: 
  - Added `calculateDifferentiatedMonthlyPayment` function
  - Updated `calculateMonthlyPayment` to handle both payment types
  - Changed `PaymentType` from enum to union type
  - Added `PAYMENT_TYPE` constant object

- `src/utils/mortgageCalculator.ts`:
  - Updated to calculate total cost differently for differentiated payments
  - Modified to use the new `PAYMENT_TYPE` constant

- `src/utils/amortizationSchedule.ts`:
  - Updated to calculate original monthly payment and total interest correctly for differentiated payments
  - Modified to handle differentiated payments in the schedule generation
  - Updated to use the new `PAYMENT_TYPE` constant

- `src/components/LoanDetails.tsx`:
  - Added a select field for payment type
  - Updated to use the new `PAYMENT_TYPE` constant
  - Added special handling for payment type changes

- `src/components/ResultsDisplay.tsx`:
  - Added a cell to display the payment type
  - Fixed early payment detection to check for actual early payments in the schedule

- `src/localization/translations.ts`:
  - Added translations for payment type labels

### 2. Payment Day Selection

#### What was implemented:
- Added a dropdown to select any day of the month (1-31) for payments
- Implemented logic to handle months with fewer days (if selected day > days in month, use the last day of that month)
- Updated the amortization schedule generation to adjust payment dates based on the selected day

#### Key files modified:
- `src/utils/financialMath.ts`:
  - Added `getLastDayOfMonth` and `adjustPaymentDay` utility functions

- `src/utils/amortizationSchedule.ts`:
  - Updated to adjust payment dates based on the selected payment day

- `src/components/LoanDetails.tsx`:
  - Added a select field for payment day
  - Initialized with the current day of the month as default

- `src/localization/translations.ts`:
  - Added translations for payment day labels

### 3. Bug Fixes

#### Issues fixed:
- Fixed an issue with changing the payment type by ensuring proper type handling
- Fixed the issue with early payment detection in the results display by checking for actual early payments in the schedule
- Fixed the calculation of original monthly payment and total interest for differentiated payments

## Technical Details

### Annuity vs. Differentiated Payments

#### Annuity Payment Calculation:
```javascript
// Monthly payment remains constant throughout the loan term
monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                 (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
```

#### Differentiated Payment Calculation:
```javascript
// Principal portion remains constant throughout the loan term
fixedPrincipalPortion = principal / numberOfPayments;
// Interest portion decreases as the remaining principal decreases
interestPortion = remainingPrincipal * monthlyRate;
// Total payment decreases over time
monthlyPayment = fixedPrincipalPortion + interestPortion;
```

### Payment Day Handling

When a specific payment day is selected:
1. Calculate the next month's date
2. Get the last day of that month
3. If the selected payment day is greater than the last day of the month, use the last day
4. Set the payment date to the adjusted day

```javascript
// If a specific payment day is set, adjust the payment date
if (paymentDay !== undefined) {
  const year = paymentDate.getFullYear();
  const month = paymentDate.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  // If payment day is greater than the last day of the month, use the last day
  const adjustedDay = Math.min(paymentDay, lastDay);
  paymentDate.setDate(adjustedDay);
}
```

## User Interface

- Added a dropdown to select between ANNUITY and DIFFERENTIATED payment types
- Added a dropdown to select a specific day of the month (1-31) for payments
- Added a cell in the results display to show the selected payment type

## Type System Improvements

- Migrated from enum to union type for `PaymentType`:
```typescript
// Before
export enum PaymentType {
  ANNUITY = 'ANNUITY',
  DIFFERENTIATED = 'DIFFERENTIATED',
}

// After
export type PaymentType = 'ANNUITY' | 'DIFFERENTIATED';

export const PAYMENT_TYPE = {
  ANNUITY: 'ANNUITY' as PaymentType,
  DIFFERENTIATED: 'DIFFERENTIATED' as PaymentType,
};
```

This change improves type safety and makes the code more maintainable.
