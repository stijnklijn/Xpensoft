import { provideHttpClient, HttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
  inject,
} from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { provideRouter } from '@angular/router';

import { Observable } from 'rxjs';

import { Locale } from 'date-fns';
import { enGB, nl } from 'date-fns/locale';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { apiInterceptor } from './interceptors/api.interceptor';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { routes } from './app.routes';

export class CustomTranslateLoader implements TranslateLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string): Observable<any> {
    return this.http.get<any>(`/assets/i18n/${lang}.json`);
  }
}

const DATE_FORMATS = {
  parse: {
    dateInput: 'dd-MM-yyyy',
  },
  display: {
    dateInput: 'dd-MM-yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd-MM-yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

const LOCALE_IDS: Record<string, string> = {
  en: 'en-GB',
  nl: 'nl-NL',
};

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enGB,
  nl: nl,
};

function getPreferredLanguage(): string {
  const storedLanguage = localStorage.getItem('language');
  if (storedLanguage && storedLanguage in LOCALE_IDS) {
    return storedLanguage;
  }

  const browserLanguage = navigator.language?.split('-')[0];
  return browserLanguage && browserLanguage in LOCALE_IDS ? browserLanguage : 'en';
}

const preferredLanguage = getPreferredLanguage();

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader,
        },
      }),
    ),
    provideBrowserGlobalErrorListeners(),
    provideCharts(withDefaultRegisterables()),
    provideDateFnsAdapter(),
    provideHttpClient(withInterceptors([apiInterceptor, authInterceptor, errorInterceptor])),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: LOCALE_IDS[preferredLanguage] },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: DATE_FNS_LOCALES[preferredLanguage] },
  ],
};
