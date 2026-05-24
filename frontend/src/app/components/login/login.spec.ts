import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';

import { Observable, of, throwError } from 'rxjs';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { Login } from './login';
import { LoginService } from '../../api/generated/login';
import { RegisterDialog } from './register-dialog/register-dialog';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;

  let loginServiceMock: Partial<LoginService>;
  let dialogMock: Pick<MatDialog, 'open'>;

  beforeEach(async () => {
    loginServiceMock = {
      postLogin: vi.fn().mockReturnValue(
        of({
          jwt: 'jwt',
        }),
      ),
    };

    dialogMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        Login,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader,
          },
        }),
      ],
      providers: [
        provideRouter([
          {
            path: 'dashboard',
            component: class {},
          },
        ]),

        {
          provide: LoginService,
          useValue: loginServiceMock,
        },
        {
          provide: MatDialog,
          useValue: dialogMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render email input', () => {
    const input = fixture.nativeElement.querySelector('input[name="email"]');

    expect(input).toBeTruthy();
  });

  it('should render password input', () => {
    const input = fixture.nativeElement.querySelector('input[name="password"]');

    expect(input).toBeTruthy();
  });

  it('should disable login button when email and password are empty', () => {
    component.email = '';
    component.password = '';

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-testid="login-button"]');

    expect(button.disabled).toBe(true);
  });

  it('should enable login button when email and password are filled', () => {
    component.email = 'stijnklijn@gmail.com';
    component.password = 'Test1234!';

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-testid="login-button"]');

    expect(button.disabled).toBe(false);
  });

  it('should login successfully', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    component.login('stijnklijn@gmail.com', 'Test1234!');

    expect(loginServiceMock.postLogin).toHaveBeenCalledWith(
      {
        email: 'stijnklijn@gmail.com',
        password: 'Test1234!',
      },
      {
        headers: {
          'x-skip-error-interceptor': 'true',
        },
      },
    );

    expect(setItemSpy).toHaveBeenCalledWith('jwt', 'jwt');
  });

  it('should show invalid credentials error', () => {
    loginServiceMock.postLogin = vi.fn().mockReturnValue(
      throwError(() => ({
        status: 401,
      })),
    );

    component.login('stijnklijn@gmail.com', 'Test1234?');

    expect(component.error()).toBe('ERRORS.LOGIN__INVALID_CREDENTIALS');
  });

  it('should show user locked error', () => {
    loginServiceMock.postLogin = vi.fn().mockReturnValue(
      throwError(() => ({
        status: 423,
      })),
    );

    component.login('stijnklijn@gmail.com', 'Test1234!');

    expect(component.error()).toBe('ERRORS.LOGIN__USER_IS_LOCKED');
  });

  it('should show internal server error', () => {
    loginServiceMock.postLogin = vi.fn().mockReturnValue(
      throwError(() => ({
        status: 500,
      })),
    );

    component.login('stijnklijn@gmail.com', 'Test1234!');

    expect(component.error()).toBe('ERRORS.INTERNAL_SERVER_ERROR');
  });

  it('should open register dialog when register button clicked', () => {
    const button = fixture.nativeElement.querySelector('.register-button');

    button.click();

    expect(dialogMock.open).toHaveBeenCalledWith(
      RegisterDialog,
      expect.objectContaining({
        disableClose: true,
      }),
    );
  });

  it('should render version info', () => {
    const versionInfo = fixture.nativeElement.querySelector('.version-info');

    expect(versionInfo.textContent).toContain('v');
  });

  it('should show spinner when loading', () => {
    component.loading.set(true);

    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');

    expect(spinner).toBeFalsy();
  });
});
