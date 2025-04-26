import { z } from 'zod';
import { unformat } from '@react-input/number-format';

export const regularPaymentSchema = z.object({
  id: z.string(),
  amount: z.string()
    .transform((val) => {
      const unformatted = unformat(val);
      return parseFloat(unformatted);
    })
    .refine((val) => !isNaN(val), 'Amount must be a number')
    .refine((val) => val > 0, 'Amount must be greater than 0'),
  startMonth: z.string().refine((date) => {
    const paymentDate = new Date(date);
    return !isNaN(paymentDate.getTime());
  }, 'Invalid date format'),
  endMonth: z.string().refine((date) => {
    const paymentDate = new Date(date);
    return !isNaN(paymentDate.getTime());
  }, 'Invalid date format'),
  type: z.enum(['reduceTerm', 'reducePayment']),
}).refine((data) => {
  // Check that endMonth is after startMonth
  const startDate = new Date(data.startMonth);
  const endDate = new Date(data.endMonth);
  
  return endDate >= startDate;
}, {
  message: 'End month must be after start month',
  path: ['endMonth'],
});

export type RegularPaymentInput = z.infer<typeof regularPaymentSchema>;
