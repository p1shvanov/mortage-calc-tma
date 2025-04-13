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
}

export interface AmortizationScheduleParams {
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in years
  startDate: string;
  earlyPayments?: Array<{
    id: string;
    date: string; // ISO date string format YYYY-MM-DD
    amount: number;
    type: 'reduceTerm' | 'reducePayment';
  }>;
}

export interface AmortizationScheduleResult {
  schedule: AmortizationScheduleItem[];
  summary: {
    originalTerm: number; // in months
    newTerm: number; // in months
    originalTotalInterest: number;
    newTotalInterest: number;
    originalMonthlyPayment: number;
    finalMonthlyPayment: number;
    totalSavings: number;
  };
}

/**
 * Calculate the number of days between two dates
 */
function daysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.round(diffTime / oneDay);
}

/**
 * Calculate the number of days in a year (accounts for leap years)
 */
function daysInYear(date: Date): number {
  const year = date.getFullYear();
  return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
}

/**
 * Generate an amortization schedule for a loan, including early payments
 */
export function generateAmortizationSchedule(
  params: AmortizationScheduleParams
): AmortizationScheduleResult {
  const { loanAmount, interestRate, loanTerm, startDate, earlyPayments = [] } = params;
  
  // We'll calculate the daily rate for each period based on the actual days in that year
  
  // Total number of payments (years * 12 months)
  const numberOfPayments = loanTerm * 12;
  
  // Calculate original monthly payment using the amortization formula
  // Monthly interest rate (annual rate divided by 12 and converted to decimal)
  const monthlyRate = interestRate / 100 / 12;
  const originalMonthlyPayment = 
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  // Map early payments to their corresponding payment dates
  // Sort early payments by date first to ensure they're processed in chronological order
  const sortedEarlyPayments = [...earlyPayments].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const earlyPaymentsByDate = new Map<string, {
    amount: number;
    type: 'reduceTerm' | 'reducePayment';
  }>();
  
  sortedEarlyPayments.forEach(payment => {
    earlyPaymentsByDate.set(payment.date, {
      amount: payment.amount,
      type: payment.type
    });
  });
  
  // Generate the amortization schedule
  const schedule: AmortizationScheduleItem[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let currentMonthlyPayment = originalMonthlyPayment;
  const startDateObj = new Date(startDate);
  
  // Calculate original total interest (without early payments)
  const originalTotalInterest = (originalMonthlyPayment * numberOfPayments) - loanAmount;
  
  // Track if we've had a reducePayment type early payment
  let hadReducePaymentType = false;
  
  let currentDate = new Date(startDateObj);
  let month = 1;
  let remainingTerm = numberOfPayments; // Track remaining term separately
  
  while (month <= remainingTerm && balance > 0.01) {
    // Calculate payment date (same day of month as start date)
    const paymentDate = new Date(currentDate);
    paymentDate.setMonth(currentDate.getMonth() + 1);
    
    // Calculate days in this payment period
    const daysInPeriod = daysBetween(currentDate, paymentDate);
    
    // Calculate interest for this period using daily interest
    // This is more accurate as it accounts for different days in each month
    const yearDays = daysInYear(currentDate);
    const dailyRateForPeriod = interestRate / 100 / yearDays;
    const interest = balance * dailyRateForPeriod * daysInPeriod;
    
    // Calculate principal for this month
    const principal = currentMonthlyPayment - interest;
    
    // Update the balance
    let newBalance = balance - principal;
    
    // Format the date as ISO string (YYYY-MM-DD)
    const dateStr = paymentDate.toISOString().split('T')[0];
    
    // Check if there's an early payment for this date
    let extraPayment = 0;
    let extraPaymentType: 'reduceTerm' | 'reducePayment' | undefined;
    
    if (earlyPaymentsByDate.has(dateStr)) {
      const earlyPayment = earlyPaymentsByDate.get(dateStr)!;
      extraPayment = earlyPayment.amount;
      extraPaymentType = earlyPayment.type;
    }
    
    // Apply extra payment
    if (extraPayment > 0) {
      newBalance -= extraPayment;
      
      if (newBalance > 0) {
        // If payment type is to reduce payment, recalculate the monthly payment
        // but keep the original term
        if (extraPaymentType === 'reducePayment') {
          // Mark that we've had a reducePayment type
          hadReducePaymentType = true;
          
          // For reducePayment, we need to calculate the remaining term from the current month
          const remainingMonths = numberOfPayments - month + 1;
          
          // Update the remaining term
          remainingTerm = remainingMonths;
          
          // Recalculate monthly payment for the remaining term
          currentMonthlyPayment = 
            (newBalance * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) / 
            (Math.pow(1 + monthlyRate, remainingMonths) - 1);
        }
        // If payment type is to reduce term, keep the same monthly payment
        // which will naturally reduce the term as the balance decreases faster
        else if (extraPaymentType === 'reduceTerm') {
          // Keep the current monthly payment the same
          // This will result in paying off the loan faster (reducing the term)
          
          // Estimate the new remaining term based on the new balance and current payment
          // This is an approximation to help with the loop termination condition
          const estimatedRemainingPayments = Math.ceil(
            Math.log(currentMonthlyPayment / (currentMonthlyPayment - newBalance * monthlyRate)) / 
            Math.log(1 + monthlyRate)
          );
          
          // Update the remaining term (reduce it)
          // If we've had a reducePayment type before, we need to make sure we're using
          // the correct remaining term calculation
          if (hadReducePaymentType) {
            // We've already reduced the payment, now we're reducing the term
            remainingTerm = Math.min(remainingTerm, estimatedRemainingPayments);
          } else {
            // We're just reducing the term
            remainingTerm = Math.min(remainingTerm, month + estimatedRemainingPayments);
          }
        }
      }
    }
    
    // Update total interest
    totalInterest += interest;
    
    // Add this month to the schedule
    schedule.push({
      month,
      date: dateStr,
      payment: currentMonthlyPayment,
      principal,
      interest,
      totalInterest,
      balance: Math.max(0, newBalance),
      extraPayment: extraPayment > 0 ? extraPayment : undefined,
      extraPaymentType: extraPayment > 0 ? extraPaymentType : undefined
    });
    
    // Update balance for next iteration
    balance = newBalance;
    
    // Move to next month
    currentDate = paymentDate;
    month++;
  }
  
  // Calculate summary statistics
  const newTerm = schedule.length;
  const newTotalInterest = totalInterest;
  const finalMonthlyPayment = schedule[schedule.length - 1].payment;
  
  // Calculate total savings - this should only include interest savings
  // The true savings is the difference between the total interest that would have been paid
  // without early payments and the total interest actually paid
  const totalSavings = originalTotalInterest - newTotalInterest;
  
  return {
    schedule,
    summary: {
      originalTerm: numberOfPayments,
      newTerm,
      originalTotalInterest,
      newTotalInterest,
      originalMonthlyPayment,
      finalMonthlyPayment,
      totalSavings
    }
  };
}
