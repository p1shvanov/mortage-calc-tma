import type { LoanDetailsType } from '@/types/form';
import type { CalculationPayload } from '@/hooks/useLoanForm';

/**
 * Ensures a value is a canonical number string for form inputs (dot decimal, no locale).
 * Prevents invalid data when navigating back (e.g. interest rate from payload).
 */
function toCanonicalNumberString(value: number | undefined | null): string {
  if (value == null || Number.isNaN(Number(value))) return '';
  return String(Number(value));
}

/**
 * Converts calculation payload (numbers) to form default values (strings for inputs).
 * Used when opening the calculator from the result page ("Edit parameters") or from history.
 * Uses canonical number strings so InputNumberFormat (including format='percent') always receives valid input.
 */
export function payloadToFormValues(payload: CalculationPayload): LoanDetailsType {
  const { loanDetails, earlyPayments, regularPayments } = payload;
  return {
    loanAmount: toCanonicalNumberString(loanDetails.loanAmount),
    interestRate: toCanonicalNumberString(loanDetails.interestRate),
    loanTerm: toCanonicalNumberString(loanDetails.loanTerm),
    startDate: loanDetails.startDate ?? '',
    paymentType: loanDetails.paymentType,
    paymentDay: loanDetails.paymentDay != null ? String(loanDetails.paymentDay) : '',
    earlyPayments: earlyPayments.map((ep) => ({
      id: ep.id,
      date: ep.date ?? '',
      amount: toCanonicalNumberString(ep.amount),
      type: ep.type,
    })),
    regularPayments: regularPayments.map((rp) => ({
      id: rp.id,
      amount: toCanonicalNumberString(rp.amount),
      startMonth: rp.startMonth ?? '',
      endMonth: rp.endMonth ?? '',
      type: rp.type,
    })),
  };
}
