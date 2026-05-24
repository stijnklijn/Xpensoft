import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Observable, of } from 'rxjs';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { SettingsDialog } from './settings-dialog';
import { DashboardStore } from '../../../store/dashboard.store';
import { ToastService } from '../../../services/toast.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<any> {
    return of({});
  }
}

describe('SettingsDialog', () => {
  let fixture: ComponentFixture<SettingsDialog>;
  let component: SettingsDialog;

  let storeMock: Partial<DashboardStore>;
  let dialogRefMock: Pick<MatDialogRef<SettingsDialog>, 'close'>;
  let toastMock: Pick<ToastService, 'success'>;

  const user = {
    firstName: 'Stijn',
    lastName: 'Klijn',
    language: 'en',
    defaultResultsPerPage: 100,
  };

  beforeEach(async () => {
    storeMock = {
      updateUser: vi.fn().mockReturnValue(of({})),
    };

    dialogRefMock = {
      close: vi.fn(),
    };

    toastMock = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        SettingsDialog,
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
            user,
          },
        },
        provideNativeDateAdapter(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsDialog);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form values', () => {
    expect(component.form.value).toEqual({
      firstName: 'Stijn',
      lastName: 'Klijn',
      language: 'en',
      defaultResultsPerPage: 100,
    });
  });

  it('should invalidate short first names', () => {
    const control = component.form.controls.firstName;

    control.setValue('A');

    expect(control.hasError('lengthInvalid')).toBe(true);
  });

  it('should invalidate short last names', () => {
    const control = component.form.controls.lastName;

    control.setValue('A');

    fixture.detectChanges();

    expect(control.hasError('lengthInvalid')).toBe(true);
  });

  it('should disable save button when form invalid', () => {
    const control = component.form.controls.firstName;

    control.setValue(null);

    fixture.detectChanges();

    const saveButton = fixture.nativeElement.querySelector('[data-testid="save-button"]');

    expect(saveButton.disabled).toBe(true);
  });

  it('should render validation errors', () => {
    const control = component.form.controls.firstName;

    control.setValue('A');
    control.markAsTouched();

    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('mat-error');

    expect(error).toBeTruthy();
  });

  it('should save settings', () => {
    component.form.patchValue({
      firstName: 'Stijn',
      lastName: 'Klijn',
      language: 'en',
      defaultResultsPerPage: 100,
    });

    component.save();

    expect(storeMock.updateUser).toHaveBeenCalledWith({
      firstName: 'Stijn',
      lastName: 'Klijn',
      language: 'en',
      defaultResultsPerPage: 100,
    });
    expect(toastMock.success).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('should disable form during save', () => {
    component.form.patchValue({
      firstName: 'Stijn',
      lastName: 'Klijn',
      language: 'en',
      defaultResultsPerPage: 100,
    });

    const disableSpy = vi.spyOn(component.form, 'disable');

    component.save();

    expect(disableSpy).toHaveBeenCalled();
  });
});
