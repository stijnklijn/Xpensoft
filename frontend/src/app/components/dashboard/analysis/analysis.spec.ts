import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { Analysis } from './analysis';
import { BarChart } from './bar-chart/bar-chart';
import { DoughnutChart } from './doughnut-chart/doughnut-chart';
import { DashboardStore } from '../../../store/dashboard.store';
import { Category } from '../../../models/category';
import { Transaction } from '../../../models/transaction';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

const categories: Category[] = [
  { id: 'salary', name: 'Salary', isIncome: true },
  { id: 'bonus', name: 'Bonus', isIncome: true },
  { id: 'groceries', name: 'Groceries', isIncome: false },
  { id: 'rent', name: 'Rent', isIncome: false },
];

const transactions: Transaction[] = [
  {
    id: 't1',
    date: new Date('2024-01-10'),
    description: 'Salary Jan',
    categoryId: 'salary',
    amount: 2000,
  },
  {
    id: 't2',
    date: new Date('2024-01-15'),
    description: 'Groceries Jan',
    categoryId: 'groceries',
    amount: 150,
  },
  {
    id: 't3',
    date: new Date('2024-03-05'),
    description: 'Rent Mar',
    categoryId: 'rent',
    amount: 850,
  },
  {
    id: 't4',
    date: new Date('2023-06-01'),
    description: 'Bonus',
    categoryId: 'bonus',
    amount: 500,
  },
  {
    id: 't5',
    date: new Date('2023-06-02'),
    description: 'Groceries',
    categoryId: 'groceries',
    amount: 80,
  },
];

describe('Analysis', () => {
  let fixture: ComponentFixture<Analysis>;
  let component: Analysis;
  let storeMock: Partial<DashboardStore>;

  function sectionTitles(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.sidenav .section-title'));
  }

  function selects(): HTMLSelectElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.controls select'));
  }

  function displayOptions(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.controls ul li'));
  }

  beforeEach(async () => {
    storeMock = {
      transactions: signal(transactions),
      categories: signal(categories),
    };

    await TestBed.configureTestingModule({
      imports: [
        Analysis,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
      providers: [{ provide: DashboardStore, useValue: storeMock }],
    })
      .overrideComponent(BarChart, { set: { template: '<div class="bar-chart-stub"></div>' } })
      .overrideComponent(DoughnutChart, {
        set: { template: '<div class="doughnut-chart-stub"></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Analysis);
    component = fixture.componentInstance;
    component.year.set(2024);

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('renders all section titles in the sidenav', () => {
    const titles = sectionTitles();
    expect(titles.length).toBe(8);
    expect(titles[0].textContent?.trim()).toBe('ANALYSIS.SECTION_HEADERS.SUMMARY');
    expect(titles[1].textContent?.trim()).toBe('ANALYSIS.SECTION_HEADERS.TOTALS');
    expect(titles[7].textContent?.trim()).toBe(
      'ANALYSIS.SECTION_HEADERS.EXPENSES_DISTRIBUTION_PER_CATEGORY_PER_MONTH',
    );
  });

  describe('summary section', () => {
    function summaryTabs(): HTMLElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('.summary-tab'));
    }

    beforeEach(() => {
      component.month.set(0); // January
      fixture.detectChanges();
    });

    it('is the section shown by default', () => {
      expect(component.activeSectionIndex()).toBe(0);
      expect(sectionTitles()[0].classList).toContain('active');
    });

    it('shows the month tab by default and switches to the year tab', () => {
      const tabs = summaryTabs();
      expect(tabs.length).toBe(2);
      expect(tabs[0].classList).toContain('active');
      expect(tabs[1].classList).not.toContain('active');

      tabs[1].click();
      fixture.detectChanges();

      expect(tabs[0].classList).not.toContain('active');
      expect(tabs[1].classList).toContain('active');
    });

    it('shows income, expenses and difference for the selected month on the month tab', () => {
      const stats = fixture.nativeElement.querySelectorAll('.summary-stat');
      expect(stats.length).toBe(3);

      const [income, expenses, diff] = Array.from(stats) as HTMLElement[];
      expect(income.textContent).toContain('2,000.00');
      expect(expenses.textContent).toContain('150.00');
      expect(diff.textContent).toContain('1,850.00');
    });

    it('shows income, expenses and difference for the selected year on the year tab', () => {
      summaryTabs()[1].click();
      fixture.detectChanges();

      const stats = fixture.nativeElement.querySelectorAll('.summary-stat');
      expect(stats.length).toBe(3);

      const [income, expenses, diff] = Array.from(stats) as HTMLElement[];
      expect(income.textContent).toContain('2,000.00');
      expect(expenses.textContent).toContain('1,000.00');
      expect(diff.textContent).toContain('1,000.00');
    });

    it('lists the top expenses for the month on the month tab', () => {
      const rows = fixture.nativeElement.querySelectorAll('.summary-section table tbody tr');
      expect(rows.length).toBe(1);
      expect(rows[0].textContent).toContain('Groceries Jan');
      expect(rows[0].textContent).toContain('150.00');
    });

    it('lists the top expenses for the year on the year tab', () => {
      summaryTabs()[1].click();
      fixture.detectChanges();

      const rows = fixture.nativeElement.querySelectorAll('.summary-section table tbody tr');
      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain('Rent Mar');
      expect(rows[1].textContent).toContain('Groceries Jan');
    });
  });

  it('shows a no-data message when there is nothing for the selected year', () => {
    sectionTitles()[1].click(); // totals
    component.year.set(1999);
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.main h3');
    expect(message.textContent.trim()).toBe('ANALYSIS.NO_DATA');
  });

  it('renders the monthly totals table for the totals section', () => {
    sectionTitles()[1].click(); // totals
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.main tbody tr');
    expect(rows.length).toBe(13); // 12 months + total row

    const januaryCells = rows[0].querySelectorAll('td');
    expect(januaryCells[1].textContent.trim()).toBe('2,000.00');
    expect(januaryCells[2].textContent.trim()).toBe('150.00');
    expect(januaryCells[3].textContent.trim()).toBe('1,850.00');

    const marchCells = rows[2].querySelectorAll('td');
    expect(marchCells[1].textContent.trim()).toBe('0.00');
    expect(marchCells[2].textContent.trim()).toBe('850.00');
    expect(marchCells[3].textContent.trim()).toBe('-850.00');

    const totalCells = rows[12].querySelectorAll('td');
    expect(totalCells[1].textContent.trim()).toBe('2,000.00');
    expect(totalCells[2].textContent.trim()).toBe('1,000.00');
    expect(totalCells[3].textContent.trim()).toBe('1,000.00');
  });

  it('switches to the chart display option and passes monthly data to the bar chart', () => {
    sectionTitles()[1].click(); // totals
    fixture.detectChanges();

    const [, chartOption] = displayOptions();
    chartOption.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.main table')).toBeNull();

    const barChart = fixture.debugElement.query(By.directive(BarChart))
      .componentInstance as BarChart;
    expect(barChart.labels).toEqual(component.monthLabels());
    expect(barChart.datasets[0].data).toEqual(component.incomePerMonth());
    expect(barChart.datasets[1].data).toEqual(component.expensesPerMonth());
  });

  it('resets the display option when switching sections', () => {
    sectionTitles()[1].click(); // totals
    fixture.detectChanges();

    const [, chartOption] = displayOptions();
    chartOption.click();
    fixture.detectChanges();
    expect(component.activeDisplayOptionIndex()).toBe(1);

    sectionTitles()[2].click(); // totals-per-category
    fixture.detectChanges();

    expect(component.activeSectionIndex()).toBe(2);
    expect(component.activeDisplayOptionIndex()).toBe(0);
  });

  it('renders income and expense categories sorted by amount in the totals-per-category section', () => {
    sectionTitles()[2].click(); // totals-per-category
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.controls ul')).toBeNull();

    const tables = fixture.nativeElement.querySelectorAll('.main table');
    expect(tables.length).toBe(2);

    const incomeRows = tables[0].querySelectorAll('tbody tr');
    expect(incomeRows.length).toBe(1);
    expect(incomeRows[0].textContent).toContain('Salary');
    expect(incomeRows[0].textContent).toContain('2,000.00');

    const expenseRows = tables[1].querySelectorAll('tbody tr');
    expect(expenseRows.length).toBe(2);
    expect(expenseRows[0].textContent).toContain('Rent');
    expect(expenseRows[0].textContent).toContain('850.00');
    expect(expenseRows[1].textContent).toContain('Groceries');
    expect(expenseRows[1].textContent).toContain('150.00');
  });

  it('updates totals when a different year is selected', () => {
    sectionTitles()[2].click(); // totals-per-category
    fixture.detectChanges();

    const yearSelect = selects()[0];
    yearSelect.value = '2023';
    yearSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.year()).toBe(2023);

    const tables = fixture.nativeElement.querySelectorAll('.main table');
    expect(tables[0].querySelector('tbody tr').textContent).toContain('Bonus');
    expect(tables[1].querySelector('tbody tr').textContent).toContain('Groceries');
    expect(tables[1].querySelector('tbody tr').textContent).toContain('80.00');
  });

  it('shows a month selector and filters category totals by month', () => {
    sectionTitles()[5].click(); // totals-per-category-per-month
    component.month.set(0); // January
    fixture.detectChanges();

    expect(selects().length).toBe(2); // month + year

    let tables = fixture.nativeElement.querySelectorAll('.main table');
    expect(tables[0].querySelector('tbody tr').textContent).toContain('Salary');
    expect(tables[1].querySelector('tbody tr').textContent).toContain('Groceries');

    const monthSelect = selects()[0];
    monthSelect.value = '2'; // March
    monthSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.month()).toBe(2);

    tables = fixture.nativeElement.querySelectorAll('.main table');
    expect(tables[0].querySelectorAll('tbody tr').length).toBe(0); // no income in March
    expect(tables[1].querySelector('tbody tr').textContent).toContain('Rent');
  });

  it('renders income category data in the income distribution chart and switches to a doughnut chart', () => {
    sectionTitles()[3].click(); // income-distribution-per-category
    fixture.detectChanges();

    const barChart = fixture.debugElement.query(By.directive(BarChart))
      .componentInstance as BarChart;
    expect(barChart.labels).toEqual(['Salary']);
    expect(barChart.datasets[0].data).toEqual([2000]);

    const [, doughnutOption] = displayOptions();
    doughnutOption.click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(BarChart))).toBeNull();
    const doughnutChart = fixture.debugElement.query(By.directive(DoughnutChart))
      .componentInstance as DoughnutChart;
    expect(doughnutChart.labels).toEqual(['Salary']);
    expect(doughnutChart.datasets[0].data).toEqual([2000]);
  });

  it('renders per-month category data in the income distribution per month chart', () => {
    component.month.set(0); // January
    sectionTitles()[6].click(); // income-distribution-per-category-per-month
    fixture.detectChanges();

    const barChart = fixture.debugElement.query(By.directive(BarChart))
      .componentInstance as BarChart;
    expect(barChart.labels).toEqual(['Salary']);
    expect(barChart.datasets[0].data).toEqual([2000]);
  });
});
