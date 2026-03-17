import {
  calculateInterestForPeriod,
  InterestCalculationMethod,
  PaymentType,
  roundMoney,
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
  /** True if this month falls within a recurring overpayment rule (regularPayments) date range */
  inRecurringOverpaymentPeriod?: boolean;
  /** Shown when inRecurringOverpaymentPeriod but no excess over monthly payment (no actual early repayment) */
  regularPaymentMessage?: string;
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
  regularPayments?: Array<{
    id: string;
    amount: number;
    startMonth: string; // Month to start regular payments
    endMonth?: string;  // Month to end regular payments (optional)
    type: 'reduceTerm' | 'reducePayment'; // Recalculation type
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
    regularPayments = [],
    paymentType = 'annuity',
    interestCalculationMethod = InterestCalculationMethod.ACTUAL_365
  } = params;

  if (loanAmount <= 0 || loanTerm <= 0) {
    return {
      schedule: [],
      summary: {
        originalTerm: 0,
        newTerm: 0,
        originalTotalInterest: 0,
        newTotalInterest: 0,
        originalMonthlyPayment: 0,
        finalMonthlyPayment: 0,
        totalSavings: 0,
        paymentType,
      },
    };
  }

  // Total number of payments (years * 12 months)
  const numberOfPayments = Math.max(0, Math.floor(loanTerm * 12));
  if (numberOfPayments === 0) {
    return {
      schedule: [],
      summary: {
        originalTerm: 0,
        newTerm: 0,
        originalTotalInterest: 0,
        newTotalInterest: 0,
        originalMonthlyPayment: 0,
        finalMonthlyPayment: 0,
        totalSavings: 0,
        paymentType,
      },
    };
  }

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
  
  // Map early payments by month (YYYY-MM); keep full list with dates for interest splitting
  const earlyPaymentsByMonth = new Map<string, Array<{ date: string; amount: number; type: 'reduceTerm' | 'reducePayment' }>>();
  earlyPayments.forEach(payment => {
    const d = new Date(payment.date);
    const monthKey = Number.isNaN(d.getTime())
      ? payment.date.slice(0, 7)
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const list = earlyPaymentsByMonth.get(monthKey) ?? [];
    list.push({ date: payment.date, amount: payment.amount, type: payment.type });
    earlyPaymentsByMonth.set(monthKey, list);
  });
  
  // Generate the amortization schedule
  const schedule: AmortizationScheduleItem[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let currentMonthlyPayment = originalMonthlyPayment;
  const startDateObj = new Date(startDate);
  
  // Original total interest: use same ACTUAL_365 schedule when there are overpayments, so totalSavings is consistent
  let originalTotalInterest: number;
  if (earlyPayments.length > 0 || regularPayments.length > 0) {
    const baseResult = generateAmortizationSchedule({
      loanAmount,
      interestRate,
      loanTerm,
      startDate,
      paymentType,
      paymentDay: params.paymentDay,
      interestCalculationMethod,
      earlyPayments: [],
      regularPayments: [],
    });
    originalTotalInterest = baseResult.summary.newTotalInterest;
  } else {
    if (paymentType === 'differentiated') {
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
      originalTotalInterest = (originalMonthlyPayment * numberOfPayments) - loanAmount;
    }
  }
  
  // Track if we've had a reducePayment type early payment
  let hadReducePaymentType = false;
  /** When reducePayment is used, store the recalculated annuity so summary shows it (not the last row which may be a partial payoff). */
  let lastRecalculatedPaymentForReduce = originalMonthlyPayment;

  let currentDate = new Date(startDateObj);
  let month = 1;
  let remainingTerm = numberOfPayments; // Used as hint for reduceTerm; we exit when balance is paid off
  const maxMonths = numberOfPayments + 24; // Safety cap to avoid infinite loop

  while (balance > 0.01 && month <= maxMonths) {
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

    const dateStr = paymentDate.toISOString().split('T')[0];
    const monthKey = dateStr.slice(0, 7);

    // Early payments in this month that fall within (currentDate, paymentDate] for interest splitting
    const listInMonth = earlyPaymentsByMonth.get(monthKey) ?? [];
    const periodStart = new Date(currentDate);
    const periodEnd = new Date(paymentDate);
    const inPeriod = listInMonth
      .map((ep) => ({ ...ep, dateObj: new Date(ep.date) }))
      .filter((ep) => !Number.isNaN(ep.dateObj.getTime()) && ep.dateObj > periodStart && ep.dateObj <= periodEnd)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    let interest: number;
    let extraPayment = 0;
    let extraPaymentType: 'reduceTerm' | 'reducePayment' | undefined;
    /** Balance at payment date (after any in-period early payments); used to cap principal and for reducePayment recalc. */
    let balanceAtPaymentDate = balance;

    if (inPeriod.length === 0) {
      interest = calculateInterestForPeriod(
        balance,
        interestRate,
        currentDate,
        paymentDate,
        interestCalculationMethod
      );
      if (listInMonth.length > 0) {
        extraPayment = listInMonth.reduce((s, ep) => s + ep.amount, 0);
        extraPaymentType = listInMonth[listInMonth.length - 1].type;
      }
    } else {
      // Split period by exact early payment dates: interest before each date on current balance, after on reduced
      interest = 0;
      let segmentStart = new Date(currentDate);
      let runningBalance = balance;
      for (const ep of inPeriod) {
        const segmentEnd = ep.dateObj;
        interest += calculateInterestForPeriod(
          runningBalance,
          interestRate,
          segmentStart,
          segmentEnd,
          interestCalculationMethod
        );
        runningBalance -= ep.amount;
        segmentStart = segmentEnd;
        extraPayment += ep.amount;
        extraPaymentType = ep.type;
      }
      interest += calculateInterestForPeriod(
        runningBalance,
        interestRate,
        segmentStart,
        paymentDate,
        interestCalculationMethod
      );
      balanceAtPaymentDate = runningBalance;
    }
    
    // Calculate principal and payment based on payment type
    let principal: number;
    let payment: number;
    
    if (paymentType === 'differentiated') {
      // For differentiated payments, recalculate the payment for each month
      // The principal portion is fixed, and the interest portion decreases over time (use outer integer numberOfPayments)
      const fixedPrincipalPortion = loanAmount / numberOfPayments;
      principal = fixedPrincipalPortion;
      payment = principal + interest;
      currentMonthlyPayment = payment; // Update for this month
    } else {
      // For annuity payments, the total payment is fixed
      // The principal portion increases over time, and the interest portion decreases
      // Never allow negative principal (e.g. when segmented interest exceeds monthly payment)
      principal = Math.max(0, currentMonthlyPayment - interest);
      payment = principal + interest;
    }

    // Cap principal at balance at payment date (after in-period early payments) so we never overpay
    principal = Math.min(principal, balanceAtPaymentDate);
    // At or past scheduled term, or negligible remainder: close out in this row to avoid extra payments from rounding
    const remainder = balanceAtPaymentDate - principal;
    const isLastPayment =
      balanceAtPaymentDate > 0 &&
      (month >= numberOfPayments || (remainder >= 0 && remainder < 0.02));
    if (isLastPayment) principal = balanceAtPaymentDate;
    payment = principal + interest;

    // Update the balance: apply principal to balance at payment date; one-time extras already reduced balance in-period
    const principalR = isLastPayment ? principal : roundMoney(principal);
    const interestR = roundMoney(interest);
    let newBalance = isLastPayment ? 0 : roundMoney(balanceAtPaymentDate - principalR);

    let inRecurringOverpaymentPeriod = false;

    // Check if this date falls within any recurring overpayment (regularPayments) ranges
    const currentPaymentDate = new Date(dateStr);
    for (const regularPayment of regularPayments) {
      const startMonth = new Date(regularPayment.startMonth);
      const endMonth = regularPayment.endMonth ? new Date(regularPayment.endMonth) : null;
      const isAfterStart = currentPaymentDate >= startMonth;
      const isBeforeEnd = !endMonth || currentPaymentDate <= endMonth;

      if (isAfterStart && isBeforeEnd) {
        const excessAmount = regularPayment.amount - currentMonthlyPayment;
        if (excessAmount > 0) {
          if (extraPayment > 0) {
            extraPayment += excessAmount;
            extraPaymentType = regularPayment.type;
          } else {
            extraPayment = excessAmount;
            extraPaymentType = regularPayment.type;
          }
        }
        inRecurringOverpaymentPeriod = true;
      }
    }
    
    // Apply extra payment (when not already in balanceAtPaymentDate, i.e. when not in-period)
    if (extraPayment > 0) {
      if (inPeriod.length === 0) {
        newBalance = roundMoney(newBalance - extraPayment);
      }
      // else: extra already reflected in balanceAtPaymentDate (runningBalance)
      
      if (newBalance > 0) {
        // If payment type is to reduce payment, recalculate the monthly payment
        // but keep the original term
        if (extraPaymentType === 'reducePayment') {
          const remainingMonths = Math.max(1, numberOfPayments - month);
          // Only recalculate when there is more than one payment left; otherwise we're effectively paying off
          if (remainingMonths > 1) {
            hadReducePaymentType = true;
            remainingTerm = remainingMonths;
            const recalculated =
              (newBalance * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) /
              (Math.pow(1 + monthlyRate, remainingMonths) - 1);
            // Cap to original: "reduce payment" must never show or use a higher payment than original
            const capped = Math.min(recalculated, originalMonthlyPayment);
            currentMonthlyPayment = capped;
            lastRecalculatedPaymentForReduce = capped;
          }
        }
        // If payment type is to reduce term, keep the same monthly payment
        // which will naturally reduce the term as the balance decreases faster
        else if (extraPaymentType === 'reduceTerm') {
          // Keep the current monthly payment the same
          // This will result in paying off the loan faster (reducing the term)
          
          // Estimate the new remaining term based on the new balance and current payment
          // This is an approximation to help with the loop termination condition
          const denominator = currentMonthlyPayment - newBalance * monthlyRate;
          const estimatedRemainingPayments = denominator > 0
            ? Math.ceil(
                Math.log(currentMonthlyPayment / denominator) /
                  Math.log(1 + monthlyRate)
              )
            : 1;
          const safeEstimated = Number.isFinite(estimatedRemainingPayments)
            ? Math.max(1, estimatedRemainingPayments)
            : 1;

          // Update the remaining term (reduce it)
          // If we've had a reducePayment type before, we need to make sure we're using
          // the correct remaining term calculation
          if (hadReducePaymentType) {
            // We've already reduced the payment, now we're reducing the term
            remainingTerm = Math.min(remainingTerm, safeEstimated);
          } else {
            // We're just reducing the term
            remainingTerm = Math.min(remainingTerm, month + safeEstimated);
          }
        }
      }
    }

    newBalance = Math.max(0, newBalance);

    // Update total interest (use rounded interest for consistency with row display)
    totalInterest += interestR;

    // Add this month to the schedule (rounded values for display and consistency)
    const paymentR = roundMoney(payment);
    schedule.push({
      month,
      date: dateStr,
      payment: paymentR,
      principal: principalR,
      interest: interestR,
      totalInterest: roundMoney(totalInterest),
      balance: roundMoney(newBalance),
      extraPayment: extraPayment > 0 ? roundMoney(extraPayment) : undefined,
      extraPaymentType: extraPayment > 0 ? extraPaymentType : undefined,
      inRecurringOverpaymentPeriod: inRecurringOverpaymentPeriod || undefined,
      regularPaymentMessage:
        inRecurringOverpaymentPeriod && extraPayment <= 0
          ? 'The specified total payment is less than the monthly payment amount, so early repayment did not occur.'
          : undefined,
    });

    // Update balance for next iteration
    balance = newBalance;
    
    // Move to next month
    currentDate = paymentDate;
    month++;
  }
  
  // Calculate summary statistics (rounded for consistency)
  const newTerm = schedule.length;
  const newTotalInterestR = roundMoney(totalInterest);
  // For "reduce term" the monthly payment is unchanged; only the last payment can be smaller (final payoff).
  // For "reduce payment" take the payment from the first row after a reducePayment row so the summary matches the chart.
  // (Values in schedule are already capped to original in the loop, so no extra min here.)
  let rawFinal: number;
  if (hadReducePaymentType && schedule.length > 0) {
    const lastReduceIdx = schedule.map((r) => r.extraPaymentType).lastIndexOf('reducePayment');
    rawFinal =
      lastReduceIdx >= 0 && lastReduceIdx + 1 < schedule.length
        ? roundMoney(schedule[lastReduceIdx + 1].payment)
        : roundMoney(lastRecalculatedPaymentForReduce);
  } else {
    rawFinal = roundMoney(originalMonthlyPayment);
  }
  const finalMonthlyPayment = rawFinal;

  const totalSavings = roundMoney(originalTotalInterest - newTotalInterestR);

  return {
    schedule,
    summary: {
      originalTerm: numberOfPayments,
      newTerm,
      originalTotalInterest: roundMoney(originalTotalInterest),
      newTotalInterest: newTotalInterestR,
      originalMonthlyPayment: roundMoney(originalMonthlyPayment),
      finalMonthlyPayment,
      totalSavings,
      paymentType
    }
  };
}
