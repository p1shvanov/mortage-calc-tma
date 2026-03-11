import { calculateMortgage } from '@/utils/mortgageCalculator';
import { generateAmortizationSchedule } from '@/utils/amortizationSchedule';
import {
  IMortgageService,
  BaseCalculationParams,
  MortgageCalculationParams,
  MortgageCalculationResults,
  AmortizationScheduleResults
} from './IMortgageService';

/**
 * Local implementation of the mortgage service.
 * Base calculation (loan only) and schedule (with optional overpayments) are separate.
 */
export class LocalMortgageService implements IMortgageService {
  /**
   * Base calculation: loan parameters only. Used for "without overpayments" summary.
   */
  async calculateBase(params: BaseCalculationParams): Promise<MortgageCalculationResults> {
    const result = calculateMortgage({
      loanAmount: params.loanAmount,
      interestRate: params.interestRate,
      loanTerm: params.loanTerm,
      startDate: params.startDate,
      paymentType: params.paymentType,
      paymentDay: params.paymentDay
    });
    return {
      monthlyPayment: result.monthlyPayment,
      totalInterest: result.totalInterest,
      totalCost: result.totalCost,
      payoffDate: result.payoffDate,
      loanTerm: result.loanTerm,
      paymentType: result.paymentType,
      effectiveInterestRate: result.effectiveInterestRate
    };
  }

  /**
   * @deprecated Use calculateBase for base-only results.
   */
  async calculateMortgage(params: MortgageCalculationParams): Promise<MortgageCalculationResults> {
    return this.calculateBase(params);
  }

  /**
   * Generate an amortization schedule for a loan
   * @param params Mortgage calculation parameters
   * @returns Amortization schedule results
   */
  async generateAmortizationSchedule(params: MortgageCalculationParams): Promise<AmortizationScheduleResults> {
    // Use the existing utility function
    const result = generateAmortizationSchedule({
      loanAmount: params.loanAmount,
      interestRate: params.interestRate,
      loanTerm: params.loanTerm,
      startDate: params.startDate,
      paymentType: params.paymentType,
      paymentDay: params.paymentDay,
      earlyPayments: params.earlyPayments || [],
      regularPayments: params.regularPayments || []
    });

    return result as AmortizationScheduleResults;
  }
}
