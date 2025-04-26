import React, { createContext, useContext, useEffect, useState } from 'react';
import { PaymentType } from '@/utils/financialMath';
import { 
  mortgageService, 
  MortgageCalculationResults, 
  AmortizationScheduleResults 
} from '@/services/mortgage';

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
  mortgageResults: MortgageCalculationResults | null;
  amortizationResult: AmortizationScheduleResults | null;
  setMortgageResults: (mortage: MortgageCalculationResults) => void;
  setAmortizationResult: (amortization: AmortizationScheduleResults) => void;
}

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export function MortgageProvider({ children }: { children: React.ReactNode }) {
  const [loanDetails, setLoanDetails] = useState<LoanDetailsValues | null>(null);
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const [regularPayments, setRegularPayments] = useState<RegularPayment[]>([]);
  const [mortgageResults, setMortgageResults] = useState<MortgageCalculationResults | null>(null);
  const [amortizationResult, setAmortizationResult] = useState<AmortizationScheduleResults | null>(null);

  useEffect(() => {
    if (loanDetails) {
      try {
        // Use the mortgage service to calculate mortgage results
        mortgageService.calculateMortgage({
          ...loanDetails,
          earlyPayments,
          regularPayments
        }).then(results => {
          setMortgageResults(results);
        }).catch(error => {
          console.error('Error calculating mortgage results:', error);
        });
      } catch (error) {
        console.error('Error calculating mortgage results:', error);
      }
    }
  }, [loanDetails]);
  
  // Generate amortization schedule when loan details, early payments, or regular payments change
  useEffect(() => {
    if (loanDetails) {
      try {
        // Use the mortgage service to generate amortization schedule
        mortgageService.generateAmortizationSchedule({
          ...loanDetails,
          earlyPayments,
          regularPayments
        }).then(result => {
          setAmortizationResult(result);
        }).catch(error => {
          console.error('Error generating amortization schedule:', error);
        });
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
