export interface MortgageParams {
  homeValue: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in years
  startDate: string;
}

export interface MortgageResults {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  payoffDate: string;
}

/**
 * Calculate mortgage results based on input parameters
 */
export function calculateMortgage(params: MortgageParams): MortgageResults {
  console.log('calculateMortgage called with params:', params);
  
  const { loanAmount, interestRate, loanTerm, startDate } = params;
  
  console.log('Destructured values:', { loanAmount, interestRate, loanTerm, startDate });
  
  // Monthly interest rate (annual rate divided by 12 and converted to decimal)
  const monthlyRate = interestRate / 100 / 12;
  
  // Total number of payments (years * 12 months)
  const numberOfPayments = loanTerm * 12;
  
  console.log('Calculated values:', { monthlyRate, numberOfPayments });
  
  // Calculate monthly payment using the amortization formula
  // M = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  // Where:
  // M = monthly payment
  // P = principal (loan amount)
  // r = monthly interest rate (in decimal)
  // n = number of payments
  const monthlyPayment = 
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  // Calculate total cost (monthly payment * number of payments)
  const totalCost = monthlyPayment * numberOfPayments;
  
  // Calculate total interest (total cost - loan amount)
  const totalInterest = totalCost - loanAmount;
  
  // Calculate payoff date
  const payoffDate = calculatePayoffDate(startDate, loanTerm);
  
  const results = {
    monthlyPayment,
    totalInterest,
    totalCost,
    payoffDate
  };
  
  console.log('Calculated results:', results);
  
  return results;
}

/**
 * Calculate the payoff date based on start date and loan term
 */
function calculatePayoffDate(startDate: string, loanTerm: number): string {
  const date = new Date(startDate);
  date.setFullYear(date.getFullYear() + loanTerm);
  return date.toISOString().split('T')[0];
}
