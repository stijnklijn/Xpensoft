import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../services/api.service';
import { RegisterDialog } from './register-dialog/register-dialog';
import { RegisterSuccessDialog } from './register-success-dialog/register-success-dialog';
import { versionInfo } from '../../../environments/version';

@Component({
  selector: 'app-login',
  imports: [TranslateModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  translate = inject(TranslateService);
  api = inject(ApiService);
  router = inject(Router);
  registerDialog = inject(MatDialog);

  email: string = '';
  password: string = '';
  error = signal('');
  version = versionInfo.version;
  buildDate = new Date(versionInfo.buildDate).toLocaleDateString();

  login(email: string, password: string) {
    this.api.login(email, password).subscribe({
      next: (response) => {
        localStorage.setItem('jwt', response.jwt);
        this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        if (e.status === 401) {
          this.error.set(this.translate.instant('ERRORS.LOGIN__INVALID_CREDENTIALS'));
        } else if (e.status === 423) {
          this.error.set(this.translate.instant('ERRORS.LOGIN__USER_IS_LOCKED'));
        } else {
          this.error.set(this.translate.instant('ERRORS.INTERNAL_SERVER_ERROR'));
        }
      },
    });
  }

  register() {
    const dialogRef = this.registerDialog.open(RegisterDialog, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.api
          .createUser(data.firstName, data.lastName, data.email, data.password)
          .subscribe(() => {
            this.registerDialog.open(RegisterSuccessDialog, {
              disableClose: true,
              data: { email: data.email },
            });
          });
      }
    });
  }
}
