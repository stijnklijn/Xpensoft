import { Category } from '../../../models/category';
import { Transaction } from '../../../models/transaction';
import {
  daysBetween,
  sumIncomeExpenseDiff,
  toChartData,
  topExpenses,
  totalsByCategory,
  totalsByMonth,
  transactionsInRange,
} from './analysis.helpers';

const categoryMap: Record<string, Category> = {
  salary: { id: 'salary', name: 'Salary', isIncome: true },
  bonus: { id: 'bonus', name: 'Bonus', isIncome: true },
  groceries: { id: 'groceries', name: 'Groceries', isIncome: false },
  rent: { id: 'rent', name: 'Rent', isIncome: false },
};

function transaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: '1',
    date: new Date('2024-01-15'),
    description: 'test',
    categoryId: 'salary',
    amount: 100,
    ...overrides,
  };
}

describe('sumIncomeExpenseDiff', () => {
  it('sums income and expenses and computes the diff', () => {
    const result = sumIncomeExpenseDiff(
      [
        transaction({ categoryId: 'salary', amount: 2000 }),
        transaction({ categoryId: 'groceries', amount: 150 }),
        transaction({ categoryId: 'rent', amount: 850 }),
      ],
      categoryMap,
    );

    expect(result).toEqual({ income: 2000, expenses: 1000, diff: 1000 });
  });

  it('returns all zeroes for an empty list', () => {
    expect(sumIncomeExpenseDiff([], categoryMap)).toEqual({ income: 0, expenses: 0, diff: 0 });
  });

  it('treats transactions with an unknown category as an expense', () => {
    const result = sumIncomeExpenseDiff(
      [transaction({ categoryId: 'unknown', amount: 50 })],
      categoryMap,
    );

    expect(result).toEqual({ income: 0, expenses: 50, diff: -50 });
  });
});

describe('totalsByMonth', () => {
  it('buckets totals into 12 months by transaction date', () => {
    const result = totalsByMonth(
      [
        transaction({ categoryId: 'salary', amount: 2000, date: new Date('2024-01-15') }),
        transaction({ categoryId: 'groceries', amount: 150, date: new Date('2024-01-20') }),
        transaction({ categoryId: 'rent', amount: 850, date: new Date('2024-03-05') }),
      ],
      categoryMap,
    );

    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({ income: 2000, expenses: 150, diff: 1850 });
    expect(result[2]).toEqual({ income: 0, expenses: 850, diff: -850 });
    expect(result[1]).toEqual({ income: 0, expenses: 0, diff: 0 });
  });

  it('returns 12 empty buckets for an empty list', () => {
    const result = totalsByMonth([], categoryMap);

    expect(result).toHaveLength(12);
    expect(result.every((m) => m.income === 0 && m.expenses === 0 && m.diff === 0)).toBe(true);
  });
});

describe('totalsByCategory', () => {
  it('aggregates amounts per category and sorts descending by amount', () => {
    const result = totalsByCategory(
      [
        transaction({ categoryId: 'salary', amount: 2000 }),
        transaction({ categoryId: 'groceries', amount: 150 }),
        transaction({ categoryId: 'groceries', amount: 50 }),
        transaction({ categoryId: 'rent', amount: 850 }),
      ],
      categoryMap,
    );

    expect(result).toEqual([
      { name: 'Salary', isIncome: true, amount: 2000 },
      { name: 'Rent', isIncome: false, amount: 850 },
      { name: 'Groceries', isIncome: false, amount: 200 },
    ]);
  });
});

describe('topExpenses', () => {
  it('returns the largest expenses sorted descending', () => {
    const result = topExpenses(
      [
        transaction({ id: '1', categoryId: 'salary', amount: 2000 }),
        transaction({ id: '2', categoryId: 'groceries', amount: 150, description: 'Groceries' }),
        transaction({ id: '3', categoryId: 'rent', amount: 850, description: 'Rent' }),
        transaction({ id: '4', categoryId: 'groceries', amount: 50, description: 'Snacks' }),
      ],
      categoryMap,
      3,
    );

    expect(result).toEqual([
      {
        id: '3',
        date: new Date('2024-01-15'),
        description: 'Rent',
        categoryName: 'Rent',
        amount: 850,
      },
      {
        id: '2',
        date: new Date('2024-01-15'),
        description: 'Groceries',
        categoryName: 'Groceries',
        amount: 150,
      },
      {
        id: '4',
        date: new Date('2024-01-15'),
        description: 'Snacks',
        categoryName: 'Groceries',
        amount: 50,
      },
    ]);
  });

  it('respects the limit', () => {
    const result = topExpenses(
      [
        transaction({ id: '1', categoryId: 'groceries', amount: 10 }),
        transaction({ id: '2', categoryId: 'rent', amount: 20 }),
      ],
      categoryMap,
      1,
    );

    expect(result).toEqual([
      {
        id: '2',
        date: new Date('2024-01-15'),
        description: 'test',
        categoryName: 'Rent',
        amount: 20,
      },
    ]);
  });

  it('returns an empty array when there are no expenses', () => {
    expect(
      topExpenses([transaction({ categoryId: 'salary', amount: 100 })], categoryMap, 3),
    ).toEqual([]);
  });
});

describe('daysBetween', () => {
  it('counts a 31-day month inclusively', () => {
    expect(daysBetween(new Date('2024-08-14'), new Date('2024-09-13'))).toBe(31);
  });

  it('counts a 28-day month inclusively', () => {
    expect(daysBetween(new Date('2026-02-14'), new Date('2026-03-13'))).toBe(28);
  });

  it('counts a 365-day year inclusively', () => {
    expect(daysBetween(new Date('2025-09-14'), new Date('2026-09-13'))).toBe(365);
  });

  it('counts a 366-day range spanning a leap day inclusively', () => {
    expect(daysBetween(new Date('2023-09-14'), new Date('2024-09-13'))).toBe(366);
  });

  it('ignores the time of day', () => {
    expect(daysBetween(new Date('2024-01-01T23:00:00'), new Date('2024-01-01T01:00:00'))).toBe(1);
  });
});

describe('transactionsInRange', () => {
  it('includes transactions on and between the start and end dates', () => {
    const result = transactionsInRange(
      [
        transaction({ id: '1', date: new Date('2024-02-10') }),
        transaction({ id: '2', date: new Date('2024-02-11') }),
        transaction({ id: '3', date: new Date('2024-03-10') }),
        transaction({ id: '4', date: new Date('2024-03-11') }),
      ],
      new Date('2024-02-11'),
      new Date('2024-03-10'),
    );

    expect(result.map((t) => t.id)).toEqual(['2', '3']);
  });

  it('ignores the time of day on the range boundaries', () => {
    const result = transactionsInRange(
      [transaction({ id: '1', date: new Date('2024-02-11T23:59:00') })],
      new Date('2024-02-11T08:00:00'),
      new Date('2024-02-11T08:00:00'),
    );

    expect(result.map((t) => t.id)).toEqual(['1']);
  });

  it('returns an empty array when nothing falls in range', () => {
    expect(
      transactionsInRange(
        [transaction({ date: new Date('2024-01-01') })],
        new Date('2024-02-01'),
        new Date('2024-02-28'),
      ),
    ).toEqual([]);
  });
});

describe('toChartData', () => {
  const totals = [
    { name: 'Salary', isIncome: true, amount: 2000 },
    { name: 'Bonus', isIncome: true, amount: 500 },
    { name: 'Rent', isIncome: false, amount: 850 },
  ];

  it('filters and maps income totals to labels and amounts', () => {
    expect(toChartData(totals, true)).toEqual({
      labels: ['Salary', 'Bonus'],
      amounts: [2000, 500],
    });
  });

  it('filters and maps expense totals to labels and amounts', () => {
    expect(toChartData(totals, false)).toEqual({
      labels: ['Rent'],
      amounts: [850],
    });
  });

  it('returns empty arrays when nothing matches', () => {
    expect(toChartData([], true)).toEqual({ labels: [], amounts: [] });
  });
});
