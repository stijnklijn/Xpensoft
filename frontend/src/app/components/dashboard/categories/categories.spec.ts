import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AddEditCategoryDialog } from './add-edit-category-dialog/add-edit-category-dialog';
import { Categories } from './categories';
import { ConfirmationDialog } from '../../shared/confirmation-dialog/confirmation-dialog';
import { DashboardStore } from '../../../store/dashboard.store';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('Categories', () => {
  let fixture: ComponentFixture<Categories>;
  let component: Categories;

  let storeMock: Partial<DashboardStore>;
  let dialogMock: Pick<MatDialog, 'open'>;

  beforeEach(async () => {
    storeMock = {
      transactions: signal([
        { id: '1', categoryId: '1' },
        { id: '2', categoryId: '2' },
        { id: '3', categoryId: '2' },
      ]),
      categories: signal([
        { id: '1', name: 'Salary', isIncome: true },
        { id: '2', name: 'Groceries', isIncome: false },
        { id: '3', name: 'ZEmpty', isIncome: false },
      ]),
    };

    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(false),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [
        Categories,
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

    fixture = TestBed.createComponent(Categories);
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
    expect(message.textContent).toEqual('CATEGORIES.NO_CATEGORIES');
  });

  it('should render categories sorted by name', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('Groceries');
    expect(rows[1].textContent).toContain('Salary');
    expect(rows[2].textContent).toContain('ZEmpty');
  });

  it('should render transaction counts', () => {
    const transactionCells = fixture.nativeElement.querySelectorAll('td.number');
    expect(transactionCells[0].textContent.trim()).toBe('2');
    expect(transactionCells[1].textContent.trim()).toBe('1');
    expect(transactionCells[2].textContent.trim()).toBe('0');
  });

  it('should open add dialog when add button clicked', () => {
    const button = fixture.nativeElement.querySelector('[data-testid="add-button"]');

    button.click();

    expect(dialogMock.open).toHaveBeenCalledWith(
      AddEditCategoryDialog,
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
    const row = [...rows].find((r) => r.textContent.includes('Groceries'));
    const button = row.querySelector('[data-testid="edit-button"]');

    button.click();

    expect(dialogMock.open).toHaveBeenCalledWith(
      AddEditCategoryDialog,
      expect.objectContaining({
        disableClose: true,
        data: expect.objectContaining({
          isNew: false,
          category: expect.objectContaining({ id: '2' }),
        }),
      }),
    );
  });

  it('should open delete dialog when delete button clicked and category has no transactions', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const row = [...rows].find((r) => r.textContent.includes('ZEmpty'));
    const button = row.querySelector('[data-testid="delete-button"]');

    button.click();

    expect(dialogMock.open).toHaveBeenCalledWith(
      ConfirmationDialog,
      expect.objectContaining({
        disableClose: true,
        data: expect.objectContaining({
          title: 'CATEGORIES.DIALOG.HEADER.DELETE',
          message: 'CATEGORIES.DIALOG.CONFIRM_DELETE ZEmpty?',
        }),
      }),
    );
  });

  it('should not open delete dialog when delete button clicked and category has transactions', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const row = [...rows].find((r) => r.textContent.includes('Groceries'));
    const button = row.querySelector('[data-testid="delete-button"]');

    button.click();

    expect(dialogMock.open).not.toHaveBeenCalled();
  });
});
