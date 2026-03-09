import { unformat } from '@react-input/number-format';
import { LoanDetailsType } from '@/types/form';

function parseNum(value: string): number {
  const raw = unformat(String(value ?? '').trim());
  const n = parseFloat(raw);
  return Number.isNaN(n) ? 0 : n;
}

function parsePaymentDay(value: string): number {
  const n = parseInt(String(value ?? '').trim(), 10);
  return Number.isNaN(n) ? 1 : Math.max(1, Math.min(31, n));
}

/**
 * Transforms form values from strings to numbers.
 * Uses unformat so locale-formatted strings (e.g. "18,45" for percent) are parsed correctly.
 */
export function unformatFormValues(values: LoanDetailsType) {
  return {
    loanAmount: parseNum(values.loanAmount),
    interestRate: parseNum(values.interestRate),
    loanTerm: parseNum(values.loanTerm),
    startDate: values.startDate ?? '',
    paymentType: values.paymentType ?? 'annuity',
    paymentDay: parsePaymentDay(values.paymentDay),
    earlyPayments: values.earlyPayments.map((earlyPayment) => ({
      ...earlyPayment,
      amount: parseNum(earlyPayment.amount),
    })),
    regularPayments: values.regularPayments.map((regularPayment) => ({
      ...regularPayment,
      amount: parseNum(regularPayment.amount),
    })),
  };
}
