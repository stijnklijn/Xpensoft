import { Category } from '../../../models/category';
import { Transaction } from '../../../models/transaction';

export interface TotalsSummary {
  income: number;
  expenses: number;
  diff: number;
}

export interface CategoryTotal {
  name: string;
  isIncome: boolean;
  amount: number;
}

export interface ChartData {
  labels: string[];
  amounts: number[];
}

export function sumIncomeExpenseDiff(
  transactions: Transaction[],
  categoryMap: Record<string, Category>,
): TotalsSummary {
  return transactions.reduce(
    (acc, t) => {
      const isIncome = categoryMap[t.categoryId]?.isIncome;

      if (isIncome) {
        acc.income += t.amount;
        acc.diff += t.amount;
      } else {
        acc.expenses += t.amount;
        acc.diff -= t.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0, diff: 0 },
  );
}

export function totalsByMonth(
  transactions: Transaction[],
  categoryMap: Record<string, Category>,
): TotalsSummary[] {
  const transactionsByMonth: Transaction[][] = Array.from({ length: 12 }, () => []);
  transactions.forEach((t) => transactionsByMonth[new Date(t.date).getMonth()].push(t));

  return transactionsByMonth.map((monthTransactions) =>
    sumIncomeExpenseDiff(monthTransactions, categoryMap),
  );
}

export function totalsByCategory(
  transactions: Transaction[],
  categoryMap: Record<string, Category>,
): CategoryTotal[] {
  const totals = new Map<string, CategoryTotal>();

  transactions.forEach((t) => {
    const category = categoryMap[t.categoryId];
    if (!category) return;

    if (!totals.has(t.categoryId)) {
      totals.set(t.categoryId, { name: category.name, isIncome: category.isIncome, amount: 0 });
    }

    totals.get(t.categoryId)!.amount += t.amount;
  });

  return Array.from(totals.values()).sort((a, b) => b.amount - a.amount);
}

export function toChartData(totals: CategoryTotal[], isIncome: boolean): ChartData {
  const filtered = totals.filter((c) => c.isIncome === isIncome);
  return { labels: filtered.map((c) => c.name), amounts: filtered.map((c) => c.amount) };
}
