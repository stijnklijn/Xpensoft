import { Category } from '../../../models/category';
import { Transaction } from '../../../models/transaction';
import {
  sumIncomeExpenseDiff,
  toChartData,
  totalsByCategory,
  totalsByMonth,
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
