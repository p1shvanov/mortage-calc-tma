import { PaymentType } from '@/utils/financialMath';
import { EarlyPayment, RegularPayment } from '@/providers/MortgageProvider';

/**
 * Interface for mortgage calculation parameters
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
 * This service is responsible for calculating mortgage payments and generating amortization schedules
 */
export interface IMortgageService {
  /**
   * Calculate mortgage results based on input parameters
   * @param params Mortgage calculation parameters
   * @returns Mortgage calculation results
   */
  calculateMortgage(params: MortgageCalculationParams): Promise<MortgageCalculationResults>;
  
  /**
   * Generate an amortization schedule for a loan
   * @param params Mortgage calculation parameters
   * @returns Amortization schedule results
   */
  generateAmortizationSchedule(params: MortgageCalculationParams): Promise<AmortizationScheduleResults>;
}
