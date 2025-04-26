import { z } from 'zod';

export const regularEarlyPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  startMonth: z.string().refine((date) => {
    const paymentDate = new Date(date);
    return !isNaN(paymentDate.getTime());
  }, 'Invalid date format'),
  endMonth: z.string().optional().refine((date) => {
    if (!date) return true;
    const paymentDate = new Date(date);
    return !isNaN(paymentDate.getTime());
  }, 'Invalid date format'),
  type: z.enum(['reduceTerm', 'reducePayment']),
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

export type RegularEarlyPaymentInput = z.infer<typeof regularEarlyPaymentSchema>;
