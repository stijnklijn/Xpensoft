import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Observable, of, throwError } from 'rxjs';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { RegisterDialog } from './register-dialog';
import { UserService } from '../../../api/generated/user';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('RegisterDialog', () => {
  let fixture: ComponentFixture<RegisterDialog>;
  let component: RegisterDialog;

  let userServiceMock: Partial<UserService>;

  beforeEach(async () => {
    userServiceMock = {
      postUsersExists: vi.fn().mockReturnValue(of({ exists: false })),
      postUsers: vi.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [
        RegisterDialog,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader,
          },
        }),
      ],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterDialog);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize empty form', () => {
    expect(component.form.value).toEqual({
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      repeatPassword: null,
    });
  });

  it('should invalidate short first name', () => {
    const control = component.form.controls.firstName;

    control.setValue('A');

    expect(control.hasError('lengthInvalid')).toBe(true);
  });

  it('should invalidate short last name', () => {
    const control = component.form.controls.lastName;

    control.setValue('B');

    expect(control.hasError('lengthInvalid')).toBe(true);
  });

  it('should require email', () => {
    const control = component.form.controls.email;

    control.setValue(null);

    expect(control.hasError('required')).toBe(true);
  });

  it('should invalidate invalid email format', () => {
    const control = component.form.controls.email;

    control.setValue('stijnklijn');

    expect(control.hasError('email')).toBe(true);
  });

  it('should require password', () => {
    const control = component.form.controls.password;

    control.setValue(null);

    expect(control.hasError('required')).toBe(true);
  });

  it('should invalidate weak password', () => {
    const control = component.form.controls.password;

    control.setValue('Test1234');

    expect(control.hasError('pattern')).toBe(true);
  });

  it('should invalidate unequal passwords', () => {
    component.form.patchValue({
      password: 'Password1!',
      repeatPassword: 'Password2!',
    });

    expect(component.form.hasError('passwordsNotEqual')).toBe(true);
  });

  it('should invalidate existing email', async () => {
    userServiceMock.postUsersExists = vi.fn().mockReturnValue(of({ exists: true }));

    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [
        RegisterDialog,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader,
          },
        }),
      ],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterDialog);
    component = fixture.componentInstance;

    fixture.detectChanges();

    const control = component.form.controls.email;

    control.setValue('stijnklijn@gmail.com');
    control.markAsTouched();
    control.updateValueAndValidity();

    await fixture.whenStable();

    expect(control.hasError('emailExists')).toBe(true);
  });

  it('should disable register button when form invalid', () => {
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-testid="register-button"]');

    expect(button.disabled).toBe(true);
  });

  it('should render validation errors', () => {
    const control = component.form.controls.firstName;

    control.setValue('A');
    control.markAsTouched();

    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('mat-error');

    expect(error).toBeTruthy();
  });

  it('should register user', () => {
    component.form.patchValue({
      firstName: 'Stijn',
      lastName: 'Klijn',
      email: 'stijnklijn@gmail.com',
      password: 'Test1234!',
      repeatPassword: 'Test1234!',
    });

    component.register();

    expect(userServiceMock.postUsers).toHaveBeenCalledWith({
      firstName: 'Stijn',
      lastName: 'Klijn',
      email: 'stijnklijn@gmail.com',
      password: 'Test1234!',
    });

    expect(component.registeredEmail()).toBe('stijnklijn@gmail.com');
  });

  it('should disable form during register', () => {
    component.form.patchValue({
      firstName: 'Stijn',
      lastName: 'Klijn',
      email: 'stijnklijn@gmail.com',
      password: 'Test1234!',
      repeatPassword: 'Test1234!',
    });

    const disableSpy = vi.spyOn(component.form, 'disable');

    component.register();

    expect(disableSpy).toHaveBeenCalled();
  });

  it('should show success message after register', () => {
    component.registeredEmail.set('stijnklijn@gmail.com');

    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.message');

    expect(message.textContent).toContain('stijnklijn@gmail.com');
  });

  it('should call register when register button clicked', () => {
    component.form.patchValue({
      firstName: 'Stijn',
      lastName: 'Klijn',
      email: 'stijnklijn@gmail.com',
      password: 'Test1234!',
      repeatPassword: 'Test1234!',
    });

    fixture.detectChanges();

    const spy = vi.spyOn(component, 'register');

    const button = fixture.nativeElement.querySelector('[data-testid="register-button"]');

    button.click();

    expect(spy).toHaveBeenCalled();
  });
});
