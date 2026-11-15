import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  translate = inject(TranslateService);
  document = inject(DOCUMENT);

  constructor() {
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-rounded');
    this.initLanguage();
  }

  private initLanguage() {
    this.translate.addLangs(['en', 'nl']);
    this.translate.setFallbackLang('en');

    // Keep <html lang> in sync for screen readers and hyphenation.
    this.translate.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(({ lang }) => (this.document.documentElement.lang = lang));

    const browserLang = this.translate.getBrowserLang();
    const localStorageLang = localStorage.getItem('language');
    const lang = localStorageLang ?? (browserLang?.match(/en|nl/) ? browserLang : 'en');

    this.translate.use(lang);
  }
}
