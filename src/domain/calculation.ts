/**
 * Domain types for mortgage calculation.
 * Single source of truth for calculation data; no UI or infrastructure dependencies.
 */

/** Loan payment type (annuity or differentiated). */
export type PaymentType = 'annuity' | 'differentiated';

/** Core loan parameters (numeric values for calculation). */
export interface LoanDetailsValues {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  startDate: string;
  paymentType: PaymentType;
  paymentDay: number;
}

/** One-time early payment. */
export interface EarlyPayment {
  id: string;
  date: string;
  amount: number;
  type: 'reduceTerm' | 'reducePayment';
}

/** Recurring overpayment. */
export interface RegularPayment {
  id: string;
  amount: number;
  startMonth: string;
  endMonth?: string;
  type: 'reduceTerm' | 'reducePayment';
}

/**
 * Full calculation input — loan + overpayments.
 * Used as form submission payload, storage save/update body, and calculation input.
 */
export interface CalculationData {
  loanDetails: LoanDetailsValues;
  earlyPayments: EarlyPayment[];
  regularPayments: RegularPayment[];
}

/**
 * Stored calculation with metadata.
 * Persisted in storage; id is generated on first save.
 */
export interface SavedCalculation {
  id: string;
  createdAt: string;
  loanDetails: LoanDetailsValues;
  earlyPayments: EarlyPayment[];
  regularPayments: RegularPayment[];
}

/** Alias for backward compatibility and form/storage APIs. */
export type CalculationPayload = CalculationData;

/** Type guard: value has calculation payload shape (for validation / narrowing). */
export function isCalculationData(value: unknown): value is CalculationData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'loanDetails' in value &&
    typeof (value as CalculationData).loanDetails === 'object'
  );
}

/** Type guard for full saved calculation (id + createdAt). */
export function isSavedCalculation(value: unknown): value is SavedCalculation {
  return (
    isCalculationData(value) &&
    'id' in value &&
    typeof (value as SavedCalculation).id === 'string' &&
    'createdAt' in value &&
    typeof (value as SavedCalculation).createdAt === 'string'
  );
}

/**
 * Generates a unique id for a new calculation.
 * Used by storage adapters on first save.
 */
export function generateCalculationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
