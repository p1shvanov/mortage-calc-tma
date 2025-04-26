import { z } from 'zod';
import { useLocalizedSchemas } from '@/hooks/useLocalizedSchemas';

/**
 * Hook that provides localized schemas for form validation
 * @returns Object with localized schemas
 */
export const useLocalizedFormSchemas = () => {
  const schemas = useLocalizedSchemas();
  
  // Loan details schema
  const loanDetailsSchema = z.object({
    loanAmount: schemas.createNumberSchema({
      fieldName: 'loanAmount',
      min: 0,
      max: 1000000000
    }),
    
    interestRate: schemas.createNumberSchema({
      fieldName: 'interestRate',
      min: 0,
      max: 100
    }),
    
    loanTerm: schemas.createNumberSchema({
      fieldName: 'loanTerm',
      min: 0,
      max: 50
    }),
    
    startDate: schemas.createDateSchema({
      fieldName: 'startDate'
    }),
    
    paymentType: z.enum(['annuity', 'differentiated']),
    
    paymentDay: z.string()
      .transform((val) => parseInt(val))
      .refine((val) => !isNaN(val), 'validation.mustBeNumber')
      .refine((val) => val >= 1 && val <= 31, 'validation.dayOfMonth'),
  });
  
  // Early payment schema
  const earlyPaymentSchema = z.object({
    date: schemas.createDateSchema({
      fieldName: 'earlyPaymentDate'
    }),
    
    amount: schemas.createNumberSchema({
      fieldName: 'earlyPaymentAmount',
      min: 0
    }),
    
    type: z.enum(['reduceTerm', 'reducePayment']),
  });
  
  // Regular payment schema
  const regularPaymentSchema = z.object({
    id: z.string(),
    
    amount: schemas.createNumberSchema({
      fieldName: 'regularPaymentAmount',
      min: 0
    }),
    
    startMonth: schemas.createDateSchema({
      fieldName: 'startMonth'
    }),
    
    endMonth: schemas.createDateSchema({
      fieldName: 'endMonth'
    }),
    
    type: z.enum(['reduceTerm', 'reducePayment']),
  }).refine(
    schemas.createDateRangeRefinement({
      startField: 'startMonth',
      endField: 'endMonth'
    }),
    schemas.getDateRangeErrorMessage({
      startField: 'startMonth',
      endField: 'endMonth'
    })
  );
  
  // Regular early payment schema
  const regularEarlyPaymentSchema = z.object({
    amount: schemas.createNumberSchema({
      fieldName: 'regularPaymentAmount',
      min: 0
    }),
    
    startMonth: schemas.createDateSchema({
      fieldName: 'startMonth'
    }),
    
    endMonth: schemas.createDateSchema({
      fieldName: 'endMonth'
    }).optional(),
    
    type: z.enum(['reduceTerm', 'reducePayment']),
  }).refine(
    schemas.createDateRangeRefinement({
      startField: 'startMonth',
      endField: 'endMonth',
      endIsOptional: true
    }),
    schemas.getDateRangeErrorMessage({
      startField: 'startMonth',
      endField: 'endMonth'
    })
  );
  
  // Main form schema
  const formSchema = z.object({
    loanAmount: loanDetailsSchema.shape.loanAmount,
    interestRate: loanDetailsSchema.shape.interestRate,
    loanTerm: loanDetailsSchema.shape.loanTerm,
    startDate: loanDetailsSchema.shape.startDate,
    paymentType: loanDetailsSchema.shape.paymentType,
    paymentDay: loanDetailsSchema.shape.paymentDay,
    earlyPayments: z.array(earlyPaymentSchema.extend({ id: z.string() })),
    regularPayments: z.array(regularPaymentSchema),
  });
  
  return {
    loanDetailsSchema,
    earlyPaymentSchema,
    regularPaymentSchema,
    regularEarlyPaymentSchema,
    formSchema
  };
};

// Types for the validated schemas
export type LocalizedLoanDetailsSchema = ReturnType<typeof useLocalizedFormSchemas>['loanDetailsSchema'];
export type LocalizedEarlyPaymentSchema = ReturnType<typeof useLocalizedFormSchemas>['earlyPaymentSchema'];
export type LocalizedRegularPaymentSchema = ReturnType<typeof useLocalizedFormSchemas>['regularPaymentSchema'];
export type LocalizedRegularEarlyPaymentSchema = ReturnType<typeof useLocalizedFormSchemas>['regularEarlyPaymentSchema'];
export type LocalizedFormSchema = ReturnType<typeof useLocalizedFormSchemas>['formSchema'];

// Type for the validated form data
export type LocalizedFormSchemaType = z.infer<LocalizedFormSchema>;
