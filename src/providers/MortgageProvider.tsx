import React, { createContext, useContext, useEffect, useState } from 'react';
import { calculateMortgage, MortgageResults } from '@/utils/mortgageCalculator';
import { AmortizationScheduleResult, generateAmortizationSchedule } from '@/utils/amortizationSchedule';
import { PaymentType } from '@/utils/financialMath';

export interface EarlyPayment {
  id: string;
  date: string; // ISO date string format YYYY-MM-DD
  amount: number;
  type: 'reduceTerm' | 'reducePayment';
}

export interface RegularPayment {
  id: string;
  amount: number;
  startMonth: string; // Month to start regular payments
  endMonth?: string;  // Month to end regular payments (optional)
  type: 'reduceTerm' | 'reducePayment'; // Recalculation type
}

export interface LoanDetailsValues {
  homeValue: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  startDate: string;
  paymentType: PaymentType;
  paymentDay: number;
}

interface MortgageContextType {
  loanDetails: LoanDetailsValues | null;
  setLoanDetails: (values: LoanDetailsValues) => void;
  earlyPayments: EarlyPayment[];
  setEarlyPayments: (payments: EarlyPayment[]) => void;
  regularPayments: RegularPayment[];
  setRegularPayments: (payments: RegularPayment[]) => void;
  mortgageResults: MortgageResults | null;
  amortizationResult: AmortizationScheduleResult | null;
  setMortgageResults: (mortage: MortgageResults) => void;
  setAmortizationResult: (amortization: AmortizationScheduleResult) => void;
}

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export function MortgageProvider({ children }: { children: React.ReactNode }) {
  const [loanDetails, setLoanDetails] = useState<LoanDetailsValues | null>(null);
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const [regularPayments, setRegularPayments] = useState<RegularPayment[]>([]);
  const [mortgageResults, setMortgageResults] = useState<MortgageResults | null>(null);
  const [amortizationResult, setAmortizationResult] = useState<AmortizationScheduleResult | null>(null);

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
  
  // Generate amortization schedule when loan details, early payments, or regular payments change
  useEffect(() => {
    if (loanDetails) {
      try {
        const result = generateAmortizationSchedule({
          loanAmount: loanDetails.loanAmount,
          interestRate: loanDetails.interestRate,
          loanTerm: loanDetails.loanTerm,
          startDate: loanDetails.startDate,
          earlyPayments,
          regularPayments
        });
        setAmortizationResult(result);
      } catch (error) {
        console.error('Error generating amortization schedule:', error);
      }
    }
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
