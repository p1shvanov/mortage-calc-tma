import { z } from 'zod';

export const earlyPaymentSchema = z.object({
  date: z.string().refine((date) => {
    const paymentDate = new Date(date);
    return !isNaN(paymentDate.getTime());
  }, 'Invalid date format'),
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['reduceTerm', 'reducePayment']),
});

export type EarlyPaymentInput = z.infer<typeof earlyPaymentSchema>; 