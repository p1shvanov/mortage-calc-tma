# TASK-20: Regular Payment Feature Implementation

## Overview

This task involved implementing a regular payment feature for the mortgage calculator. The feature allows users to set up multiple recurring monthly payments with specified amounts, date ranges, and recalculation types (reduce term or reduce payment).

The key concept is: "Set an amount you plan to pay each month. The first part of this payment will go towards the planned loan repayment, and the remaining part will be automatically calculated and directed towards partial early repayment."

## Implementation Details

### Data Structure Changes

1. Added a new `RegularPaymentType` to handle regular payment data:
   ```typescript
   export type RegularPaymentType = {
     id: string;
     amount: string;
     startMonth: string; // Month to start regular payments
     endMonth: string;   // Month to end regular payments (optional)
     type: 'reduceTerm' | 'reducePayment'; // Recalculation type
   };
   ```

2. Updated `LoanDetailsType` to include an array of regular payments:
   ```typescript
   export type LoanDetailsType = {
     // Existing fields...
     regularPayments: RegularPaymentType[];
   };
   ```

3. Created validation schema for regular payments with proper date range validation:
   ```typescript
   export const regularPaymentSchema = z.object({
     // Fields...
   }).refine((data) => {
     // Check that endMonth is after startMonth, if endMonth is provided
     if (!data.endMonth) return true;
     
     const startDate = new Date(data.startMonth);
     const endDate = new Date(data.endMonth);
     
     return endDate >= startDate;
   }, {
     message: 'End month must be after start month',
     path: ['endMonth'],
   });
   ```

### UI Components

1. Created a new `RegularPaymentsForm` component that allows users to:
   - Add multiple regular payments
   - Set amount, start month, end month, and recalculation type for each payment
   - Remove existing regular payments

2. Updated the payment schedule to visually distinguish regular payments:
   - Added background color for rows with regular payments
   - Added an indicator symbol (*) next to regular payment amounts

3. Enhanced chart tooltips to show information about regular payments

### Financial Calculation Logic

1. Updated the amortization schedule generator to handle multiple regular payments:
   ```typescript
   // Process all regular payments
   for (const regularPayment of regularPayments) {
     const startMonth = new Date(regularPayment.startMonth);
     const endMonth = regularPayment.endMonth ? new Date(regularPayment.endMonth) : null;
     
     // Check if the current date is within the regular payment range
     const isAfterStart = currentPaymentDate >= startMonth;
     const isBeforeEnd = !endMonth || currentPaymentDate <= endMonth;
     
     if (isAfterStart && isBeforeEnd) {
       // Apply regular payment logic...
       isRegularPayment = true;
     }
   }
   ```

2. Added logic to handle cases where a regular payment and a one-time early payment occur on the same date:
   - The payment amounts are combined
   - The regular payment type takes precedence

3. Added an `isRegularPayment` flag to the amortization schedule items to track which payments are regular

### Translations

Added translations for all new UI elements in both English and Russian:

```typescript
// Regular Payment
regularPayment: "Regular Payment",
regularPaymentAmount: "Regular Payment Amount",
startMonth: "Start Month",
endMonth: "End Month (Optional)",
addRegularPayment: "Add Regular Payment",
```

## Challenges and Solutions

1. **Challenge**: Handling multiple regular payments that might overlap in date ranges.
   **Solution**: Process all regular payments for each payment date and combine them with any one-time early payments.

2. **Challenge**: Validating date ranges to ensure end month is after start month.
   **Solution**: Added a custom validation rule using Zod's refine method.

3. **Challenge**: Visually distinguishing regular payments in the payment schedule.
   **Solution**: Added styling and indicators to clearly show which payments are regular.

4. **Challenge**: Updating the financial core to handle both one-time and regular payments.
   **Solution**: Modified the amortization schedule generator to process both types of payments while maintaining the correct payment application logic.

## Future Improvements

1. Add the ability to set a specific day of the month for regular payments
2. Implement a summary view showing the total impact of all regular payments
3. Add visualization to show how different regular payment strategies compare
4. Allow importing/exporting regular payment plans
