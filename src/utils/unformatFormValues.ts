import { unformat } from '@react-input/number-format';
import { LoanDetailsType } from '@/types/form';

/**
 * Transforms form values from strings to numbers
 * @param values Form values with string types
 * @returns Transformed values with number types
 */
export function unformatFormValues(values: LoanDetailsType) {
  return {
    loanAmount: parseFloat(unformat(values.loanAmount)),
    interestRate: parseFloat(unformat(values.interestRate)),
    loanTerm: parseFloat(unformat(values.loanTerm)),
    startDate: values.startDate,
    paymentType: values.paymentType,
    paymentDay: parseInt(values.paymentDay),
    earlyPayments: values.earlyPayments.map((earlyPayment) => ({
      ...earlyPayment,
      amount: parseFloat(unformat(earlyPayment.amount))
    })),
  }
} 