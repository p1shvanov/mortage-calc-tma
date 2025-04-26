import { z } from 'zod';
import { unformat } from '@react-input/number-format';

export const earlyPaymentSchema = z.object({
  date: z.string().refine((date) => {
    const paymentDate = new Date(date);
    return !isNaN(paymentDate.getTime());
  }, 'Invalid date format'),
  amount: z.string()
    .transform((val) => {
      const unformatted = unformat(val);
      return parseFloat(unformatted);
    })
    .refine((val) => !isNaN(val), 'Amount must be a number')
    .refine((val) => val > 0, 'Amount must be greater than 0'),
  type: z.enum(['reduceTerm', 'reducePayment']),
});

export type EarlyPaymentInput = z.infer<typeof earlyPaymentSchema>;
