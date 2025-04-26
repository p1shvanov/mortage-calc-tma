export type EarlyPaymentType = {
  id: string;
  date: string;
  amount: string;
  type: 'reduceTerm' | 'reducePayment';
};

export type LoanDetailsType = {
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  startDate: string;
  paymentType: 'annuity' | 'differentiated';
  paymentDay: string;
  earlyPayments: EarlyPaymentType[];
};

export const defaultLoanDetails: LoanDetailsType = {
  loanAmount: '',
  interestRate: '',
  loanTerm: '',
  startDate: new Date().toISOString().split('T')[0],
  paymentType: 'annuity',
  paymentDay: new Date().getDate().toLocaleString(),
  earlyPayments: [],
};

