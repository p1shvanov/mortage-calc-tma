import type { LoanDetailsValues, EarlyPayment, RegularPayment } from '@/providers/MortgageProvider';

/**
 * Saved calculation item — serializable for storage (Telegram Cloud Storage or mock).
 * Results are computed when opening the result page.
 */
export interface SavedCalculation {
  id: string;
  createdAt: string; // ISO date string
  loanDetails: LoanDetailsValues;
  earlyPayments: EarlyPayment[];
  regularPayments: RegularPayment[];
}

export type CalculationPayload = Omit<SavedCalculation, 'id' | 'createdAt'>;
