import { useEffect, useRef, useState } from 'react';
import type { LoanDetailsValues, EarlyPayment, RegularPayment } from '@/domain';
import {
  mortgageService,
  MortgageCalculationResults,
  AmortizationScheduleResults,
} from '@/services/mortgage';
import { getCalculationsStorage } from '@/services/storage';

export interface CalculationWithResultsValue {
  loanDetails: LoanDetailsValues | null;
  setLoanDetails: (values: LoanDetailsValues) => void;
  earlyPayments: EarlyPayment[];
  setEarlyPayments: (payments: EarlyPayment[]) => void;
  regularPayments: RegularPayment[];
  setRegularPayments: (payments: RegularPayment[]) => void;
  mortgageResults: MortgageCalculationResults | null;
  amortizationResult: AmortizationScheduleResults | null;
}

export type CalculationWithResultsStatus = 'idle' | 'loading' | 'notFound' | 'ready';

export interface UseCalculationWithResultsResult {
  status: CalculationWithResultsStatus;
  value: CalculationWithResultsValue | null;
}

/**
 * Loads a calculation from storage by id, runs mortgage calculations,
 * and keeps state in sync with storage on updates.
 * Use only on the result page; storage is the source of truth.
 */
export function useCalculationWithResults(id: string | null): UseCalculationWithResultsResult {
  const [loanDetails, setLoanDetails] = useState<LoanDetailsValues | null>(null);
  const [earlyPayments, setEarlyPayments] = useState<EarlyPayment[]>([]);
  const [regularPayments, setRegularPayments] = useState<RegularPayment[]>([]);
  const [mortgageResults, setMortgageResults] = useState<MortgageCalculationResults | null>(null);
  const [amortizationResult, setAmortizationResult] = useState<AmortizationScheduleResults | null>(null);
  const [status, setStatus] = useState<CalculationWithResultsStatus>(id ? 'loading' : 'idle');
  const loadedIdRef = useRef<string | null>(null);

  // Load from storage when id is set
  useEffect(() => {
    if (!id) {
      loadedIdRef.current = null;
      setLoanDetails(null);
      setEarlyPayments([]);
      setRegularPayments([]);
      setMortgageResults(null);
      setAmortizationResult(null);
      setStatus('idle');
      return;
    }

    if (loadedIdRef.current === id) return;
    loadedIdRef.current = id;
    setStatus('loading');

    getCalculationsStorage()
      .getById(id)
      .then((calc) => {
        if (!calc) {
          setStatus('notFound');
          return;
        }
        setLoanDetails(calc.loanDetails);
        setEarlyPayments(calc.earlyPayments ?? []);
        setRegularPayments(calc.regularPayments ?? []);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('notFound');
      });
  }, [id]);

  // Re-run calculations when inputs change (only when we have loanDetails)
  useEffect(() => {
    if (!loanDetails || status !== 'ready') return;

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
  }, [loanDetails, earlyPayments, regularPayments, status]);

  // Persist to storage when calculation data changes
  useEffect(() => {
    if (!id || !loanDetails || status !== 'ready') return;
    getCalculationsStorage()
      .update(id, { loanDetails, earlyPayments, regularPayments })
      .catch(() => {});
  }, [id, loanDetails, earlyPayments, regularPayments, status]);

  if (status === 'idle' || status === 'loading' || status === 'notFound') {
    return { status, value: null };
  }

  const value: CalculationWithResultsValue = {
    loanDetails,
    setLoanDetails,
    earlyPayments,
    setEarlyPayments,
    regularPayments,
    setRegularPayments,
    mortgageResults,
    amortizationResult,
  };

  return { status: 'ready', value };
}
