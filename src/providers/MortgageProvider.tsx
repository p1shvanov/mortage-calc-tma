import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoanDetailsValues } from '@/components/LoanDetails/LoanDetails';
import { MortgageResults, calculateMortgage } from '@/utils/mortgageCalculator';
import { AmortizationScheduleResult, generateAmortizationSchedule } from '@/utils/amortizationSchedule';

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
}

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export function MortgageProvider({ children }: { children: React.ReactNode }) {
  const [loanDetails, setLoanDetails] = useState<LoanDetailsValues | null>(null);
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const [mortgageResults, setMortgageResults] = useState<MortgageResults | null>(null);
  const [amortizationResult, setAmortizationResult] = useState<AmortizationScheduleResult | null>(null);

  // Calculate mortgage results when loan details change
  useEffect(() => {
    if (loanDetails) {
      try {
        const results = calculateMortgage(loanDetails);
        setMortgageResults(results);
      } catch (error) {
        console.error('Error calculating mortgage results:', error);
      }
    }
  }, [loanDetails]);
  
  // Generate amortization schedule when loan details or early payments change
  useEffect(() => {
    if (loanDetails) {
      try {
        const result = generateAmortizationSchedule({
          loanAmount: loanDetails.loanAmount,
          interestRate: loanDetails.interestRate,
          loanTerm: loanDetails.loanTerm,
          startDate: loanDetails.startDate,
          earlyPayments
        });
        setAmortizationResult(result);
      } catch (error) {
        console.error('Error generating amortization schedule:', error);
      }
    }
  }, [loanDetails, earlyPayments]);

  return (
    <MortgageContext.Provider
      value={{
        loanDetails,
        setLoanDetails,
        earlyPayments,
        setEarlyPayments,
        mortgageResults,
        amortizationResult
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
