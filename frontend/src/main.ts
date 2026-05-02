import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

registerLocaleData(localeNl);
bootstrapApplication(App, appConfig).catch((e) => console.error(e));
