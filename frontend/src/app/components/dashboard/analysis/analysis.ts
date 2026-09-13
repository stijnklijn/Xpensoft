import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BarChart } from './bar-chart/bar-chart';
import { DashboardStore } from '../../../store/dashboard.store';
import { DoughnutChart } from './doughnut-chart/doughnut-chart';
import { icons } from '../../../shared/icons';
import {
  daysBetween,
  sumIncomeExpenseDiff,
  toChartData,
  topExpenses,
  totalsByCategory,
  totalsByMonth,
  transactionsInRange,
} from './analysis.helpers';

interface Section {
  id: string;
  title: string;
  displayOptions: IconDefinition[];
  perMonth: boolean;
}

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
  today = signal(new Date());

  activeSectionIndex = signal<number>(0);
  activeDisplayOptionIndex = signal<number>(0);
  summaryTabIndex = signal<number>(0);

  sections = signal<Array<Section>>([]);
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
    this.sections.set([
      {
        id: 'summary',
        title: 'ANALYSIS.SECTION_HEADERS.SUMMARY',
        displayOptions: [],
        perMonth: true,
      },
      {
        id: 'totals',
        title: 'ANALYSIS.SECTION_HEADERS.TOTALS',
        displayOptions: [icons.faTable, icons.faChartSimple],
        perMonth: false,
      },
      {
        id: 'totals-per-category',
        title: 'ANALYSIS.SECTION_HEADERS.TOTALS_PER_CATEGORY',
        displayOptions: [icons.faTable],
        perMonth: false,
      },
      {
        id: 'income-distribution-per-category',
        title: 'ANALYSIS.SECTION_HEADERS.INCOME_DISTRIBUTION_PER_CATEGORY',
        displayOptions: [icons.faChartSimple, icons.faChartPie],
        perMonth: false,
      },
      {
        id: 'expenses-distribution-per-category',
        title: 'ANALYSIS.SECTION_HEADERS.EXPENSES_DISTRIBUTION_PER_CATEGORY',
        displayOptions: [icons.faChartSimple, icons.faChartPie],
        perMonth: false,
      },
      {
        id: 'totals-per-category-per-month',
        title: 'ANALYSIS.SECTION_HEADERS.TOTALS_PER_CATEGORY_PER_MONTH',
        displayOptions: [icons.faTable],
        perMonth: true,
      },
      {
        id: 'income-distribution-per-category-per-month',
        title: 'ANALYSIS.SECTION_HEADERS.INCOME_DISTRIBUTION_PER_CATEGORY_PER_MONTH',
        displayOptions: [icons.faChartSimple, icons.faChartPie],
        perMonth: true,
      },
      {
        id: 'expenses-distribution-per-category-per-month',
        title: 'ANALYSIS.SECTION_HEADERS.EXPENSES_DISTRIBUTION_PER_CATEGORY_PER_MONTH',
        displayOptions: [icons.faChartSimple, icons.faChartPie],
        perMonth: true,
      },
    ]);

    let firstYear = this.year();
    let lastYear = this.year();

    if (this.transactions().length > 0) {
      const years = this.transactions().map((t) => new Date(t.date).getFullYear());
      firstYear = Math.min(...years, firstYear);
      lastYear = Math.max(...years, lastYear);
    }

    this.yearLabels.set(Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i));

    this.translate
      .stream([
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
        this.monthLabels.set(Object.values(t));
      });
  }

  activeSection = computed<Section | undefined>(() => this.sections()[this.activeSectionIndex()]);

  categoryMap = computed(() => {
    const categories = this.categories();
    if (!categories) return {};
    return Object.fromEntries(categories.map((c) => [c.id, c]));
  });

  transactionsThisYear = computed(() =>
    this.transactions().filter((t) => new Date(t.date).getFullYear() === this.year()),
  );

  transactionsThisMonth = computed(() =>
    this.transactionsThisYear().filter((t) => new Date(t.date).getMonth() === this.month()),
  );

  totalsThisYear = computed(() =>
    sumIncomeExpenseDiff(this.transactionsThisYear(), this.categoryMap()),
  );

  totalsPerMonth = computed(() => totalsByMonth(this.transactionsThisYear(), this.categoryMap()));

  totalsThisMonth = computed(() => this.totalsPerMonth()[this.month()]);

  monthRangeStart = computed(() => new Date(this.year(), this.month(), 1));

  monthRangeEnd = computed(() => new Date(this.year(), this.month() + 1, 0));

  yearRangeStart = computed(() => new Date(this.year(), 0, 1));

  yearRangeEnd = computed(() => new Date(this.year(), 11, 31));

  pastMonthEnd = computed(() => this.today());

  pastMonthStart = computed(() => {
    const start = new Date(this.today());
    start.setMonth(start.getMonth() - 1);
    start.setDate(start.getDate() + 1);
    return start;
  });

  pastYearEnd = computed(() => this.today());

  pastYearStart = computed(() => {
    const start = new Date(this.today());
    start.setFullYear(start.getFullYear() - 1);
    start.setDate(start.getDate() + 1);
    return start;
  });

  pastMonthDays = computed(() => daysBetween(this.pastMonthStart(), this.pastMonthEnd()));

  pastYearDays = computed(() => daysBetween(this.pastYearStart(), this.pastYearEnd()));

  transactionsPastMonth = computed(() =>
    transactionsInRange(this.transactions(), this.pastMonthStart(), this.pastMonthEnd()),
  );

  transactionsPastYear = computed(() =>
    transactionsInRange(this.transactions(), this.pastYearStart(), this.pastYearEnd()),
  );

  totalsPastMonth = computed(() =>
    sumIncomeExpenseDiff(this.transactionsPastMonth(), this.categoryMap()),
  );

  totalsPastYear = computed(() =>
    sumIncomeExpenseDiff(this.transactionsPastYear(), this.categoryMap()),
  );

  totalsPerCategory = computed(() =>
    totalsByCategory(this.transactionsThisYear(), this.categoryMap()),
  );

  totalsPerMonthPerCategory = computed(() =>
    totalsByCategory(this.transactionsThisMonth(), this.categoryMap()),
  );

  incomePerMonth = computed(() => this.totalsPerMonth().map((t) => t.income));

  expensesPerMonth = computed(() => this.totalsPerMonth().map((t) => t.expenses));

  incomeByCategory = computed(() => toChartData(this.totalsPerCategory(), true));

  expensesByCategory = computed(() => toChartData(this.totalsPerCategory(), false));

  incomeByCategoryPerMonth = computed(() => toChartData(this.totalsPerMonthPerCategory(), true));

  expensesByCategoryPerMonth = computed(() => toChartData(this.totalsPerMonthPerCategory(), false));

  topExpensesThisMonth = computed(() =>
    topExpenses(this.transactionsThisMonth(), this.categoryMap(), 5),
  );

  topExpensesThisYear = computed(() =>
    topExpenses(this.transactionsThisYear(), this.categoryMap(), 5),
  );

  topExpensesPastMonth = computed(() =>
    topExpenses(this.transactionsPastMonth(), this.categoryMap(), 5),
  );

  topExpensesPastYear = computed(() =>
    topExpenses(this.transactionsPastYear(), this.categoryMap(), 5),
  );

  changeSection(index: number) {
    this.activeSectionIndex.set(index);
    this.activeDisplayOptionIndex.set(0);
  }

  changeDisplayOption(index: number) {
    this.activeDisplayOptionIndex.set(index);
  }

  changeYear(year: number) {
    this.year.set(year);
  }

  changeMonth(month: number) {
    this.month.set(month);
  }

  changeSummaryTab(index: number) {
    this.summaryTabIndex.set(index);
  }
}
