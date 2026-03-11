import { PaymentType } from '@/utils/financialMath';
import { EarlyPayment, RegularPayment } from '@/providers/MortgageProvider';

/**
 * Interface for mortgage calculation parameters (full: loan + optional overpayments).
 */
export interface MortgageCalculationParams {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  startDate: string;
  paymentType: PaymentType;
  paymentDay: number;
  earlyPayments?: EarlyPayment[];
  regularPayments?: RegularPayment[];
}

/**
 * Parameters for base mortgage calculation (loan only, no overpayments).
 */
export type BaseCalculationParams = Pick<
  MortgageCalculationParams,
  'loanAmount' | 'interestRate' | 'loanTerm' | 'startDate' | 'paymentType' | 'paymentDay'
>;

/**
 * Interface for mortgage calculation results
 */
export interface MortgageCalculationResults {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  loanTerm: number;
  paymentType: PaymentType;
  effectiveInterestRate?: number;
}

/**
 * Interface for amortization schedule item
 */
export interface AmortizationScheduleItem {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  totalInterest: number;
  balance: number;
  extraPayment?: number;
  extraPaymentType?: 'reduceTerm' | 'reducePayment';
  isRegularPayment?: boolean;
  regularPaymentMessage?: string; // Message for regular payments that don't result in early repayment
}

/**
 * Interface for amortization schedule results
 */
export interface AmortizationScheduleResults {
  schedule: AmortizationScheduleItem[];
  summary: {
    originalTerm: number;
    newTerm: number;
    originalTotalInterest: number;
    newTotalInterest: number;
    originalMonthlyPayment: number;
    finalMonthlyPayment: number;
    totalSavings: number;
    paymentType: PaymentType;
  };
}

/**
 * Interface for mortgage service
 * This service is responsible for calculating mortgage payments and generating amortization schedules.
 * Base calculation (loan only) and schedule generation (with optional overpayments) are separate.
 */
export interface IMortgageService {
  /**
   * Base calculation: loan parameters only, no early/regular payments.
   * Use this for the "without overpayments" summary.
   */
  calculateBase(params: BaseCalculationParams): Promise<MortgageCalculationResults>;

  /**
   * Calculate mortgage results based on input parameters.
   * @deprecated Prefer calculateBase for base-only results.
   */
  calculateMortgage(params: MortgageCalculationParams): Promise<MortgageCalculationResults>;

  /**
   * Generate amortization schedule (base if no overpayments, extended if overpayments provided).
   */
  generateAmortizationSchedule(params: MortgageCalculationParams): Promise<AmortizationScheduleResults>;
}
