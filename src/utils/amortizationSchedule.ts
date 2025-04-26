import {
  calculateInterestForPeriod,
  InterestCalculationMethod,
  PaymentType,
} from './financialMath';

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
  paymentType?: PaymentType; // Preparation for future extension
  paymentDay?: number; // Preparation for future extension - day of monthly payment
  interestCalculationMethod?: InterestCalculationMethod; // Interest calculation method
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
    paymentType: PaymentType; // Payment type
  };
}

/**
 * Generate an amortization schedule for a loan, including early payments
 */
export function generateAmortizationSchedule(
  params: AmortizationScheduleParams
): AmortizationScheduleResult {
  const { 
    loanAmount, 
    interestRate, 
    loanTerm, 
    startDate, 
    earlyPayments = [],
    paymentType = 'annuity', // Default to annuity payments
    interestCalculationMethod = InterestCalculationMethod.ACTUAL_365 // Default to current method
  } = params;
  
  // Total number of payments (years * 12 months)
  const numberOfPayments = loanTerm * 12;
  
  // Calculate original monthly payment based on payment type
  const monthlyRate = interestRate / 100 / 12;
  let originalMonthlyPayment: number;
  
  if (paymentType === 'differentiated') {
    // For differentiated payments, calculate the first payment (which will be the highest)
    const fixedPrincipalPortion = loanAmount / numberOfPayments;
    const firstInterestPortion = loanAmount * monthlyRate;
    originalMonthlyPayment = fixedPrincipalPortion + firstInterestPortion;
  } else {
    // For annuity payments, use the amortization formula
    originalMonthlyPayment = 
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }
  
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
  let originalTotalInterest: number;
  
  if (paymentType === 'differentiated') {
    // For differentiated payments, calculate the sum of all interest payments
    let totalPayments = 0;
    let remainingBalance = loanAmount;
    const fixedPrincipalPortion = loanAmount / numberOfPayments;
    
    for (let i = 0; i < numberOfPayments; i++) {
      const interestPortion = remainingBalance * monthlyRate;
      totalPayments += fixedPrincipalPortion + interestPortion;
      remainingBalance -= fixedPrincipalPortion;
    }
    
    originalTotalInterest = totalPayments - loanAmount;
  } else {
    // For annuity payments, all payments are the same
    originalTotalInterest = (originalMonthlyPayment * numberOfPayments) - loanAmount;
  }
  
  // Track if we've had a reducePayment type early payment
  let hadReducePaymentType = false;
  
  let currentDate = new Date(startDateObj);
  let month = 1;
  let remainingTerm = numberOfPayments; // Track remaining term separately
  
  while (month <= remainingTerm && balance > 0.01) {
  // Calculate payment date based on payment day setting
  const paymentDate = new Date(currentDate);
  paymentDate.setMonth(currentDate.getMonth() + 1);
  
  // If a specific payment day is set, adjust the payment date
  if (params.paymentDay !== undefined) {
    const year = paymentDate.getFullYear();
    const month = paymentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    // If payment day is greater than the last day of the month, use the last day
    const adjustedDay = Math.min(params.paymentDay, lastDay);
    paymentDate.setDate(adjustedDay);
  }
    
    // Calculate interest for this period using the selected calculation method
    const interest = calculateInterestForPeriod(
      balance,
      interestRate,
      currentDate,
      paymentDate,
      interestCalculationMethod
    );
    
    // Calculate principal and payment based on payment type
    let principal: number;
    let payment: number;
    
    if (paymentType === 'differentiated') {
      // For differentiated payments, recalculate the payment for each month
      // The principal portion is fixed, and the interest portion decreases over time
      const numberOfPayments = loanTerm * 12;
      const fixedPrincipalPortion = loanAmount / numberOfPayments;
      principal = fixedPrincipalPortion;
      payment = principal + interest;
      currentMonthlyPayment = payment; // Update for this month
    } else {
      // For annuity payments, the total payment is fixed
      // The principal portion increases over time, and the interest portion decreases
      principal = currentMonthlyPayment - interest;
      payment = currentMonthlyPayment;
    }
    
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
      totalSavings,
      paymentType
    }
  };
}
