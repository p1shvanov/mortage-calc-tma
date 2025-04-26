export type EarlyPaymentType = {
  id: string;
  date: string;
  amount: string;
  type: 'reduceTerm' | 'reducePayment';
};

export type RegularPaymentType = {
  id: string;
  amount: string;
  startMonth: string; // Month to start regular payments
  endMonth: string;   // Month to end regular payments (optional)
  type: 'reduceTerm' | 'reducePayment'; // Recalculation type
};

export type LoanDetailsType = {
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  startDate: string;
  paymentType: 'annuity' | 'differentiated';
  paymentDay: string;
  earlyPayments: EarlyPaymentType[];
  regularPayments: RegularPaymentType[];
};

export const defaultLoanDetails: LoanDetailsType = {
  loanAmount: '',
  interestRate: '',
  loanTerm: '',
  startDate: new Date().toISOString().split('T')[0],
  paymentType: 'annuity',
  paymentDay: new Date().getDate().toLocaleString(),
  earlyPayments: [],
  regularPayments: [],
};
