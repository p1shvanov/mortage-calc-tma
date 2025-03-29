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
    month: number;
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
 * Generate an amortization schedule for a loan, including early payments
 */
export function generateAmortizationSchedule(
  params: AmortizationScheduleParams
): AmortizationScheduleResult {
  const { loanAmount, interestRate, loanTerm, startDate, earlyPayments = [] } = params;
  
  // Monthly interest rate (annual rate divided by 12 and converted to decimal)
  const monthlyRate = interestRate / 100 / 12;
  
  // Total number of payments (years * 12 months)
  const numberOfPayments = loanTerm * 12;
  
  // Calculate original monthly payment using the amortization formula
  const originalMonthlyPayment = 
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  // Sort early payments by month
  const sortedEarlyPayments = [...earlyPayments].sort((a, b) => a.month - b.month);
  
  // Generate the amortization schedule
  const schedule: AmortizationScheduleItem[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let currentMonthlyPayment = originalMonthlyPayment;
  let earlyPaymentIndex = 0;
  const startDateObj = new Date(startDate);
  
  // Calculate original total interest (without early payments)
  const originalTotalInterest = (originalMonthlyPayment * numberOfPayments) - loanAmount;
  
  for (let month = 1; month <= numberOfPayments; month++) {
    // Check if there's an early payment for this month
    let extraPayment = 0;
    let extraPaymentType: 'reduceTerm' | 'reducePayment' | undefined;
    
    if (earlyPaymentIndex < sortedEarlyPayments.length && 
        sortedEarlyPayments[earlyPaymentIndex].month === month) {
      const earlyPayment = sortedEarlyPayments[earlyPaymentIndex];
      extraPayment = earlyPayment.amount;
      extraPaymentType = earlyPayment.type;
      earlyPaymentIndex++;
    }
    
    // Calculate interest for this month
    const interest = balance * monthlyRate;
    
    // Calculate principal for this month
    const principal = currentMonthlyPayment - interest;
    
    // Update the balance
    let newBalance = balance - principal;
    
    // Apply extra payment
    if (extraPayment > 0) {
      newBalance -= extraPayment;
      
      // If payment type is to reduce payment, recalculate the monthly payment
      if (extraPaymentType === 'reducePayment' && newBalance > 0) {
        const remainingPayments = numberOfPayments - month;
        
        // Recalculate monthly payment for the remaining term
        currentMonthlyPayment = 
          (newBalance * monthlyRate * Math.pow(1 + monthlyRate, remainingPayments)) / 
          (Math.pow(1 + monthlyRate, remainingPayments) - 1);
      }
    }
    
    // Update total interest
    totalInterest += interest;
    
    // Calculate the date for this payment
    const date = new Date(startDateObj);
    date.setMonth(startDateObj.getMonth() + month - 1);
    
    // Add this month to the schedule
    schedule.push({
      month,
      date: date.toISOString().split('T')[0],
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
    
    // If balance is effectively zero, we're done
    if (balance <= 0.01) {
      break;
    }
  }
  
  // Calculate summary statistics
  const newTerm = schedule.length;
  const newTotalInterest = totalInterest;
  const finalMonthlyPayment = schedule[schedule.length - 1].payment;
  const totalSavings = (originalTotalInterest - newTotalInterest) + 
                       (numberOfPayments - newTerm) * originalMonthlyPayment;
  
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
