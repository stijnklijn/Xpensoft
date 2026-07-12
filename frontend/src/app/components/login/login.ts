import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { catchError, EMPTY, finalize, tap } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LoginService } from '../../api/generated/login';

import { RegisterDialog } from './register-dialog/register-dialog';
import { versionInfo } from '../../../environments/version';

@Component({
  selector: 'app-login',
  imports: [TranslateModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  dialog = inject(MatDialog);
  loginService = inject(LoginService);
  router = inject(Router);
  translate = inject(TranslateService);

  email: string = '';
  password: string = '';

  loading = signal(false);
  error = signal('');

  version = versionInfo.version;
  buildDate = new Date(versionInfo.buildDate).toLocaleDateString();

  login(email: string, password: string) {
    this.loading.set(true);

    this.loginService
      .postLogin({ email, password }, { headers: { 'x-skip-error-interceptor': 'true' } })
      .pipe(
        tap((response) => {
          localStorage.setItem('jwt', response.jwt);
          this.router.navigate(['/dashboard']);
        }),
        catchError((e) => {
          if (e.status === 401) {
            this.error.set(this.translate.instant('ERRORS.LOGIN__INVALID_CREDENTIALS'));
          } else if (e.status === 423) {
            this.error.set(this.translate.instant('ERRORS.LOGIN__USER_IS_LOCKED'));
          } else {
            this.error.set(this.translate.instant('ERRORS.INTERNAL_SERVER_ERROR'));
          }

          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  register() {
    this.dialog.open(RegisterDialog, {
      disableClose: true,
    });
  }
}
