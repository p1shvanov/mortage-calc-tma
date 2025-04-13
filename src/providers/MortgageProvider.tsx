import React, { createContext, useContext, useState } from 'react';
import { LoanDetailsValues } from '@/components/LoanDetails';
import { MortgageResults } from '@/utils/mortgageCalculator';
import { AmortizationScheduleResult } from '@/utils/amortizationSchedule';

export interface EarlyPayment {
  id: string;
  month: number;
  amount: number;
  type: 'reduceTerm' | 'reducePayment';
}

interface MortgageContextType {
  loanDetails: LoanDetailsValues | null;
  setLoanDetails: (values: LoanDetailsValues) => void;
  earlyPayments: EarlyPayment[];
  setEarlyPayments: (payments: EarlyPayment[]) => void;
  mortgageResults: MortgageResults | null;
  amortizationResult: AmortizationScheduleResult | null;
  setMortgageResults: (mortage: MortgageResults) => void;
  setAmortizationResult: (amortization: AmortizationScheduleResult) => void;

}

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export function MortgageProvider({ children }: { children: React.ReactNode }) {
  const [loanDetails, setLoanDetails] = useState<LoanDetailsValues | null>(null);
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const [mortgageResults, setMortgageResults] = useState<MortgageResults | null>(null);
  const [amortizationResult, setAmortizationResult] = useState<AmortizationScheduleResult | null>(null);

  return (
    <MortgageContext.Provider
      value={{
        loanDetails,
        setLoanDetails,
        earlyPayments,
        setEarlyPayments,
        mortgageResults,
        amortizationResult,
        setMortgageResults,
        setAmortizationResult

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
