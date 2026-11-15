import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TranslatedTitleStrategy } from './translated-title-strategy';

@Component({ template: '' })
class Page {}

describe('TranslatedTitleStrategy', () => {
  let router: Router;
  let title: Title;
  let translate: TranslateService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([
          { path: 'transactions', component: Page, title: 'DASHBOARD.TRANSACTIONS' },
          { path: 'untitled', component: Page },
        ]),
        { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
      ],
    });

    router = TestBed.inject(Router);
    title = TestBed.inject(Title);
    translate = TestBed.inject(TranslateService);

    translate.setTranslation('en', { DASHBOARD: { TRANSACTIONS: 'Transactions' } });
    translate.setTranslation('nl', { DASHBOARD: { TRANSACTIONS: 'Transacties' } });
    translate.use('en');
  });

  it('should set the translated route title', async () => {
    await router.navigateByUrl('/transactions');

    expect(title.getTitle()).toBe('Transactions');
  });

  it('should update the title when the language changes', async () => {
    await router.navigateByUrl('/transactions');

    translate.use('nl');

    expect(title.getTitle()).toBe('Transacties');
  });

  it('should fall back to the app name for routes without a title', async () => {
    await router.navigateByUrl('/untitled');

    expect(title.getTitle()).toBe('Xpensoft');
  });
});
