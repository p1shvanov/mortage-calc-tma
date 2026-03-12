import { describe, it, expect } from 'vitest';
import { calculateMortgage } from './mortgageCalculator';

describe('calculateMortgage', () => {
  const baseParams = {
    loanAmount: 1_000_000,
    interestRate: 12,
    loanTerm: 10,
    startDate: '2024-01-15',
  };

  it('returns monthly payment, total interest, total cost, payoff date', () => {
    const r = calculateMortgage({ ...baseParams });
    expect(r.monthlyPayment).toBeGreaterThan(0);
    expect(r.totalInterest).toBeGreaterThan(0);
    expect(r.totalCost).toBeCloseTo(baseParams.loanAmount + r.totalInterest, 2);
    expect(r.payoffDate).toMatch(/^2034-01-15$/);
    expect(r.loanTerm).toBe(10);
    expect(r.paymentType).toBe('annuity');
  });

  it('returns effective interest rate', () => {
    const r = calculateMortgage({ ...baseParams });
    expect(r.effectiveInterestRate).toBeDefined();
    expect(r.effectiveInterestRate).toBeGreaterThan(baseParams.interestRate);
  });

  it('annuity: total cost equals loan + total interest', () => {
    const r = calculateMortgage({ ...baseParams, paymentType: 'annuity' });
    expect(r.totalCost).toBeCloseTo(baseParams.loanAmount + r.totalInterest, 2);
  });

  it('differentiated: total interest is less than annuity for same params', () => {
    const ann = calculateMortgage({ ...baseParams, paymentType: 'annuity' });
    const diff = calculateMortgage({ ...baseParams, paymentType: 'differentiated' });
    expect(diff.totalInterest).toBeLessThan(ann.totalInterest);
  });

  it('all monetary values are rounded to 2 decimals', () => {
    const r = calculateMortgage({ ...baseParams });
    const twoDecimals = (x: number) => Math.round(x * 100) / 100 === x;
    expect(twoDecimals(r.monthlyPayment)).toBe(true);
    expect(twoDecimals(r.totalInterest)).toBe(true);
    expect(twoDecimals(r.totalCost)).toBe(true);
  });

  it('returns zero totals for loanAmount <= 0 or loanTerm <= 0', () => {
    const zeroAmount = calculateMortgage({ ...baseParams, loanAmount: 0 });
    expect(zeroAmount.monthlyPayment).toBe(0);
    expect(zeroAmount.totalInterest).toBe(0);
    expect(zeroAmount.totalCost).toBe(0);

    const zeroTerm = calculateMortgage({ ...baseParams, loanTerm: 0 });
    expect(zeroTerm.monthlyPayment).toBe(0);
    expect(zeroTerm.totalInterest).toBe(0);
  });
});
