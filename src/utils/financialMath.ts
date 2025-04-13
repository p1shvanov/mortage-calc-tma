/**
 * Types of interest calculation methods
 * Preparation for future functionality expansion
 */
export enum InterestCalculationMethod {
  ACTUAL_365 = 'ACTUAL_365', // Current method
  THIRTY_360 = 'THIRTY_360',
  ACTUAL_ACTUAL = 'ACTUAL_ACTUAL',
}

/**
 * Types of loan payments
 * Preparation for future functionality expansion
 */
export enum PaymentType {
  ANNUITY = 'ANNUITY', // Annuity payments (current method)
  DIFFERENTIATED = 'DIFFERENTIATED', // Differentiated payments
}

/**
 * Calculate monthly payment for an annuity loan
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termInYears: number
): number {
  // Monthly interest rate (annual rate divided by 12 and converted to decimal)
  const monthlyRate = annualInterestRate / 100 / 12;
  
  // Total number of payments (years * 12 months)
  const numberOfPayments = termInYears * 12;
  
  // Calculate monthly payment using the amortization formula
  // M = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.round(diffTime / oneDay);
}

/**
 * Calculate the number of days in a year (accounts for leap years)
 */
export function daysInYear(date: Date): number {
  const year = date.getFullYear();
  return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
}

/**
 * Calculate interest for a period based on calculation method
 * Currently only ACTUAL_365 is implemented, others are reserved for future
 */
export function calculateInterestForPeriod(
  balance: number,
  annualInterestRate: number,
  startDate: Date,
  endDate: Date,
  method: InterestCalculationMethod = InterestCalculationMethod.ACTUAL_365
): number {
  switch (method) {
    case InterestCalculationMethod.ACTUAL_365:
      const days = daysBetween(startDate, endDate);
      const yearDays = daysInYear(startDate);
      const dailyRate = annualInterestRate / 100 / yearDays;
      return balance * dailyRate * days;
    
    // Reserved for future calculation methods
    case InterestCalculationMethod.THIRTY_360:
    case InterestCalculationMethod.ACTUAL_ACTUAL:
    default:
      // For now, use ACTUAL_365 for all methods
      const fallbackDays = daysBetween(startDate, endDate);
      const fallbackYearDays = daysInYear(startDate);
      const fallbackDailyRate = annualInterestRate / 100 / fallbackYearDays;
      return balance * fallbackDailyRate * fallbackDays;
  }
}

/**
 * Calculate the payoff date based on start date and loan term
 */
export function calculatePayoffDate(startDate: string, loanTermYears: number): string {
  const date = new Date(startDate);
  date.setFullYear(date.getFullYear() + loanTermYears);
  return date.toISOString().split('T')[0];
}
