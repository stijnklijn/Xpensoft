import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';

import { Observable, of } from 'rxjs';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AddEditCategoryDialog } from './add-edit-category-dialog';
import { DashboardStore } from '../../../../store/dashboard.store';
import { ToastService } from '../../../../services/toast.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<any> {
    return of({});
  }
}

describe('AddEditCategoryDialog', () => {
  let fixture: ComponentFixture<AddEditCategoryDialog>;
  let component: AddEditCategoryDialog;

  let storeMock: Partial<DashboardStore>;
  let dialogRefMock: Pick<MatDialogRef<AddEditCategoryDialog>, 'close'>;
  let toastMock: Pick<ToastService, 'success'>;

  const categories = [
    {
      id: '1',
      name: 'Salary',
      isIncome: true,
    },
    {
      id: '2',
      name: 'Groceries',
      isIncome: false,
    },
  ];

  beforeEach(async () => {
    storeMock = {
      createCategory: vi.fn().mockReturnValue(of({})),
      updateCategory: vi.fn().mockReturnValue(of({})),
    };

    dialogRefMock = {
      close: vi.fn(),
    };

    toastMock = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        AddEditCategoryDialog,
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditCategoryDialog);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize empty form for new category', () => {
    expect(component.form.value).toEqual({
      name: null,
      isIncome: null,
    });
  });

  it('should patch form values when editing category', () => {
    TestBed.resetTestingModule();

    return TestBed.configureTestingModule({
      imports: [
        AddEditCategoryDialog,
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
            category: {
              id: '2',
              name: 'Groceries',
              isIncome: false,
            },
          },
        },
      ],
    })
      .compileComponents()
      .then(() => {
        const fixture = TestBed.createComponent(AddEditCategoryDialog);

        const component = fixture.componentInstance;

        fixture.detectChanges();

        expect(component.form.value).toEqual({
          name: 'Groceries',
          isIncome: false,
        });
      });
  });

  it('should invalidate short names', () => {
    const control = component.form.controls.name;

    control.setValue('A');

    expect(control.hasError('lengthInvalid')).toBe(true);
  });

  it('should validate unique names', () => {
    const control = component.form.controls.name;

    control.setValue('salary');

    expect(control.hasError('nameNotUnique')).toBe(true);
  });

  it('should allow same name for edited category', () => {
    component.data.category = {
      id: '1',
      name: 'Salary',
      isIncome: true,
    };

    const control = component.form.controls.name;

    control.setValue('Salary');

    expect(control.hasError('nameNotUnique')).toBe(false);
  });

  it('should require isIncome field', () => {
    const control = component.form.controls.isIncome;

    control.setValue(null);

    expect(control.hasError('required')).toBe(true);
  });

  it('should disable save button when form invalid', () => {
    fixture.detectChanges();

    const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');

    expect(saveButton.disabled).toBe(true);
  });

  it('should render validation errors', () => {
    const control = component.form.controls.name;

    control.setValue('A');
    control.markAsTouched();

    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('mat-error');

    expect(error).toBeTruthy();
  });

  it('should create category', () => {
    component.form.patchValue({
      name: 'Car',
      isIncome: false,
    });

    component.save();

    expect(storeMock.createCategory).toHaveBeenCalledWith({
      name: 'Car',
      isIncome: false,
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should update category', () => {
    component.data.isNew = false;

    component.data.category = {
      id: '2',
      name: 'Groceries',
      isIncome: false,
    };

    component.form.patchValue({
      name: 'Food',
      isIncome: false,
    });

    component.save();

    expect(storeMock.updateCategory).toHaveBeenCalledWith('2', {
      name: 'Food',
      isIncome: false,
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should disable form during save', () => {
    component.form.patchValue({
      name: 'Car',
      isIncome: false,
    });

    const disableSpy = vi.spyOn(component.form, 'disable');

    component.save();

    expect(disableSpy).toHaveBeenCalled();
  });

  it('should call save when save button clicked', () => {
    component.form.patchValue({
      name: 'Car',
      isIncome: false,
    });

    fixture.detectChanges();

    const spy = vi.spyOn(component, 'save');

    const saveButton = fixture.debugElement.query(By.css('[data-testid="save-button"]'));

    saveButton.triggerEventHandler('click', null);

    expect(spy).toHaveBeenCalled();
  });
});
