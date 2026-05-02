import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  snackBar = inject(MatSnackBar);

  success(message: string) {
    this.show(message, {
      panelClass: ['toast-success'],
    });
  }

  error(message: string) {
    this.show(message, {
      panelClass: ['toast-error'],
    });
  }

  info(message: string) {
    this.show(message, {
      panelClass: ['toast-info'],
    });
  }

  private show(message: string, config?: MatSnackBarConfig) {
    this.snackBar.open(message, '✕', {
      duration: 5_000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      ...config,
    });
  }
}
