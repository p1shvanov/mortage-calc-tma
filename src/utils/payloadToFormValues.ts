import type { LoanDetailsType } from '@/types/form';
import type { CalculationPayload } from '@/hooks/useLoanForm';

/**
 * Converts calculation payload (numbers) to form default values (strings for inputs).
 * Used when opening the calculator from the result page ("Edit parameters") or from history.
 */
export function payloadToFormValues(payload: CalculationPayload): LoanDetailsType {
  const { loanDetails, earlyPayments, regularPayments } = payload;
  return {
    loanAmount: String(loanDetails.loanAmount),
    interestRate: String(loanDetails.interestRate),
    loanTerm: String(loanDetails.loanTerm),
    startDate: loanDetails.startDate,
    paymentType: loanDetails.paymentType,
    paymentDay: String(loanDetails.paymentDay),
    earlyPayments: earlyPayments.map((ep) => ({
      id: ep.id,
      date: ep.date,
      amount: String(ep.amount),
      type: ep.type,
    })),
    regularPayments: regularPayments.map((rp) => ({
      id: rp.id,
      amount: String(rp.amount),
      startMonth: rp.startMonth,
      endMonth: rp.endMonth ?? '',
      type: rp.type,
    })),
  };
}
