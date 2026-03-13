import { unformat } from '@react-input/number-format';
import type { LoanDetailsType } from '@/types/form';
import type { CalculationData } from '@/domain';

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
 * Transforms form values (strings) to domain CalculationData (numbers).
 * Uses unformat so locale-formatted strings (e.g. "18,45" for percent) are parsed correctly.
 */
export function unformatFormValues(values: LoanDetailsType): CalculationData {
  const loanDetails = {
    loanAmount: parseNum(values.loanAmount),
    interestRate: parseNum(values.interestRate),
    loanTerm: parseNum(values.loanTerm),
    startDate: values.startDate ?? '',
    paymentType: values.paymentType ?? 'annuity',
    paymentDay: parsePaymentDay(values.paymentDay),
  };
  const earlyPayments = values.earlyPayments.map((ep) => ({
    id: ep.id,
    date: ep.date ?? '',
    amount: parseNum(ep.amount),
    type: ep.type,
  }));
  const regularPayments = values.regularPayments.map((rp) => ({
    id: rp.id,
    amount: parseNum(rp.amount),
    startMonth: rp.startMonth ?? '',
    endMonth: rp.endMonth,
    type: rp.type,
  }));
  return { loanDetails, earlyPayments, regularPayments };
}
