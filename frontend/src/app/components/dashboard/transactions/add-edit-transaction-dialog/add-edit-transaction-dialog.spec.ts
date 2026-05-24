import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { Observable, of } from 'rxjs';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AddEditTransactionDialog } from './add-edit-transaction-dialog';
import { DashboardStore } from '../../../../store/dashboard.store';
import { ToastService } from '../../../../services/toast.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<any> {
    return of({});
  }
}

describe('AddEditTransactionDialog', () => {
  let fixture: ComponentFixture<AddEditTransactionDialog>;
  let component: AddEditTransactionDialog;

  let storeMock: Partial<DashboardStore>;
  let dialogRefMock: Pick<MatDialogRef<AddEditTransactionDialog>, 'close'>;
  let toastMock: Pick<ToastService, 'success'>;

  const categories = [
    {
      id: '2',
      name: 'Groceries',
      isIncome: false,
    },
  ];

  beforeEach(async () => {
    storeMock = {
      createTransaction: vi.fn().mockReturnValue(of({})),
      updateTransaction: vi.fn().mockReturnValue(of({})),
    };

    dialogRefMock = {
      close: vi.fn(),
    };

    toastMock = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        AddEditTransactionDialog,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader,
          },
        }),
      ],
      providers: [
        {
          provide: DashboardStore,
          useValue: storeMock,
        },
        {
          provide: ToastService,
          useValue: toastMock,
        },
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            isNew: true,
            categories,
          },
        },
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditTransactionDialog);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize empty form for new transaction', () => {
    expect(component.form.value).toEqual({
      date: null,
      description: null,
      category: null,
      amount: null,
    });
  });

  it('should patch form values when editing transaction', () => {
    TestBed.resetTestingModule();

    return TestBed.configureTestingModule({
      imports: [
        AddEditTransactionDialog,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader,
          },
        }),
      ],
      providers: [
        {
          provide: DashboardStore,
          useValue: storeMock,
        },
        {
          provide: ToastService,
          useValue: toastMock,
        },
        {
          provide: MatDialogRef,
          useValue: dialogRefMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            isNew: false,
            categories,
            transaction: {
              id: '2',
              date: '2026-01-02',
              description: 'Peaches',
              categoryId: '2',
              amount: '2.5',
            },
          },
        },
        provideNativeDateAdapter(),
      ],
    })
      .compileComponents()
      .then(() => {
        const fixture = TestBed.createComponent(AddEditTransactionDialog);

        const component = fixture.componentInstance;

        fixture.detectChanges();

        expect(component.form.value).toEqual({
          date: '2026-01-02',
          description: 'Peaches',
          category: categories[0],
          amount: '2.50',
        });
      });
  });

  it('should require date field', () => {
    const control = component.form.controls.date;

    control.setValue(null);

    expect(control.hasError('required')).toBe(true);
  });

  it('should invalidate short descriptions', () => {
    const control = component.form.controls.description;

    control.setValue('A');

    expect(control.hasError('lengthInvalid')).toBe(true);
  });

  it('should require category field', () => {
    const control = component.form.controls.category;

    control.setValue(null);

    expect(control.hasError('required')).toBe(true);
  });

  it('should require amount field', () => {
    const control = component.form.controls.amount;

    control.setValue(null);

    expect(control.hasError('required')).toBe(true);
  });

  it('should invalidate amounts outside the allowed range', () => {
    const control = component.form.controls.amount;

    control.setValue(0);

    expect(control.hasError('min')).toBe(true);

    control.setValue(1_000_000);

    expect(control.hasError('max')).toBe(true);
  });

  it('should disable save button when form invalid', () => {
    fixture.detectChanges();

    const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');

    expect(saveButton.disabled).toBe(true);
  });

  it('should render validation errors', () => {
    const control = component.form.controls.description;

    control.setValue('A');
    control.markAsTouched();

    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('mat-error');

    expect(error).toBeTruthy();
  });

  it('should create transaction', () => {
    component.form.patchValue({
      date: new Date('2026-01-03'),
      description: 'Bananas',
      category: categories[0],
      amount: 1.5,
    });

    component.save();

    expect(storeMock.createTransaction).toHaveBeenCalledWith({
      date: '2026-01-03',
      description: 'Bananas',
      categoryId: '2',
      amount: 1.5,
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should update transaction', () => {
    component.data.isNew = false;

    component.data.transaction = {
      id: '2',
      date: '2026-01-02',
      description: 'Peaches',
      category: categories[0],
      amount: 2.5,
    };

    component.form.patchValue({
      date: new Date('2026-01-02'),
      description: 'Grapes',
      category: categories[0],
      amount: 3,
    });

    component.save();

    expect(storeMock.updateTransaction).toHaveBeenCalledWith('2', {
      date: '2026-01-02',
      description: 'Grapes',
      categoryId: '2',
      amount: 3,
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should disable form during save', () => {
    component.form.patchValue({
      date: new Date('2026-01-03'),
      description: 'Bananas',
      category: categories[0],
      amount: 1.5,
    });

    const disableSpy = vi.spyOn(component.form, 'disable');

    component.save();

    expect(disableSpy).toHaveBeenCalled();
  });

  it('should call save when save button clicked', () => {
    component.form.patchValue({
      date: new Date('2026-01-03'),
      description: 'Bananas',
      category: categories[0],
      amount: 1.5,
    });

    fixture.detectChanges();

    const spy = vi.spyOn(component, 'save');

    const saveButton = fixture.debugElement.query(By.css('[data-testid="save-button"]'));

    saveButton.triggerEventHandler('click', null);

    expect(spy).toHaveBeenCalled();
  });
});
