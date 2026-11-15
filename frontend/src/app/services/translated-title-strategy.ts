import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';

const DEFAULT_TITLE = 'Xpensoft';

/**
 * Treats a route's `title` as a translation key and keeps the document title translated,
 * including after a language change. Routes without a title fall back to the app name.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private title = inject(Title);
  private translate = inject(TranslateService);

  private titleKey?: string;

  constructor() {
    super();
    this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => this.applyTitle());
  }

  override updateTitle(snapshot: RouterStateSnapshot) {
    this.titleKey = this.buildTitle(snapshot);
    this.applyTitle();
  }

  private applyTitle() {
    if (!this.titleKey) {
      this.title.setTitle(DEFAULT_TITLE);
      return;
    }

    this.translate.get(this.titleKey).subscribe((title: string) => this.title.setTitle(title));
  }
}
