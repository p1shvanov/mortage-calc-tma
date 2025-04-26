import { z } from 'zod';

// Early payment schema
export const earlyPaymentSchema = z.object({
  id: z.string(),
  date: z.string().refine((date) => {
    const paymentDate = new Date(date);
    return !isNaN(paymentDate.getTime());
  }, 'Invalid date format'),
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['reduceTerm', 'reducePayment']),
});

// Main loan details schema
export const loanDetailsSchema = z.object({
  loanAmount: z.string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), 'Loan amount must be a number')
    .refine((val) => val > 0, 'Loan amount must be greater than 0')
    .refine((val) => val <= 1000000000, 'Loan amount is too large'),

  interestRate: z.string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), 'Interest rate must be a number')
    .refine((val) => val > 0, 'Interest rate must be greater than 0')
    .refine((val) => val <= 100, 'Interest rate cannot exceed 100%'),

  loanTerm: z.string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), 'Loan term must be a number')
    .refine((val) => val > 0, 'Loan term must be greater than 0')
    .refine((val) => val <= 50, 'Loan term cannot exceed 50 years'),

  startDate: z.string()
    .refine((date) => {
      const startDate = new Date(date);
      return !isNaN(startDate.getTime());
    }, 'Invalid start date')
    .refine((date) => {
      const startDate = new Date(date);
      const today = new Date();
      return startDate >= today;
    }, 'Start date cannot be in the past'),

  paymentType: z.enum(['annuity', 'differentiated']),
  
  paymentDay: z.string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), 'Payment day must be a number')
    .refine((val) => val >= 1 && val <= 31, 'Payment day must be between 1 and 31'),

});
