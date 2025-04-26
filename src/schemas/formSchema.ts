import { z } from 'zod';
import { loanDetailsSchema } from './loanDetails';
import { earlyPaymentSchema } from './earlyPayment';
import { regularPaymentSchema } from './regularPayment';

export const formSchema = z.object({
  loanAmount: loanDetailsSchema.shape.loanAmount,
  interestRate: loanDetailsSchema.shape.interestRate,
  loanTerm: loanDetailsSchema.shape.loanTerm,
  startDate: loanDetailsSchema.shape.startDate,
  paymentType: loanDetailsSchema.shape.paymentType,
  paymentDay: loanDetailsSchema.shape.paymentDay,
  earlyPayments: z.array(earlyPaymentSchema.extend({ id: z.string() })),
  regularPayments: z.array(regularPaymentSchema),
});

export type FormSchemaType = z.infer<typeof formSchema>;
