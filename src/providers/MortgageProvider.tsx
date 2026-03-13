import React, { createContext, useContext, useEffect, useState } from 'react';
import type { LoanDetailsValues, EarlyPayment, RegularPayment } from '@/domain';
import {
  mortgageService,
  MortgageCalculationResults,
  AmortizationScheduleResults,
} from '@/services/mortgage';

interface MortgageContextType {
  loanDetails: LoanDetailsValues | null;
  setLoanDetails: (values: LoanDetailsValues) => void;
  earlyPayments: EarlyPayment[];
  setEarlyPayments: (payments: EarlyPayment[]) => void;
  regularPayments: RegularPayment[];
  setRegularPayments: (payments: RegularPayment[]) => void;
  mortgageResults: MortgageCalculationResults | null;
  amortizationResult: AmortizationScheduleResults | null;
}

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export function MortgageProvider({ children }: { children: React.ReactNode }) {
  const [loanDetails, setLoanDetails] = useState<LoanDetailsValues | null>(null);
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const [regularPayments, setRegularPayments] = useState<RegularPayment[]>([]);
  const [mortgageResults, setMortgageResults] = useState<MortgageCalculationResults | null>(null);
  const [amortizationResult, setAmortizationResult] = useState<AmortizationScheduleResults | null>(null);

  // Single effect: base summary (loan only) + schedule (loan + overpayments)
  useEffect(() => {
    if (!loanDetails) return;

    mortgageService
      .calculateBase(loanDetails)
      .then(setMortgageResults)
      .catch((err) => console.error('Error calculating mortgage results:', err));

    mortgageService
      .generateAmortizationSchedule({
        ...loanDetails,
        earlyPayments,
        regularPayments,
      })
      .then(setAmortizationResult)
      .catch((err) => console.error('Error generating amortization schedule:', err));
  }, [loanDetails, earlyPayments, regularPayments]);

  return (
    <MortgageContext.Provider
      value={{
        loanDetails,
        setLoanDetails,
        earlyPayments,
        setEarlyPayments,
        regularPayments,
        setRegularPayments,
        mortgageResults,
        amortizationResult,
      }}
    >
      {children}
    </MortgageContext.Provider>
  );
}

export function useMortgage() {
  const context = useContext(MortgageContext);
  if (!context) {
    throw new Error('useMortgage must be used within a MortgageProvider');
  }
  return context;
}
