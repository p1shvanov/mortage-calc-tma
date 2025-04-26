import { calculateMortgage } from '@/utils/mortgageCalculator';
import { generateAmortizationSchedule } from '@/utils/amortizationSchedule';
import { 
  IMortgageService, 
  MortgageCalculationParams, 
  MortgageCalculationResults,
  AmortizationScheduleResults
} from './IMortgageService';

/**
 * Local implementation of the mortgage service
 * This implementation uses the local utility functions for calculations
 */
export class LocalMortgageService implements IMortgageService {
  /**
   * Calculate mortgage results based on input parameters
   * @param params Mortgage calculation parameters
   * @returns Mortgage calculation results
   */
  async calculateMortgage(params: MortgageCalculationParams): Promise<MortgageCalculationResults> {
    // Use the existing utility function
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
