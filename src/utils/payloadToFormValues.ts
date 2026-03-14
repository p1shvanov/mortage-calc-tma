import type { LoanDetailsType } from '@/types/form';
import type { CalculationData } from '@/domain';
import type { SupportedLanguage } from '@/localization/locales';
import { isCommaDecimalLocale } from '@/localization/locales';

export type FormValuesLocale = SupportedLanguage;

/**
 * Number string for form inputs using the correct decimal separator for the locale.
 * Percent and number inputs (e.g. @react-input/number-format with format='percent') expect
 * the value to match the locale (comma for many EU locales, dot for en/zh).
 */
function toLocalizedNumberString(
  value: number | undefined | null,
  locale: FormValuesLocale
): string {
  if (value == null || Number.isNaN(Number(value))) return '';
  const s = String(Number(value));
  return isCommaDecimalLocale(locale) ? s.replace('.', ',') : s;
}

/**
 * Converts calculation data (numbers) to form default values (strings for inputs).
 * Used when opening the calculator from the result page ("Edit parameters") or from history.
 * Pass locale so percent/number inputs get the correct decimal separator (e.g. 18,75 for ru).
 */
export function payloadToFormValues(
  payload: CalculationData,
  locale: FormValuesLocale = 'en'
): LoanDetailsType {
  const { loanDetails, earlyPayments, regularPayments } = payload;
  const paymentDay =
    loanDetails.paymentDay != null &&
    loanDetails.paymentDay >= 1 &&
    loanDetails.paymentDay <= 31
      ? String(loanDetails.paymentDay)
      : String(new Date().getDate() || 1);

  return {
    loanAmount: toLocalizedNumberString(loanDetails.loanAmount, locale),
    interestRate: toLocalizedNumberString(loanDetails.interestRate, locale),
    loanTerm: toLocalizedNumberString(loanDetails.loanTerm, locale),
    startDate: loanDetails.startDate ?? '',
    paymentType: loanDetails.paymentType,
    paymentDay,
    earlyPayments: earlyPayments.map((ep) => ({
      id: ep.id,
      date: ep.date ?? '',
      amount: toLocalizedNumberString(ep.amount, locale),
      type: ep.type,
    })),
    regularPayments: regularPayments.map((rp) => ({
      id: rp.id,
      amount: toLocalizedNumberString(rp.amount, locale),
      startMonth: rp.startMonth ?? '',
      endMonth: rp.endMonth ?? '',
      type: rp.type,
    })),
  };
}
