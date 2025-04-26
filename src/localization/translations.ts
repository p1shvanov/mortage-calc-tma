export const translations = {
  en: {
    // App
    appTitle: "Mortgage Calculator",
    
    // Validation
    validation: {
      mustBeNumber: "{field} must be a number",
      mustBeGreaterThan: "{field} must be greater than {value}",
      mustBeLessThan: "{field} must be less than or equal to {value}",
      invalidDate: "{field} has an invalid date format",
      endDateAfterStart: "{endField} must be after {startField}",
      invalidNumber: "Must be a valid number",
      mustBePositive: "Must be a positive number",
      dayOfMonth: "Day must be between 1 and 31"
    },
    
    // Loan Details
    loanDetails: "Loan Details",
    homeValue: "Home Value",
    downPayment: "Down Payment",
    loanAmount: "Loan Amount",
    interestRate: "Interest Rate",
    loanTerm: "Loan Term (years)",
    startDate: "Start Date",
    paymentType: "Payment Type",
    annuityPayment: "Annuity",
    differentiatedPayment: "Differentiated",
    paymentDay: "Payment Day",
    paymentDayMonthly: "Same day as start date",
    paymentDaySpecific: "Specific day of month",
    
    // Results
    paymentSummary: "Payment Summary",
    monthlyPayment: "Monthly Payment",
    totalInterest: "Total Interest",
    totalCost: "Total Cost",
    planPayoffDate: "Plan Payoff Date",
    actualPayoffDate: 'Actual Payoff Date',
    
    // Early Payment
    earlyPayment: "Early Payment",
    earlyPaymentAmount: "Additional Amount",
    earlyPaymentMonth: "Month of Payment",
    earlyPaymentDate: "Date of Payment",
    earlyPaymentType: "Payment Type",
    typeReduceTerm: "Reduce Term",
    typeReducePayment: "Reduce Payment",
    addEarlyPayment: "Add Early Payment",
    earlyPaymentList: "Scheduled Early Payments",
    remove: "Remove",
    paymentHistory: "Early Payments",
    totalEarlyPayments: "Total Early Payments",
    errorPaymentAmount: "Payment amount must be greater than 0",
    errorPaymentMonth: "Payment month must be within the loan term",
    errorPaymentDate: "Payment date must be within the loan term",
    
    // Regular Payment
    regularPayment: "Regular Payment",
    regularPaymentAmount: "Regular Payment Amount",
    startMonth: "Start Month",
    endMonth: "End Month (Optional)",
    addRegularPayment: "Add Regular Payment",
    yes: "Yes",
    
    // Results with Early Payments
    finalPayment: "Final Payment",
    originalPayment: "Original Payment",
    savings: "Interest Savings",
    monthsSaved: "Months Saved",
    totalSavings: "Total Interest Savings",
    
    // Payment Schedule
    amortization: "Amortization Schedule",
    paymentSchedule: "Payment Schedule",
    month: "Month",
    date: "Date",
    payment: "Payment",
    principal: "Principal",
    interest: "Interest",
    extraPayment: "Extra Payment",
    balance: "Balance",
    previous: "Previous",
    next: "Next",
    showingPayments: "Showing payments {from}-{to} of {total}",
    
    // Charts
    graphicalView: "Graphical View",
    paymentBreakdown: "Payment Breakdown",
    amortizationSchedule: "Amortization Schedule",
    paymentAmount: "Payment Amount",
    paymentDistribution: "Payment Distribution",
    interestSavings: "Interest Savings",
    newTotalInterest: "New Total Interest",
    interestSaved: "Interest Saved",
    monthlyPaymentBreakdown: "Monthly Payment Breakdown",
    totalPaymentBreakdown: "Total Payment Breakdown",
    mortgageComparison: "Mortgage Comparison",
    original: "Original Mortgage",
    withEarlyPayments: "With Early Payments",
    
    // Validation
    errorHomeValue: "Home value must be greater than 0",
    errorDownPayment: "Down payment must be greater than 0",
    errorDownPaymentMax: "Down payment must be less than home value",
    errorInterestRate: "Interest rate must be greater than 0",
    errorLoanTerm: "Loan term must be greater than 0",
    
    // Common
    calculate: "Calculate",
    reset: "Reset",
    years: "years",
    months: "months"
  },
  ru: {
    // App
    appTitle: "Ипотечный калькулятор",
    
    // Validation
    validation: {
      mustBeNumber: "{field} должен быть числом",
      mustBeGreaterThan: "{field} должен быть больше {value}",
      mustBeLessThan: "{field} должен быть меньше или равен {value}",
      invalidDate: "{field} имеет неверный формат даты",
      endDateAfterStart: "{endField} должен быть после {startField}",
      invalidNumber: "Должно быть действительным числом",
      mustBePositive: "Должно быть положительным числом",
      dayOfMonth: "День должен быть между 1 и 31"
    },
    
    // Loan Details
    loanDetails: "Детали кредита",
    homeValue: "Стоимость недвижимости",
    downPayment: "Первоначальный взнос",
    loanAmount: "Сумма кредита",
    interestRate: "Процентная ставка",
    loanTerm: "Срок кредита (лет)",
    startDate: "Дата начала",
    paymentType: "Тип платежа",
    annuityPayment: "Аннуитетный",
    differentiatedPayment: "Дифференцированный",
    paymentDay: "День платежа",
    paymentDayMonthly: "В тот же день, что и дата начала",
    paymentDaySpecific: "Конкретный день месяца",
    
    // Results
    paymentSummary: "Сводка по платежам",
    monthlyPayment: "Ежемесячный платеж",
    totalInterest: "Общий процент",
    totalCost: "Общая стоимость",
    planPayoffDate: "Плановая дата погашения",
    actualPayoffDate: 'Фактическая дата погашения',
    
    // Early Payment
    earlyPayment: "Досрочное погашение",
    earlyPaymentAmount: "Дополнительная сумма",
    earlyPaymentMonth: "Месяц платежа",
    earlyPaymentDate: "Дата платежа",
    earlyPaymentType: "Тип платежа",
    typeReduceTerm: "Сократить срок",
    typeReducePayment: "Уменьшить платеж",
    addEarlyPayment: "Добавить досрочный платеж",
    earlyPaymentList: "Запланированные досрочные платежи",
    remove: "Удалить",
    paymentHistory: "Досрочные платежи",
    totalEarlyPayments: "Всего досрочных платежей",
    errorPaymentAmount: "Сумма платежа должна быть больше 0",
    errorPaymentMonth: "Месяц платежа должен быть в пределах срока кредита",
    errorPaymentDate: "Дата платежа должна быть в пределах срока кредита",
    
    // Regular Payment
    regularPayment: "Регулярный платеж",
    regularPaymentAmount: "Сумма регулярного платежа",
    startMonth: "Месяц начала",
    endMonth: "Месяц окончания (Опционально)",
    addRegularPayment: "Добавить регулярный платеж",
    yes: "Да",
    
    // Results with Early Payments
    finalPayment: "Итоговый платеж",
    originalPayment: "Первоначальный платеж",
    savings: "Экономия на процентах",
    monthsSaved: "Сэкономлено месяцев",
    totalSavings: "Общая экономия на процентах",
    
    // Payment Schedule
    amortization: "График платежей",
    paymentSchedule: "График платежей",
    month: "Месяц",
    date: "Дата",
    payment: "Платеж",
    principal: "Основной долг",
    interest: "Проценты",
    extraPayment: "Досрочный платеж",
    balance: "Остаток",
    previous: "Назад",
    next: "Вперед",
    showingPayments: "Платежи {from}-{to} из {total}",
    
    // Charts
    graphicalView: "Графическое представление",
    paymentBreakdown: "Структура платежа",
    amortizationSchedule: "График погашения",
    paymentAmount: "Сумма платежа",
    paymentDistribution: "Распределение платежей",
    interestSavings: "Экономия на процентах",
    newTotalInterest: "Новая общая сумма процентов",
    interestSaved: "Сэкономленные проценты",
    monthlyPaymentBreakdown: "Ежемесячная структура платежей",
    totalPaymentBreakdown: "Общая структура платежей",
    mortgageComparison: "Сравнение ипотеки",
    original: "Первоначальная ипотека",
    withEarlyPayments: "С досрочными платежами",
    
    // Validation
    errorHomeValue: "Стоимость недвижимости должна быть больше 0",
    errorDownPayment: "Первоначальный взнос должен быть больше 0",
    errorDownPaymentMax: "Первоначальный взнос должен быть меньше стоимости жилья",
    errorInterestRate: "Процентная ставка должна быть больше 0",
    errorLoanTerm: "Срок кредита должен быть больше 0",
    
    // Common
    calculate: "Рассчитать",
    reset: "Сбросить",
    years: "лет",
    months: "месяцев"
  }
};
