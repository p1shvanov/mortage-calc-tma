import {
  calculateMonthlyPayment,
  calculatePayoffDate,
  effectiveAnnualRatePercent,
  PaymentType,
  roundMoney,
} from './financialMath';
import { generateAmortizationSchedule } from './amortizationSchedule';

export interface MortgageParams {
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in years
  startDate: string;
  paymentType?: PaymentType;
  paymentDay?: number;
}

export interface MortgageResults {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  loanTerm: number;
  effectiveInterestRate: number;
  paymentType: PaymentType;
}

/**
 * Calculate mortgage results based on input parameters.
 * Uses the same schedule logic (ACTUAL_365) for total interest/cost so base summary matches the schedule.
 */
export function calculateMortgage(params: MortgageParams): MortgageResults {
  const {
    loanAmount,
    interestRate,
    loanTerm,
    startDate,
    paymentType = 'annuity',
    paymentDay,
  } = params;

  if (loanAmount <= 0 || loanTerm <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalCost: roundMoney(loanAmount),
      payoffDate: startDate,
      loanTerm,
      effectiveInterestRate: interestRate <= 0 ? 0 : effectiveAnnualRatePercent(interestRate),
      paymentType,
    };
  }

  const monthlyPayment = roundMoney(
    calculateMonthlyPayment(loanAmount, interestRate, loanTerm, paymentType)
  );

  // Base totals from schedule (no overpayments) so interest methodology matches the UI schedule
  const scheduleResult = generateAmortizationSchedule({
    loanAmount,
    interestRate,
    loanTerm,
    startDate,
    paymentType,
    paymentDay,
    earlyPayments: [],
    regularPayments: [],
  });

  const totalInterest = scheduleResult.summary.newTotalInterest;
  const totalCost = roundMoney(loanAmount + totalInterest);
  const payoffDate = calculatePayoffDate(startDate, loanTerm);
  const effectiveInterestRate = effectiveAnnualRatePercent(interestRate);

  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    payoffDate,
    loanTerm,
    effectiveInterestRate,
    paymentType,
  };
}
