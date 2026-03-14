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

  // Single effect: base summary (loan only) + schedule (loan + overpayments).
  // Ignore results if inputs change before promises resolve (avoid stale state).
  useEffect(() => {
    if (!loanDetails) return;

    let cancelled = false;

    mortgageService
      .calculateBase(loanDetails)
      .then((results) => {
        if (!cancelled) setMortgageResults(results);
      })
      .catch((err) => {
        if (!cancelled) console.error('Error calculating mortgage results:', err);
      });

    mortgageService
      .generateAmortizationSchedule({
        ...loanDetails,
        earlyPayments,
        regularPayments,
      })
      .then((results) => {
        if (!cancelled) setAmortizationResult(results);
      })
      .catch((err) => {
        if (!cancelled)
          console.error('Error generating amortization schedule:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [loanDetails, earlyPayments, regularPayments]);

  const value = React.useMemo(
    () => ({
      loanDetails,
      setLoanDetails,
      earlyPayments,
      setEarlyPayments,
      regularPayments,
      setRegularPayments,
      mortgageResults,
      amortizationResult,
    }),
    [
      loanDetails,
      earlyPayments,
      regularPayments,
      mortgageResults,
      amortizationResult,
    ]
  );

  return (
    <MortgageContext.Provider value={value}>
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
