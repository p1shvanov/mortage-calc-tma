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
 */
export type PaymentType = 'annuity' | 'differentiated';

/**
 * Calculate monthly payment for a differentiated loan
 * In differentiated payments, the principal portion is fixed, and the interest portion decreases over time
 */
export function calculateDifferentiatedMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termInYears: number,
  paymentNumber: number = 1 // 1-based payment number
): number {
  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = termInYears * 12;
  const fixedPrincipalPortion = principal / numberOfPayments;
  const remainingPrincipal = principal - (fixedPrincipalPortion * (paymentNumber - 1));
  const interestPortion = remainingPrincipal * monthlyRate;
  
  return fixedPrincipalPortion + interestPortion;
}

/**
 * Calculate monthly payment for a loan
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  termInYears: number,
  paymentType: PaymentType = 'annuity',
  paymentNumber: number = 1
): number {
  if (paymentType === 'differentiated') {
    return calculateDifferentiatedMonthlyPayment(principal, annualInterestRate, termInYears, paymentNumber);
  }
  
  // Annuity payment calculation
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

/**
 * Get the last day of a month
 */
export function getLastDayOfMonth(year: number, month: number): number {
  // month is 0-based in JavaScript Date (0 = January, 11 = December)
  // Create a date for the first day of the next month, then subtract one day
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Adjust payment day to handle months with fewer days
 * If the specified day is greater than the number of days in the month,
 * return the last day of the month
 */
export function adjustPaymentDay(date: Date, paymentDay: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = getLastDayOfMonth(year, month);
  
  // If payment day is greater than the last day of the month, use the last day
  const adjustedDay = Math.min(paymentDay, lastDay);
  
  const result = new Date(date);
  result.setDate(adjustedDay);
  return result;
}
