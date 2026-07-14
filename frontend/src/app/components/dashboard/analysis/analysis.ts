import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BarChart } from './bar-chart/bar-chart';
import { DashboardStore } from '../../../store/dashboard.store';
import { DoughnutChart } from './doughnut-chart/doughnut-chart';
import { icons } from '../../../shared/icons';

@Component({
  selector: 'app-analysis',
  imports: [CommonModule, TranslateModule, DecimalPipe, FontAwesomeModule, BarChart, DoughnutChart],
  templateUrl: './analysis.html',
  styleUrl: './analysis.css',
})
export class Analysis {
  store = inject(DashboardStore);
  translate = inject(TranslateService);

  icons = icons;

  transactions = this.store.transactions;
  categories = this.store.categories;

  year = signal(new Date().getFullYear());
  month = signal(new Date().getMonth());

  activeSection = signal<string | null>('totals-table');
  activeSectionGroupIndex = signal<number>(0);

  sections = signal<Array<any>>([]);
  yearLabels = signal<Array<number>>([]);
  monthLabels = signal<Array<string>>([]);

  colorScheme = [
    '#c8c8c8',
    '#f0c571',
    '#59a89c',
    '#0b81a2',
    '#e25759',
    '#9d2c00',
    '#7e4794',
    '#36b700',
  ];

  incomeColor = '#a8eda8';
  expensesColor = '#f75555';

  constructor() {
    this.translate
      .stream([
        'ANALYSIS.TABLE',
        'ANALYSIS.BAR',
        'ANALYSIS.DOUGHNUT',
        'ANALYSIS.SECTION_HEADERS.TOTALS',
        'ANALYSIS.SECTION_HEADERS.TOTALS_PER_CATEGORY',
        'ANALYSIS.SECTION_HEADERS.INCOME_DISTRIBUTION_PER_CATEGORY',
        'ANALYSIS.SECTION_HEADERS.EXPENSES_DISTRIBUTION_PER_CATEGORY',
        'ANALYSIS.SECTION_HEADERS.TOTALS_PER_CATEGORY_PER_MONTH',
        'ANALYSIS.SECTION_HEADERS.INCOME_DISTRIBUTION_PER_CATEGORY_PER_MONTH',
        'ANALYSIS.SECTION_HEADERS.EXPENSES_DISTRIBUTION_PER_CATEGORY_PER_MONTH',
        'ANALYSIS.SECTION_HEADERS.TOTALS',
        'ANALYSIS.MONTHS.JANUARY',
        'ANALYSIS.MONTHS.FEBRUARY',
        'ANALYSIS.MONTHS.MARCH',
        'ANALYSIS.MONTHS.APRIL',
        'ANALYSIS.MONTHS.MAY',
        'ANALYSIS.MONTHS.JUNE',
        'ANALYSIS.MONTHS.JULY',
        'ANALYSIS.MONTHS.AUGUST',
        'ANALYSIS.MONTHS.SEPTEMBER',
        'ANALYSIS.MONTHS.OCTOBER',
        'ANALYSIS.MONTHS.NOVEMBER',
        'ANALYSIS.MONTHS.DECEMBER',
      ])
      .subscribe((t) => {
        this.sections.set([
          {
            title: t['ANALYSIS.SECTION_HEADERS.TOTALS'],
            perMonth: false,
            children: [
              {
                icon: this.icons.faTable,
                label: t['ANALYSIS.TABLE'],
                id: 'totals-table',
              },
              {
                icon: this.icons.faChartSimple,
                label: t['ANALYSIS.BAR'],
                id: 'totals-bar',
              },
            ],
          },
          {
            title: t['ANALYSIS.SECTION_HEADERS.TOTALS_PER_CATEGORY'],
            perMonth: false,
            children: [
              {
                icon: this.icons.faTable,
                label: t['ANALYSIS.TABLE'],
                id: 'totals-per-category-table',
              },
            ],
          },
          {
            title: t['ANALYSIS.SECTION_HEADERS.INCOME_DISTRIBUTION_PER_CATEGORY'],

            perMonth: false,
            children: [
              {
                icon: this.icons.faChartSimple,
                label: t['ANALYSIS.BAR'],
                id: 'income-distribution-per-category-bar',
              },
              {
                icon: this.icons.faChartPie,
                label: t['ANALYSIS.DOUGHNUT'],
                id: 'income-distribution-per-category-doughnut',
              },
            ],
          },
          {
            title: t['ANALYSIS.SECTION_HEADERS.EXPENSES_DISTRIBUTION_PER_CATEGORY'],
            perMonth: false,
            children: [
              {
                icon: this.icons.faChartSimple,

                label: t['ANALYSIS.BAR'],
                id: 'expenses-distribution-per-category-bar',
              },
              {
                icon: this.icons.faChartPie,
                label: t['ANALYSIS.DOUGHNUT'],
                id: 'expenses-distribution-per-category-doughnut',
              },
            ],
          },
          {
            title: t['ANALYSIS.SECTION_HEADERS.TOTALS_PER_CATEGORY_PER_MONTH'],
            perMonth: true,
            children: [
              {
                icon: this.icons.faTable,
                label: t['ANALYSIS.TABLE'],
                id: 'totals-per-category-per-month-table',
              },
            ],
          },
          {
            title: t['ANALYSIS.SECTION_HEADERS.INCOME_DISTRIBUTION_PER_CATEGORY_PER_MONTH'],

            perMonth: true,
            children: [
              {
                icon: this.icons.faChartSimple,
                label: t['ANALYSIS.BAR'],
                id: 'income-distribution-per-category-per-month-bar',
              },
              {
                icon: this.icons.faChartPie,
                label: t['ANALYSIS.DOUGHNUT'],
                id: 'income-distribution-per-category-per-month-doughnut',
              },
            ],
          },
          {
            title: t['ANALYSIS.SECTION_HEADERS.EXPENSES_DISTRIBUTION_PER_CATEGORY_PER_MONTH'],
            perMonth: true,
            children: [
              {
                icon: this.icons.faChartSimple,
                label: t['ANALYSIS.BAR'],
                id: 'expenses-distribution-per-category-per-month-bar',
              },
              {
                icon: this.icons.faChartPie,
                label: t['ANALYSIS.DOUGHNUT'],
                id: 'expenses-distribution-per-category-per-month-doughnut',
              },
            ],
          },
        ]);

        let firstYear = this.year();
        let lastYear = this.year();

        if (this.transactions().length > 0) {
          const years = this.transactions().map((t) => new Date(t.date).getFullYear());
          firstYear = Math.min(...years, firstYear);
          lastYear = Math.max(...years, lastYear);
        }

        this.yearLabels.set(
          Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i),
        );

        this.monthLabels.set([
          t['ANALYSIS.MONTHS.JANUARY'],
          t['ANALYSIS.MONTHS.FEBRUARY'],
          t['ANALYSIS.MONTHS.MARCH'],
          t['ANALYSIS.MONTHS.APRIL'],
          t['ANALYSIS.MONTHS.MAY'],
          t['ANALYSIS.MONTHS.JUNE'],
          t['ANALYSIS.MONTHS.JULY'],
          t['ANALYSIS.MONTHS.AUGUST'],
          t['ANALYSIS.MONTHS.SEPTEMBER'],
          t['ANALYSIS.MONTHS.OCTOBER'],
          t['ANALYSIS.MONTHS.NOVEMBER'],
          t['ANALYSIS.MONTHS.DECEMBER'],
        ]);
      });
  }

  goTo(id: string, groupIndex: number) {
    this.activeSection.set(id);
    this.activeSectionGroupIndex.set(groupIndex);
  }

  categoryMap = computed(() => {
    const categories = this.categories();
    if (!categories) return {};
    return Object.fromEntries(categories.map((c) => [c.id, c]));
  });

  totalsThisYear = computed(() => {
    const transactions = this.transactions().filter(
      (t) => new Date(t.date).getFullYear() === this.year(),
    );
    const categoryMap = this.categoryMap();
    if (!transactions) return { income: 0, expenses: 0, diff: 0 };

    return transactions.reduce(
      (acc, curr) => {
        const isIncome = categoryMap[curr.categoryId]?.isIncome;

        if (isIncome) {
          acc.income += curr.amount;
          acc.diff += curr.amount;
        } else {
          acc.expenses += curr.amount;
          acc.diff -= curr.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0, diff: 0 },
    );
  });

  totalsPerMonth = computed(() => {
    const transactions = this.transactions().filter(
      (t) => new Date(t.date).getFullYear() === this.year(),
    );
    const categoryMap = this.categoryMap();
    if (!transactions) return [];

    const result = new Array(12).fill(null).map(() => ({
      income: 0,
      expenses: 0,
      diff: 0,
    }));

    transactions.forEach((t) => {
      const month = new Date(t.date).getMonth();
      const isIncome = categoryMap[t.categoryId]?.isIncome;

      if (isIncome) {
        result[month].income += t.amount;
        result[month].diff += t.amount;
      } else {
        result[month].expenses += t.amount;
        result[month].diff -= t.amount;
      }
    });

    return result;
  });

  totalsPerCategory = computed(() => {
    const transactions = this.transactions().filter(
      (t) => new Date(t.date).getFullYear() === this.year(),
    );
    const categoryMap = this.categoryMap();
    if (!transactions) return [];

    const totals = new Map();

    transactions.forEach((t) => {
      const category = categoryMap[t.categoryId];
      if (!category) return;

      if (!totals.has(t.categoryId)) {
        totals.set(t.categoryId, {
          name: category.name,
          isIncome: category.isIncome,
          amount: 0,
        });
      }

      totals.get(t.categoryId).amount += t.amount;
    });

    return Array.from(totals.values()).sort((a: any, b: any) => b.amount - a.amount);
  });

  totalsPerMonthPerCategory = computed(() => {
    const transactions = this.transactions().filter(
      (t) => new Date(t.date).getFullYear() === this.year(),
    );
    const categoryMap = this.categoryMap();
    const month = this.month();

    if (!transactions) return [];

    const totals = new Map();

    transactions
      .filter((t) => new Date(t.date).getMonth() === month)
      .forEach((t) => {
        const category = categoryMap[t.categoryId];
        if (!category) return;

        if (!totals.has(t.categoryId)) {
          totals.set(t.categoryId, {
            name: category.name,
            isIncome: category.isIncome,
            amount: 0,
          });
        }

        totals.get(t.categoryId).amount += t.amount;
      });

    return Array.from(totals.values()).sort((a: any, b: any) => b.amount - a.amount);
  });

  incomePerMonth = computed(() => this.totalsPerMonth().map((t) => t.income));

  expensesPerMonth = computed(() => this.totalsPerMonth().map((t) => t.expenses));

  incomeCategoryLabels = computed(() =>
    this.totalsPerCategory()
      .filter((c) => c.isIncome)
      .map((c) => c.name),
  );

  expensesCategoryLabels = computed(() =>
    this.totalsPerCategory()
      .filter((c) => !c.isIncome)
      .map((c) => c.name),
  );

  incomePerCategory = computed(() =>
    this.totalsPerCategory()
      .filter((c) => c.isIncome)
      .map((c) => c.amount),
  );

  expensesPerCategory = computed(() =>
    this.totalsPerCategory()
      .filter((c) => !c.isIncome)
      .map((c) => c.amount),
  );

  incomePerMonthCategoryLabels = computed(() =>
    this.totalsPerMonthPerCategory()
      .filter((c) => c.isIncome)
      .map((c) => c.name),
  );

  expensesPerMonthCategoryLabels = computed(() =>
    this.totalsPerMonthPerCategory()
      .filter((c) => !c.isIncome)
      .map((c) => c.name),
  );

  incomePerMonthPerCategory = computed(() =>
    this.totalsPerMonthPerCategory()
      .filter((c) => c.isIncome)
      .map((c) => c.amount),
  );

  expensesPerMonthPerCategory = computed(() =>
    this.totalsPerMonthPerCategory()
      .filter((c) => !c.isIncome)
      .map((c) => c.amount),
  );

  changeYear(year: number) {
    this.year.set(year);
  }

  changeMonth(month: number) {
    this.month.set(month);
  }
}
