import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { TranslateService } from '@ngx-translate/core';

import { DashboardStore } from '../store/dashboard.store';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);
  const toast = inject(ToastService);
  const translate = inject(TranslateService);
  const router = inject(Router);
  const store = inject(DashboardStore);

  const skip = req.headers.has('x-skip-error-interceptor');

  return next(req).pipe(
    catchError((e) => {
      if (!skip) {
        const message =
          e.status === 401
            ? 'ERRORS.JWT_EXPIRED'
            : e.error && e.error.code
              ? `ERRORS.${e.error.code}`
              : 'ERRORS.INTERNAL_SERVER_ERROR';

        toast.error(translate.instant(message));

        if (e.status === 401) {
          store.clear();
          dialog.closeAll();
          localStorage.removeItem('jwt');
          router.navigate(['/login']);
        }
      }
      return throwError(() => e);
    }),
  );
};
