import { describe, it, expect } from 'vitest';
import { generateAmortizationSchedule } from './amortizationSchedule';

describe('generateAmortizationSchedule', () => {
  const baseParams = {
    loanAmount: 100_000,
    interestRate: 12,
    loanTerm: 1,
    startDate: '2024-01-15',
  };

  it('returns schedule with 12 months for 1-year loan', () => {
    const r = generateAmortizationSchedule(baseParams);
    expect(r.schedule).toHaveLength(12);
    expect(r.summary.originalTerm).toBe(12);
    expect(r.summary.newTerm).toBe(12);
  });

  it('20-year loan without early payments yields exactly 240 payments', () => {
    const r = generateAmortizationSchedule({
      loanAmount: 5_400_000,
      interestRate: 18.75,
      loanTerm: 20,
      startDate: new Date().toISOString().slice(0, 10),
    });
    expect(r.schedule).toHaveLength(240);
    expect(r.summary.newTerm).toBe(240);
    const last = r.schedule[r.schedule.length - 1];
    expect(last.balance).toBe(0);
  });

  it('last row has zero balance', () => {
    const r = generateAmortizationSchedule(baseParams);
    const last = r.schedule[r.schedule.length - 1];
    expect(last.balance).toBe(0);
  });

  it('no row has negative principal', () => {
    const r = generateAmortizationSchedule({
      ...baseParams,
      loanAmount: 500_000,
      loanTerm: 20,
      earlyPayments: [
        { id: '1', date: '2025-04-11', amount: 50_000, type: 'reduceTerm' },
      ],
    });
    for (const row of r.schedule) {
      expect(row.principal).toBeGreaterThanOrEqual(0);
    }
  });

  it('no row has principal greater than prior balance (last payment capped)', () => {
    const r = generateAmortizationSchedule({
      ...baseParams,
      loanAmount: 100_000,
      loanTerm: 10,
    });
    let prevBalance = 100_000;
    for (const row of r.schedule) {
      expect(row.principal).toBeLessThanOrEqual(prevBalance);
      prevBalance = row.balance;
    }
    expect(prevBalance).toBe(0);
  });

  it('total interest in summary matches sum of schedule interest (annuity)', () => {
    const r = generateAmortizationSchedule({ ...baseParams, paymentType: 'annuity' });
    const sumInterest = r.schedule.reduce((acc, row) => acc + row.interest, 0);
    expect(r.summary.newTotalInterest).toBeCloseTo(sumInterest, 2);
  });

  it('with early payment: new term is shorter and new total interest is lower', () => {
    const without = generateAmortizationSchedule(baseParams);
    const withEarly = generateAmortizationSchedule({
      ...baseParams,
      earlyPayments: [
        { id: '1', date: '2024-06-15', amount: 10_000, type: 'reduceTerm' },
      ],
    });
    expect(withEarly.summary.newTerm).toBeLessThanOrEqual(without.summary.newTerm);
    expect(withEarly.summary.newTotalInterest).toBeLessThan(without.summary.newTotalInterest);
    expect(withEarly.summary.totalSavings).toBeGreaterThan(0);
  });

  it('all schedule amounts are rounded to 2 decimals', () => {
    const r = generateAmortizationSchedule(baseParams);
    const twoDecimals = (x: number) => Math.round(x * 100) / 100 === x;
    for (const row of r.schedule) {
      expect(twoDecimals(row.payment)).toBe(true);
      expect(twoDecimals(row.principal)).toBe(true);
      expect(twoDecimals(row.interest)).toBe(true);
      expect(twoDecimals(row.balance)).toBe(true);
    }
  });

  it('returns empty schedule for loanAmount <= 0 or loanTerm <= 0', () => {
    const zeroAmount = generateAmortizationSchedule({ ...baseParams, loanAmount: 0 });
    expect(zeroAmount.schedule).toHaveLength(0);
    expect(zeroAmount.summary.newTerm).toBe(0);

    const zeroTerm = generateAmortizationSchedule({ ...baseParams, loanTerm: 0 });
    expect(zeroTerm.schedule).toHaveLength(0);
  });

  it('sums multiple early payments on the same date', () => {
    const r = generateAmortizationSchedule({
      ...baseParams,
      loanTerm: 2,
      earlyPayments: [
        { id: '1', date: '2024-06-15', amount: 5_000, type: 'reduceTerm' },
        { id: '2', date: '2024-06-15', amount: 3_000, type: 'reduceTerm' },
      ],
    });
    const row = r.schedule.find((s) => s.date === '2024-06-15');
    expect(row?.extraPayment).toBe(8_000);
  });
});
