import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';

import { Observable, of } from 'rxjs';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { Dashboard } from './dashboard';
import { DashboardStore } from '../../store/dashboard.store';
import { SettingsDialog } from './settings-dialog/settings-dialog';
import { ToastService } from '../../services/toast.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
}

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  let component: Dashboard;

  let storeMock: Partial<DashboardStore>;
  let dialogMock: Pick<MatDialog, 'open'>;

  beforeEach(async () => {
    storeMock = {
      loading: signal(false),

      user: signal({
        firstName: 'Stijn',
        lastName: 'Klijn',
        lastLoginDateTime: '2026-01-01T12:00:00',
      }),

      resultsPerPageOptions: [10, 25, 50],

      loadDashboard: vi.fn(),

      clear: vi.fn(),
    };

    dialogMock = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        Dashboard,
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
            path: 'login',
            component: class {},
          },
        ]),
        {
          provide: DashboardStore,
          useValue: storeMock,
        },
        {
          provide: MatDialog,
          useValue: dialogMock,
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard on init', () => {
    expect(storeMock.loadDashboard).toHaveBeenCalled();
  });

  it('should render navigation links', () => {
    const links = fixture.nativeElement.querySelectorAll('a');

    expect(links.length).toBe(3);

    expect(links[0].textContent).toContain('DASHBOARD.TRANSACTIONS');
    expect(links[1].textContent).toContain('DASHBOARD.CATEGORIES');
    expect(links[2].textContent).toContain('DASHBOARD.ANALYSIS');
  });

  it('should render user information', () => {
    const controls = fixture.nativeElement.querySelector('.controls');

    expect(controls.textContent).toContain('Stijn');
    expect(controls.textContent).toContain('Klijn');
  });

  it('should render last login information when available', () => {
    const em = fixture.nativeElement.querySelector('em');

    expect(em).toBeTruthy();

    expect(em.textContent).toContain('DASHBOARD.LAST_LOGIN_ON');
  });

  it('should not render last login information when unavailable', () => {
    storeMock.user?.set({
      firstName: 'Stijn',
      lastName: 'Klijn',
      lastLoginDateTime: null,
    });

    fixture.detectChanges();

    const em = fixture.nativeElement.querySelector('em');

    expect(em).toBeFalsy();
  });

  it('should show spinner when loading', () => {
    storeMock.loading?.set(true);

    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');

    expect(spinner).toBeTruthy();
  });

  it('should render router outlet when not loading', () => {
    const outlet = fixture.nativeElement.querySelector('router-outlet');

    expect(outlet).toBeTruthy();
  });

  it('should open settings dialog when settings button clicked', () => {
    const button = fixture.nativeElement.querySelector('[data-testid="settings-button"]');

    button.click();

    expect(dialogMock.open).toHaveBeenCalledWith(
      SettingsDialog,
      expect.objectContaining({
        disableClose: true,
        data: {
          user: component.user(),
          resultsPerPageOptions: component.resultsPerPageOptions,
        },
      }),
    );
  });

  it('should logout when logout button clicked', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    const button = fixture.nativeElement.querySelector('[data-testid="logout-button"]');

    button.click();

    expect(storeMock.clear).toHaveBeenCalled();

    expect(removeItemSpy).toHaveBeenCalledWith('jwt');
  });
});
