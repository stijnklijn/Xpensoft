import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AddEditTransactionDialog } from './add-edit-transaction-dialog/add-edit-transaction-dialog';
import { Transactions } from './transactions';
import { DashboardStore } from '../../../store/dashboard.store';
import { DeleteTransactionDialog } from './delete-transaction-dialog/delete-transaction-dialog';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('Transactions', () => {
  let fixture: ComponentFixture<Transactions>;
  let component: Transactions;

  let storeMock: Partial<DashboardStore>;
  let dialogMock: Pick<MatDialog, 'open'>;

  beforeEach(async () => {
    storeMock = {
      resultsPerPageOptions: [2, 4],
      transactions: signal([
        {
          id: '1',
          date: new Date('2026-01-01'),
          description: 'Bonus',
          categoryId: '1',
          amount: 1000,
        },
        {
          id: '2',
          date: new Date('2026-01-02'),
          description: 'Strawberries',
          categoryId: '2',
          amount: 2.5,
        },
        {
          id: '3',
          date: new Date('2026-01-03'),
          description: 'Cherries',
          categoryId: '2',
          amount: 3.5,
        },
        {
          id: '4',
          date: new Date('2026-01-04'),
          description: 'Bananas',
          categoryId: '2',
          amount: 2,
        },
      ]),
      categories: signal([
        { id: '1', name: 'Salary', isIncome: true },
        { id: '2', name: 'Groceries', isIncome: false },
      ]),
      currentPageNumber: signal(1),
      resultsPerPage: signal(2),
      sort: signal({ field: 'date', asc: false }),
      filter: signal(''),
    };

    dialogMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        Transactions,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader,
          },
        }),
      ],
      providers: [
        { provide: DashboardStore, useValue: storeMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Transactions);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should show no categories message when category list is empty', () => {
    storeMock.categories?.set([]);
    fixture.detectChanges();
    const message = fixture.nativeElement.querySelector('.message');
    expect(message.textContent).toEqual('TRANSACTIONS.NO_CATEGORIES');
  });

  it('should render correct number of transactions in correct sort order', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Bananas');
    expect(rows[1].textContent).toContain('Cherries');
  });

  it('should open add dialog when add button clicked', () => {
    const button = fixture.nativeElement.querySelector('[data-testid="add-button"]');

    button.click();

    expect(dialogMock.open).toHaveBeenCalledWith(
      AddEditTransactionDialog,
      expect.objectContaining({
        disableClose: true,
        data: expect.objectContaining({
          isNew: true,
        }),
      }),
    );
  });

  it('should open edit dialog when edit button clicked', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const row = [...rows].find((r) => r.textContent.includes('Bananas'));
    const button = row.querySelector('[data-testid="edit-button"]');

    button.click();

    expect(dialogMock.open).toHaveBeenCalledWith(
      AddEditTransactionDialog,
      expect.objectContaining({
        disableClose: true,
        data: expect.objectContaining({
          isNew: false,
          transaction: expect.objectContaining({
            id: '4',
          }),
        }),
      }),
    );
  });

  it('should open delete dialog when delete button clicked', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const row = [...rows].find((r) => r.textContent.includes('Bananas'));
    const button = row.querySelector('[data-testid="delete-button"]');

    button.click();

    expect(dialogMock.open).toHaveBeenCalledWith(
      DeleteTransactionDialog,
      expect.objectContaining({
        disableClose: true,
        data: expect.objectContaining({
          id: '4',
        }),
      }),
    );
  });

  it('should go to previous page when prev button clicked', () => {
    storeMock.currentPageNumber?.set(2);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-testid="prev-button"]');
    button.click();

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(component.currentPageNumber()).toBe(1);
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Bananas');
    expect(rows[1].textContent).toContain('Cherries');
  });

  it('should go to next page when next button clicked', () => {
    const button = fixture.nativeElement.querySelector('[data-testid="next-button"]');
    button.click();

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(component.currentPageNumber()).toBe(2);
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Strawberries');
    expect(rows[1].textContent).toContain('Bonus');
  });

  it('should change results per page when new value selected', () => {
    const select = fixture.nativeElement.querySelector('[data-testid="results-per-page-select"]');
    select.value = '4';
    select.dispatchEvent(new Event('change'));

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(component.resultsPerPage()).toBe('4');
    expect(component.currentPageNumber()).toBe(1);
    expect(rows.length).toBe(4);
    expect(rows[0].textContent).toContain('Bananas');
    expect(rows[1].textContent).toContain('Cherries');
    expect(rows[2].textContent).toContain('Strawberries');
    expect(rows[3].textContent).toContain('Bonus');
  });

  it('should change sort option when new option selected', () => {
    const select = fixture.nativeElement.querySelector('[data-testid="sort-select"]');
    select.value = '2';
    select.dispatchEvent(new Event('change'));

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(component.sort()).toEqual({
      label: 'TRANSACTIONS.SORT_OPTIONS.DESCRIPTION_ASC',
      field: 'description',
      asc: true,
    });
    expect(rows[0].textContent).toContain('Bananas');
    expect(rows[1].textContent).toContain('Bonus');
  });

  it('should filter transactions when filter value entered', () => {
    const input = fixture.nativeElement.querySelector('[data-testid="filter-input"]');
    input.value = 'raw';
    input.dispatchEvent(new Event('input'));

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(component.filter()).toBe('raw');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Strawberries');
  });

  it('should remove filter when remove filter button clicked', () => {
    storeMock.filter?.set('raw');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-testid="remove-filter-button"]');
    button.click();

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(component.filter()).toBe('');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Bananas');
    expect(rows[1].textContent).toContain('Cherries');
  });
});
