import { describe, it, expect } from 'vitest';
import {
  generateAmortizationSchedule,
  type AmortizationScheduleParams,
} from './amortizationSchedule';
import { calculateMortgage } from './mortgageCalculator';

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

  // --- Invariants: calculation accuracy ---

  it('sum of principal over schedule equals loan amount (no early payments)', () => {
    const r = generateAmortizationSchedule(baseParams);
    const sumPrincipal = r.schedule.reduce((acc, row) => acc + row.principal, 0);
    expect(sumPrincipal).toBeCloseTo(baseParams.loanAmount, 2);
  });

  it('annuity without early payments: total cost = loan + total interest', () => {
    const r = generateAmortizationSchedule(baseParams);
    const totalPayments = r.schedule.reduce((acc, row) => acc + row.payment, 0);
    expect(totalPayments).toBeCloseTo(
      baseParams.loanAmount + r.summary.newTotalInterest,
      1
    );
  });

  it('differentiated payment: sum of principal equals loan amount', () => {
    const params = {
      loanAmount: 1_500_000,
      interestRate: 14,
      loanTerm: 8,
      startDate: '2024-01-15',
      paymentType: 'differentiated' as const,
    };
    const r = generateAmortizationSchedule(params);
    const sumPrincipal = r.schedule.reduce((acc, row) => acc + row.principal, 0);
    expect(sumPrincipal).toBeCloseTo(params.loanAmount, 2);
    expect(r.schedule[r.schedule.length - 1].balance).toBe(0);
  });

  it('sum of principal + extra payments equals loan amount (with early payments)', () => {
    const params = {
      loanAmount: 3_000_000,
      interestRate: 15,
      loanTerm: 10,
      startDate: '2024-01-14',
      earlyPayments: [
        { id: '1', date: '2025-03-10', amount: 200_000, type: 'reduceTerm' as const },
        { id: '2', date: '2026-06-20', amount: 150_000, type: 'reducePayment' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    const sumPrincipal = r.schedule.reduce((acc, row) => acc + row.principal, 0);
    const sumExtra = r.schedule.reduce((acc, row) => acc + (row.extraPayment ?? 0), 0);
    expect(sumPrincipal + sumExtra).toBeCloseTo(params.loanAmount, 2);
  });

  it('total paid (payment + extra) equals loan + total interest (within rounding)', () => {
    const params = {
      loanAmount: 2_000_000,
      interestRate: 12,
      loanTerm: 15,
      startDate: '2024-01-15',
      earlyPayments: [
        { id: '1', date: '2025-01-15', amount: 100_000, type: 'reduceTerm' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    const totalPaid = r.schedule.reduce(
      (acc, row) => acc + row.payment + (row.extraPayment ?? 0),
      0
    );
    const totalPrincipalPaid =
      r.schedule.reduce((acc, row) => acc + row.principal, 0) +
      r.schedule.reduce((acc, row) => acc + (row.extraPayment ?? 0), 0);
    const totalInterest = r.schedule.reduce((acc, row) => acc + row.interest, 0);
    expect(totalPaid).toBeCloseTo(totalPrincipalPaid + totalInterest, 0);
    expect(totalPrincipalPaid).toBeCloseTo(params.loanAmount, 2);
    expect(r.summary.newTotalInterest).toBeCloseTo(totalInterest, 2);
  });

  it('reduce term only: final monthly payment equals original (unchanged)', () => {
    const params = {
      loanAmount: 5_000_000,
      interestRate: 18,
      loanTerm: 20,
      startDate: '2024-01-14',
      earlyPayments: [
        { id: '1', date: '2029-03-14', amount: 1_000_000, type: 'reduceTerm' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    expect(r.summary.finalMonthlyPayment).toBe(r.summary.originalMonthlyPayment);
    expect(r.summary.newTerm).toBeLessThan(r.summary.originalTerm);
  });

  it('reduce term only: regular rows have payment equal to original (except last)', () => {
    const params = {
      loanAmount: 500_000,
      interestRate: 12,
      loanTerm: 5,
      startDate: '2024-01-15',
      earlyPayments: [
        { id: '1', date: '2025-06-15', amount: 50_000, type: 'reduceTerm' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    const original = r.summary.originalMonthlyPayment;
    const lastIndex = r.schedule.length - 1;
    r.schedule.forEach((row, i) => {
      if (i < lastIndex) {
        expect(row.payment).toBeCloseTo(original, 2);
      }
    });
  });

  it('reduce payment only: term stays same as original (same number of payments)', () => {
    const params = {
      loanAmount: 2_000_000,
      interestRate: 14,
      loanTerm: 10,
      startDate: '2024-01-15',
      earlyPayments: [
        { id: '1', date: '2025-07-15', amount: 300_000, type: 'reducePayment' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    expect(r.schedule.length).toBe(r.summary.originalTerm);
    expect(r.summary.finalMonthlyPayment).toBeLessThan(r.summary.originalMonthlyPayment);
    expect(r.summary.newTerm).toBe(r.summary.originalTerm);
  });

  it('reduce payment only: after early payment month, payment is lower and constant (except last)', () => {
    const params = {
      loanAmount: 1_000_000,
      interestRate: 12,
      loanTerm: 10,
      startDate: '2024-01-15',
      earlyPayments: [
        { id: '1', date: '2024-12-15', amount: 100_000, type: 'reducePayment' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    const rowWithExtra = r.schedule.find((s) => s.extraPayment != null && s.extraPayment > 0);
    expect(rowWithExtra).toBeDefined();
    const monthIndex = rowWithExtra!.month - 1;
    const firstNewPayment = r.schedule[monthIndex + 1].payment;
    const lastIndex = r.schedule.length - 1;
    for (let i = monthIndex + 1; i < lastIndex; i++) {
      expect(r.schedule[i].payment).toBeCloseTo(firstNewPayment, 2);
    }
    expect(firstNewPayment).toBeLessThan(r.summary.originalMonthlyPayment);
  });

  it('chain of reduce term early payments: term shortens, payment unchanged', () => {
    const params = {
      loanAmount: 4_000_000,
      interestRate: 16,
      loanTerm: 15,
      startDate: '2024-01-14',
      earlyPayments: [
        { id: '1', date: '2026-04-14', amount: 200_000, type: 'reduceTerm' as const },
        { id: '2', date: '2028-08-14', amount: 200_000, type: 'reduceTerm' as const },
        { id: '3', date: '2030-01-14', amount: 150_000, type: 'reduceTerm' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    expect(r.summary.finalMonthlyPayment).toBe(r.summary.originalMonthlyPayment);
    expect(r.summary.newTerm).toBeLessThan(r.summary.originalTerm);
    const sumPrincipal = r.schedule.reduce((acc, row) => acc + row.principal, 0);
    const sumExtra = r.schedule.reduce((acc, row) => acc + (row.extraPayment ?? 0), 0);
    expect(sumPrincipal + sumExtra).toBeCloseTo(params.loanAmount, 2);
  });

  it('reduce term then reduce payment: payment drops after second, term shorter than original', () => {
    const params = {
      loanAmount: 3_000_000,
      interestRate: 14,
      loanTerm: 20,
      startDate: '2024-01-15',
      earlyPayments: [
        { id: '1', date: '2026-06-15', amount: 250_000, type: 'reduceTerm' as const },
        { id: '2', date: '2028-06-15', amount: 200_000, type: 'reducePayment' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    expect(r.summary.finalMonthlyPayment).toBeLessThan(r.summary.originalMonthlyPayment);
    expect(r.summary.newTerm).toBeLessThanOrEqual(r.summary.originalTerm);
    const sumPrincipal = r.schedule.reduce((acc, row) => acc + row.principal, 0);
    const sumExtra = r.schedule.reduce((acc, row) => acc + (row.extraPayment ?? 0), 0);
    expect(sumPrincipal + sumExtra).toBeCloseTo(params.loanAmount, 2);
  });

  it('reduce payment then reduce term: payment drops then stays, term shortens', () => {
    const params = {
      loanAmount: 2_500_000,
      interestRate: 15,
      loanTerm: 15,
      startDate: '2024-01-15',
      earlyPayments: [
        { id: '1', date: '2025-09-15', amount: 300_000, type: 'reducePayment' as const },
        { id: '2', date: '2028-03-15', amount: 200_000, type: 'reduceTerm' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    expect(r.summary.finalMonthlyPayment).toBeLessThan(r.summary.originalMonthlyPayment);
    const sumPrincipal = r.schedule.reduce((acc, row) => acc + row.principal, 0);
    const sumExtra = r.schedule.reduce((acc, row) => acc + (row.extraPayment ?? 0), 0);
    expect(sumPrincipal + sumExtra).toBeCloseTo(params.loanAmount, 2);
  });

  it('same period two early payments on different dates: interest split by dates', () => {
    // startDate 2024-01-20 gives payment dates 02-20, 03-20, 04-20. Row 04-20 has period (03-20, 04-20], so 04-10 and 04-20 are inside.
    const params = {
      loanAmount: 1_000_000,
      interestRate: 12,
      loanTerm: 5,
      startDate: '2024-01-20',
      earlyPayments: [
        { id: '1', date: '2024-04-10', amount: 30_000, type: 'reduceTerm' as const },
        { id: '2', date: '2024-04-20', amount: 20_000, type: 'reduceTerm' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    const row = r.schedule.find((s) => s.date === '2024-04-20');
    expect(row).toBeDefined();
    expect(row!.extraPayment).toBe(50_000);
    const sumPrincipal = r.schedule.reduce((acc, row) => acc + row.principal, 0);
    const sumExtra = r.schedule.reduce((acc, row) => acc + (row.extraPayment ?? 0), 0);
    expect(sumPrincipal + sumExtra).toBeCloseTo(params.loanAmount, 2);
  });

  describe('reference / golden (замороженные эталоны для верификации)', () => {
    it('базовый сценарий: 100k, 12%, 1 год — сводка совпадает с эталоном', () => {
      const r = generateAmortizationSchedule(baseParams);
      expect(r.summary).toMatchSnapshot();
    });

    it('сценарий с досрочным погашением «сократить срок»: сводка совпадает с эталоном', () => {
      const params = {
        loanAmount: 500_000,
        interestRate: 12,
        loanTerm: 5,
        startDate: '2024-01-15',
        earlyPayments: [
          { id: '1', date: '2025-06-15', amount: 50_000, type: 'reduceTerm' as const },
        ],
      } satisfies AmortizationScheduleParams;
      const r = generateAmortizationSchedule(params);
      expect(r.summary).toMatchSnapshot();
    });
  });

  it('large single reduce term: schedule ends with zero balance and correct totals', () => {
    const params = {
      loanAmount: 10_000_000,
      interestRate: 18.75,
      loanTerm: 20,
      startDate: '2024-01-14',
      earlyPayments: [
        { id: '1', date: '2029-03-14', amount: 5_000_000, type: 'reduceTerm' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    expect(r.schedule[r.schedule.length - 1].balance).toBe(0);
    const sumPrincipal = r.schedule.reduce((acc, row) => acc + row.principal, 0);
    const sumExtra = r.schedule.reduce((acc, row) => acc + (row.extraPayment ?? 0), 0);
    expect(sumPrincipal + sumExtra).toBeCloseTo(params.loanAmount, 2);
    expect(r.summary.newTerm).toBeLessThan(r.summary.originalTerm);
    expect(r.summary.totalSavings).toBeGreaterThan(0);
  });

  it('reduce payment: final monthly payment must never exceed original (sanity)', () => {
    const params = {
      loanAmount: 5_400_000,
      interestRate: 18.75,
      loanTerm: 20,
      startDate: '2024-01-14',
      earlyPayments: [
        { id: '1', date: '2024-02-15', amount: 500_000, type: 'reducePayment' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    expect(r.summary.finalMonthlyPayment).toBeLessThanOrEqual(r.summary.originalMonthlyPayment);
    expect(r.summary.newTerm).toBeLessThanOrEqual(r.summary.originalTerm);
  });

  it('reduce payment in last month (remainingMonths=1): does not recalc to avoid wrong increase', () => {
    const params = {
      loanAmount: 100_000,
      interestRate: 12,
      loanTerm: 1,
      startDate: '2024-01-15',
      earlyPayments: [
        { id: '1', date: '2024-12-10', amount: 10_000, type: 'reducePayment' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    expect(r.summary.finalMonthlyPayment).toBeLessThanOrEqual(r.summary.originalMonthlyPayment);
  });

  it('user scenario: 5.4M, 18.75%, 20y, 1M early on 14.03.2028 reducePayment — payment must decrease', () => {
    const params = {
      loanAmount: 5_400_000,
      interestRate: 18.75,
      loanTerm: 20,
      startDate: '2026-03-14',
      earlyPayments: [
        { id: '1', date: '2028-03-14', amount: 1_000_000, type: 'reducePayment' as const },
      ],
    } satisfies AmortizationScheduleParams;
    const r = generateAmortizationSchedule(params);
    expect(r.summary.originalMonthlyPayment).toBeCloseTo(86_468, 0);
    expect(r.summary.finalMonthlyPayment).toBeLessThan(r.summary.originalMonthlyPayment);
    expect(r.summary.finalMonthlyPayment).toBeLessThanOrEqual(86_468);
  });

  describe('data flow consistency (base calc ↔ schedule ↔ summary ↔ UI)', () => {
    const loanOnly = {
      loanAmount: 2_000_000,
      interestRate: 14,
      loanTerm: 10,
      startDate: '2024-01-15',
    };

    it('base mortgage monthlyPayment equals schedule originalMonthlyPayment when no early payments', () => {
      const base = calculateMortgage(loanOnly);
      const schedule = generateAmortizationSchedule(loanOnly);
      expect(schedule.summary.originalMonthlyPayment).toBeCloseTo(base.monthlyPayment, 2);
    });

    it('base mortgage totalInterest equals schedule newTotalInterest when no early payments', () => {
      const base = calculateMortgage(loanOnly);
      const schedule = generateAmortizationSchedule(loanOnly);
      expect(schedule.summary.newTotalInterest).toBeCloseTo(base.totalInterest, 2);
    });

    it('summary newTotalInterest equals sum of schedule row interest', () => {
      const params = {
        ...loanOnly,
        earlyPayments: [
          { id: '1', date: '2026-06-15', amount: 200_000, type: 'reducePayment' as const },
        ],
      } satisfies AmortizationScheduleParams;
      const r = generateAmortizationSchedule(params);
      const sumInterest = r.schedule.reduce((acc, row) => acc + row.interest, 0);
      expect(r.summary.newTotalInterest).toBeCloseTo(sumInterest, 2);
    });

    it('totalPayout (sum payment+extra) equals loanAmount + newTotalInterest', () => {
      const params = {
        ...loanOnly,
        earlyPayments: [
          { id: '1', date: '2025-03-10', amount: 100_000, type: 'reduceTerm' as const },
        ],
      } satisfies AmortizationScheduleParams;
      const r = generateAmortizationSchedule(params);
      const totalPayout = r.schedule.reduce(
        (acc, row) => acc + row.payment + (row.extraPayment ?? 0),
        0
      );
      expect(totalPayout).toBeCloseTo(params.loanAmount + r.summary.newTotalInterest, 0);
    });

    it('finalMonthlyPayment equals payment in row after last reducePayment row (chart = summary)', () => {
      const params = {
        loanAmount: 1_500_000,
        interestRate: 12,
        loanTerm: 8,
        startDate: '2024-01-15',
        earlyPayments: [
          { id: '1', date: '2025-06-15', amount: 150_000, type: 'reducePayment' as const },
        ],
      } satisfies AmortizationScheduleParams;
      const r = generateAmortizationSchedule(params);
      const lastReduceIdx = r.schedule.map((row) => row.extraPaymentType).lastIndexOf('reducePayment');
      expect(lastReduceIdx).toBeGreaterThanOrEqual(0);
      const paymentAfter = r.schedule[lastReduceIdx + 1]?.payment;
      expect(paymentAfter).toBeDefined();
      expect(r.summary.finalMonthlyPayment).toBe(paymentAfter);
    });
  });
});
