import {
  calculateMonthlyPayment,
  calculatePayoffDate,
  PaymentType,
  PAYMENT_TYPE,
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
    paymentType = PAYMENT_TYPE.ANNUITY, // Default to annuity payments
    // paymentDay
  } = params;
  
  // Calculate monthly payment
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm, paymentType);
  
  // Calculate total cost based on payment type
  let totalCost: number;
  
  if (paymentType === PAYMENT_TYPE.DIFFERENTIATED) {
    // For differentiated payments, we need to calculate each payment separately
    // and sum them up, since they decrease over time
    let totalPayments = 0;
    const numberOfPayments = loanTerm * 12;
    
    for (let i = 1; i <= numberOfPayments; i++) {
      totalPayments += calculateMonthlyPayment(loanAmount, interestRate, loanTerm, paymentType, i);
    }
    
    totalCost = totalPayments;
  } else {
    // For annuity payments, all payments are the same
    totalCost = monthlyPayment * loanTerm * 12;
  }
  
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
