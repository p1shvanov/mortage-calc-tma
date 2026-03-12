import { describe, it, expect } from 'vitest';
import {
  roundMoney,
  effectiveAnnualRatePercent,
  calculateMonthlyPayment,
  calculateDifferentiatedMonthlyPayment,
  calculateInterestForPeriod,
  calculatePayoffDate,
  daysBetween,
  daysInYear,
  InterestCalculationMethod,
} from './financialMath';

describe('roundMoney', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundMoney(1.234)).toBe(1.23);
    expect(roundMoney(1.235)).toBe(1.24);
    expect(roundMoney(1.2349)).toBe(1.23);
  });

  it('handles integers', () => {
    expect(roundMoney(100)).toBe(100);
  });
});

describe('effectiveAnnualRatePercent', () => {
  it('returns value greater than nominal for 12%', () => {
    const r = effectiveAnnualRatePercent(12);
    expect(r).toBeGreaterThan(12);
    expect(r).toBeLessThan(13);
  });

  it('rounds to 2 decimals', () => {
    const r = effectiveAnnualRatePercent(10);
    expect(Number.isInteger(r * 100)).toBe(true);
  });
});

describe('calculateMonthlyPayment (annuity)', () => {
  it('computes known annuity payment', () => {
    // 100_000, 12% annual, 12 months -> payment ~8862.45
    const p = calculateMonthlyPayment(100_000, 12, 1, 'annuity');
    expect(p).toBeGreaterThan(8800);
    expect(p).toBeLessThan(8900);
  });

  it('total payments equal principal + interest over term', () => {
    const principal = 1_000_000;
    const rate = 10;
    const years = 5;
    const payment = calculateMonthlyPayment(principal, rate, years, 'annuity');
    const total = payment * years * 12;
    const interest = total - principal;
    expect(interest).toBeGreaterThan(0);
    expect(total).toBeGreaterThan(principal);
  });
});

describe('calculateDifferentiatedMonthlyPayment', () => {
  it('first payment is highest', () => {
    const first = calculateDifferentiatedMonthlyPayment(1_000_000, 12, 10, 1);
    const last = calculateDifferentiatedMonthlyPayment(1_000_000, 12, 10, 120);
    expect(first).toBeGreaterThan(last);
  });

  it('principal portion is fixed', () => {
    const n = 60;
    const principal = 600_000;
    const principalPortion = principal / n;
    const pay1 = calculateDifferentiatedMonthlyPayment(principal, 10, 5, 1);
    const pay2 = calculateDifferentiatedMonthlyPayment(principal, 10, 5, 60);
    const interest1 = pay1 - principalPortion;
    const interest2 = pay2 - principalPortion;
    expect(interest1).toBeGreaterThan(interest2);
  });
});

describe('calculateInterestForPeriod', () => {
  it('ACTUAL_365 uses actual days', () => {
    const start = new Date(2024, 0, 1); // Jan 1
    const end = new Date(2024, 1, 1);   // Feb 1 (31 days)
    const interest = calculateInterestForPeriod(
      100_000,
      12,
      start,
      end,
      InterestCalculationMethod.ACTUAL_365
    );
    // 100_000 * 0.12 * (31/365) ≈ 1019.18
    expect(interest).toBeGreaterThan(1000);
    expect(interest).toBeLessThan(1050);
  });
});

describe('calculatePayoffDate', () => {
  it('adds loan term years to start date', () => {
    const start = '2024-06-15';
    const payoff = calculatePayoffDate(start, 5);
    expect(payoff).toMatch(/^2029-06-15$/);
  });
});

describe('daysBetween', () => {
  it('returns positive day count', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 15);
    expect(daysBetween(a, b)).toBe(14);
  });
});

describe('daysInYear', () => {
  it('returns 366 for leap year', () => {
    expect(daysInYear(new Date(2024, 0, 1))).toBe(366);
  });

  it('returns 365 for non-leap year', () => {
    expect(daysInYear(new Date(2023, 0, 1))).toBe(365);
  });
});
