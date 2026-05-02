import { Component, inject } from '@angular/core';
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

  constructor() {
    this.initLanguage();
  }

  private initLanguage() {
    this.translate.addLangs(['en', 'nl']);
    this.translate.setFallbackLang('en');

    const browserLang = this.translate.getBrowserLang();
    const localStorageLang = localStorage.getItem('language');
    const lang = localStorageLang ?? (browserLang?.match(/en|nl/) ? browserLang : 'en');

    this.translate.use(lang);
  }
}
