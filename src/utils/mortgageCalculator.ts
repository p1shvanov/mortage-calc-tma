import {
  calculateMonthlyPayment,
  calculatePayoffDate,
  PaymentType,
} from './financialMath';

export interface MortgageParams {
  homeValue: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in years
  startDate: string;
  paymentType?: PaymentType; // Preparation for future extension
  paymentDay?: number; // Preparation for future extension - day of monthly payment
}

export interface MortgageResults {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
  loanTerm: number;
  // Additional fields for future extensions
  effectiveInterestRate?: number; // Effective interest rate
  paymentType: PaymentType;
}

/**
 * Calculate mortgage results based on input parameters
 */
export function calculateMortgage(params: MortgageParams): MortgageResults {
  const { 
    loanAmount, 
    interestRate, 
    loanTerm, 
    startDate,
    paymentType = PaymentType.ANNUITY // Default to annuity payments
  } = params;
  
  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
  
  // Calculate total cost (monthly payment * number of payments)
  const totalCost = monthlyPayment * loanTerm * 12;
  
  // Calculate total interest (total cost - loan amount)
  const totalInterest = totalCost - loanAmount;
  
  // Calculate payoff date
  const payoffDate = calculatePayoffDate(startDate, loanTerm);
  
  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    payoffDate,
    loanTerm,
    paymentType
  };
}
