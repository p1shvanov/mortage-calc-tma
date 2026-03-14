import React, { createContext, useContext } from 'react';
import type { CalculationWithResultsValue } from '@/hooks/useCalculationWithResults';

export type MortgageContextType = CalculationWithResultsValue;

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

/**
 * Provides mortgage calculation state to the result page subtree.
 * Only wrap result page content when you have value from useCalculationWithResults(id).
 */
export function MortgageContextProvider({
  value,
  children,
}: {
  value: MortgageContextType;
  children: React.ReactNode;
}) {
  return (
    <MortgageContext.Provider value={value}>
      {children}
    </MortgageContext.Provider>
  );
}

export function useMortgage() {
  const context = useContext(MortgageContext);
  if (!context) {
    throw new Error('useMortgage must be used within a MortgageContextProvider (on the result page)');
  }
  return context;
}
